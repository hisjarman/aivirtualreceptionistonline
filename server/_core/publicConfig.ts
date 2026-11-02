// Only explicitly approved browser-safe values may reach the frontend.
// Retell private API keys, webhook secrets, OAuth secrets, and payment credentials
// must never be added to this object.
export function publicPlatformConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    projectId: env.MANUS_PROJECT_ID ?? "",
    oauthPortalUrl: env.MANUS_OAUTH_PORTAL_URL ?? "",
    apiUrl: env.MANUS_API_URL ?? "",
    apiBrowserKey: env.MANUS_API_BROWSER_KEY ?? "",
    retellSupportPublicKey: env.RETELL_SUPPORT_PUBLIC_KEY ?? "",
    retellSupportChatAgentId: env.RETELL_SUPPORT_CHAT_AGENT_ID ?? "",
    retellSupportAgentVersion: env.RETELL_SUPPORT_AGENT_VERSION ?? "",
  };
}

export function publicPlatformScript(env: NodeJS.ProcessEnv = process.env): string {
  const json = JSON.stringify(publicPlatformConfig(env)).replaceAll("<", "\\u003c");
  return `window.__MANUS_CONFIG__=${json};`;
}