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

  // Set the sales inbox in this one place before publishing.
  const SALES_EMAIL = "SET_YOUR_SALES_EMAIL";
  const form = document.getElementById("lead-form");
  if (form) form.addEventListener("submit", event => {
    event.preventDefault();
    if (SALES_EMAIL === "SET_YOUR_SALES_EMAIL") {
      const message = document.getElementById("form-message");
      message.textContent = "The website is ready, but the sales inbox has not been configured yet. Set SALES_EMAIL in script.js before publishing.";
      return;
    }
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