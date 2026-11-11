// Configure a form endpoint before publishing. Formspree is one supported option:
// 1) Create a form at https://formspree.io/
// 2) Replace the value below with your form endpoint, e.g. https://formspree.io/f/abcdwxyz
// 3) Commit and publish this file. Do not put API keys or private credentials here.
const API_BASE = "https://avr-trust-lab-api.hisjarman.workers.dev";

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

// Optional AI Discovery Coach. Only business/call-handling fields are shared;
// contact details, business name, website, escalation contact and consent are excluded.
const assistantToggle = document.querySelector("#discovery-assistant-toggle");
const assistantPanel = document.querySelector("#discovery-assistant-panel");
const assistantClose = document.querySelector("#discovery-assistant-close");
const assistantFrame = document.querySelector("#discovery-assistant-frame");
const assistantSafeFields = new Set(["industry","industryOther","serviceArea","services","callVolume","hours","callTasks","faqs","recordingPreference","additionalNeeds","outboundAiCalls","automatedSms","phoneSetup","notes"]);
const industrySelect = form.elements.namedItem("industry");
const industrySearch = document.querySelector("#industry-search");
industrySearch?.addEventListener("input", () => {
  const query = industrySearch.value.trim().toLocaleLowerCase();
  for (const group of industrySelect?.querySelectorAll("optgroup") || []) {
    let visible = 0;
    for (const option of group.querySelectorAll("option")) {
      const match = !query || option.textContent.toLocaleLowerCase().includes(query);
      option.hidden = !match;
      if (match) visible++;
    }
    group.hidden = visible === 0;
  }
});
const industryOtherWrap = document.querySelector("#industry-other-wrap");
const industryOtherInput = form.elements.namedItem("industryOther");
function syncCustomIndustry() {
  const custom = industrySelect?.value === "Other / not listed";
  if (industryOtherWrap) industryOtherWrap.hidden = !custom;
  if (industryOtherInput) {
    industryOtherInput.disabled = !custom;
    industryOtherInput.required = custom;
    if (!custom) industryOtherInput.value = "";
  }
}
industrySelect?.addEventListener("change", () => { syncCustomIndustry(); sendAssistantContext(industrySelect); });
syncCustomIndustry();

function buildAssistantContext(activeControl) {
  const answers = {};
  for (const name of assistantSafeFields) {
    const control = form.elements.namedItem(name);
    if (name === "additionalNeeds") { const selected = [...form.querySelectorAll('input[name="additionalNeeds"]:checked')].map(item => item.value); if (selected.length) answers[name] = selected; continue; }
    if (control && String(control.value || "").trim()) answers[name] = String(control.value).trim().slice(0, 650);
  }
  const activeName = activeControl?.name || "";
  const activeAllowed = assistantSafeFields.has(activeName);
  const activeLabel = activeAllowed ? String(activeControl.closest("label")?.innerText || activeName).replace(/\s+/g, " ").trim().slice(0, 140) : "";
  return {
    source: "Star69AI discovery form",
    step: "Step " + (currentStep + 1) + " of " + fields.length,
    industry: String(form.elements.namedItem("industry")?.value === "Other / not listed" ? form.elements.namedItem("industryOther")?.value || "Other / not listed" : form.elements.namedItem("industry")?.value || ""),
    answers,
    activeField: activeAllowed ? { name: activeName, label: activeLabel, value: String(activeControl.value || "").slice(0, 900) } : null
  };
}
function sendAssistantContext(activeControl) {
  if (!assistantPanel || assistantPanel.hidden || !assistantFrame?.contentWindow) return;
  assistantFrame.contentWindow.postMessage({type:"star69ai-form-context",context:buildAssistantContext(activeControl)}, "https://star69ai-concierge.hisjarman.workers.dev");
}
if (assistantToggle && assistantPanel && assistantClose) {
  const setAssistantOpen = open => {
    assistantPanel.hidden = !open;
    assistantToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      sendAssistantContext(lastAssistantField);
      assistantClose.focus();
    } else assistantToggle.focus();
  };
  assistantToggle.addEventListener("click", () => setAssistantOpen(assistantPanel.hidden));
  assistantClose.addEventListener("click", () => setAssistantOpen(false));
  assistantFrame?.addEventListener("load", () => sendAssistantContext(null));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !assistantPanel.hidden) setAssistantOpen(false);
  });
  form.addEventListener("input", event => { lastAssistantField = event.target; sendAssistantContext(event.target); });
  form.addEventListener("change", event => { lastAssistantField = event.target; sendAssistantContext(event.target); });
  form.addEventListener("focusin", event => { lastAssistantField = event.target; sendAssistantContext(event.target); });
}

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
    if (!control.checkValidity()) {
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

// Formspree's normal HTML POST avoids browser CORS/fetch failures on mobile browsers.
form.addEventListener("submit", event => {
  event.preventDefault();
  if (!validateStep()) return;

  submit.disabled = true;
  submit.textContent = "Sending…";
  errorBox.hidden = true;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.additionalNeeds = formData.getAll("additionalNeeds");
  const submittedAt = new Date().toISOString();
  const brief = [
    ["Contact name", payload.name],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Business", payload.business],
    ["Industry", payload.industry],
    ["Industry details", payload.industryOther],
    ["Website", payload.website],
    ["Service area", payload.serviceArea],
    ["Services", payload.services],
    ["Monthly call volume", payload.callVolume],
    ["Business hours", payload.hours],
    ["Caller tasks", payload.callTasks],
    ["Common questions", payload.faqs],
    ["Recording preference", payload.recordingPreference],
    ["Additional features requested", Array.isArray(payload.additionalNeeds) ? payload.additionalNeeds.join(", ") : payload.additionalNeeds],
    ["Outbound AI calls", payload.outboundAiCalls],
    ["Automated SMS", payload.automatedSms],
    ["Human escalation", payload.humanEscalation],
    ["Phone setup", payload.phoneSetup],
    ["Plan interest", payload.planInterest],
    ["Additional notes", payload.notes],
    ["Privacy acknowledgement", payload.privacyConsent ? "Confirmed" : "Not confirmed"],
    ["Submitted at", submittedAt],
    ["Source", "Star69AI business discovery form"]
  ].map(([label, value]) => label + ": " + (String(value || "").trim() || "Not provided")).join("\\n");

  const hiddenFields = {
    _subject: "New business discovery request — Star69AI",
    _replyto: payload.email || "",
    _next: "https://star69ai.com/get-started.html?submitted=1#start",
    message: brief,
    submittedAt,
    source: "Star69AI business discovery form"
  };
  for (const [name, value] of Object.entries(hiddenFields)) {
    let input = form.querySelector('input[type="hidden"][name="' + name + '"]');
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  form.method = "POST";
  form.action = "https://formspree.io/f/mrppjqdb";
  // Submit through the browser's native form navigation rather than fetch().
  HTMLFormElement.prototype.submit.call(form);
});

// Formspree redirects here only after accepting a native form submission.
if (new URLSearchParams(window.location.search).get("submitted") === "1") {
  form.hidden = true;
  const success = document.querySelector("#form-success");
  if (success) {
    success.querySelector("p").textContent =
      "Your business brief has been received. We'll review your details and contact you about your requested demo.";
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
