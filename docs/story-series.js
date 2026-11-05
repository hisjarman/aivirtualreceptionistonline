(() => {
  const API_BASE = "https://avr-trust-lab-api.hisjarman.workers.dev";
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }
  document.querySelectorAll("[data-story-subscribe]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const status = form.querySelector(".story-form-status");
      const button = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      const payload = {
        email: String(data.get("email") || "").trim(),
        firstName: String(data.get("firstName") || "").trim(),
        consent: data.get("consent") === "on",
        website: String(data.get("website") || "")
      };
      status.textContent = "";
      status.classList.remove("error");
      button.disabled = true;
      button.textContent = "Saving…";
      try {
        const response = await fetch(API_BASE + "/api/newsletter/subscribe", {
          method: "POST",
          headers: {"Content-Type":"application/json","Accept":"application/json"},
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "We couldn't save your subscription. Please try again.");
        form.reset();
        status.textContent = result.confirmationSent ? "You're subscribed! Check your inbox for a confirmation email." : "You're subscribed, but the confirmation email could not be sent just now.";
      } catch (error) {
        status.textContent = error.message || "Something went wrong. Please try again.";
        status.classList.add("error");
      } finally {
        button.disabled = false;
        button.textContent = "Subscribe ↗";
      }
    });
  });
})();
