// Only intentionally public browser configuration is serialized here.
// Firebase Web API keys identify the project; security comes from Auth, rules,
// App Check and server-side ID-token verification, never from hiding this key.
export function publicPlatformConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    projectId: env.MANUS_PROJECT_ID ?? "",
    oauthPortalUrl: env.MANUS_OAUTH_PORTAL_URL ?? "",
    apiUrl: env.MANUS_API_URL ?? "",
    apiBrowserKey: env.MANUS_API_BROWSER_KEY ?? "",
  };
}

export function publicPlatformScript(env: NodeJS.ProcessEnv = process.env): string {
  const platform = JSON.stringify(publicPlatformConfig(env)).replaceAll("<", "\\u003c");
  const firebase = JSON.stringify({
    apiKey: env.FIREBASE_API_KEY ?? "",
    projectId: env.FIREBASE_PROJECT_ID ?? "",
    authDomain: env.FIREBASE_AUTH_DOMAIN ?? "",
  }).replaceAll("<", "\\u003c");
  return `window.__MANUS_CONFIG__=${platform};window.__FIREBASE_CONFIG__=${firebase};`;
}
