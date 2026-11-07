(()=> {
 const API="https://avr-platform-api.hisjarman.workers.dev", OVERAGE_RATE=0.49;
 const $=s=>document.querySelector(s);
 let clerk=null,customer=null,loading=false;
 function note(t,e=false){const n=$("#notice");n.textContent=t;n.classList.remove("hidden","error");if(e)n.classList.add("error")}
 async function api(path,opts={}){const token=await clerk.session?.getToken();if(!token)throw Error("Please sign in again.");const r=await fetch(API+path,{...opts,headers:{Accept:"application/json",...(opts.body?{"Content-Type":"application/json"}:{}),Authorization:"Bearer "+token,...(opts.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Request failed ("+r.status+")");return d}
 function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 function fmtDate(v){if(!v)return "—";const n=Number(v);const d=new Date(Number.isFinite(n)?(n>1e12?n:n*1000):v);return Number.isNaN(d.getTime())?"—":d.toLocaleString()}
 function safeHttps(v){try{const u=new URL(v);return u.protocol==="https:"?u.href:""}catch{return ""}}
 function money(v){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(v)}
 function showPage(page){
  const labels={overview:["Overview","A clear view of your receptionist and business activity."],receptionist:["Your receptionist","Your assigned AI receptionist and connected phone numbers."],billing:["Plan & billing","Manage your subscription, usage and business profile."],addons:["Upgrades & add-ons","Extend your receptionist with additional capabilities."],calls:["Call activity","Review recent calls, summaries, transcripts and recordings."],support:["Support center","Get help, request changes and track your support requests."]};
  document.querySelectorAll("[data-page-panel]").forEach(p=>p.classList.toggle("active",p.dataset.pagePanel===page));
  document.querySelectorAll(".client-nav-item").forEach(b=>{const active=b.dataset.page===page;b.classList.toggle("active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  const label=labels[page]||labels.overview;$("#client-page-title").textContent=label[0];$("#client-page-description").textContent=label[1];
  try{history.replaceState(null,"",page==="overview"?"#overview":"#"+page)}catch{}
 }
 function showSignedOut(){$("#auth").classList.remove("hidden");$("#app").classList.add("hidden");$("#session-pill").textContent="Signed out"}
 function renderUsage(usage,included){
  const used=Math.max(0,Number(usage.minutes||0)),allowance=Math.max(0,Number(included||0)),over=Math.max(0,used-allowance),pct=allowance?Math.min(100,used/allowance*100):0;
  $("#usage-percent").textContent=Math.round(pct)+"%";
  $("#usage-fill").style.width=pct+"%";
  $("#usage-fill").classList.toggle("over-limit",over>0);
  $("#usage-left").textContent=allowance?Math.max(0,allowance-used)+" minutes remaining": "No included minutes on this account";
  $("#usage-total").textContent=used+" of "+allowance+" included minutes";
  $("#overage-estimate").textContent="Estimated overage: "+money(over*OVERAGE_RATE);
  $("#minutes-used").textContent=used.toLocaleString();
  $("#minutes-included").textContent=allowance.toLocaleString()+" included minutes";
 }
 function renderCalls(calls,defaultEmail=""){
  const root=$("#calls-table");
  if(!calls.length){root.innerHTML='<div class="empty">No calls have been recorded for your account yet.</div>';return}
  root.innerHTML='<table><thead><tr><th>DATE</th><th>CALLER</th><th>STATUS</th><th>DURATION</th><th>SUMMARY</th><th></th></tr></thead><tbody>'+calls.map((c,i)=>{
   const summary=c.call_summary||"No summary available",transcript=c.transcript||"",recording=safeHttps(c.recording_url);
   const callId=String(c.call_id||"");
   const detail='<div class="call-detail-grid"><div><b>Call summary</b><p>'+safe(summary)+'</p><p class="small">Direction: '+safe(c.direction||"—")+' · Sentiment: '+safe(c.user_sentiment||"—")+' · Disconnection: '+safe(c.disconnection_reason||"—")+'</p><form class="call-email-form" data-call-id="'+safe(callId)+'"><label class="small" for="call-email-'+i+'">Send call details to email</label><div class="row"><input id="call-email-'+i+'" name="email" type="email" value="'+safe(defaultEmail)+'" placeholder="name@business.com" required><button class="btn secondary" type="submit">Email details</button></div><label class="small"><input type="checkbox" name="authorized" required> I confirm this recipient is authorized to receive this call information.</label><span class="small email-status" role="status"></span></form></div><div><b>Transcript</b><pre class="transcript">'+safe(transcript||"No transcript available for this call.")+'</pre>'+(recording?'<audio class="call-audio" controls preload="none" src="'+safe(recording)+'">Your browser does not support audio playback.</audio><a class="small recording-link" href="'+safe(recording)+'" target="_blank" rel="noopener noreferrer">Open recording in new tab ↗</a>':'<span class="small">No recording available</span>')+'</div></div>';
   return '<tr><td>'+safe(fmtDate(c.start_timestamp))+'</td><td>'+safe(c.from_number||"Unknown")+'</td><td><span class="status">'+safe(c.call_status||"—")+'</span></td><td>'+Math.ceil((c.duration_ms||0)/60000)+' min</td><td><div class="call-summary">'+safe(summary)+'</div></td><td><button class="btn secondary call-toggle" type="button" data-call-index="'+i+'" aria-expanded="false">Details</button></td></tr><tr class="call-detail-row hidden" data-detail-index="'+i+'"><td colspan="6">'+detail+'</td></tr>';
  }).join("")+'</tbody></table>';
  root.querySelectorAll(".call-toggle").forEach(b=>b.addEventListener("click",()=>{const row=root.querySelector('[data-detail-index="'+b.dataset.callIndex+'"]');const open=row.classList.toggle("hidden")===false;b.setAttribute("aria-expanded",String(open));b.textContent=open?"Hide":"Details"}));
  root.querySelectorAll(".call-email-form").forEach(form=>form.addEventListener("submit",async e=>{
   e.preventDefault();const button=form.querySelector('button[type="submit"]'),status=form.querySelector(".email-status"),email=form.elements.email.value.trim();
   if(!form.elements.authorized.checked){status.textContent="Please confirm the recipient is authorized.";return}
   button.disabled=true;status.textContent="Sending…";
   try{await api("/api/client/calls/"+encodeURIComponent(form.dataset.callId)+"/email",{method:"POST",body:JSON.stringify({email})});status.textContent="Call details emailed successfully."}
   catch(err){status.textContent=err.message;button.disabled=false}
  }));
 }

 const ticketCategory={change_request:"Change request",technical_support:"Technical support",concern:"Concern or complaint",billing:"Billing question",general:"General question"};
 const ticketStatus={open:"Open",in_progress:"In progress",waiting_on_customer:"Waiting on you",resolved:"Resolved",closed:"Closed"};
 function renderTickets(items){const root=$("#support-ticket-list");if(!root)return;if(!items.length){root.innerHTML='<div class="support-empty"><span>✳</span><b>No support requests yet</b><p>When you submit a request, you can track its status and our replies here.</p></div>';return}root.innerHTML=items.map(t=>'<article class="support-ticket"><div class="support-ticket-top"><div><span class="support-ticket-category">'+safe(ticketCategory[t.category]||t.category)+'</span><h4>'+safe(t.subject)+'</h4></div><span class="ticket-status '+safe(t.status)+'">'+safe(ticketStatus[t.status]||t.status)+'</span></div><p class="support-ticket-description">'+safe(t.description)+'</p><div class="support-ticket-meta"><span>Ticket #'+safe(String(t.id).slice(0,8).toUpperCase())+'</span><span>'+safe(fmtDate(t.created_at))+'</span><span class="ticket-priority '+safe(t.priority)+'">'+safe(t.priority)+' priority</span></div>'+(t.admin_reply?'<div class="support-reply"><b>Reply from support</b><p>'+safe(t.admin_reply)+'</p><span>'+safe(fmtDate(t.updated_at))+'</span></div>':'')+'</article>').join("")}
 async function loadTickets(){const root=$("#support-ticket-list");if(!root)return;root.innerHTML='<div class="empty">Loading support requests…</div>';try{const d=await api("/api/client/support-tickets");renderTickets(d.tickets||[])}catch(e){root.innerHTML='<div class="empty">'+safe(e.message)+'</div>'}}
 async function submitTicket(e){e.preventDefault();const form=e.currentTarget,button=$("#support-submit"),status=$("#support-form-status");button.disabled=true;status.textContent="Submitting securely…";try{const p=Object.fromEntries(new FormData(form).entries());await api("/api/client/support-tickets",{method:"POST",body:JSON.stringify(p)});form.reset();status.textContent="Your request has been submitted. You can track it below.";await loadTickets()}catch(err){status.textContent=err.message}finally{button.disabled=false}}

 const addonNames={voice_cloning:"Custom Voice Cloning",sms_messaging:"SMS Messaging",extra_numbers:"Additional Phone Numbers",advanced_analytics:"Advanced Analytics",calendar_booking:"Calendar & Appointment Booking",crm_integration:"CRM Integration",extra_languages:"Additional Language Configuration",priority_support:"Priority Support"};
 function addonStatus(v){return ({requested:"Request received",approved:"Approved",in_progress:"In progress",active:"Active",declined:"Not approved",cancelled:"Cancelled"})[v]||v}
 async function loadAddons(){
  const root=$("#addon-orders");if(!root)return;
  try{const d=await api("/api/client/addons");root.innerHTML=d.orders.length?d.orders.map(o=>'<div class="resource addon-order"><div><b>'+safe(o.addon_name||addonNames[o.addon_key]||o.addon_key)+'</b><span class="small">Requested '+safe(fmtDate(o.created_at))+'</span>'+(o.customer_note?'<p class="small">'+safe(o.customer_note)+'</p>':'')+'</div><span class="status '+safe(o.status)+'">'+safe(addonStatus(o.status))+'</span></div>').join(""):'<div class="empty">You have not requested any upgrades yet.</div>'}
  catch(e){root.innerHTML='<div class="empty">'+safe(e.message)+'</div>'}
 }
 async function requestAddon(key,button){
  if(button.disabled)return;
  const original=button.textContent;button.disabled=true;button.textContent="Submitting…";
  try{await api("/api/client/addons",{method:"POST",body:JSON.stringify({addonKey:key,note:$("#addon-note")?.value||""})});note("Upgrade request submitted. Our team will confirm pricing and availability before any charge.");if($("#addon-note"))$("#addon-note").value="";await loadAddons();button.textContent="Request received"}
  catch(e){note(e.message,true);button.disabled=false;button.textContent=original}
 }
 async function load(){
  if(loading)return;loading=true;$("#refresh-dashboard").disabled=true;
  try{
   const d=await api("/api/client/dashboard");customer=d.customer;
   $("#auth").classList.add("hidden");$("#app").classList.remove("hidden");$("#session-pill").textContent="Signed in";
   if(!customer){$("#no-account").classList.remove("hidden");$("#workspace").classList.add("hidden");return}
   $("#no-account").classList.add("hidden");$("#workspace").classList.remove("hidden");
   $("#business-title").textContent=customer.businessName||"Your dashboard";
   $("#account-status").textContent=customer.status||"Pending";$("#account-status").className="status "+(customer.status||"pending");
   const plans={starter:["Starter","$149 / month"],growth:["Growth","$249 / month"],pro:["Pro","$399 / month"]};
   $("#plan-name").textContent=plans[customer.plan]?.[0]||"Not selected";
   $("#plan-price").textContent=plans[customer.plan]?.[1]||"Select a monthly plan";
   renderUsage(d.usage||{},customer.includedMinutes||0);
   $("#calls-count").textContent=Number(d.usage?.calls||0).toLocaleString();
   $("#subscription-status").textContent=customer.subscriptionStatus||"Not active";
   $("#billing-portal").disabled=!customer.hasBillingAccount;
   $("#billing-portal").textContent=customer.hasBillingAccount?"Manage subscription":"Billing not started";
   document.querySelectorAll(".plan-btn").forEach(b=>{b.disabled=["active","trialing","past_due"].includes(customer.subscriptionStatus)});
   $("#renewal-date").textContent=customer.periodEnd?"Period ends "+fmtDate(customer.periodEnd):"Manage billing below";
   $("#business-name").value=customer.businessName||"";
   $("#contact-name").value=customer.contactName||"";
   $("#contact-phone").value=customer.phone||"";
   $("#contact-email").value=customer.email||"";
   $("#agent-list").innerHTML=d.agents.length?d.agents.map(a=>'<div class="resource"><b>'+safe(a.agent_name||a.agent_id)+'</b><span class="small">Your assigned AI receptionist</span></div>').join(""):'<div class="empty">Your receptionist is being prepared or has not yet been assigned.</div>';
   $("#number-list").innerHTML=d.numbers.length?d.numbers.map(n=>'<div class="resource"><b>'+safe(n.phone_number)+'</b><span class="small">'+safe(n.nickname||"Business line")+'</span></div>').join(""):'<div class="empty">Your business phone number has not been assigned yet.</div>';
   renderCalls(d.calls||[],customer.email||"");
   await Promise.all([loadAddons(),loadTickets()]);
  }catch(e){note(e.message,true)}
  finally{loading=false;$("#refresh-dashboard").disabled=false}
 }
 async function init(){
  try{
   if(!window.Clerk)throw Error("Clerk failed to load.");
   await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor},appearance:{variables:{colorPrimary:"#70e1cb",colorPrimaryForeground:"#10252b",colorBackground:"#182831",colorForeground:"#eaf1f2",colorInput:"#203943",colorInputForeground:"#eaf1f2",colorBorder:"#38535c",colorMuted:"#203943",colorMutedForeground:"#b6c3c7",colorRing:"#70e1cb",borderRadius:"12px",fontFamily:'"DM Sans",sans-serif'}}});
   clerk=window.Clerk;
   if(clerk.isSignedIn){$("#auth").classList.add("hidden");clerk.mountUserButton($("#user-button"));await load()}else showSignedOut();
   clerk.addListener(()=>{if(clerk.isSignedIn)load();else showSignedOut()});
  }catch(e){note(e.message,true)}
 }
 document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
 const initialPage=location.hash.slice(1);showPage(["overview","receptionist","billing","addons","calls","support"].includes(initialPage)?initialPage:"overview");
 $("#sign-in").onclick=()=>clerk?.openSignIn();
 $("#sign-up").onclick=()=>clerk?.openSignUp();
 $("#refresh-dashboard").onclick=()=>load();
 $("#support-ticket-form")?.addEventListener("submit",submitTicket);
 $("#refresh-tickets")?.addEventListener("click",loadTickets);
 $("#profile-form").onsubmit=async e=>{e.preventDefault();try{await api("/api/client/profile",{method:"PATCH",body:JSON.stringify({businessName:$("#business-name").value,contactName:$("#contact-name").value,phone:$("#contact-phone").value})});note("Account details saved.");await load()}catch(e){note(e.message,true)}};
 document.querySelectorAll(".addon-request").forEach(b=>b.onclick=()=>requestAddon(b.dataset.addon,b));
 $("#refresh-addons")?.addEventListener("click",loadAddons);
 $("#billing-portal").onclick=async()=>{try{const d=await api("/api/billing/portal",{method:"POST",body:"{}"});location.href=d.url}catch(e){note(e.message,true)}};
 document.querySelectorAll(".plan-btn").forEach(b=>b.onclick=async()=>{try{const d=await api("/api/billing/checkout",{method:"POST",body:JSON.stringify({plan:b.dataset.plan})});location.href=d.url}catch(e){note(e.message,true)}});
 const params=new URLSearchParams(location.search);
 if(params.has("billing"))note(params.get("billing")==="success"?"Checkout completed. Your subscription will appear after Stripe confirms the webhook.":"Checkout was cancelled.");
 init();
})();