// Configure a form endpoint before publishing. Formspree is one supported option:
// 1) Create a form at https://formspree.io/
// 2) Replace the value below with your form endpoint, e.g. https://formspree.io/f/abcdwxyz
// 3) Commit and publish this file. Do not put API keys or private credentials here.
const API_BASE = "https://avr-trust-lab-api.hisjarman.workers.dev";
const DEMO_API_BASE = "https://avr-platform-api.hisjarman.workers.dev";
const PARTNER_COOKIE = "star69ai_partner_ref";
function readPartnerAttribution() {
  const entry = document.cookie.split("; ").find(item => item.startsWith(PARTNER_COOKIE + "="));
  if (!entry) return null;
  try {
    const value = JSON.parse(decodeURIComponent(entry.slice(PARTNER_COOKIE.length + 1)));
    if (!value.partnerCode || (value.expiresAt && Date.now() > value.expiresAt)) return null;
    return value;
  } catch { return null; }
}
function writePartnerAttribution(value) {
  const expiresAt = Date.now() + 90 * 86400000;
  document.cookie = PARTNER_COOKIE + "=" + encodeURIComponent(JSON.stringify({...value,expiresAt})) + "; Max-Age=7776000; Path=/; Domain=.star69ai.com; SameSite=Lax; Secure";
}
const partnerAttributionReady = (async () => {
  const incoming = String(new URLSearchParams(window.location.search).get("ref") || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{6,16}$/.test(incoming)) return readPartnerAttribution();
  const fallback={partnerCode:incoming,clickId:""};writePartnerAttribution(fallback);
  try {
    const response = await fetch(API_BASE + "/api/partners/click", {
      method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({partnerCode:incoming,landingPath:location.pathname,referrer:document.referrer})
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.clickId) {
      const value={partnerCode:incoming,clickId:result.clickId};writePartnerAttribution(value);return value;
    }
  } catch {}
  return fallback;
})();
async function capturePartnerLead(payload) {
  const attribution=await Promise.race([partnerAttributionReady,new Promise(resolve=>setTimeout(()=>resolve(readPartnerAttribution()),1200))]);
  if(!attribution?.partnerCode||!String(payload.email||"").trim())return false;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),1800);
  try {
    const response=await fetch(API_BASE+"/api/partners/lead",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},signal:controller.signal,body:JSON.stringify({
      partnerCode:attribution.partnerCode,clickId:attribution.clickId||"",name:String(payload.name||"").slice(0,120),
      email:String(payload.email||"").slice(0,254),business:String(payload.business||"").slice(0,160),landingPath:location.pathname
    })});
    return response.ok;
  } catch { return false; } finally { clearTimeout(timeout); }
}
window.star69aiCapturePartnerLead=capturePartnerLead;
window.star69aiGetPartnerAttribution=()=>readPartnerAttribution();
document.querySelectorAll('form[action*="formspree.io/f/mrppjqdb"]:not(#intake-form)').forEach(partnerForm=>{
  partnerForm.addEventListener("submit",async event=>{
    event.preventDefault();
    const data=new FormData(partnerForm),payload={name:data.get("name"),email:data.get("email"),business:data.get("business")};
    const button=partnerForm.querySelector('button[type="submit"]');if(button)button.disabled=true;
    try{
      const attribution=await Promise.race([partnerAttributionReady,new Promise(resolve=>setTimeout(()=>resolve(readPartnerAttribution()),1200))]);
      if(attribution?.partnerCode){
        for(const [name,value] of [["partner_code",attribution.partnerCode],["partner_click_id",attribution.clickId||""]]){
          let input=partnerForm.querySelector('input[type="hidden"][name="'+name+'"]');
          if(!input){input=document.createElement("input");input.type="hidden";input.name=name;partnerForm.appendChild(input);}
          input.value=value;
        }
      }
      await capturePartnerLead(payload);
    }catch{}
    HTMLFormElement.prototype.submit.call(partnerForm);
  });
});


/* Keep the client portal entry point visible in every public-page header. */
(() => {
  const header = document.querySelector("header.topbar");
  if (!header || header.querySelector('.client-login-global, a[href="./client/"], a[href$="/client/"]')) return;
  const startLink = header.querySelector("a.nav-login, a.reference-start");
  if (!startLink) return;
  const loginLink = document.createElement("a");
  loginLink.className = "button button-small client-login-global";
  loginLink.href = "./client/";
  loginLink.textContent = "Client Login";
  loginLink.setAttribute("aria-label", "Client login portal");
  header.insertBefore(loginLink, startLink);
})();


