(() => {
 const API="https://avr-trust-lab-api.hisjarman.workers.dev", $=s=>document.querySelector(s);
 const auth=$("#pa-auth"),dashboard=$("#pa-dashboard"),locked=$("#pa-locked"),actions=$("#pa-auth-actions"),userButton=$("#pa-user-button"),list=$("#pa-list"),message=$("#pa-message");
 let clerk=null,mounted=false,applications=[];
 function say(text,error=false){message.textContent=text;message.classList.toggle("error",error);message.hidden=false;}
 async function api(path,options={}){const token=await clerk.session?.getToken();if(!token)throw new Error("Session expired. Sign in again.");const r=await fetch(API+path,{...options,headers:{"Accept":"application/json",...(options.body?{"Content-Type":"application/json"}:{}),"Authorization":"Bearer "+token,...(options.headers||{})}});const d=await r.json().catch(()=>({}));if(r.status===403&&d.error==="admin_access_required"){const e=new Error("admin_access_required");e.code=e.message;throw e;}if(!r.ok)throw new Error(d.error||"Request failed ("+r.status+")");return d;}
 function updateStats(){ $("#pa-total").textContent=applications.length;$("#pa-pending").textContent=applications.filter(x=>x.applicationStatus==="pending").length;$("#pa-enrolled").textContent=applications.filter(x=>x.applicationStatus==="approved").length;}
 function field(label,name,value,type="text",wide=false){const wrap=document.createElement("label");if(wide)wrap.className="pa-wide";wrap.textContent=label;let el;if(type==="select"){el=document.createElement("select");const opts=name==="applicationStatus"?[["pending","Pending"],["approved","Approved"],["rejected","Rejected"]]:name==="commissionTier"?[["standard","Standard · 20%"],["founding","Founding · 25%"],["growth","Growth · 25%"],["premier","Premier · 30%"]]:[];opts.forEach(([v,t])=>{const o=document.createElement("option");o.value=v;o.textContent=t;el.append(o);});}else if(type==="textarea"){el=document.createElement("textarea");el.rows=3;}else{el=document.createElement("input");el.type=type;}el.name=name;el.value=value??"";wrap.append(el);return wrap;}
 function render(){const filter=$("#pa-filter").value,rows=applications.filter(x=>filter==="all"||x.applicationStatus===filter);updateStats();list.replaceChildren();if(!rows.length){const e=document.createElement("div");e.className="pa-empty";e.textContent=applications.length?"No applications match this filter.":"No partner applications yet.";list.append(e);return;}
 rows.forEach(item=>{const card=document.createElement("article");card.className="pa-card";const head=document.createElement("div");head.className="pa-card-head";const identity=document.createElement("div"),title=document.createElement("h2");title.textContent=item.name;const email=document.createElement("a");email.href="mailto:"+item.email;email.textContent=item.email;const meta=document.createElement("div");meta.className="pa-meta";meta.textContent=(item.promotionMethod||"")+" · "+(item.createdAt?new Date(item.createdAt).toLocaleString():"Date unknown");identity.append(title,email,meta);head.append(identity);card.append(head);
 if(item.businessWebsite){const site=document.createElement("p");const a=document.createElement("a");a.href=item.businessWebsite;a.target="_blank";a.rel="noopener noreferrer";a.textContent=item.businessWebsite;site.append("Website: ",a);card.append(site);}
 [["Audience",item.audience],["Experience",item.experience],["Additional notes",item.notes]].forEach(([label,value])=>{if(value){const p=document.createElement("p");p.textContent=label+": "+value;card.append(p);}});
 const fields=document.createElement("div");fields.className="pa-fields";
 fields.append(field("APPLICATION STATUS","applicationStatus",item.applicationStatus,"select"));
 fields.append(field("COMMISSION TIER","commissionTier",item.commissionTier||"standard","select"));
 const codeField=field("PARTNER CODE","partnerCode",item.partnerCode||"Assigned when the partner first signs in");const codeInput=codeField.querySelector("input");if(codeInput)codeInput.readOnly=true;fields.append(codeField);
 fields.append(field("PARTNER REFERRAL URL","referralUrl",item.referralUrl,"url",true));
 fields.append(field("PRIVATE ADMIN NOTES","adminNote",item.adminNote,"textarea",true));
 card.append(fields);const foot=document.createElement("div");foot.className="pa-actions";const result=document.createElement("span");result.className="pa-status";const reject=document.createElement("button");reject.className="pa-reject";reject.textContent="Reject";const approve=document.createElement("button");approve.className="pa-approve";approve.textContent="Approve";const save=document.createElement("button");save.className="pa-save";save.textContent="Save changes";reject.addEventListener("click",()=>{card.querySelector('[name="applicationStatus"]').value="rejected";saveCard();});approve.addEventListener("click",()=>{card.querySelector('[name="applicationStatus"]').value="approved";saveCard();});save.addEventListener("click",saveCard);foot.append(result,reject,approve,save);card.append(foot);list.append(card);
 async function saveCard(){[reject,approve,save].forEach(b=>b.disabled=true);result.textContent="Saving…";const payload={};fields.querySelectorAll("[name]").forEach(el=>payload[el.name]=el.value);try{await api("/api/admin/partners/"+encodeURIComponent(item.id),{method:"PATCH",body:JSON.stringify(payload)});Object.assign(item,payload);result.textContent="Saved";updateStats();}catch(e){result.textContent=e.message||"Save failed";}finally{[reject,approve,save].forEach(b=>b.disabled=false);}}
 });}
 function ledgerMoney(cents,currency="usd"){return new Intl.NumberFormat("en-US",{style:"currency",currency:String(currency||"usd").toUpperCase()}).format(Number(cents||0)/100);}
 async function loadLedger(){
  const refs=$("#pa-referral-rows"),commissions=$("#pa-commission-rows"),note=$("#pa-ledger-message");
  if(!refs||!commissions)return;
  refs.innerHTML='<tr><td colspan="5">Loading referrals…</td></tr>';commissions.innerHTML='<tr><td colspan="6">Loading commissions…</td></tr>';if(note)note.hidden=true;
  try{
   const d=await api("/api/admin/partners/ledger"),sum=d.summary||{};
   $("#pa-ledger-clicks").textContent=Number(sum.clicks||0).toLocaleString();
   $("#pa-ledger-leads").textContent=Number(sum.leads||0).toLocaleString();
   $("#pa-ledger-customers").textContent=Number(sum.customers||0).toLocaleString();
   $("#pa-ledger-pending").textContent=ledgerMoney(sum.pendingCents);
   $("#pa-ledger-paid").textContent=ledgerMoney(sum.paidCents);
   refs.replaceChildren();
   if(!(d.referrals||[]).length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=5;td.textContent="No referred businesses recorded yet.";tr.append(td);refs.append(tr);}
   (d.referrals||[]).forEach(item=>{const tr=document.createElement("tr");[item.partnerName,item.businessName||item.leadName,item.leadEmail,item.status,item.createdAt?new Date(item.createdAt).toLocaleDateString():"—"].forEach(value=>{const td=document.createElement("td");td.textContent=value||"—";tr.append(td);});refs.append(tr);});
   commissions.replaceChildren();
   if(!(d.commissions||[]).length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=6;td.textContent="No subscription commissions recorded yet.";tr.append(td);commissions.append(tr);}
   (d.commissions||[]).forEach(item=>{
    const tr=document.createElement("tr");
    [item.partnerName,item.businessName,ledgerMoney(item.commissionAmountCents,item.currency),item.status+(item.status==="pending"&&item.validationUntil?" · until "+new Date(item.validationUntil).toLocaleDateString():"")].forEach(value=>{const td=document.createElement("td");td.textContent=value||"—";tr.append(td);});
    const refCell=document.createElement("td"),refInput=document.createElement("input");refInput.type="text";refInput.maxLength=160;refInput.placeholder="Payment reference";refInput.value=item.payoutReference||"";refCell.append(refInput);tr.append(refCell);
    const actionCell=document.createElement("td"),button=document.createElement("button");button.type="button";button.textContent=item.status==="pending"?"Mark paid":item.status==="paid"?"Paid":"Reversed";
    const holdActive=item.status==="pending"&&item.validationUntil&&new Date(item.validationUntil)>new Date();
    button.disabled=item.status!=="pending"||!!holdActive;
    if(holdActive)button.title="Validation hold ends "+new Date(item.validationUntil).toLocaleDateString();
    button.addEventListener("click",async()=>{button.disabled=true;button.textContent="Saving…";try{await api("/api/admin/partners/commissions/"+encodeURIComponent(item.id),{method:"PATCH",body:JSON.stringify({status:"paid",payoutReference:refInput.value.trim()})});await loadLedger();}catch(e){if(note){note.textContent=e.message||"Could not update commission.";note.hidden=false;note.classList.add("error");}button.disabled=false;button.textContent="Mark paid";}});
    actionCell.append(button);tr.append(actionCell);commissions.append(tr);
   });
  }catch(e){if(note){note.textContent=e.message||"Unable to load the partner ledger.";note.hidden=false;note.classList.add("error");}}
 }
 async function load(){list.innerHTML='<div class="pa-empty">Loading applications…</div>';message.hidden=true;try{const d=await api("/api/admin/partners?status=all");applications=Array.isArray(d.applications)?d.applications:[];render();await loadLedger();}catch(e){if(e.code==="admin_access_required"){dashboard.hidden=true;locked.hidden=false;return;}say(e.message||"Could not load applications.",true);list.innerHTML='<div class="pa-empty">Unable to load partner applications.</div>';}}
 function signedOut(){auth.hidden=false;dashboard.hidden=true;locked.hidden=true;$("#pa-auth-title").textContent="Sign in to continue";$("#pa-auth-copy").textContent="Use your verified administrator account.";actions.hidden=false;userButton.hidden=true;$("#pa-session").textContent="SIGNED OUT";if(mounted){clerk.unmountUserButton(userButton);mounted=false;}}
 function signedIn(){auth.hidden=false;$("#pa-auth-title").textContent="Signed in";$("#pa-auth-copy").textContent="Your session is active. Server-side permissions are checked before applicant data is shown.";actions.hidden=true;userButton.hidden=false;$("#pa-session").textContent="SESSION ACTIVE";if(!mounted){clerk.mountUserButton(userButton);mounted=true;}dashboard.hidden=false;load();}
 $("#pa-sign-in").addEventListener("click",()=>clerk?.openSignIn());$("#pa-sign-up").addEventListener("click",()=>clerk?.openSignUp());$("#pa-refresh").addEventListener("click",load);$("#pa-ledger-refresh")?.addEventListener("click",loadLedger);$("#pa-filter").addEventListener("change",render);
 async function init(){try{if(!window.Clerk)throw new Error("Clerk did not load. Refresh and try again.");await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});clerk=window.Clerk;if(clerk.isSignedIn)signedIn();else signedOut();clerk.addListener(()=>clerk.isSignedIn?signedIn():signedOut());}catch(e){$("#pa-auth-title").textContent="Sign-in could not initialize";$("#pa-auth-copy").textContent=e.message||"Refresh and try again.";actions.hidden=true;$("#pa-session").textContent="AUTH ERROR";}}
 init();
})();