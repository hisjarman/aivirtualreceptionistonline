// Configure a form endpoint before publishing. Formspree is one supported option:
// 1) Create a form at https://formspree.io/
// 2) Replace the value below with your form endpoint, e.g. https://formspree.io/f/abcdwxyz
// 3) Commit and publish this file. Do not put API keys or private credentials here.
const API_BASE = "https://avr-trust-lab-api.hisjarman.workers.dev";

const form = document.querySelector("#intake-form");
const fields = [...form.querySelectorAll("fieldset")];
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
  payload.submittedAt = new Date().toISOString();
  payload.source = "AIVirtualReceptionist.online GitHub Pages onboarding";
  const brief = [
    ["Business", payload.business], ["Industry", payload.industry], ["Website", payload.website],
    ["Service area", payload.serviceArea], ["Services", payload.services], ["Monthly call volume", payload.callVolume],
    ["Business hours", payload.hours], ["Caller tasks", payload.callTasks], ["Common questions", payload.faqs],
    ["Phone setup", payload.phoneSetup], ["Plan interest", payload.planInterest], ["Additional notes", payload.notes]
  ].map(([label, value]) => label + ": " + (String(value || "").trim() || "Not provided")).join("\n");
  try {
    const response = await fetch(API_BASE + "/api/contact", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ ...payload, type: "onboarding", subject: "New custom receptionist onboarding request", message: brief, contactConsent: payload.contactConsent === "yes" }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Submission failed");
    form.hidden = true;
    const success = document.querySelector("#form-success");
    success.querySelector("p").textContent = payload.contactConsent !== "yes" ? "Your brief has been received. You selected not to be contacted, so we will not send a follow-up email." : result.confirmationSent ? "Your brief has been received. Check your inbox for a confirmation; we will follow up about your custom demo." : "Your brief has been received, but the confirmation email could not be sent. Please email admin@aivirtualreceptionist.online if you need confirmation.";
    success.hidden = false;
  } catch {
    errorBox.textContent = "We couldn't send your brief. Please try again in a moment or contact the business owner directly.";
    errorBox.hidden = false;
  } finally {
    submit.disabled = false;
    submit.textContent = "Submit onboarding request →";
  }
});

// Mobile navigation is initialized independently so an unrelated form error
// cannot prevent the menu from working.
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#primary-navigation");
if (menuToggle && nav) {
  const closeMenu = () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  };
  menuToggle.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 650) closeMenu();
  });
}
document.querySelector("#year").textContent = new Date().getFullYear();
showStep(0);


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
