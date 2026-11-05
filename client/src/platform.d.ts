export {};
declare global {
  interface Window {
    __PLATFORM_CONFIG__?: {
      projectId: string; oauthPortalUrl: string; apiUrl: string; apiBrowserKey: string;
    };
  }
}
