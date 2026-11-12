(() => {
 const API="https://avr-trust-lab-api.hisjarman.workers.dev", $=s=>document.querySelector(s);
 const auth=$("#pp-auth"),dashboard=$("#pp-dashboard"),notApproved=$("#pp-not-approved"),actions=$("#pp-auth-actions"),userButton=$("#pp-user-button");
 let clerk=null,mounted=false;
 async function api(path,options={}){const token=await clerk.session?.getToken();if(!token)throw new Error("Your session expired. Please sign in again.");const r=await fetch(API+path,{...options,headers:{"Accept":"application/json",...(options.body?{"Content-Type":"application/json"}:{}),"Authorization":"Bearer "+token,...(options.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Request failed ("+r.status+")");return d;}
 function money(cents,currency="usd"){return new Intl.NumberFormat("en-US",{style:"currency",currency:String(currency||"usd").toUpperCase()}).format(Number(cents||0)/100);}
 function cell(text){const td=document.createElement("td");td.textContent=text||"—";return td;}
 function emptyRow(body,cols,message){const tr=document.createElement("tr"),td=cell(message);td.colSpan=cols;td.className="pp-empty";tr.append(td);body.replaceChildren(tr);}
 function render(data){
  $("#pp-status").textContent="PARTNER ACCOUNT · "+Math.round(Number(data.partner.currentRate||0.20)*100)+"% CURRENT COMMISSION RATE";
  $("#pp-code").textContent=data.partner.partnerCode;
  $("#pp-payout-method").value=data.partner.payoutMethod||"paypal";
  $("#pp-paypal-email").value=data.partner.paypalEmail||"";
  $("#pp-payout-status").textContent=data.partner.paypalEmail?"PAYPAL DETAILS SAVED":"PAYPAL SETUP NEEDED";
  $("#pp-payout-message").textContent=data.partner.payoutUpdatedAt?"Last updated "+new Date(data.partner.payoutUpdatedAt).toLocaleDateString():"Add your PayPal email to receive payouts.";

  $("#pp-referral-link").value=data.partner.referralUrl;
  $("#pp-clicks").textContent=Number(data.stats.clicks||0).toLocaleString();
  $("#pp-leads").textContent=Number(data.stats.leads||0).toLocaleString();
  $("#pp-customers").textContent=Number(data.stats.customers||0).toLocaleString();
  $("#pp-pending").textContent=money(data.stats.pendingCents);
  $("#pp-paid").textContent=money(data.stats.paidCents);
  $("#pp-referral-count").textContent=String(data.referrals.length);
  const referrals=$("#pp-referrals");referrals.replaceChildren();
  if(!data.referrals.length)emptyRow(referrals,3,"No referrals recorded yet.");
  data.referrals.forEach(item=>{const tr=document.createElement("tr");tr.append(cell(item.businessName||"New business lead"),cell(item.status),cell(item.createdAt?new Date(item.createdAt).toLocaleDateString():"—"));referrals.append(tr);});
  const commissions=$("#pp-commissions");commissions.replaceChildren();
  if(!data.commissions.length)emptyRow(commissions,3,"No commissions recorded yet.");
  data.commissions.forEach(item=>{const tr=document.createElement("tr");tr.append(cell(item.businessName||"Customer"),cell(money(item.commissionAmountCents,item.currency)),cell(item.status+(item.status==="pending"&&item.validationUntil?" · clears "+new Date(item.validationUntil).toLocaleDateString():"")));commissions.append(tr);});
 }
 async function load(){ $("#pp-status").textContent="LOADING PARTNER DATA";try{const data=await api("/api/partners/dashboard");render(data);auth.hidden=true;notApproved.hidden=true;dashboard.hidden=false;}catch(e){dashboard.hidden=true;if(e.message==="partner_approval_required"||e.message==="partner_account_not_found"){auth.hidden=true;notApproved.hidden=false;$("#pp-status").textContent="APPLICATION NOT APPROVED";}else{$("#pp-status").textContent=e.message||"Unable to load partner data";$("#pp-status").classList.add("pp-error");}}}
 function signedOut(){auth.hidden=false;dashboard.hidden=true;notApproved.hidden=true;actions.hidden=false;userButton.hidden=true;$("#pp-session").textContent="SIGNED OUT";if(mounted){clerk.unmountUserButton(userButton);mounted=false;}}
 function signedIn(){actions.hidden=true;userButton.hidden=false;$("#pp-session").textContent="SIGNED IN";if(!mounted){clerk.mountUserButton(userButton);mounted=true;}load();}
 $("#pp-sign-in").addEventListener("click",()=>clerk?.openSignIn());$("#pp-sign-up").addEventListener("click",()=>clerk?.openSignUp());
 $("#pp-payout-form").addEventListener("submit",async event=>{
  event.preventDefault();
  const button=$("#pp-save-payout"),message=$("#pp-payout-message"),email=$("#pp-paypal-email").value.trim();
  button.disabled=true;button.textContent="Saving…";message.textContent="";
  try{
   const result=await api("/api/partners/payout-preferences",{method:"PATCH",body:JSON.stringify({payoutMethod:"paypal",paypalEmail:email})});
   $("#pp-paypal-email").value=result.paypalEmail;
   $("#pp-payout-status").textContent="PAYPAL DETAILS SAVED";
   message.textContent="Payout details saved. Updated "+new Date(result.payoutUpdatedAt).toLocaleDateString()+".";
  }catch(e){message.textContent=e.message==="valid_paypal_email_required"?"Enter a valid PayPal email address.":e.message||"Could not save payout details.";}
  finally{button.disabled=false;button.textContent="Save payout details";}
 });
 $("#pp-copy-link").addEventListener("click",async()=>{const value=$("#pp-referral-link").value;try{await navigator.clipboard.writeText(value);$("#pp-copy-status").textContent="Referral link copied."; }catch{$("#pp-referral-link").select();$("#pp-copy-status").textContent="Select and copy your referral link."; }});
 async function init(){try{if(!window.Clerk)throw new Error("Clerk did not load. Refresh and try again.");await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});clerk=window.Clerk;if(clerk.isSignedIn)signedIn();else signedOut();clerk.addListener(()=>clerk.isSignedIn?signedIn():signedOut());}catch(e){$("#pp-auth-title").textContent="Sign-in could not initialize";$("#pp-auth-copy").textContent=e.message||"Refresh and try again.";actions.hidden=true;}}
 init();
})();