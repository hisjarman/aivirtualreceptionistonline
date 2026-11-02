export type RetellCallSummary = {
  call_id: string;
  agent_id?: string;
  agent_name?: string;
  call_status?: string;
  call_type?: string;
  direction?: string;
  from_number?: string;
  to_number?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  recording_url?: string;
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: string;
    call_successful?: boolean;
    in_voicemail?: boolean;
    custom_analysis_data?: Record<string, unknown>;
  };
  call_cost?: { combined_cost?: number; total_duration_seconds?: number };
};

export type RetellCallDetail = RetellCallSummary & {
  transcript?: string;
  transcript_object?: Array<{ role?: string; content?: string; words?: unknown[] }>;
  recording_multi_channel_url?: string;
  scrubbed_recording_url?: string;
  public_log_url?: string;
  disconnection_reason?: string;
  latency?: Record<string, unknown>;
};

const RETELL_BASE_URL = "https://api.retellai.com";

function getApiKey() {
  const key = process.env.RETELL_API_KEY;
  if (!key) throw new Error("Retell integration is not configured. Add RETELL_API_KEY to the server environment.");
  return key;
}

async function retellRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${RETELL_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 401) throw new Error("Retell rejected the API key. Check RETELL_API_KEY.");
    if (response.status === 429) throw new Error("Retell rate limit reached. Please retry shortly.");
    throw new Error(`Retell API request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

export async function listRetellCalls(args: {
  agentIds: string[];
  limit: number;
  paginationKey?: string;
}) {
  if (!args.agentIds.length) return { items: [] as RetellCallSummary[], pagination_key: undefined, total: 0 };
  return retellRequest<{
    items: RetellCallSummary[];
    pagination_key?: string;
    has_more?: boolean;
    total?: number;
  }>("/v3/list-calls", {
    method: "POST",
    body: JSON.stringify({
      filter_criteria: { agent: args.agentIds.map(agent_id => ({ agent_id })) },
      sort_order: "descending",
      limit: args.limit,
      pagination_key: args.paginationKey,
      include_total: false,
    }),
  });
}

export async function getRetellCallForAgents(callId: string, agentIds: string[]) {
  if (!agentIds.length) throw new Error("No Retell agent is assigned to this account.");
  // Verify tenant ownership with a Retell-side agent + call filter before fetching full details.
  const ownership = await retellRequest<{ items: RetellCallSummary[] }>("/v3/list-calls", {
    method: "POST",
    body: JSON.stringify({
      filter_criteria: {
        agent: agentIds.map(agent_id => ({ agent_id })),
        call_id: { type: "string", value: callId },
      },
      sort_order: "descending",
      limit: 1,
      include_total: false,
    }),
  });
  if (!ownership.items?.some(call => call.call_id === callId)) {
    throw new Error("Call not found for this customer account.");
  }
  return retellRequest<RetellCallDetail>(`/v2/get-call/${encodeURIComponent(callId)}`, { method: "GET" });
}
