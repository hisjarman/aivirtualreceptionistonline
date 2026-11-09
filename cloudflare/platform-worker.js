const DEFAULT_ORIGINS=["https://aivirtualreceptionist.online","https://www.aivirtualreceptionist.online","https://hisjarman.github.io"];
let jwksCache={expires:0,keys:[]};
const json=(data,status=200,origin,env)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","Vary":"Origin",...(origin&&origins(env).includes(origin)?{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"GET, POST, PUT, PATCH, DELETE, OPTIONS","Access-Control-Allow-Headers":"Authorization, Content-Type, Accept, Stripe-Signature, X-Retell-Signature","Access-Control-Max-Age":"86400"}:{})}});
function origins(env){return (env.ALLOWED_ORIGINS||DEFAULT_ORIGINS.join(",")).split(",").map(x=>x.trim()).filter(Boolean)}
function b64u(s){s=s.replace(/-/g,"+").replace(/_/g,"/");s+="=".repeat((4-s.length%4)%4);return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
function decode(s){return JSON.parse(new TextDecoder().decode(b64u(s)))}
async function clerkUser(req,env){
 const token=(req.headers.get("Authorization")||"").match(/^Bearer\s+(.+)$/i)?.[1];if(!token)throw Error("sign_in_required");
 const p=token.split(".");if(p.length!==3)throw Error("invalid_session");
 const h=decode(p[0]),c=decode(p[1]),issuer=(env.CLERK_ISSUER||"").replace(/\/$/,""),now=Math.floor(Date.now()/1000);
 if(h.alg!=="RS256"||!h.kid||c.iss!==issuer||!c.sub||!c.exp||c.exp<=now||(c.nbf&&c.nbf>now))throw Error("invalid_session");
 const origin=req.headers.get("Origin");if(c.azp&&origin){try{if(new URL(c.azp).origin!==origin)throw Error("invalid_authorized_party")}catch(e){if(e.message==="invalid_authorized_party")throw e}}
 if(jwksCache.expires<Date.now()){const r=await fetch(issuer+"/.well-known/jwks.json");if(!r.ok)throw Error("clerk_jwks_unavailable");const d=await r.json();jwksCache={keys:d.keys||[],expires:Date.now()+600000}}
 const jwk=jwksCache.keys.find(k=>k.kid===h.kid&&k.kty==="RSA");if(!jwk)throw Error("clerk_key_not_found");
 const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
 if(!await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,b64u(p[2]),new TextEncoder().encode(p[0]+"."+p[1])))throw Error("invalid_session_signature");
 if(!env.CLERK_SECRET_KEY)throw Error("clerk_backend_not_configured");
 const ur=await fetch("https://api.clerk.com/v1/users/"+encodeURIComponent(c.sub),{headers:{Authorization:"Bearer "+env.CLERK_SECRET_KEY,Accept:"application/json"}});
 if(!ur.ok)throw Error("clerk_user_lookup_failed");const u=await ur.json(),em=(u.email_addresses||[]).find(x=>x.id===u.primary_email_address_id);
 if(!em||em.verification?.status!=="verified")throw Error("email_verification_required");
 return {id:c.sub,email:String(em.email_address).toLowerCase(),name:[u.first_name,u.last_name].filter(Boolean).join(" ")};
}
async function requireAdmin(req,env){const u=await clerkUser(req,env),allowed=(env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase());if(!allowed.includes(u.email))throw Error("admin_access_required");return u}
function fail(e,origin,env){const m=e?.message||"request_failed",status=m==="admin_access_required"?403:m==="clerk_backend_not_configured"||m==="call_email_not_configured_contact_support"?503:m==="sign_in_required"||m.includes("session")||m.includes("signature")?401:m==="email_verification_required"?403:400;return json({error:m},status,origin,env)}
async function body(req,max=20000){const t=await req.text();if(t.length>max)throw Error("payload_too_large");try{return JSON.parse(t)}catch{throw Error("invalid_json")}}
const planInfo={starter:{name:"Starter",price:149,minutes:300,priceEnv:"STRIPE_PRICE_STARTER"},growth:{name:"Growth",price:249,minutes:600,priceEnv:"STRIPE_PRICE_GROWTH"},pro:{name:"Pro",price:399,minutes:1000,priceEnv:"STRIPE_PRICE_PRO"}};
async function customerFor(user,env){let c=await env.DB.prepare("SELECT * FROM avr_customers WHERE clerk_user_id=? LIMIT 1").bind(user.id).first();if(!c)c=await env.DB.prepare("SELECT * FROM avr_customers WHERE lower(email)=? LIMIT 1").bind(user.email).first();if(c&&!c.clerk_user_id)await env.DB.prepare("UPDATE avr_customers SET clerk_user_id=?,updated_at=? WHERE id=?").bind(user.id,new Date().toISOString(),c.id).run();return c}
async function audit(env,user,action,customerId,detail={}){await env.DB.prepare("INSERT INTO avr_admin_audit(id,admin_user_id,action,customer_id,detail_json) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),user.id,action,customerId||null,JSON.stringify(detail)).run()}
async function stripeRequest(env,path,params={},method="POST"){if(!env.STRIPE_SECRET_KEY)throw Error("stripe_not_configured");const form=new URLSearchParams();for(const [k,v] of Object.entries(params))if(v!==undefined&&v!==null)form.set(k,String(v));const r=await fetch("https://api.stripe.com/v1/"+path,{method,headers:{Authorization:"Bearer "+env.STRIPE_SECRET_KEY,"Content-Type":"application/x-www-form-urlencoded"},body:method==="GET"?undefined:form.toString()});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error?.message||"stripe_request_failed");return d}
async function createCheckout(user,c,plan,env){const p=planInfo[plan];if(!p)throw Error("invalid_plan");const price=env[p.priceEnv];if(!price||price==="price_replace_me")throw Error("stripe_price_id_missing_"+plan);
 let stripeId=c.stripe_customer_id;if(!stripeId){const sc=await stripeRequest(env,"customers",{email:user.email,name:c.business_name, "metadata[avr_customer_id]":c.id});stripeId=sc.id;await env.DB.prepare("UPDATE avr_customers SET stripe_customer_id=?,updated_at=? WHERE id=?").bind(stripeId,new Date().toISOString(),c.id).run()}
 const session=await stripeRequest(env,"checkout/sessions",{mode:"subscription",customer:stripeId,"line_items[0][price]":price,"line_items[0][quantity]":1,success_url:"https://aivirtualreceptionist.online/client/?billing=success",cancel_url:"https://aivirtualreceptionist.online/client/?billing=cancelled","metadata[avr_customer_id]":c.id,"subscription_data[metadata][avr_customer_id]":c.id});
 return {url:session.url,id:session.id};
}
async function stripeWebhook(req,env){const raw=await req.text(),sig=req.headers.get("Stripe-Signature")||"",secret=env.STRIPE_WEBHOOK_SECRET;if(!secret)throw Error("stripe_webhook_secret_missing");const parts=Object.fromEntries(sig.split(",").map(x=>x.split("=").map(y=>y.trim()))),ts=parts.t;if(!ts||!parts.v1||Math.abs(Date.now()/1000-Number(ts))>300)throw Error("invalid_stripe_signature");const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const mac=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(ts+"."+raw)));const hex=Array.from(mac,x=>x.toString(16).padStart(2,"0")).join("");if(hex!==parts.v1)throw Error("invalid_stripe_signature");
 const ev=JSON.parse(raw);const seen=await env.DB.prepare("SELECT event_id FROM avr_webhook_events WHERE provider='stripe' AND event_id=?").bind(ev.id).first();if(seen)return {received:true,duplicate:true};
 
 const o=ev.data?.object||{},customerId=o.metadata?.avr_customer_id||null,stripeCustomer=o.customer||o.customer_id||null;
 if(ev.type==="checkout.session.completed"&&customerId){await env.DB.prepare("UPDATE avr_customers SET stripe_customer_id=COALESCE(stripe_customer_id,?),stripe_subscription_id=?,subscription_status='active',updated_at=? WHERE id=?").bind(stripeCustomer,o.subscription||null,new Date().toISOString(),customerId).run()}
 if(ev.type?.startsWith("customer.subscription.")||ev.type==="customer.subscription.created"||ev.type==="customer.subscription.updated"||ev.type==="customer.subscription.deleted"){
  const sid=o.id,scid=typeof o.customer==="string"?o.customer:null,priceId=o.items?.data?.[0]?.price?.id||"",plan=Object.entries(planInfo).find(([k,v])=>env[v.priceEnv]===priceId)?.[0]||null,status=o.status||"unknown",period=o.current_period_end?new Date(o.current_period_end*1000).toISOString():null;
  await env.DB.prepare("UPDATE avr_customers SET stripe_subscription_id=?,subscription_status=?,plan_key=COALESCE(?,plan_key),included_minutes=CASE WHEN ?='starter' THEN 300 WHEN ?='growth' THEN 600 WHEN ?='pro' THEN 1000 ELSE included_minutes END,current_period_end=?,status=CASE WHEN ?='active' OR ?='trialing' THEN 'active' WHEN ?='canceled' THEN 'suspended' ELSE status END,updated_at=? WHERE stripe_customer_id=?").bind(sid,status,plan,plan,plan,plan,period,status,status,status,new Date().toISOString(),scid).run();
 }
 if(ev.type==="invoice.payment_failed"){await env.DB.prepare("UPDATE avr_customers SET subscription_status='past_due',updated_at=? WHERE stripe_customer_id=?").bind(new Date().toISOString(),stripeCustomer).run()}
 if(customerId||stripeCustomer){await env.DB.prepare("INSERT OR IGNORE INTO avr_billing_events(event_id,customer_id,event_type,event_created,payload_json) VALUES(?,?,?,?,?)").bind(ev.id,customerId,ev.type,ev.created,JSON.stringify(o).slice(0,50000)).run()}
 await env.DB.prepare("INSERT OR IGNORE INTO avr_webhook_events(provider,event_id) VALUES('stripe',?)").bind(ev.id).run();
 return {received:true};
}

