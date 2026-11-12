const DEFAULT_ALLOWED_ORIGINS = ["https://star69ai.com","https://www.star69ai.com","https://hisjarman.github.io"];
let jwksCache = { expiresAt: 0, keys: [] };
function allowedOrigins(env) { const v=(env.ALLOWED_ORIGINS||"").split(",").map(x=>x.trim()).filter(Boolean); return v.length?v:DEFAULT_ALLOWED_ORIGINS; }
function headersFor(origin,env) {
  const h={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Frame-Options":"DENY","Vary":"Origin"};
  if(origin&&allowedOrigins(env).includes(origin)){h["Access-Control-Allow-Origin"]=origin;h["Access-Control-Allow-Methods"]="GET, POST, PATCH, OPTIONS";h["Access-Control-Allow-Headers"]="Authorization, Content-Type, Accept";h["Access-Control-Max-Age"]="86400";}
  return h;
}
function json(data,status,origin,env){return new Response(JSON.stringify(data),{status:status||200,headers:headersFor(origin,env)});}
function base64UrlBytes(v){const n=v.replace(/-/g,"+").replace(/_/g,"/");const p=n+"=".repeat((4-n.length%4)%4);const r=atob(p);return Uint8Array.from(r,c=>c.charCodeAt(0));}
function decodePart(v){return JSON.parse(new TextDecoder().decode(base64UrlBytes(v)));}
async function getJwks(issuer){
  if(jwksCache.expiresAt>Date.now()&&jwksCache.keys.length)return jwksCache.keys;
  const r=await fetch(issuer.replace(/\/$/,"")+"/.well-known/jwks.json",{headers:{"Accept":"application/json"}});
  if(!r.ok)throw new Error("clerk_jwks_unavailable");
  const d=await r.json();if(!Array.isArray(d.keys)||!d.keys.length)throw new Error("clerk_jwks_invalid");
  jwksCache={keys:d.keys,expiresAt:Date.now()+600000};return d.keys;
}
async function verifySessionToken(request,env){
  const auth=request.headers.get("Authorization")||"";const token=auth.match(/^Bearer\s+(.+)$/i)?.[1];if(!token)throw new Error("sign_in_required");
  const p=token.split(".");if(p.length!==3)throw new Error("invalid_session");
  const head=decodePart(p[0]),claims=decodePart(p[1]);if(head.alg!=="RS256"||!head.kid)throw new Error("invalid_session");
  const issuer=(env.CLERK_ISSUER||"").replace(/\/$/,"");if(!issuer||claims.iss!==issuer)throw new Error("invalid_session_issuer");
  const now=Math.floor(Date.now()/1000);if(!claims.sub||!claims.exp||claims.exp<=now||(claims.nbf&&claims.nbf>now))throw new Error("session_expired");
  const origin=request.headers.get("Origin");
  if(claims.azp&&origin){let azp="";try{azp=new URL(claims.azp).origin;}catch{}if(azp&&azp!==origin)throw new Error("invalid_authorized_party");}
  const keys=await getJwks(issuer);const jwk=keys.find(k=>k.kid===head.kid&&k.kty==="RSA");if(!jwk){jwksCache.expiresAt=0;throw new Error("signing_key_not_found");}
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
  const ok=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,base64UrlBytes(p[2]),new TextEncoder().encode(p[0]+"."+p[1]));
  if(!ok)throw new Error("invalid_session_signature");return claims;
}
async function getVerifiedUser(request,env){
  const claims=await verifySessionToken(request,env);if(!env.CLERK_SECRET_KEY)throw new Error("clerk_backend_not_configured");
  const r=await fetch("https://api.clerk.com/v1/users/"+encodeURIComponent(claims.sub),{headers:{"Authorization":"Bearer "+env.CLERK_SECRET_KEY,"Accept":"application/json"}});
  if(!r.ok)throw new Error("clerk_user_lookup_failed");const u=await r.json();
  const email=(u.email_addresses||[]).find(x=>x.id===u.primary_email_address_id);
  if(!email||email.verification?.status!=="verified")throw new Error("email_verification_required");
  return {userId:claims.sub,email:String(email.email_address||"").toLowerCase()};
}
function authError(e,origin,env){
  const m=e?.message||"authentication_failed";const known=new Set(["sign_in_required","invalid_session","invalid_session_issuer","session_expired","invalid_authorized_party","signing_key_not_found","invalid_session_signature","clerk_backend_not_configured","clerk_user_lookup_failed","email_verification_required","clerk_jwks_unavailable","clerk_jwks_invalid"]);
  const status=m==="clerk_backend_not_configured"?503:m==="sign_in_required"||m==="session_expired"?401:m==="email_verification_required"?403:401;
  return json({error:known.has(m)?m:"authentication_failed"},status,origin,env);
}
async function hashIp(ip,pepper){const b=new TextEncoder().encode(String(ip||"unknown")+":"+String(pepper||"avr-trust-lab"));const d=await crypto.subtle.digest("SHA-256",b);return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,"0")).join("");}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function brandEmail(content){
  const logo="https://star69ai.com/assets/star69ai-logo.svg";
  return "<!doctype html><html><body style=\"margin:0;padding:24px 12px;background:#f3f7fa;font-family:Arial,Helvetica,sans-serif;color:#20343b\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2eaf0;border-radius:12px\"><tr><td align=\"center\" style=\"padding:24px 24px 18px;border-bottom:1px solid #e8eef3\"><a href=\"https://star69ai.com/\" style=\"text-decoration:none\"><img src=\""+logo+"\" width=\"250\" alt=\"Star69AI — Smarter Calls. Bigger Opportunity.\" style=\"display:block;width:250px;max-width:100%;height:auto;border:0\"></a></td></tr><tr><td style=\"padding:24px\">"+content+"</td></tr><tr><td style=\"padding:16px 24px 22px;border-top:1px solid #e8eef3;text-align:center;font-size:12px;line-height:1.5;color:#71808a\">Star69AI · <a href=\"https://star69ai.com/\" style=\"color:#1689a8;text-decoration:none\">star69ai.com</a></td></tr></table></body></html>";
}

