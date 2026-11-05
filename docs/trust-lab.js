(() => {
  // The API base is intentionally unset until the new backend is deployed.
  // Never put Clerk Secret Keys or HubSpot tokens in this public file.
  const API_BASE = window.AVR_CONFIG?.apiBase || "";
  const form = document.querySelector("#tl-form");
  const message = document.querySelector("#tl-message");
  const submit = document.querySelector("#tl-submit");
  const wall = document.querySelector("#tl-wall");
  const score = document.querySelector("#tl-score");
  const scoreValue = document.querySelector("#tl-score-value");
  const scoreWrap = document.querySelector("#tl-score-wrap");
  const authTitle = document.querySelector("#tl-auth-title");
  const authStatus = document.querySelector("#tl-auth-status");
  const authActions = document.querySelector("#tl-auth-actions");
  const userButton = document.querySelector("#tl-user-button");
  let kind = "challenge";
  let clerk = null;
  let userButtonMounted = false;

  const labels = { challenge: "Challenge", question: "Question", stress_test: "Stress test" };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[ch]);

  function isVerified() {
    const email = clerk?.user?.primaryEmailAddress;
    return Boolean(clerk?.isSignedIn && email?.verification?.status === "verified");
  }

  function updateAuthState() {
    const signedIn = Boolean(clerk?.isSignedIn);
    const verified = isVerified();
    submit.disabled = !verified;
    authActions.hidden = signedIn;
    userButton.hidden = !signedIn;
    if (signedIn) {
      authTitle.textContent = verified ? "You're signed in" : "Verify your email to submit";
      authStatus.textContent = verified
        ? "Your account is ready. Your submission will be linked to your verified account."
        : "Complete the email verification step in Clerk before submitting a test.";
      if (!userButtonMounted) {
        clerk.mountUserButton(userButton);
        userButtonMounted = true;
      }
    } else {
      authTitle.textContent = "Sign in to submit a test";
      authStatus.textContent = "Create a free account or sign in. Your email must be verified before submitting.";
      if (userButtonMounted) {
        clerk.unmountUserButton(userButton);
        userButtonMounted = false;
      }
    }
  }

  document.querySelector("#tl-sign-up").addEventListener("click", () => clerk?.openSignUp());
  document.querySelector("#tl-sign-in").addEventListener("click", () => clerk?.openSignIn());

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
    if (!API_BASE) {
      wall.innerHTML = '<div class="tl-empty">The new Trust Lab service is being connected. Please check back soon.</div>';
      return;
    }
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
    if (!isVerified()) {
      showMessage("Please sign in and verify your email before submitting.", true);
      return;
    }
    if (!API_BASE) {
      showMessage("The new submission service is not connected yet. Your test has not been sent.", true);
      return;
    }
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
      const token = await clerk.session?.getToken();
      if (!token) throw new Error("Your sign-in session expired. Please sign in again.");
      const response = await fetch(API_BASE + "/api/trust-lab/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.created !== true) {
        if (result.error === "database_unavailable") throw new Error("The submission database is temporarily unavailable. Please try again later.");
        throw new Error(result.error || "We couldn't submit this test. Please try again in a moment.");
      }
      form.reset();
      score.value = "50";
      scoreValue.textContent = "50/100";
      document.querySelector("#tl-confirm").checked = false;
      showMessage("Thank you. Your test has been received and is pending human review. It will not appear publicly unless approved.");
    } catch (error) {
      showMessage(error.message || "Submission failed. Please try again.", true);
    } finally {
      submit.disabled = !isVerified();
      submit.innerHTML = 'Submit for human review <span>→</span>';
    }
  });

  async function initClerk() {
    try {
      if (!window.Clerk) throw new Error("ClerkJS did not load. Check the Clerk Frontend API domain and script access.");
      await window.Clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
      clerk = window.Clerk;
      updateAuthState();
      clerk.addListener(updateAuthState);
    } catch (error) {
      authTitle.textContent = "Account sign-in is temporarily unavailable";
      authStatus.textContent = error.message || "Please try again later.";
      authActions.hidden = true;
      submit.disabled = true;
    }
  }

  loadWall();
  initClerk();
})();