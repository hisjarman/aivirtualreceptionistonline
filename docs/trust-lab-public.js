(() => {
const API_BASE=window.AVR_CONFIG?.apiBase||"https://avr-trust-lab-api.hisjarman.workers.dev";
const $=s=>document.querySelector(s);
const labels={challenge:"Challenge",question:"Hard question",stress_test:"Stress test"};
let posts=[];
const fmtDate=value=>{if(!value)return "";const d=new Date(value);return Number.isNaN(d.getTime())?"":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});};
function setStat(id,value){$(id).textContent=String(value);}
function renderStats(){
setStat("#tp-total",posts.length);
setStat("#tp-challenges",posts.filter(p=>p.kind==="challenge").length);
setStat("#tp-questions",posts.filter(p=>p.kind==="question").length);
setStat("#tp-stress",posts.filter(p=>p.kind==="stress_test").length);
const types=[["challenge","Challenges"],["question","Hard questions"],["stress_test","Stress tests"]];
const max=Math.max(1,...types.map(([key])=>posts.filter(p=>p.kind===key).length));
const bars=$("#tp-category-bars");bars.replaceChildren();
if(!posts.length){bars.innerHTML='<div class="tp-loading">No approved tests have been published yet.</div>';return;}
types.forEach(([key,label])=>{
const n=posts.filter(p=>p.kind===key).length;
const row=document.createElement("div");row.className="tp-bar-row";
const line=document.createElement("div");line.className="tp-bar-label";
const name=document.createElement("span");name.textContent=label;
const value=document.createElement("span");value.textContent=n+" · "+Math.round(n/posts.length*100)+"%";
line.append(name,value);
const track=document.createElement("div");track.className="tp-bar-track";
const fill=document.createElement("div");fill.className="tp-bar-fill";fill.style.width=(n/max*100)+"%";
track.append(fill);row.append(line,track);bars.append(row);
});
const industries={};
posts.forEach(p=>{const key=String(p.industry||"General").trim()||"General";industries[key]=(industries[key]||0)+1;});
const entries=Object.entries(industries).sort((a,b)=>b[1]-a[1]).slice(0,6);
const list=$("#tp-industry-list");list.replaceChildren();
if(!entries.length){list.innerHTML='<div class="tp-loading">Industry information will appear as approved tests are added.</div>';return;}
entries.forEach(([name,n])=>{const row=document.createElement("div");row.className="tp-industry-row";const label=document.createElement("span");label.textContent=name;const count=document.createElement("strong");count.textContent=n;row.append(label,count);list.append(row);});
}
function renderFeed(){
const query=$("#tp-search").value.trim().toLowerCase(),type=$("#tp-type").value,sort=$("#tp-sort").value;
let rows=posts.filter(p=>(type==="all"||p.kind===type)&&(!query||[p.title,p.body,p.industry,p.displayName,p.kind].some(v=>String(v||"").toLowerCase().includes(query))));
rows.sort((a,b)=>{const delta=new Date(a.createdAt||0)-new Date(b.createdAt||0);return sort==="oldest"?delta:-delta;});
$("#tp-feed-count").textContent=rows.length+" shown · "+posts.length+" loaded";
const feed=$("#tp-feed");feed.replaceChildren();
if(!rows.length){const empty=document.createElement("div");empty.className="tp-empty";empty.textContent=posts.length?"No approved tests match those filters.":"No approved tests have been published yet. Check back soon.";feed.append(empty);return;}
rows.forEach(post=>{
const card=document.createElement("article");card.className="tp-card";
const top=document.createElement("div");top.className="tp-card-top";
const type=document.createElement("span");type.className="tp-type";type.textContent=labels[post.kind]||"Community test";
const approved=document.createElement("span");approved.className="tp-approved";approved.textContent="✓ APPROVED";top.append(type,approved);
const title=document.createElement("h3");title.textContent=post.title||labels[post.kind]||"Community test";
const body=document.createElement("p");body.textContent=post.body||"";
const foot=document.createElement("div");foot.className="tp-card-foot";
[post.displayName||"Anonymous",post.industry||"General",fmtDate(post.createdAt)].filter(Boolean).forEach(value=>{const span=document.createElement("span");span.textContent=value;foot.append(span);});
card.append(top,title,body,foot);feed.append(card);
});
}
async function load(){
const button=$("#tp-refresh");button.disabled=true;button.textContent="↻ Loading…";
$("#tp-feed").innerHTML='<div class="tp-loading">Loading approved tests…</div>';
try{
const response=await fetch(API_BASE+"/api/trust-lab/wall?limit=40",{headers:{"Accept":"application/json"}});
if(!response.ok)throw new Error("The public feed is currently unavailable.");
const data=await response.json();if(!Array.isArray(data.posts))throw new Error("The public feed returned an unexpected response.");
posts=data.posts;renderStats();renderFeed();
$("#tp-footnote").textContent="Only human-approved entries are included. This public view displays up to 40 of the most recent approved submissions.";
}catch(error){
$("#tp-feed").innerHTML='<div class="tp-empty">The public dashboard could not load right now. Please refresh in a moment.</div>';
$("#tp-category-bars").textContent="Public data unavailable.";
$("#tp-industry-list").textContent="Public data unavailable.";
$("#tp-feed-count").textContent="Unavailable";
}finally{button.disabled=false;button.textContent="↻ Refresh data";}
}
$("#tp-refresh").addEventListener("click",load);
$("#tp-search").addEventListener("input",renderFeed);
$("#tp-type").addEventListener("change",renderFeed);
$("#tp-sort").addEventListener("change",renderFeed);
load();
})();