async function sendAutomaticCallSummary(env,customerId,callId){
 try{
  if(!env.RESEND_API_KEY||!env.RESEND_FROM_EMAIL)return;
  const settings=await env.DB.prepare("SELECT enabled,recipients_json FROM avr_call_email_settings WHERE customer_id=?").bind(customerId).first();
  if(!settings||Number(settings.enabled)!==1)return;
  let recipients=[];try{recipients=JSON.parse(settings.recipients_json||"[]")}catch{}
  recipients=[...new Set(recipients.map(x=>String(x).trim().toLowerCase()).filter(x=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x)))].slice(0,10);
  if(!recipients.length)return;
  const call=await env.DB.prepare("SELECT call_id,from_number,to_number,direction,duration_ms,start_timestamp,call_summary,user_sentiment FROM avr_calls WHERE call_id=? AND customer_id=? LIMIT 1").bind(callId,customerId).first();
  const customer=await env.DB.prepare("SELECT business_name FROM avr_customers WHERE id=?").bind(customerId).first();
  if(!call)return;
  const esc=v=>String(v??"—").replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
  const date=call.start_timestamp?new Date(Number(call.start_timestamp)>1e12?Number(call.start_timestamp):Number(call.start_timestamp)*1000).toISOString():"Unknown";
  const duration=Math.ceil(Number(call.duration_ms||0)/60000)+" minute(s)";
  const summary=call.call_summary||"No AI summary was provided for this call.";
  const subject="New call summary — "+String(customer?.business_name||"Your business")+" — "+String(call.from_number||"Unknown caller");
  const text=["AIVirtualReceptionist.online — Call summary","Business: "+(customer?.business_name||"Your business"),"Caller: "+(call.from_number||"Unknown"),"Business line: "+(call.to_number||"Unknown"),"Date/time: "+date,"Direction: "+(call.direction||"Unknown"),"Duration: "+duration,"Sentiment: "+(call.user_sentiment||"Unknown"),"","Call summary:",summary,"","Open your client portal to review the transcript and available recording: https://aivirtualreceptionist.online/client/#calls"].join("\n");
  const html="<div style=\"font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#20343b\"><h2>New call summary</h2><p><b>Business:</b> "+esc(customer?.business_name)+"</p><p><b>Caller:</b> "+esc(call.from_number)+"<br><b>Business line:</b> "+esc(call.to_number)+"<br><b>Date/time:</b> "+esc(date)+"<br><b>Direction:</b> "+esc(call.direction)+"<br><b>Duration:</b> "+esc(duration)+"<br><b>Sentiment:</b> "+esc(call.user_sentiment)+"</p><h3>Call summary</h3><p>"+esc(summary)+"</p><p><a href=\"https://aivirtualreceptionist.online/client/#calls\">Open call history to listen to the recording and read the transcript</a></p><p style=\"font-size:12px;color:#68777c\">Sent because automatic call-summary emails are enabled in your client portal.</p></div>";
  const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json","Idempotency-Key":"avr-auto-call-summary/"+call.call_id},body:JSON.stringify({from:env.RESEND_FROM_EMAIL,to:recipients,subject,html,text})});
  if(!sent.ok){const result=await sent.json().catch(()=>({}));console.error("automatic_call_summary_email_failed",sent.status,result)}
 }catch(e){console.error("automatic_call_summary_email_error",e.message)}
}

