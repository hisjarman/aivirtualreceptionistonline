(() => {
  // Public API is hosted by the existing Render backend; never put secrets in this file.
  const API_BASE = "https://aivirtualreceptionist-clean1.onrender.com";
  const form = document.querySelector("#tl-form");
  const message = document.querySelector("#tl-message");
  const submit = document.querySelector("#tl-submit");
  const wall = document.querySelector("#tl-wall");
  const score = document.querySelector("#tl-score");
  const scoreValue = document.querySelector("#tl-score-value");
  const scoreWrap = document.querySelector("#tl-score-wrap");
  let kind = "challenge";

  const labels = { challenge: "Challenge", question: "Question", stress_test: "Stress test" };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[ch]);

  document.querySelectorAll("[data-kind]").forEach(button => {
    button.addEventListener("click", () => {
      kind = button.dataset.kind;
      document.querySelectorAll("[data-kind]").forEach(item => item.classList.toggle("active", item === button));
      scoreWrap.hidden = kind !== "stress_test";
      document.querySelector("#tl-body-label").childNodes[0].textContent = kind === "question" ? "Your question " : "Describe the scenario ";
      message.hidden = true;
    });
  });
  score.addEventListener("input", () => { scoreValue.textContent = score.value + "/100"; });

  document.querySelectorAll("[data-example]").forEach(button => {
    button.addEventListener("click", () => {
      kind = "challenge";
      document.querySelector('[data-kind="challenge"]').click();
      form.elements.body.value = button.dataset.example;
      form.elements.body.focus();
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  function showMessage(text, error = false) {
    message.textContent = text;
    message.classList.toggle("error", error);
    message.hidden = false;
  }

  async function loadWall() {
    try {
      const response = await fetch(API_BASE + "/api/trust-lab/wall", { headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error("wall unavailable");
      const data = await response.json();
      if (!Array.isArray(data.posts) || data.posts.length === 0) {
        wall.innerHTML = '<div class="tl-empty">No approved challenges yet. Be the first to submit one.</div>';
        return;
      }
      wall.innerHTML = data.posts.map(post => {
        const title = post.title || labels[post.kind] || "Community test";
        const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" }) : "";
        return '<article class="tl-post"><div class="tl-post-kind">' + escapeHtml(labels[post.kind] || "Community test") + '</div><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(post.body) + '</p><div class="tl-post-foot">' + escapeHtml(post.displayName || "Anonymous") + (post.industry ? " · " + escapeHtml(post.industry) : "") + (date ? " · " + escapeHtml(date) : "") + '</div></article>';
      }).join("");
    } catch {
      wall.innerHTML = '<div class="tl-empty">The public test wall is temporarily unavailable. Please try again later.</div>';
    }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!document.querySelector("#tl-confirm").checked) return;
    const payload = {
      kind,
      title: form.elements.title.value.trim(),
      body: form.elements.body.value.trim(),
      displayName: form.elements.displayName.value.trim(),
      industry: form.elements.industry.value.trim(),
      website: form.elements.website.value,
      ...(kind === "stress_test" ? { impactScore: Number(score.value) } : {})
    };
    submit.disabled = true;
    submit.textContent = "Sending for review…";
    message.hidden = true;
    try {
      const response = await fetch(API_BASE + "/api/trust-lab/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.created !== true) {
        if (result.error === "database_unavailable") throw new Error("The submission database is temporarily unavailable. Please try again later.");
        throw new Error("We couldn't submit this test. Please try again in a moment.");
      }
      form.reset();
      score.value = "50";
      scoreValue.textContent = "50/100";
      document.querySelector("#tl-confirm").checked = false;
      showMessage("Thank you. Your test has been received and is pending human review. It will not appear publicly unless approved.");
    } catch (error) {
      showMessage(error.message || "Submission failed. Please try again.", true);
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Submit for human review <span>→</span>';
    }
  });

  loadWall();
})();