(() => {
 const form=document.getElementById("partner-form"),status=document.getElementById("partner-status"),success=document.getElementById("partner-success");
 if(!form)return;
 const API="https://avr-trust-lab-api.hisjarman.workers.dev";
 form.addEventListener("submit",async event=>{
  event.preventDefault();status.classList.remove("error");status.textContent="";
  if(!form.reportValidity())return;
  const button=form.querySelector("button[type=submit]");button.disabled=true;button.textContent="Submitting application…";
  const data=new FormData(form);const payload=Object.fromEntries(data.entries());payload.consent=data.get("consent")==="on";
  try{
   const response=await fetch(API+"/api/partners/apply",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(result.error==="application_rate_limit"?"Too many attempts. Please try again later.":result.error==="application_unavailable"?"The application service is temporarily unavailable. Please try again shortly.":"Please check your details and try again.");
   form.hidden=true;success.hidden=false;
  }catch(error){status.textContent=error.message||"We couldn't submit your application. Please try again.";status.classList.add("error");button.disabled=false;button.textContent="Submit partner application ↗";}
 });
})();