async function sendResend(env,{to,subject,html,text,replyTo}){if(!env.RESEND_API_KEY)return false;try{const payload={from:"Star69AI <hello@star69ai.com>",to:Array.isArray(to)?to:[to],subject,html:brandEmail(html),text};if(replyTo)payload.reply_to=replyTo;const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify(payload)});if(!r.ok){console.error("resend_send_failed",r.status,(await r.text()).slice(0,500));return false;}return true;}catch(e){console.error("resend_send_error",e?.message||e);return false;}}
async function handleContact(request,env,origin){
let p;try{const raw=await request.text();if(raw.length>12000)return json({error:"message_too_large"},413,origin,env);p=JSON.parse(raw);}catch{return json({error:"invalid_json"},400,origin,env);}
if(String(p.website||"").trim())return json({received:true},201,origin,env);
const type=p.type==="onboarding"?"onboarding":"contact",name=String(p.name||"").trim().slice(0,120),email=String(p.email||"").trim().toLowerCase(),phone=String(p.phone||"").trim().slice(0,50)||null;
const subject=String(p.subject||(type==="onboarding"?"New setup request":"Website question")).trim().slice(0,180),message=String(p.message||p.details||"").trim().slice(0,5000),meeting=!!(p.meetingRequest||p.engineerCall),consent=p.contactConsent===true||p.contactConsent==="yes";
if(name.length<2)return json({error:"name_required"},400,origin,env);if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)||email.length>254)return json({error:"valid_email_required"},400,origin,env);if(message.length<5)return json({error:"message_required"},400,origin,env);
try{const ipHash=await hashIp(request.headers.get("CF-Connecting-IP"),env.CLERK_SECRET_KEY),since=new Date(Date.now()-3600000).toISOString(),count=await env.DB.prepare("SELECT COUNT(*) AS total FROM contact_messages WHERE ip_hash=? AND created_at>=?").bind(ipHash,since).first();if(Number(count?.total||0)>=6)return json({error:"contact_rate_limit"},429,origin,env);
const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO contact_messages (id,message_type,name,email,phone,subject,message,meeting_request,contact_consent,ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(id,type,name,email,phone,subject,message,meeting?1:0,consent?1:0,ipHash).run();
const adminSent=await sendResend(env,{to:"support@star69ai.com",subject:(meeting?"ENGINEER CALL REQUEST — ":"")+subject,replyTo:email,text:"Type: "+type+"\nName: "+name+"\nEmail: "+email+"\nPhone: "+(phone||"Not provided")+"\nEngineer call requested: "+(meeting?"Yes":"No")+"\n\n"+message,html:"<h2>New "+(type==="onboarding"?"setup request":"website message")+"</h2><p><b>Name:</b> "+escapeHtml(name)+"<br><b>Email:</b> "+escapeHtml(email)+"<br><b>Phone:</b> "+escapeHtml(phone||"Not provided")+"<br><b>Subject:</b> "+escapeHtml(subject)+"<br><b>Engineer call requested:</b> "+(meeting?"Yes":"No")+"</p><p>"+escapeHtml(message).replace(/\n/g,"<br>")+"</p>"});
const confirmationSent=(type==="contact"||consent)?await sendResend(env,{to:email,subject:type==="onboarding"?"We received your setup request":"We received your message",text:"Hi "+name+",\n\nThanks for contacting Star69AI.com. We received your message and will reply to this email address. "+(meeting?"We also noted your request to arrange a call with the engineer; this is not a confirmed booking. ":"")+"\n\nStar69AI.com",html:"<p>Hi "+escapeHtml(name)+",</p><p>Thanks for contacting Star69AI.com. We received your message and will reply to this email address.</p>"+(meeting?"<p>We also noted your request to arrange a call with the engineer. This is not a confirmed booking.</p>":"")+"<p>Star69AI.com</p>"}):false;
return json({received:true,id,notificationSent:adminSent,confirmationSent,meetingRequested:meeting},201,origin,env);}catch(e){console.error("contact_save_failed",e?.message||e);return json({error:"contact_unavailable"},503,origin,env);}}
async function handleSubmit(request,env,origin){
  let user;try{user=await getVerifiedUser(request,env);}catch(e){return authError(e,origin,env);}
  let p;try{const raw=await request.text();if(raw.length>16000)return json({error:"submission_too_large"},413,origin,env);p=JSON.parse(raw);}catch{return json({error:"invalid_json"},400,origin,env);}
  if(String(p.website||"").trim())return json({created:true},201,origin,env);
  const kind=String(p.kind||""),title=String(p.title||"").trim(),body=String(p.body||"").trim();
  const displayName=String(p.displayName||"Anonymous").trim().slice(0,60)||"Anonymous";
  const industry=String(p.industry||"General").trim().slice(0,80)||"General";
  const impact=kind==="stress_test"?Number(p.impactScore):null;
  const contactConsent=p.contactConsent==="yes"?1:p.contactConsent==="no"?0:null;
  const contactEmail=contactConsent===1?user.email:null;
  if(contactConsent===null)return json({error:"contact_preference_required"},400,origin,env);
  if(!["challenge","question","stress_test"].includes(kind))return json({error:"invalid_submission_type"},400,origin,env);
  if(title.length<3||title.length>140)return json({error:"title_must_be_3_to_140_characters"},400,origin,env);
  if(body.length<15||body.length>4000)return json({error:"body_must_be_15_to_4000_characters"},400,origin,env);
  if(kind==="stress_test"&&(!Number.isInteger(impact)||impact<0||impact>100))return json({error:"impact_score_must_be_0_to_100"},400,origin,env);
  try{
    const ipHash=await hashIp(request.headers.get("CF-Connecting-IP"),env.CLERK_SECRET_KEY);
    const since=new Date(Date.now()-3600000).toISOString();
    const uc=await env.DB.prepare("SELECT COUNT(*) AS total FROM trust_lab_submissions WHERE clerk_user_id = ? AND created_at >= ?").bind(user.userId,since).first();
    if(Number(uc?.total||0)>=5)return json({error:"submission_rate_limit"},429,origin,env);
    const ic=await env.DB.prepare("SELECT COUNT(*) AS total FROM trust_lab_submissions WHERE ip_hash = ? AND created_at >= ?").bind(ipHash,since).first();
    if(Number(ic?.total||0)>=10)return json({error:"submission_rate_limit"},429,origin,env);
    const id=crypto.randomUUID();
    await env.DB.prepare("INSERT INTO trust_lab_submissions (id,clerk_user_id,submission_type,title,body,industry,display_name,impact_score,ip_hash,contact_consent,contact_email) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id,user.userId,kind,title,body,industry,displayName,impact,ipHash,contactConsent,contactEmail).run();
    const adminSent=await sendResend(env,{to:"support@star69ai.com",subject:"Trust Lab submission awaiting review: "+title,text:"Type: "+kind+"\nTitle: "+title+"\nIndustry: "+industry+"\nDisplay name: "+displayName+"\nContact permission: "+(contactConsent===1?"Yes":"No")+(contactEmail?"\nContact email: "+contactEmail:"")+"\n\n"+body,html:"<h2>Trust Lab submission awaiting review</h2><p><b>Type:</b> "+escapeHtml(kind)+"<br><b>Title:</b> "+escapeHtml(title)+"<br><b>Industry:</b> "+escapeHtml(industry)+"<br><b>Display name:</b> "+escapeHtml(displayName)+"<br><b>Contact permission:</b> "+(contactConsent===1?"Yes":"No")+(contactEmail?"<br><b>Contact email:</b> "+escapeHtml(contactEmail):"")+"</p><p>"+escapeHtml(body).replace(/\n/g,"<br>")+"</p>"});
    const confirmationSent=contactConsent===1?await sendResend(env,{to:user.email,subject:"Your Trust Lab submission was received",text:"Your submission "+title+" has been received and is awaiting moderation. Thank you for contributing.",html:"<p>Your submission <b>"+escapeHtml(title)+"</b> has been received and is awaiting moderation. Thank you for contributing.</p>"}):false;
    return json({created:true,id,status:"pending",notificationSent:adminSent,confirmationSent},201,origin,env);
  }catch(e){console.error("trust_lab_submit_failed",e?.message||e);return json({error:"database_unavailable"},503,origin,env);}
}

async function handlePartnerApplication(request,env,origin){
  let p;try{const raw=await request.text();if(raw.length>12000)return json({error:'application_too_large'},413,origin,env);p=JSON.parse(raw);}catch{return json({error:'invalid_json'},400,origin,env);}
  if(String(p.website||'').trim())return json({received:true},201,origin,env);
  const name=String(p.name||'').trim().slice(0,120),email=String(p.email||'').trim().toLowerCase(),website=String(p.businessWebsite||'').trim().slice(0,240)||null;
  const promotionMethod=String(p.promotionMethod||'').trim().slice(0,80),audience=String(p.audience||'').trim().slice(0,120)||null,experience=String(p.experience||'').trim().slice(0,1200)||null,notes=String(p.notes||'').trim().slice(0,2000)||null;
  if(name.length<2)return json({error:'name_required'},400,origin,env);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)||email.length>254)return json({error:'valid_email_required'},400,origin,env);
  if(!['content','agency','consultant','sales','community','other'].includes(promotionMethod))return json({error:'choose_promotion_method'},400,origin,env);
  if(p.consent!==true)return json({error:'application_consent_required'},400,origin,env);
  try{const ipHash=await hashIp(request.headers.get('CF-Connecting-IP'),env.CLERK_SECRET_KEY),since=new Date(Date.now()-3600000).toISOString();const count=await env.DB.prepare('SELECT COUNT(*) AS total FROM affiliate_applications WHERE ip_hash=? AND created_at>=?').bind(ipHash,since).first();if(Number(count?.total||0)>=4)return json({error:'application_rate_limit'},429,origin,env);const existing=await env.DB.prepare("SELECT id FROM affiliate_applications WHERE email=? AND application_status='pending' ORDER BY created_at DESC LIMIT 1").bind(email).first();if(existing)return json({received:true,duplicate:true,message:'Your application is already awaiting review.'},200,origin,env);const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO affiliate_applications (id,name,email,website,promotion_method,audience,experience,notes,consent,ip_hash) VALUES (?,?,?,?,?,?,?,?,1,?)').bind(id,name,email,website,promotionMethod,audience,experience,notes,ipHash).run();const adminSent=await sendResend(env,{to:'support@star69ai.com',subject:'New affiliate partner application',replyTo:email,text:'Name: '+name+'\nEmail: '+email+'\nWebsite: '+(website||'Not provided')+'\nPromotion method: '+promotionMethod+'\nAudience: '+(audience||'Not provided')+'\n\n'+(experience||'')+'\n'+(notes||''),html:'<h2>New affiliate partner application</h2><p><b>Name:</b> '+escapeHtml(name)+'<br><b>Email:</b> '+escapeHtml(email)+'<br><b>Website:</b> '+escapeHtml(website||'Not provided')+'<br><b>Promotion method:</b> '+escapeHtml(promotionMethod)+'<br><b>Audience:</b> '+escapeHtml(audience||'Not provided')+'</p><p>'+escapeHtml(experience||'')+'<br>'+escapeHtml(notes||'')+'</p>'});const confirmationSent=await sendResend(env,{to:email,subject:'We received your partner application',text:'Hi '+name+',\n\nYour Star69AI.com partner application has been received and is awaiting manual review. We will contact you by email after review.',html:'<p>Hi '+escapeHtml(name)+',</p><p>Your Star69AI.com partner application has been received and is awaiting manual review. We will contact you by email after review.</p>'});return json({received:true,id,notificationSent:adminSent,confirmationSent,message:'Your partner application has been submitted for review.'},201,origin,env);}catch(e){console.error('affiliate_application_failed',e?.message||e);return json({error:'application_unavailable'},503,origin,env);}
}

