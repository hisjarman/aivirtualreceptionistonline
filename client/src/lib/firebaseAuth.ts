export type FirebaseAuthSession = {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  localId: string;
  email: string;
  displayName?: string;
};

declare global {
  interface Window {
    __FIREBASE_CONFIG__?: { apiKey: string; projectId: string; authDomain?: string };
  }
}

const SESSION_KEY = "aivr.firebase.session";

function config() {
  const value = window.__FIREBASE_CONFIG__;
  if (!value?.apiKey || !value?.projectId) {
    throw new Error("Firebase Authentication is not configured yet. The site owner must add FIREBASE_API_KEY and FIREBASE_PROJECT_ID to the server environment.");
  }
  return value;
}

function readSession(): FirebaseAuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as FirebaseAuthSession : null;
  } catch {
    return null;
  }
}

function saveSession(session: FirebaseAuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

async function identityRequest<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const { apiKey } = config();
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) {
    const code = result.error?.message ?? "AUTH_ERROR";
    const messages: Record<string, string> = {
      EMAIL_EXISTS: "An account with this email already exists. Sign in instead.",
      INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect.",
      EMAIL_NOT_FOUND: "No account was found with this email.",
      INVALID_PASSWORD: "Email or password is incorrect.",
      WEAK_PASSWORD: "Choose a stronger password with at least 6 characters.",
      USER_DISABLED: "This account has been disabled. Contact support.",
      TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Wait a while and try again.",
      INVALID_EMAIL: "Enter a valid email address.",
      OPERATION_NOT_ALLOWED: "Email/password sign-in is not enabled in Firebase Authentication.",
      EXPIRED_OOB_CODE: "This email link has expired. Request a new one.",
      INVALID_OOB_CODE: "This email link is invalid or has already been used.",
    };
    throw new Error(messages[code] ?? `Firebase authentication error: ${code}`);
  }
  return result;
}

type TokenResponse = {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
};

function persist(result: TokenResponse) {
  saveSession({
    idToken: result.idToken,
    refreshToken: result.refreshToken,
    expiresAt: Date.now() + Number(result.expiresIn || 3600) * 1000,
    localId: result.localId,
    email: result.email,
    displayName: result.displayName,
  });
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const result = await identityRequest<TokenResponse>("signUp", { email, password, returnSecureToken: true });
  await identityRequest("update", { idToken: result.idToken, displayName, returnSecureToken: true });
  persist(result);
  await identityRequest("sendOobCode", {
    requestType: "VERIFY_EMAIL",
    idToken: result.idToken,
    continueUrl: `${window.location.origin}/login?verified=1`,
  });
  return result;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await identityRequest<TokenResponse>("signInWithPassword", { email, password, returnSecureToken: true });
  if (!result.emailVerified) {
    saveSession({
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresAt: Date.now() + Number(result.expiresIn || 3600) * 1000,
      localId: result.localId,
      email: result.email,
      displayName: result.displayName,
    });
    throw new Error("EMAIL_NOT_VERIFIED");
  }
  persist(result);
  return result;
}

export async function resendVerificationEmail() {
  const session = readSession();
  if (!session?.idToken) throw new Error("Sign in first to resend the verification email.");
  await identityRequest("sendOobCode", { requestType: "VERIFY_EMAIL", idToken: session.idToken });
}

export async function sendPasswordReset(email: string) {
  await identityRequest("sendOobCode", { requestType: "PASSWORD_RESET", email, continueUrl: `${window.location.origin}/login?reset=1` });
}

export async function getFirebaseIdToken(): Promise<string | null> {
  const session = readSession();
  if (!session) return null;
  if (session.expiresAt > Date.now() + 60_000) return session.idToken;
  const { apiKey } = config();
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    }),
  });
  if (!response.ok) {
    clearFirebaseSession();
    return null;
  }
  const refreshed = await response.json() as { id_token: string; refresh_token: string; expires_in: string; user_id: string };
  const next = {
    ...session,
    idToken: refreshed.id_token,
    refreshToken: refreshed.refresh_token,
    expiresAt: Date.now() + Number(refreshed.expires_in || 3600) * 1000,
    localId: refreshed.user_id,
  };
  saveSession(next);
  return next.idToken;
}

export function clearFirebaseSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function hasPendingFirebaseSession() {
  return Boolean(readSession());
}
