(() => {
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      menu.textContent = open ? "×" : "☰";
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.textContent = "☰";
    }));
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Sales inbox for demo and onboarding inquiries.
  const SALES_EMAIL = "hisjarman@gmail.com";
  const form = document.getElementById("lead-form");
  if (form) form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent("AI receptionist demo request — " + data.get("business"));
    const body = encodeURIComponent([
      "New AI Virtual Receptionist demo request",
      "",
      "Business: " + data.get("business"),
      "Contact: " + data.get("name"),
      "Email: " + data.get("email"),
      "Phone: " + (data.get("phone") || "Not provided"),
      "Business type: " + (data.get("industry") || "Not selected"),
      "",
      "What they need:",
      data.get("needs") || "Not provided"
    ].join("\n"));
    window.location.href = "mailto:" + SALES_EMAIL + "?subject=" + subject + "&body=" + body;
    document.getElementById("form-message").textContent = "Your email app should open with the request ready to send.";
  });
})();