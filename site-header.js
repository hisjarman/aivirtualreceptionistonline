/* Shared responsive navigation for all public pages. */
(() => {
  const header = document.querySelector(".reference-topbar");
  if (!header) return;
  const toggle = header.querySelector(".menu-toggle");
  const nav = header.querySelector("#primary-navigation");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    }
  });
  document.addEventListener("click", event => {
    if (!header.contains(event.target)) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    }
  });
})();
