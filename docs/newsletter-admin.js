(() => {
  const API="https://avr-trust-lab-api.hisjarman.workers.dev";
  const $=s=>document.querySelector(s);
  let clerk=null,mounted=false,subscribers=[];
  const auth=$("#na-auth"),dashboard=$("#na-dashboard"),locked=$("#na-locked"),rows=$("#na-rows");
  async function request(){
    const token=await clerk.session?.getToken();
    if(!token)throw new Error("Your session expired. Sign in again.");
    const response=await fetch(API+"/api/admin/newsletter/subscribers?status=all",{headers:{Accept:"application/json",Authorization:"Bearer "+token}});
    const data=await response.json().catch(()=>({}));
    if(response.status===403&&data.error==="admin_access_required"){const e=new Error("admin_access_required");e.code=e.message;throw e;}
    if(!response.ok)throw new Error(data.error||"Unable to load subscribers.");
    return data;
  }
  function render(){
    $("#na-count").textContent=String(subscribers.filter(x=>x.status==="subscribed").length);
    rows.replaceChildren();
    if(!subscribers.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=4;td.textContent="No signups yet.";tr.append(td);rows.append(tr);return;}
    subscribers.forEach(s=>{const tr=document.createElement("tr");[s.email,s.firstName||"—",s.status,s.createdAt?new Date(s.createdAt).toLocaleDateString():"—"].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});rows.append(tr);});
  }
  async function load(){
    $("#na-status").textContent="Loading…";$("#na-error").textContent="";
    try{const data=await request();subscribers=Array.isArray(data.subscribers)?data.subscribers:[];render();$("#na-status").textContent="List updated.";}
    catch(e){if(e.code==="admin_access_required"){dashboard.hidden=true;locked.hidden=false;return;}$("#na-status").textContent="Could not load the list." ;$("#na-error").textContent=e.message;}
  }
  function signedOut(){auth.hidden=false;dashboard.hidden=true;locked.hidden=true;$("#na-title").textContent="Sign in to continue";$("#na-copy").textContent="Use your verified administrator account.";$("#na-signin").hidden=false;if(mounted){clerk.unmountUserButton($("#na-user"));mounted=false;}}
  function signedIn(){auth.hidden=false;$("#na-title").textContent="Signed in";$("#na-copy").textContent="Your administrator session is active.";$("#na-signin").hidden=true;$("#na-user").hidden=false;if(!mounted){clerk.mountUserButton($("#na-user"));mounted=true;}load();}
  $("#na-signin").addEventListener("click",()=>clerk?.openSignIn());
  $("#na-refresh").addEventListener("click",load);
  $("#na-export").addEventListener("click",()=>{
    const rows=[["email","first_name","status","joined","unsubscribe_url"],...subscribers.map(s=>[s.email,s.firstName||"",s.status,s.createdAt||"",s.unsubscribeUrl||""])];
    const csv=rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download="avr-weekly-story-subscribers.csv";a.click();URL.revokeObjectURL(url);
  });
  async function init(){try{if(!window.Clerk)throw new Error("Clerk did not load. Refresh and try again.");await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});clerk=window.Clerk;if(clerk.isSignedIn)signedIn();else signedOut();clerk.addListener(()=>clerk.isSignedIn?signedIn():signedOut());}catch(e){$("#na-title").textContent="Sign-in could not initialize";$("#na-copy").textContent=e.message;}}
  init();
})();
