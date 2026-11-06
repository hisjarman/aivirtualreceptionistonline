/* Interactive client dashboard preview: all values below are fictional demo data. */
(() => {
  const root = document.querySelector("#dashboard-showcase");
  if (!root) return;
  const tabs = [...root.querySelectorAll(".dashboard-demo-tab")];
  const views = [...root.querySelectorAll(".dashboard-demo-view")];
  function activate(name) {
    tabs.forEach(tab => {
      const selected = tab.dataset.view === name;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });
    views.forEach(view => { view.hidden = view.id !== "demo-view-" + name; });
  }
  tabs.forEach(tab => tab.addEventListener("click", () => activate(tab.dataset.view)));
  activate("overview");
})();
