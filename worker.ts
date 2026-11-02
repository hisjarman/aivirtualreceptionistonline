/// <reference path="./worker-configuration.d.ts" />

import { Container } from "@cloudflare/containers";

type Env = {
  CALLPILOT_CONTAINER: DurableObjectNamespace<CallPilotContainer>;
  DATABASE_URL: string;
  MANUS_PROJECT_ID: string;
  MANUS_JWT_SECRET: string;
  MANUS_OAUTH_API_URL: string;
  MANUS_OAUTH_PORTAL_URL: string;
  MANUS_API_URL: string;
  MANUS_API_KEY: string;
  MANUS_API_BROWSER_KEY: string;
  OWNER_OPEN_ID: string;
  RETELL_API_KEY?: string;
  FIREBASE_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_AUTH_DOMAIN?: string;
  PAYMENT_PROVIDER_SECRET?: string;
  PAYMENT_WEBHOOK_SECRET?: string;
  EMAIL_PROVIDER_API_KEY?: string;
};

export class CallPilotContainer extends Container {
  defaultPort = 3000;
  sleepAfter = "10m";

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Worker secrets are not automatically visible inside the Linux container.
    // Explicitly forward only the server runtime values required by this app.
    this.envVars = {
      NODE_ENV: "production",
      DATABASE_URL: env.DATABASE_URL,
      MANUS_PROJECT_ID: env.MANUS_PROJECT_ID,
      MANUS_JWT_SECRET: env.MANUS_JWT_SECRET,
      MANUS_OAUTH_API_URL: env.MANUS_OAUTH_API_URL,
      MANUS_OAUTH_PORTAL_URL: env.MANUS_OAUTH_PORTAL_URL,
      MANUS_API_URL: env.MANUS_API_URL,
      MANUS_API_KEY: env.MANUS_API_KEY,
      MANUS_API_BROWSER_KEY: env.MANUS_API_BROWSER_KEY,
      OWNER_OPEN_ID: env.OWNER_OPEN_ID,
      RETELL_API_KEY: env.RETELL_API_KEY ?? "",
      FIREBASE_API_KEY: env.FIREBASE_API_KEY,
      FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
      FIREBASE_AUTH_DOMAIN: env.FIREBASE_AUTH_DOMAIN ?? "",
      PAYMENT_PROVIDER_SECRET: env.PAYMENT_PROVIDER_SECRET ?? "",
      PAYMENT_WEBHOOK_SECRET: env.PAYMENT_WEBHOOK_SECRET ?? "",
      EMAIL_PROVIDER_API_KEY: env.EMAIL_PROVIDER_API_KEY ?? "",
    };
  }

  override onStart() {
    console.log("AI Virtual Receptionist container started");
  }

  override onStop() {
    console.log("AI Virtual Receptionist container stopped");
  }

  override onError(error: unknown) {
    console.error("AI Virtual Receptionist container error", error);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = env.CALLPILOT_CONTAINER.getByName(
      "aivirtualreceptionist-production"
    );
    return container.fetch(request);
  },
};