const form = document.querySelector("#intake-form");
if (form) {
const fields = [...form.children].filter(element => element.tagName === "FIELDSET");
const back = document.querySelector("#back-button");
const next = document.querySelector("#next-button");
const submit = document.querySelector("#submit-button");
const progress = document.querySelector("#progress-fill");
const stepLabel = document.querySelector("#step-label");
const stepPercent = document.querySelector("#step-percent");
const errorBox = document.querySelector("#form-error");
let currentStep = 0;
let lastAssistantField = null;

// The AI Discovery Coach is permanently visible beside the form.
// Only approved business/call-handling fields are shared; contact and identity data stay local.
const assistantFrame = document.querySelector("#discovery-assistant-frame");
const assistantSafeFields = new Set(["industry","industryOther","serviceArea","services","callVolume","hours","callTasks","faqs","recordingPreference","additionalNeeds","outboundAiCalls","automatedSms","phoneSetup","notes"]);
const industrySelect = form.elements.namedItem("industry");
const industryOtherWrap = document.querySelector("#industry-other-wrap");
const industryOtherInput = form.elements.namedItem("industryOther");
function syncCustomIndustry() {
  const custom = industrySelect?.value === "Other / not listed";
  if (industryOtherWrap) industryOtherWrap.hidden = !custom;
  if (industryOtherInput) {
    industryOtherInput.disabled = !custom;
    if (!custom) industryOtherInput.value = "";
  }
}
industrySelect?.addEventListener("change", () => { syncCustomIndustry(); sendAssistantContext(industrySelect); });
syncCustomIndustry();

function buildAssistantContext(activeControl) {
  const answers = {};
  for (const name of assistantSafeFields) {
    const control = form.elements.namedItem(name);
    if (name === "additionalNeeds") {
      const selected = [...form.querySelectorAll('input[name="additionalNeeds"]:checked')].map(item => item.value);
      if (selected.length) answers[name] = selected;
      continue;
    }
    if (control && String(control.value || "").trim()) answers[name] = String(control.value).trim().slice(0, 650);
  }
  const activeName = activeControl?.name || "";
  const activeAllowed = assistantSafeFields.has(activeName);
  const activeLabel = activeAllowed
    ? String(activeControl.closest("label")?.innerText || activeName).replace(/\s+/g, " ").trim().slice(0, 140)
    : "";
  return {
    source: "Star69AI discovery form",
    step: "Step " + (currentStep + 1) + " of " + fields.length,
    industry: String(form.elements.namedItem("industry")?.value === "Other / not listed" ? form.elements.namedItem("industryOther")?.value || "Other / not listed" : form.elements.namedItem("industry")?.value || ""),
    answers,
    activeField: activeAllowed ? { name: activeName, label: activeLabel, value: String(activeControl.value || "").slice(0, 900) } : null
  };
}
function sendAssistantContext(activeControl) {
  if (!assistantFrame?.contentWindow) return;
  assistantFrame.contentWindow.postMessage(
    {type:"star69ai-form-context",context:buildAssistantContext(activeControl)},
    "https://star69ai-concierge.hisjarman.workers.dev"
  );
}
assistantFrame?.addEventListener("load", () => sendAssistantContext(lastAssistantField));
form.addEventListener("input", event => { lastAssistantField = event.target; sendAssistantContext(event.target); });
form.addEventListener("change", event => { lastAssistantField = event.target; sendAssistantContext(event.target); });
form.addEventListener("focusin", event => { lastAssistantField = event.target; sendAssistantContext(event.target); });
// Send once immediately as well; the iframe load handler repeats this after navigation if needed.
sendAssistantContext(lastAssistantField);

// The coach may suggest text for an allowlisted business field. Nothing is applied
// until the visitor explicitly clicks "Use this suggestion" inside the coach.
window.addEventListener("message", event => {
  if (event.origin !== "https://star69ai-concierge.hisjarman.workers.dev") return;
  const data = event.data;
  if (data?.type !== "star69ai-form-suggestion" || !data.suggestion) return;
  const name = String(data.suggestion.field || "");
  const value = String(data.suggestion.value || "").trim().slice(0, 900);
  if (!assistantSafeFields.has(name) || name === "additionalNeeds" || !value) return;
  const control = form.elements.namedItem(name);
  if (!control || control.disabled) return;
  if (control.tagName === "SELECT" && ![...control.options].some(option => option.value === value)) return;
  control.value = value;
  control.dispatchEvent(new Event("input", {bubbles:true}));
  control.dispatchEvent(new Event("change", {bubbles:true}));
  control.focus({preventScroll:false});
  lastAssistantField = control;
  sendAssistantContext(control);
});

function showStep(index) {
  currentStep = index;
  fields.forEach((field, i) => field.hidden = i !== currentStep);
  back.disabled = currentStep === 0;
  next.hidden = currentStep === fields.length - 1;
  submit.hidden = currentStep !== fields.length - 1;
  const pct = Math.round(((currentStep + 1) / fields.length) * 100);
  progress.style.width = pct + "%";
  stepLabel.textContent = `STEP ${currentStep + 1} OF ${fields.length}`;
  stepPercent.textContent = pct + "%";
  errorBox.hidden = true;
  sendAssistantContext(lastAssistantField);
}
function validateStep() {
  const controls = [...fields[currentStep].querySelectorAll("input,select,textarea")];
  for (const control of controls) {
    if (String(control.value || "").trim() && !control.checkValidity()) {
      control.reportValidity();
      return false;
    }
  }
  return true;
}
next.addEventListener("click", () => {
  if (validateStep()) showStep(Math.min(currentStep + 1, fields.length - 1));
});
back.addEventListener("click", () => showStep(Math.max(currentStep - 1, 0)));

document.querySelectorAll("[data-plan]").forEach(link => {
  link.addEventListener("click", () => {
    const plan = link.dataset.plan;
    const select = document.querySelector("#plan-interest");
    select.value = plan + (plan === "Starter" ? " — $149/month" : plan === "Growth" ? " — $249/month" : " — $399/month");
  });
});

// The full discovery brief is the source of truth for demo-agent configuration.
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!validateStep()) return;
  submit.disabled = true;
  submit.textContent = "Sending…";
  errorBox.hidden = true;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.additionalNeeds = formData.getAll("additionalNeeds");
  payload.industry = payload.industry === "Other / not listed" ? (payload.industryOther || payload.industry) : payload.industry;
  payload.discoveryComplete = true;
  payload.leadSource = "Full Star69AI business discovery form";
  payload.submittedAt = new Date().toISOString();
  payload.source = "Star69AI business discovery form";
  payload.privacyConsent = formData.get("privacyConsent") === "on";
  payload.humanEscalation = String(formData.get("humanEscalation") || "");
  payload.planInterest = String(formData.get("planInterest") || "");
  payload.website = String(formData.get("website") || "");
  payload.serviceArea = String(formData.get("serviceArea") || "");
  payload.services = String(formData.get("services") || "");
  payload.callVolume = String(formData.get("callVolume") || "");
  payload.hours = String(formData.get("hours") || "");
  payload.callTasks = String(formData.get("callTasks") || "");
  payload.faqs = String(formData.get("faqs") || "");
  payload.recordingPreference = String(formData.get("recordingPreference") || "");
  payload.outboundAiCalls = String(formData.get("outboundAiCalls") || "");
  payload.automatedSms = String(formData.get("automatedSms") || "");
  payload.phoneSetup = String(formData.get("phoneSetup") || "");
  payload.notes = String(formData.get("notes") || "");
  payload.details = payload.notes;
  payload.websiteHoneypot = "";
  const attribution = readPartnerAttribution();
  if (attribution?.partnerCode) {
    payload.partnerCode = attribution.partnerCode;
    payload.partnerClickId = attribution.clickId || "";
  }

  let workerResponded = false;
  try {
    const response = await fetch(DEMO_API_BASE + "/api/demo-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    });
    workerResponded = true;
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.accepted) throw new Error(result.error || "We couldn't submit your discovery brief. Please try again.");
    try { await capturePartnerLead(payload); } catch {}
    form.hidden = true;
    const success = document.querySelector("#form-success");
    if (success) {
      success.querySelector("p").textContent = "Your complete business discovery brief has been received. Our team will review your answers before preparing your demo.";
      success.hidden = false;
    }
  } catch (error) {
    if (!workerResponded) {
      errorBox.textContent = "Our secure demo queue could not be reached. We're sending your complete brief through our backup form so our team can follow up manually. A backup submission does not automatically create a demo agent.";
      errorBox.hidden = false;
      const subject = form.querySelector('input[name="_subject"]');
      if (subject) subject.value = "BACKUP — Star69AI full discovery brief (manual review required)";
      form.dataset.backupSubmit = "true";
      HTMLFormElement.prototype.submit.call(form);
      return;
    }
    errorBox.textContent = error.message || "Submission failed. Please try again or email support@star69ai.com.";
    errorBox.hidden = false;
    submit.disabled = false;
    submit.textContent = "Submit onboarding request →";
  }
});

