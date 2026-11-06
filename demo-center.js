/* Scripted visual call simulations. Replace/add audio files in docs/audio/ and update audioSrc below. */
(() => {
  const root = document.querySelector("#demo-center");
  if (!root) return;

  // Each industry has its own fictional call scenario. Add/edit lines here as desired.
  const demos = {
    roofing: {
      label:"ROOFING", title:"Storm damage & roof inspection",
      subtitle:"An urgent roof leak inquiry becomes a qualified callback request.",
      business:"NORTHLINE ROOFING", audioSrc:"",
      lines:[
        ["receptionist","Thanks for calling Northline Roofing. I'm the virtual receptionist. How can I help you today?"],
        ["caller","We had a leak after last night's storm. Can someone come take a look?"],
        ["receptionist","I'm sorry to hear that. Is water actively coming into the home right now, or has the leak stopped?"],
        ["caller","It's stopped for now, but there's a wet spot on the bedroom ceiling."],
        ["receptionist","Understood. I can flag this for the team. What's the property ZIP code?"],
        ["caller","75001. The address is 214 Oak Ridge Drive."],
        ["receptionist","Thank you. And what's the best name and phone number for the callback?"],
        ["caller","Jordan Miller, 555-014-8820."],
        ["receptionist","I've captured the roof leak, property area, and your callback details. The roofing team can review the request and contact you about the next available inspection. Is there anything else I should add?"],
        ["caller","No, that's everything. Thanks."],
        ["receptionist","You're welcome, Jordan. Thanks for calling Northline Roofing. Take care."]
      ]
    },
    plumbing: {
      label:"PLUMBING", title:"Urgent leak & service request",
      subtitle:"The receptionist identifies urgency and collects dispatch details.",
      business:"CLEARFLOW PLUMBING", audioSrc:"",
      lines:[
        ["receptionist","Thank you for calling ClearFlow Plumbing. Are you calling about a repair, an installation, or an emergency?"],
        ["caller","There's water coming from under my kitchen sink. I need help."],
        ["receptionist","I can take the details for the team. Is the water still flowing, and have you been able to shut off the nearby valve?"],
        ["caller","I turned the valve off. It's not spraying anymore."],
        ["receptionist","Good. What's the service ZIP code and street address?"],
        ["caller","It's 75208, 18 Willow Lane."],
        ["receptionist","Thanks. May I have your name and the best number to reach you?"],
        ["caller","Taylor, 555-018-2214."],
        ["receptionist","I've noted the kitchen sink leak and that the water has been shut off. I'll mark this for a prompt team follow-up. Would you prefer a call or text if that option is available?"],
        ["caller","A call, please."],
        ["receptionist","Got it. Thanks for calling ClearFlow Plumbing. The team has the information needed to follow up."]
      ]
    },
    hvac: {
      label:"HVAC", title:"Air conditioning not cooling",
      subtitle:"A routine service inquiry is qualified and turned into an appointment request.",
      business:"BREEZEPOINT HVAC", audioSrc:"",
      lines:[
        ["receptionist","Thanks for calling BreezePoint HVAC. How can I make your day a little more comfortable?"],
        ["caller","My air conditioner is running, but the house isn't getting cool."],
        ["receptionist","I can help collect some details. Is this for a home or a commercial property?"],
        ["caller","It's a single-family home."],
        ["receptionist","Thanks. About how long has the system been having trouble cooling?"],
        ["caller","Since yesterday afternoon."],
        ["receptionist","What's your ZIP code, and what day would work best for a service visit?"],
        ["caller","75024. Tomorrow morning if possible."],
        ["receptionist","I've recorded the cooling issue, property type, ZIP code, and preferred time. I'll pass this along as an appointment request for the scheduling team to confirm."],
        ["caller","Perfect, thank you."],
        ["receptionist","You're welcome. Thanks for choosing BreezePoint HVAC."]
      ]
    },
    dental: {
      label:"DENTAL", title:"New patient appointment request",
      subtitle:"A new patient gets basic information and a clear scheduling next step.",
      business:"BRIGHTSMILE DENTAL", audioSrc:"",
      lines:[
        ["receptionist","Thank you for calling BrightSmile Dental. Are you an existing patient or would this be your first visit?"],
        ["caller","I'd be a new patient. I need a cleaning."],
        ["receptionist","We'd be happy to help you get started. Are you looking for a routine cleaning, or are you having a dental concern you'd like the office to know about?"],
        ["caller","Just a routine cleaning."],
        ["receptionist","Great. May I have your name and the best number for the office to reach you?"],
        ["caller","Morgan Lee, 555-013-4477."],
        ["receptionist","Thank you, Morgan. Do you have a preferred day or time for an appointment?"],
        ["caller","Afternoons are usually best."],
        ["receptionist","I've captured your new-patient cleaning request and afternoon preference. The office can follow up to confirm availability and explain any new-patient paperwork."],
        ["caller","Sounds good."],
        ["receptionist","Thanks for calling BrightSmile Dental. We look forward to speaking with you."]
      ]
    },
    realestate: {
      label:"REAL ESTATE", title:"Home buyer property inquiry",
      subtitle:"A property inquiry becomes a useful lead for the real estate team.",
      business:"HORIZON REALTY", audioSrc:"",
      lines:[
        ["receptionist","Thank you for calling Horizon Realty. Are you calling about a property you saw online or looking for help finding a home?"],
        ["caller","I saw the three-bedroom home on Pine Street. Is it still available?"],
        ["receptionist","I can take your details so an agent can check the latest status and follow up. Are you hoping to buy soon or just beginning your search?"],
        ["caller","We're hoping to move in the next two or three months."],
        ["receptionist","Understood. Are you already working with a real estate agent?"],
        ["caller","No, not yet."],
        ["receptionist","What's your name and the best number for an agent to reach you?"],
        ["caller","Alex, 555-016-9921."],
        ["receptionist","Thanks, Alex. I've captured the property you're interested in and your moving timeline. An agent can follow up with the current listing status and next steps."],
        ["caller","Great, I appreciate it."],
        ["receptionist","You're welcome. Thanks for contacting Horizon Realty."]
      ]
    },
    hotel: {
      label:"HOTELS", title:"Room availability & reservation inquiry",
      subtitle:"A guest gets help with a stay request and a clear reservation follow-up.",
      business:"SEABREEZE HOTEL", audioSrc:"",
      lines:[
        ["receptionist","Welcome to Seabreeze Hotel. Are you calling about an upcoming stay, an existing reservation, or hotel information?"],
        ["caller","I'd like to know if you have a room for two adults next Friday."],
        ["receptionist","I can collect your request for the front desk. How many nights are you planning to stay?"],
        ["caller","Two nights."],
        ["receptionist","Thank you. Do you have a room preference, such as a king bed or two queen beds?"],
        ["caller","A king bed, if possible."],
        ["receptionist","And may I have your name and a contact number?"],
        ["caller","Jamie, 555-012-7734."],
        ["receptionist","I've recorded your dates, guest count, and king-bed preference. The front desk can check live availability and contact you to confirm options. No reservation has been made yet."],
        ["caller","That's fine. Thank you."],
        ["receptionist","You're welcome, Jamie. We appreciate your interest in Seabreeze Hotel."]
      ]
    }
  };

  const cards=[...root.querySelectorAll(".demo-industry-card")];
  const title=root.querySelector("#demo-scenario-title");
  const subtitle=root.querySelector("#demo-scenario-subtitle");
  const label=root.querySelector("#demo-industry-label");
  const business=root.querySelector("#demo-phone-business");
  const transcript=root.querySelector("#demo-transcript");
  const state=root.querySelector("#demo-transcript-state");
  const start=root.querySelector("#demo-start");
  const reset=root.querySelector("#demo-reset");
  const progress=root.querySelector("#demo-progress-fill");
  const timer=root.querySelector("#demo-timer");
  const studio=root.querySelector(".demo-call-studio");
  const audio=root.querySelector("#demo-audio");
  const audioStatus=root.querySelector("#demo-audio-status");
  const audioPlaceholder=root.querySelector("#demo-audio-placeholder");
  let current="roofing", index=0, interval=null, seconds=0, running=false;

  function stop(){if(interval){clearInterval(interval);interval=null;}running=false;studio.classList.remove("is-playing");}
  function setIndustry(key){
    stop(); if(audio){audio.pause();audio.currentTime=0;}
    current=key; index=0;seconds=0;
    const d=demos[key];
    cards.forEach(card=>{const selected=card.dataset.industry===key;card.classList.toggle("selected",selected);card.setAttribute("aria-pressed",String(selected));});
    title.textContent=d.title;subtitle.textContent=d.subtitle;label.textContent=d.label;business.textContent=d.business;
    timer.textContent="00";progress.style.width="0%";
    transcript.innerHTML='<div class="transcript-empty"><span>✳</span><b>Your '+d.label.toLowerCase()+' demo is ready</b><small>Press Start simulation to watch the customer and AI receptionist talk.</small></div>';
    state.textContent="READY TO PLAY";
    start.disabled=false;start.innerHTML="<span>▶</span> Start simulation";reset.disabled=true;
    if(d.audioSrc){audio.src=d.audioSrc;audio.hidden=false;audioPlaceholder.hidden=true;audioStatus.textContent="Listen to the recorded example conversation.";audio.load();}
    else{audio.removeAttribute("src");audio.hidden=true;audioPlaceholder.hidden=false;audioStatus.textContent="Audio recording will be added soon. The visual call simulator is ready to explore.";}
  }
  function addLine(line){
    const [speaker,message]=line;
    const item=document.createElement("div");
    item.className="transcript-message "+(speaker==="caller"?"caller":"receptionist");
    const name=speaker==="caller"?"CALLER":"AI RECEPTIONIST";
    const stamp="00:"+String(Math.min(seconds,59)).padStart(2,"0");
    const tag=document.createElement("span");tag.className="transcript-speaker";tag.textContent=name;
    const body=document.createElement("p");body.textContent=message;
    const time=document.createElement("div");time.className="transcript-time";time.textContent=stamp;
    item.append(tag,body,time);transcript.append(item);transcript.scrollTop=transcript.scrollHeight;
  }
  function finish(){
    stop();state.textContent="SIMULATION COMPLETE";
    start.disabled=false;start.innerHTML="<span>✓</span> Replay conversation";
    progress.style.width="100%";
    const note=document.createElement("div");note.className="transcript-empty";note.innerHTML="<small>End of sample call · No real booking or customer data was created.</small>";transcript.append(note);
  }
  function tick(){
    const d=demos[current];seconds++;
    timer.textContent=String(seconds).padStart(2,"0");
    if(index<d.lines.length){addLine(d.lines[index]);index++;progress.style.width=(index/d.lines.length*100)+"%";}
    if(index>=d.lines.length)finish();
  }
  function play(){
    if(running)return;
    if(index>=demos[current].lines.length)setIndustry(current);
    if(index===0){transcript.innerHTML="";state.textContent="CALL IN PROGRESS";reset.disabled=false;addLine(demos[current].lines[index]);index++;progress.style.width=(index/demos[current].lines.length*100)+"%";}
    running=true;studio.classList.add("is-playing");start.disabled=true;start.innerHTML="<span>●</span> Playing…";
    interval=setInterval(tick,2200);
  }
  cards.forEach(card=>card.addEventListener("click",()=>setIndustry(card.dataset.industry)));
  start.addEventListener("click",play);
  reset.addEventListener("click",()=>{setIndustry(current);play();});
  if(audio){audio.addEventListener("error",()=>{audio.hidden=true;audioPlaceholder.hidden=false;audioStatus.textContent="This recording could not be loaded. Check the audio file path.";});}
  setIndustry(current);
})();
