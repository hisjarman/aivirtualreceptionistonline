// Configure a form endpoint before publishing. Formspree is one supported option:
// 1) Create a form at https://formspree.io/
// 2) Replace the value below with your form endpoint, e.g. https://formspree.io/f/abcdwxyz
// 3) Commit and publish this file. Do not put API keys or private credentials here.
const API_BASE = "https://avr-trust-lab-api.hisjarman.workers.dev";

/* Keep the client portal entry point visible in every public-page header. */
(() => {
  const header = document.querySelector("header.topbar");
  if (!header || header.querySelector(".client-login-global")) return;
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

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!validateStep()) return;
  submit.disabled = true;
  submit.textContent = "Sending…";
  errorBox.hidden = true;

  const payload = Object.fromEntries(new FormData(form).entries());
  const submittedAt = new Date().toISOString();
  const brief = [
    ["Contact name", payload.name],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Business", payload.business],
    ["Industry", payload.industry],
    ["Website", payload.website],
    ["Service area", payload.serviceArea],
    ["Services", payload.services],
    ["Monthly call volume", payload.callVolume],
    ["Business hours", payload.hours],
    ["Caller tasks", payload.callTasks],
    ["Common questions", payload.faqs],
    ["Phone setup", payload.phoneSetup],
    ["Plan interest", payload.planInterest],
    ["Additional notes", payload.notes],
    ["Contact request", "Customer submitted the discovery brief and requested a response about this inquiry"],
    ["Privacy acknowledgement", payload.privacyConsent ? "Confirmed" : "Not confirmed"],
    ["Submitted at", submittedAt],
    ["Source", "AIVirtualReceptionist.online business discovery form"]
  ].map(([label, value]) => label + ": " + (String(value || "").trim() || "Not provided")).join("\n");

  try {
    const formData = new FormData(form);
    formData.append("_subject", "New business discovery request — AI Virtual Receptionist");
    if (payload.email) formData.append("_replyto", payload.email);
    formData.append("message", brief);
    formData.append("submittedAt", submittedAt);
    formData.append("source", "AIVirtualReceptionist.online business discovery form");

    const response = await fetch("https://formspree.io/f/mrppjqdb", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: formData
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      const detail = Array.isArray(result.errors) ? result.errors.map(item => item.message).filter(Boolean).join(" ") : "";
      throw new Error(detail || result.error || "Formspree could not accept your request. Please try again.");
    }

    let confirmationSent = false;
    {
      try {
        const confirmationResponse = await fetch(API_BASE + "/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            type: "onboarding",
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            subject: "Business discovery request — " + (payload.business || "New business"),
            message: brief,
            contactConsent: true
          })
        });
        const confirmationResult = await confirmationResponse.json().catch(() => ({}));
        if (!confirmationResponse.ok) throw new Error(confirmationResult.error || "Confirmation service unavailable");
        confirmationSent = confirmationResult.confirmationSent === true;
      } catch (confirmationFailure) {
      }
    }

    form.hidden = true;
    const success = document.querySelector("#form-success");
    success.querySelector("p").textContent = confirmationSent
      ? "Your business brief has been received. A confirmation email is on its way, and we will review your details and contact you about this request."
      : "Your business brief has been received. We could not send the confirmation email automatically, but your request was submitted successfully.";
    success.hidden = false;
  } catch (error) {
    errorBox.textContent = error.message || "We couldn't send your brief. Please try again in a moment or contact admin@aivirtualreceptionist.online.";
    errorBox.hidden = false;
  } finally {
    submit.disabled = false;
    submit.textContent = "Submit onboarding request →";
  }
});

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
  try { const response=await fetch(API_BASE+"/api/contact",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.message||"We couldn't send your message. Please try again.");quickContact.reset();status.textContent=!result.notificationSent?"Your message was saved, but our notification service had a problem. Please email admin@aivirtualreceptionist.online if your request is urgent.":result.meetingRequested?(result.confirmationSent?"Message received. Check your inbox; we will contact you to arrange an engineering call.":"Message received. We will contact you to arrange an engineering call. A confirmation email could not be sent."):(result.confirmationSent?"Message received. A confirmation email is on its way.":"Message received, but the confirmation email could not be sent.");status.classList.remove("error");}
  catch(error){status.textContent=error.message||"Please email admin@aivirtualreceptionist.online directly.";status.classList.add("error");}
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