// Formspree redirects here only after accepting a native form submission.
if (new URLSearchParams(window.location.search).get("submitted") === "1") {
  form.hidden = true;
  const success = document.querySelector("#form-success");
  if (success) {
    success.querySelector("p").textContent =
      new URLSearchParams(window.location.search).get("backup") === "1"
        ? "Your brief was sent through our backup form. Our team will manually review it and add it to the demo queue before preparing a demo."
        : "Your business brief has been received. We'll review your details and contact you about your requested demo.";
    success.hidden = false;
  }
}

const yearLabel = document.querySelector("#year");
if (yearLabel) yearLabel.textContent = new Date().getFullYear();
showStep(0);
}

const quickContact = document.querySelector("#quick-contact-form");
if (quickContact) quickContact.addEventListener("submit", async event => {
  event.preventDefault(); if (!quickContact.reportValidity()) return;
  const button=quickContact.querySelector('button[type="submit"]'), status=quickContact.querySelector("[data-contact-status]"), data=new FormData(quickContact);
  const payload={type:"quick_question",name:String(data.get("name")||"").trim(),email:String(data.get("email")||"").trim(),phone:String(data.get("phone")||"").trim(),subject:String(data.get("subject")||"").trim(),message:String(data.get("message")||"").trim(),meetingRequest:data.get("meetingRequest")==="on",contactConsent:true,website:String(data.get("website")||"")};
  button.disabled=true;button.textContent="Sending…";status.textContent="";
  try { const response=await fetch(API_BASE+"/api/contact",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.message||"We couldn't send your message. Please try again.");quickContact.reset();status.textContent=!result.notificationSent?"Your message was saved, but our notification service had a problem. Please email support@star69ai.com if your request is urgent.":result.meetingRequested?(result.confirmationSent?"Message received. Check your inbox; we will contact you to arrange an engineering call.":"Message received. We will contact you to arrange an engineering call. A confirmation email could not be sent."):(result.confirmationSent?"Message received. A confirmation email is on its way.":"Message received, but the confirmation email could not be sent.");status.classList.remove("error");}
  catch(error){status.textContent=error.message||"Please email support@star69ai.com directly.";status.classList.add("error");}
  finally{button.disabled=false;button.textContent="Send message ↗";}
});

/* Missed-call opportunity calculator */
if (document.getElementById("calls-range")) {
const calcFields = [
  ["calls-range","calls-value",v=>String(v)],
  ["missed-range","missed-value",v=>v+"%"],
  ["revenue-range","revenue-value",v=>"$"+Number(v).toLocaleString("en-US")],
  ["conversion-range","conversion-value",v=>v+"%"]
];
function updateOpportunity(){
  const values=calcFields.map(([id])=>Number(document.getElementById(id).value));
  calcFields.forEach(([id,out,format],i)=>{document.getElementById(out).textContent=format(values[i]);});
  const [calls,missed,average,conversion]=values;
  const missedCalls=calls*missed/100;
  const potentialCustomers=missedCalls*conversion/100;
  const money=potentialCustomers*average;
  document.getElementById("potential-value").textContent="$"+Math.round(money).toLocaleString("en-US");
  document.getElementById("missed-count").textContent=String(Math.round(missedCalls));
  document.getElementById("customer-count").textContent=potentialCustomers.toFixed(1);
}
calcFields.forEach(([id])=>document.getElementById(id).addEventListener("input",updateOpportunity));
updateOpportunity();

}