async function handlePartnerClick(request,env,origin){
  let p;try{const raw=await request.text();if(raw.length>3000)return json({error:"request_too_large"},413,origin,env);p=JSON.parse(raw);}catch{return json({error:"invalid_json"},400,origin,env);}
  const code=String(p.partnerCode||p.code||"").trim().toUpperCase();
  if(!/^[A-Z0-9]{6,16}$/.test(code))return json({error:"invalid_partner_code"},400,origin,env);
  try{
    const partner=await env.DB.prepare("SELECT id FROM affiliate_applications WHERE partner_code=? AND application_status='approved'").bind(code).first();
    if(!partner)return json({error:"partner_not_found"},404,origin,env);
    const ipHash=await hashIp(request.headers.get("CF-Connecting-IP"),env.CLERK_SECRET_KEY),since=new Date(Date.now()-10*60000).toISOString();
    const recent=await env.DB.prepare("SELECT COUNT(*) AS total FROM partner_clicks WHERE ip_hash=? AND created_at>=?").bind(ipHash,since).first();
    if(Number(recent?.total||0)>=60)return json({error:"partner_click_rate_limit"},429,origin,env);
    const clickId=crypto.randomUUID(),now=Date.now(),createdAt=new Date(now).toISOString(),expiresAt=new Date(now+90*86400000).toISOString();
    const landingPath=String(p.landingPath||"/").slice(0,300),referrer=String(p.referrer||"").slice(0,500);
    let referrerDomain=null;try{referrerDomain=referrer?new URL(referrer).hostname.slice(0,180):null;}catch{}
    await env.DB.prepare("INSERT INTO partner_clicks(click_id,affiliate_application_id,landing_path,referrer_domain,ip_hash,created_at,expires_at) VALUES(?,?,?,?,?,?,?)").bind(clickId,partner.id,landingPath,referrerDomain,ipHash,createdAt,expiresAt).run();
    return json({tracked:true,clickId,partnerCode:code,expiresAt},201,origin,env);
  }catch(e){console.error("partner_click_failed",e?.message||e);return json({error:"partner_tracking_unavailable"},503,origin,env);}
}
async function handlePartnerLead(request,env,origin){
  let p;try{const raw=await request.text();if(raw.length>6000)return json({error:"lead_too_large"},413,origin,env);p=JSON.parse(raw);}catch{return json({error:"invalid_json"},400,origin,env);}
  if(String(p.website||"").trim())return json({recorded:true},201,origin,env);
  const code=String(p.partnerCode||"").trim().toUpperCase(),email=String(p.email||"").trim().toLowerCase();
  if(!/^[A-Z0-9]{6,16}$/.test(code)||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)||email.length>254)return json({recorded:false},200,origin,env);
  try{
    const partner=await env.DB.prepare("SELECT id,email FROM affiliate_applications WHERE partner_code=? AND application_status='approved'").bind(code).first();
    if(!partner||String(partner.email||"").trim().toLowerCase()===email)return json({recorded:false},200,origin,env);
    const ipHash=await hashIp(request.headers.get("CF-Connecting-IP"),env.CLERK_SECRET_KEY),since=new Date(Date.now()-3600000).toISOString();
    const recent=await env.DB.prepare("SELECT COUNT(*) AS total FROM partner_referrals WHERE ip_hash=? AND created_at>=?").bind(ipHash,since).first();
    if(Number(recent?.total||0)>=10)return json({error:"partner_lead_rate_limit"},429,origin,env);
    const existingCustomer=await env.DB.prepare("SELECT id FROM avr_customers WHERE lower(email)=? LIMIT 1").bind(email).first();
    if(existingCustomer)return json({recorded:false},200,origin,env);
    const now=Date.now(),createdAt=new Date(now).toISOString(),expiresAt=new Date(now+90*86400000).toISOString();
    let clickId=String(p.clickId||"").trim(),click=null;
    if(clickId)click=await env.DB.prepare("SELECT click_id,expires_at FROM partner_clicks WHERE click_id=? AND affiliate_application_id=? AND expires_at>=?").bind(clickId,partner.id,createdAt).first();
    if(!click){
      clickId=crypto.randomUUID();
      await env.DB.prepare("INSERT INTO partner_clicks(click_id,affiliate_application_id,landing_path,referrer_domain,ip_hash,created_at,expires_at) VALUES(?,?,?,?,?,?,?)").bind(clickId,partner.id,String(p.landingPath||"/get-started.html").slice(0,300),null,ipHash,createdAt,expiresAt).run();
    }
    const leadName=String(p.name||"").trim().slice(0,120)||null,businessName=String(p.business||"").trim().slice(0,160)||null;
    const attributionExpiresAt=click?.expires_at||expiresAt;
    await env.DB.prepare("INSERT OR IGNORE INTO partner_referrals(id,affiliate_application_id,click_id,lead_email,lead_name,business_name,ip_hash,lead_status,created_at,attribution_expires_at) VALUES(?,?,?,?,?,?,?,'lead',?,?)").bind(crypto.randomUUID(),partner.id,clickId,email,leadName,businessName,ipHash,createdAt,attributionExpiresAt).run();
    return json({recorded:true},201,origin,env);
  }catch(e){console.error("partner_lead_capture_failed",e?.message||e);return json({recorded:false,error:"partner_tracking_unavailable"},503,origin,env);}
}
async function handlePartnerDashboard(request,env,origin){
  let user;try{user=await getVerifiedUser(request,env);}catch(e){return authError(e,origin,env);}
  try{
    let partner=await env.DB.prepare("SELECT id,name,email,commission_tier AS commissionTier,partner_code AS partnerCode,referral_url AS referralUrl,created_at AS joinedAt FROM affiliate_applications WHERE lower(email)=? AND application_status='approved' ORDER BY updated_at DESC LIMIT 1").bind(user.email).first();
    if(!partner)return json({error:"partner_approval_required"},403,origin,env);
    const partnerCode=partner.partnerCode||("S69"+crypto.randomUUID().replace(/-/g,"").slice(0,9)).toUpperCase();
    const partnerLink="https://star69ai.com/get-started.html?ref="+partnerCode;
    if(!partner.partnerCode||partner.referralUrl!==partnerLink){
      await env.DB.prepare("UPDATE affiliate_applications SET partner_code=COALESCE(partner_code,?),referral_url=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").bind(partnerCode,partnerLink,partner.id).run();
      partner=await env.DB.prepare("SELECT id,name,email,commission_tier AS commissionTier,partner_code AS partnerCode,referral_url AS referralUrl,created_at AS joinedAt FROM affiliate_applications WHERE id=?").bind(partner.id).first();
    }
    const [clicks,leadStats,commissionStats,referrals,commissions]=await Promise.all([
      env.DB.prepare("SELECT COUNT(*) AS total FROM partner_clicks WHERE affiliate_application_id=?").bind(partner.id).first(),
      env.DB.prepare("SELECT COUNT(*) AS leads,SUM(CASE WHEN r.lead_status='converted' AND c.subscription_status IN ('active','trialing') THEN 1 ELSE 0 END) AS customers FROM partner_referrals r LEFT JOIN avr_customers c ON c.id=r.customer_id WHERE r.affiliate_application_id=?").bind(partner.id).first(),
      env.DB.prepare("SELECT COALESCE(SUM(CASE WHEN status='pending' THEN commission_amount_cents ELSE 0 END),0) AS pending,COALESCE(SUM(CASE WHEN status='paid' THEN commission_amount_cents ELSE 0 END),0) AS paid FROM partner_commissions WHERE affiliate_application_id=?").bind(partner.id).first(),
      env.DB.prepare("SELECT business_name AS businessName,lead_status AS status,created_at AS createdAt,converted_at AS convertedAt FROM partner_referrals WHERE affiliate_application_id=? ORDER BY created_at DESC LIMIT 100").bind(partner.id).all(),
      env.DB.prepare("SELECT c.commission_amount_cents AS commissionAmountCents,c.currency,c.status,c.validation_until AS validationUntil,c.created_at AS createdAt,cu.business_name AS businessName FROM partner_commissions c LEFT JOIN avr_customers cu ON cu.id=c.customer_id WHERE c.affiliate_application_id=? ORDER BY c.created_at DESC LIMIT 100").bind(partner.id).all()
    ]);
    const activeReferrals=Number(leadStats?.customers||0),assignedRate=partner.commissionTier==="founding"||partner.commissionTier==="growth"?0.25:partner.commissionTier==="premier"?0.30:0.20,thresholdRate=activeReferrals>=15?0.30:activeReferrals>=5?0.25:0.20;
    partner.currentRate=Math.max(assignedRate,thresholdRate);
    return json({partner,stats:{clicks:Number(clicks?.total||0),leads:Number(leadStats?.leads||0),customers:activeReferrals,pendingCents:Number(commissionStats?.pending||0),paidCents:Number(commissionStats?.paid||0)},referrals:referrals.results||[],commissions:commissions.results||[]},200,origin,env);
  }catch(e){console.error("partner_dashboard_failed",e?.message||e);return json({error:"partner_dashboard_unavailable"},503,origin,env);}
}

