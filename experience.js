/* Gentle, optional page motion and navigation cues. No scroll hijacking. */
(() => {
  const body=document.body;
  const topbar=document.querySelector(".topbar");
  if(!topbar)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealTargets=[...document.querySelectorAll("main > section, .trust-strip, .section-heading, .steps-grid > *, .cap-grid > *, .industry-grid > *, .pricing-grid > *, .managed-pillars > *, .faq-list details")];
  revealTargets.forEach((el,i)=>{
    el.classList.add("experience-reveal");
    if(i%4===1)el.classList.add("delay-1");
    if(i%4===2)el.classList.add("delay-2");
    if(i%4===3)el.classList.add("delay-3");
  });
  if(!reduced && "IntersectionObserver" in window){
    body.classList.add("js-motion");
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.08,rootMargin:"0px 0px -45px 0px"});
    revealTargets.forEach(el=>observer.observe(el));
  }
  const topButton=document.createElement("button");
  topButton.className="back-to-top";
  topButton.type="button";
  topButton.setAttribute("aria-label","Back to top");
  topButton.textContent="↑";
  topButton.addEventListener("click",()=>window.scrollTo({top:0,behavior:reduced?"auto":"smooth"}));
  document.body.appendChild(topButton);
  const navLinks=[...document.querySelectorAll(".nav a[href^='#']")];
  const sections=navLinks.map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const update=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    topbar.style.setProperty("--reading-progress",Math.min(100,Math.max(0,window.scrollY/max*100))+"%");
    topButton.classList.toggle("visible",window.scrollY>650);
    let current=null;
    sections.forEach(section=>{if(section.getBoundingClientRect().top<150)current=section;});
    navLinks.forEach(link=>{
      const active=current && link.getAttribute("href")==="#"+current.id;
      if(active)link.setAttribute("aria-current","location");
      else link.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll",update,{passive:true});
  window.addEventListener("resize",update);
  update();

  // Accessible responsive navigation toggle.
  const menuButton=document.querySelector(".menu-toggle");
  const primaryNav=document.querySelector("#primary-navigation");
  if(menuButton && primaryNav){
    const closeMenu=()=>{
      menuButton.setAttribute("aria-expanded","false");
      menuButton.setAttribute("aria-label","Open navigation menu");
      primaryNav.classList.remove("open");
    };
    menuButton.addEventListener("click",()=>{
      const opening=menuButton.getAttribute("aria-expanded")!=="true";
      menuButton.setAttribute("aria-expanded",String(opening));
      menuButton.setAttribute("aria-label",opening?"Close navigation menu":"Open navigation menu");
      primaryNav.classList.toggle("open",opening);
    });
    primaryNav.querySelectorAll("a").forEach(link=>link.addEventListener("click",closeMenu));
    document.addEventListener("keydown",event=>{if(event.key==="Escape"){closeMenu();const more=primaryNav.querySelector(".nav-more");if(more)more.open=false;}});
    document.addEventListener("click",event=>{if(!primaryNav.contains(event.target)&&!menuButton.contains(event.target)){closeMenu();}});
    window.addEventListener("resize",()=>{if(window.innerWidth>650)closeMenu();});
  }
})();