async function retellVerify(raw,signature,key){if(!key||!signature)return false;const m=signature.match(/v=(\d+),d=([a-f0-9]+)/i);if(!m)return false;const ts=m[1],stamp=Number(ts);if(Math.abs(Date.now()-stamp)>5*60*1000)return false;const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(key),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const out=new Uint8Array(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(raw+ts)));const hex=Array.from(out,x=>x.toString(16).padStart(2,"0")).join("");return hex===m[2].toLowerCase()}
async function retellApi(env,path,method="GET",data){if(!env.RETELL_API_KEY)throw Error("retell_not_configured");const r=await fetch("https://api.retellai.com"+path,{method,headers:{Authorization:"Bearer "+env.RETELL_API_KEY,"Content-Type":"application/json"},body:data?JSON.stringify(data):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.message||d.error||"retell_request_failed");return d}
async function retellList(env,path,method="GET",data){
 const all=[];let cursor=null,guard=0;
 do{
  if(++guard>100)throw Error("retell_pagination_limit_exceeded");
  let url=path,body=data?{...data}:{};
  if(cursor){if(method==="GET"){url+=(url.includes("?")?"&":"?")+"pagination_key="+encodeURIComponent(cursor)}else body.pagination_key=cursor}
  const page=await retellApi(env,url,method,method==="GET"?undefined:body);
  const items=Array.isArray(page)?page:(page.items||page.agents||page.phone_numbers||[]);
  all.push(...items);
  cursor=page.pagination_key||null;
  if(!page.has_more)break;
 }while(cursor);
 return all;
}
async function syncRetell(env){
 const [agents,numbers]=await Promise.all([retellList(env,"/v2/list-agents","POST",{}),retellList(env,"/v2/list-phone-numbers","GET")]);
 for(const a of agents){await env.DB.prepare("INSERT INTO avr_agents(agent_id,agent_name,voice_id,language,raw_json,synced_at) VALUES(?,?,?,?,?,?) ON CONFLICT(agent_id) DO UPDATE SET agent_name=excluded.agent_name,voice_id=excluded.voice_id,language=excluded.language,raw_json=excluded.raw_json,synced_at=excluded.synced_at").bind(a.agent_id,a.agent_name||a.agent_id,a.voice_id||null,a.language||null,JSON.stringify(a),new Date().toISOString()).run()}
 for(const n of numbers){const phone=n.phone_number;const inbound=n.inbound_agents?.[0]?.agent_id||n.inbound_agent_id||null;await env.DB.prepare("INSERT INTO avr_numbers(phone_number,nickname,agent_id,phone_number_type,raw_json,synced_at) VALUES(?,?,?,?,?,?) ON CONFLICT(phone_number) DO UPDATE SET nickname=excluded.nickname,agent_id=COALESCE(avr_numbers.agent_id,excluded.agent_id),phone_number_type=excluded.phone_number_type,raw_json=excluded.raw_json,synced_at=excluded.synced_at").bind(phone,n.nickname||null,inbound,n.phone_number_type||null,JSON.stringify(n),new Date().toISOString()).run()}
 return {agents:agents.length,numbers:numbers.length}
}
async function retellWebhook(req,env){
 const raw=await req.text();
 if(!await retellVerify(raw,req.headers.get("x-retell-signature"),env.RETELL_API_KEY))throw Error("invalid_retell_signature");
 const p=JSON.parse(raw),event=String(p.event||"unknown"),call=p.call||{},id=call.call_id||p.call_id;
 if(!id)return {received:true,ignored:true,event};
 const eventKey=id+":"+event;
 const seen=await env.DB.prepare("SELECT event_id FROM avr_webhook_events WHERE provider='retell' AND event_id=?").bind(eventKey).first();
 if(seen)return {received:true,duplicate:true,event};
 const agent=call.agent_id||null,direction=call.direction||null,to=call.to_number||null;
 const line=direction==="outbound"?(call.from_number||null):(call.to_number||null);
 const phone=line?await env.DB.prepare("SELECT customer_id FROM avr_numbers WHERE phone_number=?").bind(line).first():null;
 const agentRow=agent?await env.DB.prepare("SELECT customer_id FROM avr_agents WHERE agent_id=?").bind(agent).first():null;
 const cid=phone?.customer_id||agentRow?.customer_id||null;
 await env.DB.prepare("INSERT OR IGNORE INTO avr_retell_events(event_id,event_type,call_id,agent_id,customer_id,payload_json) VALUES(?,?,?,?,?,?)")
 .bind(eventKey,event, id,agent,cid,JSON.stringify(p).slice(0,100000)).run();
 const start=call.start_timestamp||null,end=call.end_timestamp||null;
 const duration=call.duration_ms||((start&&end)?end-start:null);
 const callStatus=call.call_status||(event==="call_ended"?"ended":event==="call_analyzed"?"analyzed":event);
 const analysis=call.call_analysis||{};
 await env.DB.prepare("INSERT INTO avr_calls(call_id,customer_id,agent_id,phone_number,from_number,to_number,direction,call_status,duration_ms,start_timestamp,end_timestamp,transcript,recording_url,call_summary,user_sentiment,disconnection_reason,raw_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(call_id) DO UPDATE SET customer_id=COALESCE(excluded.customer_id,avr_calls.customer_id),agent_id=COALESCE(excluded.agent_id,avr_calls.agent_id),phone_number=COALESCE(excluded.phone_number,avr_calls.phone_number),from_number=COALESCE(excluded.from_number,avr_calls.from_number),to_number=COALESCE(excluded.to_number,avr_calls.to_number),direction=COALESCE(excluded.direction,avr_calls.direction),call_status=excluded.call_status,duration_ms=COALESCE(excluded.duration_ms,avr_calls.duration_ms),start_timestamp=COALESCE(excluded.start_timestamp,avr_calls.start_timestamp),end_timestamp=COALESCE(excluded.end_timestamp,avr_calls.end_timestamp),transcript=COALESCE(excluded.transcript,avr_calls.transcript),recording_url=COALESCE(excluded.recording_url,avr_calls.recording_url),call_summary=COALESCE(excluded.call_summary,avr_calls.call_summary),user_sentiment=COALESCE(excluded.user_sentiment,avr_calls.user_sentiment),disconnection_reason=COALESCE(excluded.disconnection_reason,avr_calls.disconnection_reason),raw_json=excluded.raw_json")
 .bind(id,cid,agent,line,call.from_number||null,to,direction,callStatus,duration,start,end,call.transcript||null,call.recording_url||null,analysis.call_summary||null,analysis.user_sentiment||null,call.disconnection_reason||null,JSON.stringify(p).slice(0,100000)).run();
 if(event==="call_analyzed"&&cid)await sendAutomaticCallSummary(env,cid,id);
 await env.DB.prepare("INSERT OR IGNORE INTO avr_webhook_events(provider,event_id) VALUES('retell',?)").bind(eventKey).run();
 return {received:true,event,call_id:id,customer_matched:!!cid};
}
async function route(req,env){
 const url=new URL(req.url),path=url.pathname,origin=req.headers.get("Origin");
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin&&origins(env).includes(origin)?origin:"null","Access-Control-Allow-Methods":"GET, POST, PUT, PATCH, DELETE, OPTIONS","Access-Control-Allow-Headers":"Authorization, Content-Type, Accept, Stripe-Signature, X-Retell-Signature","Access-Control-Max-Age":"86400","Vary":"Origin"}});
 if(path==="/health")return json({ok:true,service:"avr-platform-api",version:"1.0.0",stripe:!!env.STRIPE_SECRET_KEY,retell:!!env.RETELL_API_KEY},200,origin,env);
 if(path==="/webhooks/stripe"&&req.method==="POST"){try{return json(await stripeWebhook(req,env),200,origin,env)}catch(e){console.error("stripe_webhook",e.message);return json({error:e.message},400,origin,env)}}
 if(path==="/webhooks/retell"&&req.method==="POST"){try{return json(await retellWebhook(req,env),200,origin,env)}catch(e){console.error("retell_webhook",e.message);return json({error:e.message},400,origin,env)}}
 try{
  if(path==="/api/me"&&req.method==="GET"){const u=await clerkUser(req,env);return json({user:u},200,origin,env)}
  if(path==="/api/client/dashboard"&&req.method==="GET"){const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({customer:null,needsSetup:true},200,origin,env);const calls=await env.DB.prepare("SELECT call_id,agent_id,from_number,to_number,direction,call_status,duration_ms,start_timestamp,transcript,recording_url,call_summary,user_sentiment,disconnection_reason FROM avr_calls WHERE customer_id=? ORDER BY start_timestamp DESC LIMIT 50").bind(c.id).all();const usage=await env.DB.prepare("SELECT COALESCE(SUM(duration_ms),0) AS ms,COUNT(*) AS calls FROM avr_calls WHERE customer_id=? AND start_timestamp>=?").bind(c.id,new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime()).first();const agent=await env.DB.prepare("SELECT agent_id,agent_name,status FROM avr_agents WHERE customer_id=?").bind(c.id).all();const nums=await env.DB.prepare("SELECT phone_number,nickname,agent_id FROM avr_numbers WHERE customer_id=?").bind(c.id).all();return json({customer:{id:c.id,businessName:c.business_name,contactName:c.contact_name,email:c.email,phone:c.phone,status:c.status,plan:c.plan_key,subscriptionStatus:c.subscription_status,periodEnd:c.current_period_end,includedMinutes:c.included_minutes,hasBillingAccount:!!c.stripe_customer_id},calls:calls.results||[],agents:agent.results||[],numbers:nums.results||[],usage:{minutes:Math.ceil(Number(usage?.ms||0)/60000),calls:Number(usage?.calls||0)}},200,origin,env)}

  if(path==="/api/client/agent-configuration"&&req.method==="GET"){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   const rows=await env.DB.prepare("SELECT a.agent_id,a.agent_name,a.status,a.raw_json,a.synced_at FROM avr_agents a WHERE a.customer_id=? ORDER BY a.agent_name").bind(c.id).all();
   const configuration=(rows.results||[]).map(row=>{
    let raw={};try{raw=JSON.parse(row.raw_json||"{}")}catch{}
    const engine=raw.response_engine||raw.responseEngine||{};
    const tools=Array.isArray(raw.tools)?raw.tools:[];
    const voice=raw.voice_id||raw.voiceId||row.agent_id;
    return {agentName:row.agent_name||"Assigned receptionist",status:row.status||"active",language:raw.language||null,voiceLabel:raw.voice_name||raw.voiceName||voice||"Configured voice",modelLabel:engine.llm_id||engine.model||raw.llm_id||raw.model||null,greeting:raw.begin_message||raw.beginMessage||null,knowledgeBaseCount:Array.isArray(raw.knowledge_base_ids)?raw.knowledge_base_ids.length:Array.isArray(raw.knowledgeBaseIds)?raw.knowledgeBaseIds.length:null,toolNames:tools.map(t=>String(t.name||t.type||"Capability")).filter(Boolean).slice(0,12),syncedAt:row.synced_at};
   });
   const nums=await env.DB.prepare("SELECT phone_number,nickname,agent_id FROM avr_numbers WHERE customer_id=? ORDER BY phone_number").bind(c.id).all();
   return json({configuration,phoneNumbers:nums.results||[]},200,origin,env)
  }
  const approveAgentRequest=path.match(/^\/api\/client\/agent-change-requests\/([a-f0-9-]{36})\/approve$/i);
  if(approveAgentRequest&&req.method==="POST"){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   const id=approveAgentRequest[1],r=await env.DB.prepare("SELECT id,status,quote_summary FROM avr_agent_change_requests WHERE id=? AND customer_id=?").bind(id,c.id).first();
   if(!r)throw Error("agent_change_request_not_found");
   if(r.status!=="quoted"||!String(r.quote_summary||"").trim())throw Error("a_written_quote_must_be_available_before_approval");
   await env.DB.prepare("UPDATE avr_agent_change_requests SET status='approved',client_approved_at=?,updated_at=? WHERE id=? AND customer_id=?").bind(new Date().toISOString(),new Date().toISOString(),id,c.id).run();
   return json({approved:true,status:"approved"},200,origin,env)
  }
  if(path==="/api/client/agent-change-requests"&&(req.method==="GET"||req.method==="POST")){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   if(req.method==="GET"){const r=await env.DB.prepare("SELECT id,request_type,title,details,priority,status,admin_note,quote_summary,created_at,updated_at FROM avr_agent_change_requests WHERE customer_id=? ORDER BY created_at DESC LIMIT 100").bind(c.id).all();return json({requests:r.results||[]},200,origin,env)}
   const p=await body(req,6000),requestType=String(p.requestType||""),priority=String(p.priority||"normal"),details=String(p.details||"").trim();
   if(!["voice","language","knowledge_base","denoising","safety","privacy","sms","phone","workflow","greeting","other"].includes(requestType))throw Error("invalid_request_type");
   if(!["normal","high","urgent"].includes(priority))throw Error("invalid_request_priority");
   if(details.length<10||details.length>4000)throw Error("request_details_must_be_10_to_4000_characters");
   const recent=await env.DB.prepare("SELECT COUNT(*) n FROM avr_agent_change_requests WHERE customer_id=? AND created_at>=?").bind(c.id,new Date(Date.now()-3600000).toISOString()).first();if(Number(recent?.n||0)>=10)throw Error("request_limit_reached_try_again_later");
   const assigned=await env.DB.prepare("SELECT agent_id FROM avr_agents WHERE customer_id=? ORDER BY agent_name LIMIT 1").bind(c.id).first();
   const id=crypto.randomUUID(),title=({voice:"Voice or voice provider",language:"Language configuration",knowledge_base:"Business knowledge and FAQs",denoising:"Background-noise handling",safety:"Safety guardrails",privacy:"Personal-information redaction",sms:"SMS messaging",phone:"Phone number or call routing",workflow:"Calendar, CRM or workflow",greeting:"Greeting, tone or call flow",other:"Other configuration change"})[requestType];
   await env.DB.prepare("INSERT INTO avr_agent_change_requests(id,customer_id,agent_id,request_type,title,details,priority,status) VALUES(?,?,?,?,?,?,?,'submitted')").bind(id,c.id,assigned?.agent_id||null,requestType,title,details,priority).run();
   await env.DB.prepare("INSERT INTO avr_support_tickets(id,customer_id,category,subject,description,priority,status) VALUES(?,?,?,?,?,?,?)").bind(crypto.randomUUID(),c.id,"change_request","Agent configuration: "+title,details,priority,"open").run();
   return json({created:true,id,status:"submitted"},201,origin,env)
  }
  if(path==="/api/client/addons"&&req.method==="GET"){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   const r=await env.DB.prepare("SELECT id,addon_key,addon_name,billing_type,status,customer_note,created_at,updated_at FROM avr_addon_orders WHERE customer_id=? ORDER BY created_at DESC LIMIT 100").bind(c.id).all();
   return json({orders:r.results||[]},200,origin,env)
  }
  if(path==="/api/client/addons"&&req.method==="POST"){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   const p=await body(req,3000),key=String(p.addonKey||"");
   const catalog={
    voice_cloning:["Custom Voice Cloning","one_time"],
    sms_messaging:["SMS Messaging","usage"],
    extra_numbers:["Additional Phone Numbers","monthly"],
    advanced_analytics:["Advanced Analytics","monthly"],
    calendar_booking:["Calendar & Appointment Booking","one_time"],
    crm_integration:["CRM Integration","one_time"],
    extra_languages:["Additional Language Configuration","one_time"],
    priority_support:["Priority Support","monthly"]
   };
   if(!catalog[key])throw Error("invalid_addon");
   const duplicate=await env.DB.prepare("SELECT id FROM avr_addon_orders WHERE customer_id=? AND addon_key=? AND status IN ('requested','approved','in_progress','active') LIMIT 1").bind(c.id,key).first();
   if(duplicate)throw Error("this_addon_already_has_an_open_order");
   const id=crypto.randomUUID(),note=String(p.note||"").trim().slice(0,1500);
   await env.DB.prepare("INSERT INTO avr_addon_orders(id,customer_id,addon_key,addon_name,billing_type,customer_note) VALUES(?,?,?,?,?,?)").bind(id,c.id,key,catalog[key][0],catalog[key][1],note).run();
   return json({created:true,id,status:"requested"},201,origin,env)
  }
  if(path==="/api/client/support-tickets"&&req.method==="GET"){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   const r=await env.DB.prepare("SELECT id,category,subject,description,priority,status,admin_reply,created_at,updated_at FROM avr_support_tickets WHERE customer_id=? ORDER BY created_at DESC LIMIT 100").bind(c.id).all();
   return json({tickets:r.results||[]},200,origin,env)
  }
  if(path==="/api/client/support-tickets"&&req.method==="POST"){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   const p=await body(req,8000),category=String(p.category||""),subject=String(p.subject||"").trim(),description=String(p.description||"").trim(),priority=String(p.priority||"normal");
   if(!["change_request","technical_support","concern","billing","general"].includes(category))throw Error("invalid_ticket_category");
   if(!["normal","high","urgent"].includes(priority))throw Error("invalid_ticket_priority");
   if(subject.length<4||subject.length>140)throw Error("subject_must_be_4_to_140_characters");
   if(description.length<10||description.length>5000)throw Error("details_must_be_10_to_5000_characters");
   const recent=await env.DB.prepare("SELECT COUNT(*) AS n FROM avr_support_tickets WHERE customer_id=? AND created_at>=?").bind(c.id,new Date(Date.now()-3600000).toISOString()).first();
   if(Number(recent?.n||0)>=10)throw Error("support_request_limit_reached_try_again_later");
   const id=crypto.randomUUID();
   await env.DB.prepare("INSERT INTO avr_support_tickets(id,customer_id,category,subject,description,priority,status) VALUES(?,?,?,?,?,?,?)").bind(id,c.id,category,subject,description,priority,"open").run();
   return json({created:true,id,status:"open"},201,origin,env)
  }
  if(path==="/api/client/call-email-settings"&&(req.method==="GET"||req.method==="PUT")){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   if(req.method==="GET"){
    const row=await env.DB.prepare("SELECT enabled,recipients_json FROM avr_call_email_settings WHERE customer_id=?").bind(c.id).first();
    let recipients=[];try{recipients=JSON.parse(row?.recipients_json||"[]")}catch{}
    return json({enabled:Number(row?.enabled||0)===1,recipients},200,origin,env)
   }
   const p=await body(req,5000),raw=Array.isArray(p.recipients)?p.recipients:[],recipients=[...new Set(raw.map(x=>String(x).trim().toLowerCase()).filter(Boolean))];
   if(recipients.length>10)throw Error("maximum_10_email_recipients");
   if(recipients.some(x=>x.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x)))throw Error("enter_valid_recipient_email_addresses");
   if(p.enabled&&recipients.length===0)throw Error("add_at_least_one_recipient_to_enable_emails");
   await env.DB.prepare("INSERT INTO avr_call_email_settings(customer_id,enabled,recipients_json,updated_at) VALUES(?,?,?,?) ON CONFLICT(customer_id) DO UPDATE SET enabled=excluded.enabled,recipients_json=excluded.recipients_json,updated_at=excluded.updated_at").bind(c.id,p.enabled?1:0,JSON.stringify(recipients),new Date().toISOString()).run();
   return json({saved:true,enabled:!!p.enabled,recipients},200,origin,env)
  }
  const callEmailMatch=path.match(/^\/api\/client\/calls\/([^/]+)\/email$/);
  if(callEmailMatch&&req.method==="POST"){
   const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);
   if(!env.RESEND_API_KEY||!env.RESEND_FROM_EMAIL)throw Error("call_email_not_configured_contact_support");
   const callId=decodeURIComponent(callEmailMatch[1]);if(!callId||callId.length>160)throw Error("invalid_call_id");
   const p=await body(req,5000),to=String(p.email||"").trim().toLowerCase();
   if(to.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to))throw Error("valid_recipient_email_required");
   const call=await env.DB.prepare("SELECT call_id,from_number,to_number,direction,call_status,duration_ms,start_timestamp,transcript,call_summary,user_sentiment,disconnection_reason FROM avr_calls WHERE call_id=? AND customer_id=? LIMIT 1").bind(callId,c.id).first();
   if(!call)throw Error("call_not_found");
   const esc=v=>String(v??"—").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
   const date=call.start_timestamp?new Date(Number(call.start_timestamp)>1e12?Number(call.start_timestamp):Number(call.start_timestamp)*1000).toISOString():"Unknown";
   const duration=Math.ceil(Number(call.duration_ms||0)/60000)+" minute(s)";
   const subject="Call details — "+String(call.from_number||"Unknown caller");
   const plain=["AIVirtualReceptionist.online — Call details","Business: "+(c.business_name||"Your business"),"Caller: "+(call.from_number||"Unknown"),"Business line: "+(call.to_number||"Unknown"),"Date/time: "+date,"Direction: "+(call.direction||"Unknown"),"Status: "+(call.call_status||"Unknown"),"Duration: "+duration,"Sentiment: "+(call.user_sentiment||"Unknown"),"Disconnection: "+(call.disconnection_reason||"Unknown"),"","Summary:",call.call_summary||"No summary available.","","Transcript:",call.transcript||"No transcript available."].join("\n");
   const html="<div style=\"font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#20343b\"><h2>Call details</h2><p><b>Business:</b> "+esc(c.business_name)+"</p><p><b>Caller:</b> "+esc(call.from_number)+"<br><b>Business line:</b> "+esc(call.to_number)+"<br><b>Date/time:</b> "+esc(date)+"<br><b>Direction:</b> "+esc(call.direction)+"<br><b>Status:</b> "+esc(call.call_status)+"<br><b>Duration:</b> "+esc(duration)+"<br><b>Sentiment:</b> "+esc(call.user_sentiment)+"</p><h3>Call summary</h3><p>"+esc(call.call_summary||"No summary available.")+"</p><h3>Transcript</h3><pre style=\"white-space:pre-wrap;font:14px/1.5 Arial,sans-serif;background:#f4f7f7;padding:16px;border-radius:8px\">"+esc(call.transcript||"No transcript available.")+"</pre><p style=\"font-size:12px;color:#68777c\">Sent securely from your AIVirtualReceptionist.online client portal.</p></div>";
   const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json","Idempotency-Key":"avr-call-details/"+call.call_id+"/"+to},body:JSON.stringify({from:env.RESEND_FROM_EMAIL,to:[to],subject,html,text:plain})});
   const result=await sent.json().catch(()=>({}));
   if(!sent.ok){console.error("call_email_send_failed",sent.status,result);throw Error(sent.status===401||sent.status===403?"email_sender_not_configured_check_resend": "call_email_send_failed_try_again")}
   return json({sent:true,emailId:result.id||null},200,origin,env);
  }
  if(path==="/api/client/profile"&&req.method==="PATCH"){const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);const p=await body(req),name=String(p.businessName||"").trim().slice(0,160),contact=String(p.contactName||"").trim().slice(0,120),phone=String(p.phone||"").trim().slice(0,40);if(name.length<2)throw Error("business_name_required");await env.DB.prepare("UPDATE avr_customers SET business_name=?,contact_name=?,phone=?,updated_at=? WHERE id=?").bind(name,contact,phone,new Date().toISOString(),c.id).run();return json({saved:true},200,origin,env)}
  if(path==="/api/billing/checkout"&&req.method==="POST"){const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c)return json({error:"customer_account_not_found"},404,origin,env);const p=await body(req);return json(await createCheckout(u,c,String(p.plan||""),env),200,origin,env)}
  if(path==="/api/billing/portal"&&req.method==="POST"){const u=await clerkUser(req,env),c=await customerFor(u,env);if(!c?.stripe_customer_id)throw Error("stripe_customer_not_found");const s=await stripeRequest(env,"billing_portal/sessions",{customer:c.stripe_customer_id,return_url:"https://aivirtualreceptionist.online/client/" });return json({url:s.url},200,origin,env)}
  if(path.startsWith("/api/admin/")){
   const u=await requireAdmin(req,env);

   if(path==="/api/admin/agent-change-requests"&&req.method==="GET"){
    const r=await env.DB.prepare("SELECT r.*,c.business_name,c.email FROM avr_agent_change_requests r LEFT JOIN avr_customers c ON c.id=r.customer_id ORDER BY CASE r.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 ELSE 2 END,r.created_at DESC LIMIT 300").all();return json({requests:r.results||[]},200,origin,env)
   }
   const agentRequestMatch=path.match(/^\/api\/admin\/agent-change-requests\/([a-f0-9-]{36})$/i);
   if(agentRequestMatch&&req.method==="PATCH"){
    const id=agentRequestMatch[1],p=await body(req,5000),status=String(p.status||"");
    if(!["reviewing","quoted","in_progress","completed","declined"].includes(status))throw Error("invalid_agent_request_status");
    const exists=await env.DB.prepare("SELECT id,customer_id,client_approved_at FROM avr_agent_change_requests WHERE id=?").bind(id).first();if(!exists)throw Error("agent_change_request_not_found");
    const quote=p.quoteSummary===undefined?null:String(p.quoteSummary).trim().slice(0,2500),note=p.adminNote===undefined?null:String(p.adminNote).trim().slice(0,1500);
    if(status==="quoted"&&!String(quote??"").trim()&&!String((await env.DB.prepare("SELECT quote_summary FROM avr_agent_change_requests WHERE id=?").bind(id).first())?.quote_summary||"").trim())throw Error("written_quote_required_before_marking_quoted");
    if(["in_progress","completed"].includes(status)&&!exists.client_approved_at)throw Error("client_approval_required_before_work_can_start");
    await env.DB.prepare("UPDATE avr_agent_change_requests SET status=?,quote_summary=COALESCE(?,quote_summary),admin_note=COALESCE(?,admin_note),updated_at=? WHERE id=?").bind(status,quote,note,new Date().toISOString(),id).run();
    await audit(env,u,"agent_change_request_updated",exists.customer_id,{requestId:id,status});
    return json({saved:true},200,origin,env)
   }
   if(path==="/api/admin/addon-orders"&&req.method==="GET"){
    const r=await env.DB.prepare("SELECT o.*,c.business_name,c.email FROM avr_addon_orders o LEFT JOIN avr_customers c ON c.id=o.customer_id ORDER BY CASE o.status WHEN 'requested' THEN 0 WHEN 'approved' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END,o.created_at DESC LIMIT 300").all();
    return json({orders:r.results||[]},200,origin,env)
   }
   const addonMatch=path.match(/^\/api\/admin\/addon-orders\/([a-f0-9-]{36})$/i);
   if(addonMatch&&req.method==="PATCH"){
    const p=await body(req,3000),id=addonMatch[1],status=String(p.status||"");
    if(!["approved","in_progress","active","declined","cancelled"].includes(status))throw Error("invalid_addon_order_status");
    const exists=await env.DB.prepare("SELECT id,customer_id FROM avr_addon_orders WHERE id=?").bind(id).first();if(!exists)throw Error("addon_order_not_found");
    await env.DB.prepare("UPDATE avr_addon_orders SET status=?,admin_note=?,updated_at=? WHERE id=?").bind(status,p.adminNote===undefined?null:String(p.adminNote).slice(0,1500),new Date().toISOString(),id).run();
    await audit(env,u,"addon_order_updated",exists.customer_id,{orderId:id,status});
    return json({saved:true},200,origin,env)
   }
   if(path==="/api/admin/support-tickets"&&req.method==="GET"){
    const status=url.searchParams.get("status"),filtered=status&&["open","in_progress","waiting_on_customer","resolved","closed"].includes(status);
    const q="SELECT t.*,c.business_name,c.email FROM avr_support_tickets t LEFT JOIN avr_customers c ON c.id=t.customer_id"+(filtered?" WHERE t.status=?":"")+" ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 ELSE 2 END,CASE t.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'waiting_on_customer' THEN 2 ELSE 3 END,t.created_at DESC LIMIT 300";
    const r=filtered?await env.DB.prepare(q).bind(status).all():await env.DB.prepare(q).all();
    return json({tickets:r.results||[]},200,origin,env)
   }
   const supportAdminMatch=path.match(/^\/api\/admin\/support-tickets\/([a-f0-9-]{36})$/i);
   if(supportAdminMatch&&req.method==="PATCH"){
    const id=supportAdminMatch[1],p=await body(req,7000),status=String(p.status||"");
    if(!["open","in_progress","waiting_on_customer","resolved","closed"].includes(status))throw Error("invalid_ticket_status");
    const exists=await env.DB.prepare("SELECT id,customer_id FROM avr_support_tickets WHERE id=?").bind(id).first();if(!exists)throw Error("support_ticket_not_found");
    const reply=p.adminReply===undefined?null:String(p.adminReply).trim().slice(0,5000);
    await env.DB.prepare("UPDATE avr_support_tickets SET status=?,admin_reply=COALESCE(?,admin_reply),updated_at=? WHERE id=?").bind(status,reply,new Date().toISOString(),id).run();
    await audit(env,u,"support_ticket_updated",exists.customer_id,{ticketId:id,status});
    return json({saved:true},200,origin,env)
   }
   if(path==="/api/admin/overview"&&req.method==="GET"){const [cc,active,subs,calls,mins]=await Promise.all([env.DB.prepare("SELECT COUNT(*) n FROM avr_customers").first(),env.DB.prepare("SELECT COUNT(*) n FROM avr_customers WHERE status='active'").first(),env.DB.prepare("SELECT COUNT(*) n FROM avr_customers WHERE subscription_status IN ('active','trialing')").first(),env.DB.prepare("SELECT COUNT(*) n FROM avr_calls").first(),env.DB.prepare("SELECT COALESCE(SUM(duration_ms),0) n FROM avr_calls WHERE start_timestamp>=?").bind(new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime()).first()]);return json({customers:cc.n,activeCustomers:active.n,activeSubscriptions:subs.n,totalCalls:calls.n,minutesThisMonth:Math.ceil(Number(mins.n||0)/60000)},200,origin,env)}
   if(path==="/api/admin/customers"&&req.method==="GET"){const r=await env.DB.prepare("SELECT c.*, (SELECT COUNT(*) FROM avr_calls x WHERE x.customer_id=c.id) AS total_calls,(SELECT COALESCE(SUM(duration_ms),0) FROM avr_calls x WHERE x.customer_id=c.id AND x.start_timestamp>=?) AS usage_ms FROM avr_customers c ORDER BY c.created_at DESC LIMIT 500").bind(new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime()).all();return json({customers:(r.results||[]).map(c=>({...c,usage_minutes:Math.ceil(Number(c.usage_ms||0)/60000),usage_ms:undefined}))},200,origin,env)}
   if(path==="/api/admin/customers"&&req.method==="POST"){const p=await body(req),business=String(p.businessName||"").trim(),email=String(p.email||"").trim().toLowerCase();if(business.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))throw Error("valid_business_and_email_required");const exists=await env.DB.prepare("SELECT id FROM avr_customers WHERE lower(email)=?").bind(email).first();if(exists)throw Error("customer_email_already_exists");const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO avr_customers(id,business_name,contact_name,email,phone,clerk_user_id,status,admin_notes) VALUES(?,?,?,?,?,?,?,?)").bind(id,business,String(p.contactName||"").slice(0,120),email,String(p.phone||"").slice(0,40),String(p.clerkUserId||"").trim()||null,"pending",String(p.notes||"").slice(0,2000)).run();await audit(env,u,"customer_created",id,{email});return json({created:true,id},201,origin,env)}
   const workspaceMatch=path.match(/^\/api\/admin\/customers\/([a-f0-9-]{36})\/workspace$/i);
   if(workspaceMatch&&req.method==="GET"){
    const id=workspaceMatch[1],customer=await env.DB.prepare("SELECT id,business_name,contact_name,email,phone,status,plan_key,included_minutes,subscription_status,stripe_customer_id,admin_notes,created_at,updated_at FROM avr_customers WHERE id=?").bind(id).first();
    if(!customer)throw Error("customer_not_found");
    const [agents,nums,emailRow,tickets,orders,calls]=await Promise.all([
     env.DB.prepare("SELECT agent_id,agent_name,status FROM avr_agents WHERE customer_id=? ORDER BY agent_name").bind(id).all(),
     env.DB.prepare("SELECT phone_number,nickname,agent_id FROM avr_numbers WHERE customer_id=? ORDER BY phone_number").bind(id).all(),
     env.DB.prepare("SELECT enabled,recipients_json FROM avr_call_email_settings WHERE customer_id=?").bind(id).first(),
     env.DB.prepare("SELECT id,category,subject,description,priority,status,admin_reply,created_at FROM avr_support_tickets WHERE customer_id=? ORDER BY created_at DESC LIMIT 8").bind(id).all(),
     env.DB.prepare("SELECT id,addon_name,billing_type,status,customer_note,admin_note,created_at FROM avr_addon_orders WHERE customer_id=? ORDER BY created_at DESC LIMIT 8").bind(id).all(),
     env.DB.prepare("SELECT call_id,from_number,to_number,direction,call_status,duration_ms,start_timestamp,call_summary FROM avr_calls WHERE customer_id=? ORDER BY start_timestamp DESC LIMIT 8").bind(id).all()
    ]);
    let recipients=[];try{recipients=JSON.parse(emailRow?.recipients_json||"[]")}catch{}
    return json({customer,agents:agents.results||[],numbers:nums.results||[],callEmail:{enabled:Number(emailRow?.enabled||0)===1,recipients},tickets:tickets.results||[],orders:orders.results||[],calls:calls.results||[]},200,origin,env)
   }
   if(workspaceMatch&&req.method==="PUT"){
    const id=workspaceMatch[1],p=await body(req,10000),customer=await env.DB.prepare("SELECT id FROM avr_customers WHERE id=?").bind(id).first();
    if(!customer)throw Error("customer_not_found");
    const status=p.status,plan=p.plan;
    if(status!==undefined&& !["pending","active","suspended","closed"].includes(status))throw Error("invalid_status");
    if(plan!==undefined&&!planInfo[plan])throw Error("invalid_plan");
    const business=p.businessName===undefined?null:String(p.businessName).trim().slice(0,160);
    if(business!==null&&business.length<2)throw Error("business_name_required");
    const contact=p.contactName===undefined?null:String(p.contactName).trim().slice(0,120);
    const phone=p.phone===undefined?null:String(p.phone).trim().slice(0,40);
    const notes=p.adminNotes===undefined?null:String(p.adminNotes).slice(0,2000);
    await env.DB.prepare("UPDATE avr_customers SET business_name=COALESCE(?,business_name),contact_name=COALESCE(?,contact_name),phone=COALESCE(?,phone),status=COALESCE(?,status),plan_key=COALESCE(?,plan_key),included_minutes=CASE WHEN ?='starter' THEN 300 WHEN ?='growth' THEN 600 WHEN ?='pro' THEN 1000 ELSE included_minutes END,admin_notes=COALESCE(?,admin_notes),updated_at=? WHERE id=?")
     .bind(business,contact,phone,status||null,plan||null,plan||"",plan||"",plan||"",notes,new Date().toISOString(),id).run();
    if(p.callEmail&&typeof p.callEmail==="object"){
     const recipients=Array.isArray(p.callEmail.recipients)?[...new Set(p.callEmail.recipients.map(x=>String(x).trim().toLowerCase()).filter(Boolean))]:[];
     if(recipients.length>10)throw Error("maximum_10_email_recipients");
     if(recipients.some(x=>!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x)))throw Error("invalid_call_email_recipient");
     await env.DB.prepare("INSERT INTO avr_call_email_settings(customer_id,enabled,recipients_json,updated_at) VALUES(?,?,?,?) ON CONFLICT(customer_id) DO UPDATE SET enabled=excluded.enabled,recipients_json=excluded.recipients_json,updated_at=excluded.updated_at")
      .bind(id,p.callEmail.enabled?1:0,JSON.stringify(recipients),new Date().toISOString()).run();
    }
    await audit(env,u,"client_workspace_updated",id,{status:status||null,plan:plan||null,callEmailUpdated:!!p.callEmail});
    return json({saved:true},200,origin,env)
   }
   const cm=path.match(/^\/api\/admin\/customers\/([a-f0-9-]{36})$/i);if(cm&&req.method==="PATCH"){const p=await body(req),id=cm[1],c=await env.DB.prepare("SELECT id FROM avr_customers WHERE id=?").bind(id).first();if(!c)throw Error("customer_not_found");const status=p.status,plan=p.plan;if(status&&!["pending","active","suspended","closed"].includes(status))throw Error("invalid_status");if(plan&&!planInfo[plan])throw Error("invalid_plan");await env.DB.prepare("UPDATE avr_customers SET status=COALESCE(?,status),plan_key=COALESCE(?,plan_key),included_minutes=CASE WHEN ?='starter' THEN 300 WHEN ?='growth' THEN 600 WHEN ?='pro' THEN 1000 ELSE included_minutes END,admin_notes=COALESCE(?,admin_notes),updated_at=? WHERE id=?").bind(status||null,plan||null,plan||"",plan||"",plan||"",p.notes===undefined?null:String(p.notes).slice(0,2000),new Date().toISOString(),id).run();await audit(env,u,"customer_updated",id,p);return json({saved:true},200,origin,env)}
   if(path==="/api/admin/retell/sync"&&req.method==="POST"){const result=await syncRetell(env);await audit(env,u,"retell_sync",null,result);return json(result,200,origin,env)}
   if(path==="/api/admin/retell/resources"&&req.method==="GET"){const [a,n]=await Promise.all([env.DB.prepare("SELECT a.*,c.business_name FROM avr_agents a LEFT JOIN avr_customers c ON c.id=a.customer_id ORDER BY a.agent_name").all(),env.DB.prepare("SELECT n.*,c.business_name FROM avr_numbers n LEFT JOIN avr_customers c ON c.id=n.customer_id ORDER BY n.phone_number").all()]);return json({agents:a.results||[],numbers:n.results||[]},200,origin,env)}
   if(path==="/api/admin/assignments"&&req.method==="POST"){const p=await body(req),customerId=String(p.customerId||""),agentId=String(p.agentId||""),phone=String(p.phoneNumber||"");const c=await env.DB.prepare("SELECT id FROM avr_customers WHERE id=?").bind(customerId).first();if(!c)throw Error("customer_not_found");if(agentId){const a=await env.DB.prepare("SELECT agent_id FROM avr_agents WHERE agent_id=?").bind(agentId).first();if(!a)throw Error("agent_not_found")}if(phone){const n=await env.DB.prepare("SELECT phone_number FROM avr_numbers WHERE phone_number=?").bind(phone).first();if(!n)throw Error("phone_number_not_found");if(!agentId)throw Error("select_agent_for_phone_number");await retellApi(env,"/update-phone-number/"+encodeURIComponent(phone),"PATCH",{inbound_agents:[{agent_id:agentId,weight:1}],outbound_agents:[{agent_id:agentId,weight:1}]})}
    if(agentId)await env.DB.prepare("UPDATE avr_agents SET customer_id=? WHERE agent_id=?").bind(customerId,agentId).run();if(phone)await env.DB.prepare("UPDATE avr_numbers SET customer_id=?,agent_id=? WHERE phone_number=?").bind(customerId,agentId||null,phone).run();await audit(env,u,"resources_assigned",customerId,{agentId,phone});return json({saved:true},200,origin,env)}
   if(path==="/api/admin/calls"&&req.method==="GET"){const r=await env.DB.prepare("SELECT x.*,c.business_name FROM avr_calls x LEFT JOIN avr_customers c ON c.id=x.customer_id ORDER BY x.start_timestamp DESC LIMIT 200").all();return json({calls:r.results||[]},200,origin,env)}
   if(path==="/api/admin/retell/events"&&req.method==="GET"){const limit=Math.min(500,Math.max(1,Number(url.searchParams.get("limit")||200)));const r=await env.DB.prepare("SELECT e.event_id,e.event_type,e.call_id,e.agent_id,e.customer_id,c.business_name,e.received_at,e.payload_json FROM avr_retell_events e LEFT JOIN avr_customers c ON c.id=e.customer_id ORDER BY e.received_at DESC LIMIT ?").bind(limit).all();return json({events:r.results||[]},200,origin,env)}
   if(path==="/api/admin/billing-events"&&req.method==="GET"){const r=await env.DB.prepare("SELECT e.*,c.business_name,c.email FROM avr_billing_events e LEFT JOIN avr_customers c ON c.id=e.customer_id ORDER BY e.event_created DESC LIMIT 100").all();return json({events:r.results||[]},200,origin,env)}
   return json({error:"admin_route_not_found"},404,origin,env)
  }
  return json({error:"not_found"},404,origin,env)
 }catch(e){console.error("api_error",path,e.message);return fail(e,origin,env)}
}
export default {async fetch(request,env){try{return await route(request,env)}catch(e){return json({error:"internal_error"},500,request.headers.get("Origin"),env)}}};