async function handleNewsletterSubscribe(request,env,origin){
  let p;try{const raw=await request.text();if(raw.length>4000)return json({error:"request_too_large"},413,origin,env);p=JSON.parse(raw);}catch{return json({error:"invalid_json"},400,origin,env);}
  if(String(p.website||"").trim())return json({subscribed:true},201,origin,env);
  const email=String(p.email||"").trim().toLowerCase(),firstName=String(p.firstName||"").trim().slice(0,80)||null;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)||email.length>254)return json({error:"valid_email_required"},400,origin,env);
  if(p.consent!==true)return json({error:"email_consent_required"},400,origin,env);
  try{
    const ipHash=await hashIp(request.headers.get("CF-Connecting-IP"),env.CLERK_SECRET_KEY),since=new Date(Date.now()-3600000).toISOString();
    const count=await env.DB.prepare("SELECT COUNT(*) AS total FROM newsletter_subscribers WHERE ip_hash=? AND updated_at>=?").bind(ipHash,since).first();
    if(Number(count?.total||0)>=5)return json({error:"signup_rate_limit"},429,origin,env);
    const token=crypto.randomUUID()+crypto.randomUUID().replace(/-/g,"");
    await env.DB.prepare("INSERT INTO newsletter_subscribers (id,email,first_name,consent_text,unsubscribe_token,ip_hash) VALUES (?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET first_name=COALESCE(excluded.first_name,newsletter_subscribers.first_name),consent_text=excluded.consent_text,status='subscribed',unsubscribe_token=excluded.unsubscribe_token,ip_hash=excluded.ip_hash,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')").bind(crypto.randomUUID(),email,firstName,"I agree to receive the free weekly Saved by the AI Receptionist story email. I can unsubscribe at any time.",token,ipHash).run();
    const unsubscribeUrl="https://avr-trust-lab-api.hisjarman.workers.dev/api/newsletter/unsubscribe?token="+encodeURIComponent(token);
    const confirmationSent=await sendResend(env,{to:email,subject:"Your weekly AI receptionist story signup",text:"You are subscribed to the weekly Saved by the AI Receptionist story email. Unsubscribe any time: "+unsubscribeUrl,html:"<p>You are subscribed to the weekly <b>Saved by the AI Receptionist</b> story email.</p><p><a href=\""+unsubscribeUrl+"\">Unsubscribe</a> at any time.</p>"});
    return json({subscribed:true,confirmationSent,message:"Your email subscription has been saved."},201,origin,env);
  }catch(e){console.error("newsletter_subscribe_failed",e?.message||e);return json({error:"newsletter_unavailable"},503,origin,env);}
}
async function handleNewsletterUnsubscribe(request,env,url){
  const token=String(url.searchParams.get("token")||"").trim();
  if(!token||token.length>100)return new Response("Invalid unsubscribe link.",{status:400,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}});
  try{
    const result=await env.DB.prepare("UPDATE newsletter_subscribers SET status='unsubscribed',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE unsubscribe_token=?").bind(token).run();
    const message=result.meta?.changes?"You're unsubscribed. This email address will no longer receive the weekly story drop.":"This unsubscribe link has already been used or is invalid.";
    return new Response("<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Newsletter preferences</title><body style=\"font:16px system-ui;background:#14252d;color:#edf4f0;padding:48px;max-width:620px;margin:auto\"><h1>Newsletter preferences</h1><p>"+message+"</p><a style=\"color:#70e1cb\" href=\"https://star69ai.com/blog/\">Return to the stories</a></body></html>",{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
  }catch(e){console.error("newsletter_unsubscribe_failed",e?.message||e);return new Response("We couldn't process that request. Please try again.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}});
  }
}

async function handleAdmin(request,env,origin,path){
  let user;try{user=await getVerifiedUser(request,env);}catch(e){return authError(e,origin,env);}
  const admins=(env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!admins.includes(user.email))return json({error:"admin_access_required"},403,origin,env);
  try{

    if(request.method==="GET"&&path==="/api/admin/partners/ledger"){
      const [referrals,commissions,summary]=await Promise.all([
        env.DB.prepare("SELECT r.id,r.lead_name AS leadName,r.lead_email AS leadEmail,r.business_name AS businessName,r.lead_status AS status,r.created_at AS createdAt,r.converted_at AS convertedAt,a.id AS partnerId,a.name AS partnerName,a.email AS partnerEmail,c.id AS customerId FROM partner_referrals r JOIN affiliate_applications a ON a.id=r.affiliate_application_id LEFT JOIN avr_customers c ON c.id=r.customer_id ORDER BY r.created_at DESC LIMIT 500").all(),
        env.DB.prepare("SELECT x.id,x.affiliate_application_id AS partnerId,a.name AS partnerName,a.email AS partnerEmail,x.customer_id AS customerId,c.business_name AS businessName,x.stripe_invoice_id AS invoiceId,x.invoice_amount_cents AS invoiceAmountCents,x.commission_rate AS commissionRate,x.commission_amount_cents AS commissionAmountCents,x.currency,x.status,x.validation_until AS validationUntil,x.paid_at AS paidAt,x.payout_reference AS payoutReference,x.created_at AS createdAt FROM partner_commissions x JOIN affiliate_applications a ON a.id=x.affiliate_application_id LEFT JOIN avr_customers c ON c.id=x.customer_id ORDER BY x.created_at DESC LIMIT 500").all(),
        env.DB.prepare("SELECT (SELECT COUNT(*) FROM partner_clicks) AS clicks,(SELECT COUNT(*) FROM partner_referrals) AS leads,(SELECT COUNT(*) FROM partner_referrals WHERE lead_status='converted') AS customers,(SELECT COALESCE(SUM(commission_amount_cents),0) FROM partner_commissions WHERE status='pending') AS pendingCents,(SELECT COALESCE(SUM(commission_amount_cents),0) FROM partner_commissions WHERE status='paid') AS paidCents").first()
      ]);
      return json({referrals:referrals.results||[],commissions:commissions.results||[],summary},200,origin,env);
    }
    const commissionMatch=path.match(/^\/api\/admin\/partners\/commissions\/([a-f0-9-]{36})$/i);
    if(request.method==="PATCH"&&commissionMatch){
      let p;try{p=await request.json();}catch{return json({error:"invalid_json"},400,origin,env);}
      const status=String(p.status||"");if(!["paid","reversed"].includes(status))return json({error:"invalid_commission_status"},400,origin,env);
      const existing=await env.DB.prepare("SELECT id,affiliate_application_id,validation_until,status FROM partner_commissions WHERE id=?").bind(commissionMatch[1]).first();
      if(!existing)return json({error:"commission_not_found"},404,origin,env);
      const now=new Date().toISOString();
      if(status==="paid"&&existing.validation_until>now)return json({error:"commission_validation_hold_active"},409,origin,env);
      if(status==="paid"){const balance=await env.DB.prepare("SELECT COALESCE(SUM(commission_amount_cents),0) AS total FROM partner_commissions WHERE affiliate_application_id=? AND status='pending' AND validation_until<=?").bind(existing.affiliate_application_id,now).first();if(Number(balance?.total||0)<5000)return json({error:"minimum_payout_threshold_not_reached"},409,origin,env);}
      await env.DB.prepare("UPDATE partner_commissions SET status=?,paid_at=CASE WHEN ?='paid' THEN ? ELSE paid_at END,payout_reference=COALESCE(?,payout_reference),admin_note=COALESCE(?,admin_note) WHERE id=?").bind(status,status,now,p.payoutReference===undefined?null:String(p.payoutReference).slice(0,160),p.adminNote===undefined?null:String(p.adminNote).slice(0,1000),commissionMatch[1]).run();
      return json({updated:true,status},200,origin,env);
    }
    if(request.method==='GET'&&path==='/api/admin/partners'){const f=new URL(request.url).searchParams.get('status')||'all';const s=['pending','approved','rejected'].includes(f)?f:'all';const cols='id,name,email,website AS businessWebsite,promotion_method AS promotionMethod,audience,experience,notes,application_status AS applicationStatus,commission_tier AS commissionTier,partner_code AS partnerCode,referral_url AS referralUrl,admin_note AS adminNote,created_at AS createdAt,updated_at AS updatedAt';const q=s==='all'?'SELECT '+cols+' FROM affiliate_applications ORDER BY created_at DESC LIMIT 500':'SELECT '+cols+' FROM affiliate_applications WHERE application_status=? ORDER BY created_at DESC LIMIT 500';const r=s==='all'?await env.DB.prepare(q).all():await env.DB.prepare(q).bind(s).all();return json({applications:r.results||[],count:(r.results||[]).length},200,origin,env);}
    const partnerMatch=path.match(new RegExp("^/api/admin/partners/([a-f0-9-]{36})$","i"));
    if(request.method==="PATCH"&&partnerMatch){
      let p;try{p=await request.json();}catch{return json({error:"invalid_json"},400,origin,env);}
      const status=p.applicationStatus,tier=p.commissionTier;
      if(status!==undefined&&!["pending","approved","rejected"].includes(status))return json({error:"invalid_application_status"},400,origin,env);
      if(tier!==undefined&&!["standard","founding","growth","premier"].includes(tier))return json({error:"invalid_commission_tier"},400,origin,env);
      const note=p.adminNote===undefined?null:String(p.adminNote).slice(0,2000);
      
      const found=await env.DB.prepare("SELECT id,name,email,application_status,partner_code,referral_url FROM affiliate_applications WHERE id=?").bind(partnerMatch[1]).first();
      if(!found)return json({error:"application_not_found"},404,origin,env);
      const nextStatus=status||found.application_status;
      const code=nextStatus==="approved"?(found.partner_code||("S69"+crypto.randomUUID().replace(/-/g,"").slice(0,9)).toUpperCase()):found.partner_code;
      const generatedUrl=code?"https://star69ai.com/get-started.html?ref="+code:null;
      const referralUrl=generatedUrl||found.referral_url;
      await env.DB.prepare("UPDATE affiliate_applications SET application_status=?,commission_tier=COALESCE(?,commission_tier),partner_code=COALESCE(partner_code,?),referral_url=COALESCE(NULLIF(? ,''),referral_url),admin_note=COALESCE(?,admin_note),updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").bind(nextStatus,tier||null,code,referralUrl||"",note,partnerMatch[1]).run();
      let notificationSent=false;
      if(nextStatus==="approved"&&found.application_status!=="approved"){
        notificationSent=await sendResend(env,{to:found.email,subject:"Your Star69AI partner application is approved",text:"Hi "+found.name+",\n\nYour Star69AI partner application has been approved. Sign in or create your account at https://star69ai.com/partner-portal/ using this verified email address. Your personal referral link is: "+referralUrl+"\\n\\nYour Partner Center shows tracked clicks, referred leads and eligible commissions. Commission credit begins only after a qualifying subscription payment is confirmed and the validation period has passed.\n\nStar69AI Partner Team",html:"<p>Hi "+escapeHtml(found.name)+",</p><p>Your Star69AI partner application has been approved.</p><p><a href=\"https://star69ai.com/partner-portal/\">Open your Partner Center</a> and sign in or create an account using this verified email address.</p><p>Your personal referral link: <a href=\""+escapeHtml(referralUrl)+"\">"+escapeHtml(referralUrl)+"</a></p><p>Your Partner Center shows tracked clicks, referred leads and eligible commissions. Commission credit begins only after a qualifying subscription payment is confirmed and the validation period has passed.</p>"});
      }
      return json({updated:true,partnerCode:code,referralUrl,notificationSent},200,origin,env);
    }
    if(request.method==="GET"&&path==="/api/admin/newsletter/subscribers"){
      const statusFilter=new URL(request.url).searchParams.get("status")==="all"?"all":"subscribed";
      const q=statusFilter==="all"?"SELECT email,first_name AS firstName,status,created_at AS createdAt,updated_at AS updatedAt,unsubscribe_token AS unsubscribeToken FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 1000":"SELECT email,first_name AS firstName,status,created_at AS createdAt,updated_at AS updatedAt,unsubscribe_token AS unsubscribeToken FROM newsletter_subscribers WHERE status='subscribed' ORDER BY created_at DESC LIMIT 1000";
      const r=await env.DB.prepare(q).all();
      const subscribers=(r.results||[]).map(s=>({...s,unsubscribeUrl:"https://avr-trust-lab-api.hisjarman.workers.dev/api/newsletter/unsubscribe?token="+encodeURIComponent(s.unsubscribeToken)}));
      return json({subscribers,count:subscribers.length},200,origin,env);
    }
    if(request.method==="GET"&&path==="/api/admin/trust-lab/pending"){
      const r=await env.DB.prepare("SELECT id,submission_type AS kind,title,body,industry,display_name AS displayName,impact_score AS impactScore,contact_consent AS contactConsent,CASE WHEN contact_consent=1 THEN contact_email ELSE NULL END AS contactEmail,created_at AS createdAt FROM trust_lab_submissions WHERE status='pending' ORDER BY created_at ASC LIMIT 100").all();
      return json({submissions:r.results||[]},200,origin,env);
    }
    const match=path.match(/^\/api\/admin\/trust-lab\/([a-f0-9-]{36})$/i);
    if(request.method==="PATCH"&&match){
      let p;try{p=await request.json();}catch{return json({error:"invalid_json"},400,origin,env);}
      if(!["approved","rejected"].includes(p.status))return json({error:"invalid_review_status"},400,origin,env);
      const r=await env.DB.prepare("UPDATE trust_lab_submissions SET status=?,reviewed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),reviewed_by=? WHERE id=? AND status='pending'").bind(p.status,user.userId,match[1]).run();
      if(!r.meta?.changes)return json({error:"submission_not_found_or_already_reviewed"},404,origin,env);
      return json({updated:true,status:p.status},200,origin,env);
    }
    return json({error:"not_found"},404,origin,env);
  }catch(e){console.error("trust_lab_admin_failed",e?.message||e);return json({error:"database_unavailable"},503,origin,env);}
}
export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get("Origin");
    if(origin&&!allowedOrigins(env).includes(origin))return new Response(JSON.stringify({error:"origin_not_allowed"}),{status:403,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:headersFor(origin,env)});
    if(request.method==="GET"&&url.pathname==="/api/health"){
      try{await env.DB.prepare("SELECT 1 AS ok").first();return json({ok:true,service:"avr-trust-lab-api",database:"connected"},200,origin,env);}
      catch{return json({ok:false,error:"database_unavailable"},503,origin,env);}
    }
    if(request.method==="POST"&&url.pathname==="/api/contact")return handleContact(request,env,origin);
    if(request.method==="POST"&&url.pathname==="/api/partners/apply")return handlePartnerApplication(request,env,origin);
    if(request.method==="POST"&&url.pathname==="/api/partners/click")return handlePartnerClick(request,env,origin);
    if(request.method==="POST"&&url.pathname==="/api/partners/lead")return handlePartnerLead(request,env,origin);
    if(request.method==="GET"&&url.pathname==="/api/partners/dashboard")return handlePartnerDashboard(request,env,origin);
    if(request.method==="POST"&&url.pathname==="/api/newsletter/subscribe")return handleNewsletterSubscribe(request,env,origin);
    if(request.method==="GET"&&url.pathname==="/api/newsletter/unsubscribe")return handleNewsletterUnsubscribe(request,env,url);
    if(request.method==="GET"&&url.pathname==="/api/trust-lab/wall"){
      try{
        const limit=Math.max(1,Math.min(40,Number(url.searchParams.get("limit")||20)));
        const r=await env.DB.prepare("SELECT id,submission_type AS kind,title,body,industry,display_name AS displayName,created_at AS createdAt FROM trust_lab_submissions WHERE status='approved' ORDER BY created_at DESC LIMIT ?").bind(limit).all();
        return json({posts:r.results||[]},200,origin,env);
      }catch(e){console.error("trust_lab_wall_failed",e?.message||e);return json({error:"database_unavailable"},503,origin,env);}
    }
    if(request.method==="POST"&&url.pathname==="/api/trust-lab/submit")return handleSubmit(request,env,origin);
    if(url.pathname.startsWith("/api/admin/"))return handleAdmin(request,env,origin,url.pathname);
    return json({error:"not_found"},404,origin,env);
  }
};
