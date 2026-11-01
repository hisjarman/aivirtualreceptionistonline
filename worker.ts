/// <reference path="./worker-configuration.d.ts" />

import { Container } from "cloudflare:workers";

export class CallPilotContainer extends Container {
  defaultPort = 3000;
  sleepAfter = "10m";

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

type Env = {
  CALLPILOT_CONTAINER: DurableObjectNamespace<CallPilotContainer>;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = env.CALLPILOT_CONTAINER.getByName("aivirtualreceptionist-production");
    return container.fetch(request);
  },
};
