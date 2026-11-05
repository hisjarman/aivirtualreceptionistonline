(() => {
  const API_BASE = window.AVR_CONFIG?.apiBase || "https://avr-trust-lab-api.hisjarman.workers.dev";
  const $ = selector => document.querySelector(selector);
  const auth = $("#ta-auth"), dashboard = $("#ta-dashboard"), locked = $("#ta-locked");
  const authTitle = $("#ta-auth-title"), authCopy = $("#ta-auth-copy"), authActions = $("#ta-auth-actions");
  const userButton = $("#ta-user-button"), list = $("#ta-list"), message = $("#ta-message");
  const count = $("#ta-count"), status = $("#ta-status"), filter = $("#ta-filter");
  let clerk = null, userButtonMounted = false, submissions = [];

  function showMessage(text, error=false) {
    message.textContent = text;
    message.classList.toggle("error", error);
    message.hidden = false;
  }
  function setSignedOut() {
    auth.hidden = false; dashboard.hidden = true; locked.hidden = true;
    authTitle.textContent = "Sign in to continue";
    authCopy.textContent = "Use your verified administrator account to access the moderation queue.";
    authActions.hidden = false; userButton.hidden = true; $("#ta-session").textContent = "SIGNED OUT";
    if (userButtonMounted) { clerk.unmountUserButton(userButton); userButtonMounted = false; }
  }
  function setSignedIn() {
    auth.hidden = false;
    authTitle.textContent = "Signed in";
    authCopy.textContent = "Your session is active. The server will verify administrator permissions before showing submissions.";
    authActions.hidden = true; userButton.hidden = false; $("#ta-session").textContent = "SESSION ACTIVE";
    if (!userButtonMounted) { clerk.mountUserButton(userButton); userButtonMounted = true; }
    loadQueue();
  }
  async function api(path, options={}) {
    const token = await clerk.session?.getToken();
    if (!token) throw new Error("Your session expired. Please sign in again.");
    const response = await fetch(API_BASE + path, {
      ...options,
      headers: { "Accept":"application/json", ...(options.body ? {"Content-Type":"application/json"} : {}), "Authorization":"Bearer "+token, ...(options.headers||{}) }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 403 && data.error === "admin_access_required") {
      const error = new Error("admin_access_required"); error.code = "admin_access_required"; throw error;
    }
    if (!response.ok) throw new Error(data.error || "Request failed ("+response.status+").");
    return data;
  }
  function renderQueue() {
    const type = filter.value;
    const rows = submissions.filter(item => type === "all" || item.kind === type);
    count.textContent = String(submissions.length);
    status.textContent = "Ready";
    if (!rows.length) {
      list.innerHTML = '<div class="ta-empty">'+(submissions.length ? "No submissions match this filter." : "Your moderation queue is clear. New submissions will appear here.")+'</div>';
      return;
    }
    list.replaceChildren();
    rows.forEach(item => {
      const card = document.createElement("article"); card.className = "ta-card";
      const head = document.createElement("div"); head.className = "ta-card-head";
      const kind = document.createElement("span"); kind.className = "ta-type"; kind.textContent = ({challenge:"Challenge",question:"Hard question",stress_test:"Stress test"})[item.kind] || "Submission";
      const date = document.createElement("span"); date.className = "ta-date"; date.textContent = item.createdAt ? new Date(item.createdAt).toLocaleString() : "Date unavailable";
      head.append(kind,date);
      const title = document.createElement("h2"); title.textContent = item.title || "Untitled submission";
      const body = document.createElement("p"); body.textContent = item.body || "";
      const meta = document.createElement("div"); meta.className = "ta-meta";
      [item.displayName || "Anonymous", item.industry || "General", item.impactScore != null ? "Difficulty: "+item.impactScore+"/100" : ""].filter(Boolean).forEach(value => { const span=document.createElement("span"); span.textContent=value; meta.append(span); });
      const actions = document.createElement("div"); actions.className = "ta-actions";
      const reject = document.createElement("button"); reject.className = "ta-reject"; reject.type="button"; reject.textContent="Reject";
      const approve = document.createElement("button"); approve.className = "ta-approve"; approve.type="button"; approve.textContent="Approve & publish";
      reject.addEventListener("click",()=>review(item.id,"rejected",reject,approve));
      approve.addEventListener("click",()=>review(item.id,"approved",approve,reject));
      actions.append(reject,approve); card.append(head,title,body,meta,actions); list.append(card);
    });
  }
  async function loadQueue() {
    status.textContent = "Loading";
    list.innerHTML = '<div class="ta-empty">Loading pending submissions…</div>';
    message.hidden = true;
    try {
      const data = await api("/api/admin/trust-lab/pending");
      submissions = Array.isArray(data.submissions) ? data.submissions : [];
      renderQueue();
    } catch(error) {
      if (error.code === "admin_access_required") {
        dashboard.hidden = true; locked.hidden = false; status.textContent = "Restricted";
        return;
      }
      status.textContent = "Error";
      list.innerHTML = '<div class="ta-empty">Could not load the queue. Check the API configuration and try again.</div>';
      showMessage(error.message || "Unable to load submissions.", true);
    }
  }
  async function review(id, decision, primary, secondary) {
    const promptText = decision === "approved"
      ? "Publish this submission on the public Trust Lab wall?"
      : "Reject this submission? It will remain hidden from the public wall.";
    if (!window.confirm(promptText)) return;
    primary.disabled = true; secondary.disabled = true;
    try {
      await api("/api/admin/trust-lab/"+encodeURIComponent(id), {method:"PATCH",body:JSON.stringify({status:decision})});
      submissions = submissions.filter(item => item.id !== id);
      renderQueue();
      showMessage(decision === "approved" ? "Approved and published to the public wall." : "Submission rejected and kept private.");
    } catch(error) {
      primary.disabled = false; secondary.disabled = false;
      showMessage(error.message || "The review action failed.", true);
    }
  }
  $("#ta-sign-in").addEventListener("click",()=>clerk?.openSignIn());
  $("#ta-sign-up").addEventListener("click",()=>clerk?.openSignUp());
  $("#ta-refresh").addEventListener("click",loadQueue);
  filter.addEventListener("change",renderQueue);
  async function init() {
    try {
      if (!window.Clerk) throw new Error("Clerk did not load. Refresh this page and try again.");
      await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});
      clerk=window.Clerk;
      if (clerk.isSignedIn) setSignedIn(); else setSignedOut();
      clerk.addListener(() => { if (clerk.isSignedIn) setSignedIn(); else setSignedOut(); });
    } catch(error) {
      authTitle.textContent="Sign-in could not initialize";
      authCopy.textContent=error.message || "Please refresh and try again.";
      authActions.hidden=true; $("#ta-session").textContent="AUTH ERROR";
    }
  }
  init();
})();