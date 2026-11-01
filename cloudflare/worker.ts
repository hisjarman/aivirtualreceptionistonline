import { Container } from "cloudflare:workers";

export class CallPilotContainer extends Container {
  defaultPort = 3000;
  sleepAfter = "10m";

  override onStart() {
    console.log("CallPilot container started");
  }

  override onStop() {
    console.log("CallPilot container stopped");
  }

  override onError(error: unknown) {
    console.error("CallPilot container error", error);
  }
}

type Env = {
  CALLPILOT_CONTAINER: DurableObjectNamespace<CallPilotContainer>;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = env.CALLPILOT_CONTAINER.getByName("callpilot-production");
    return container.fetch(request);
  },
};
