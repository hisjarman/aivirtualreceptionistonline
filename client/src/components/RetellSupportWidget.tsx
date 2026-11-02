import { useEffect, useState } from "react";
import { Bot, MessageCircle, ShieldCheck } from "lucide-react";

type PublicConfig = {
  retellSupportPublicKey?: string;
  retellSupportChatAgentId?: string;
  retellSupportAgentVersion?: string;
};

declare global {
  interface Window { __MANUS_CONFIG__?: PublicConfig }
}

/**
 * Customer-facing Retell chat widget. This intentionally uses a Retell Public Key
 * restricted to the production dashboard domain. Never pass a private API key here.
 */
export default function RetellSupportWidget() {
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    setConfig(window.__MANUS_CONFIG__ ?? {});
  }, []);

  useEffect(() => {
    if (!config?.retellSupportPublicKey || !config.retellSupportChatAgentId) return;
    const existing = document.getElementById("retell-widget");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "retell-widget";
    script.src = "https://dashboard.retellai.com/retell-widget-v2.js";
    script.type = "module";
    script.setAttribute("data-public-key", config.retellSupportPublicKey);
    script.setAttribute("data-agent-id", config.retellSupportChatAgentId);
    if (config.retellSupportAgentVersion) {
      script.setAttribute("data-agent-version", config.retellSupportAgentVersion);
    }
    script.setAttribute("data-title", "Customer support");
    script.setAttribute("data-bot-name", "AI Support Assistant");
    script.setAttribute("data-fab-text", "Ask for help");
    script.setAttribute("data-popup-message", "Questions about setup, calls, or integrations? I can help.");
    script.setAttribute("data-show-ai-popup", "false");
    script.setAttribute("data-color", "#147D78");
    document.body.appendChild(script);
    return () => { script.remove(); };
  }, [config]);

  const isConfigured = Boolean(config?.retellSupportPublicKey && config?.retellSupportChatAgentId);

  return (
    <section className="workspace-card mt-6" aria-label="AI customer support assistant">
      <div className="workspace-card-top">
        <span className="mono-small">CUSTOMER HELP</span>
        <span className={`status-pill ${isConfigured ? "status-teal" : "status-slate"}`}>
          <span className="status-dot" />{isConfigured ? "Assistant enabled" : "Setup required"}
        </span>
      </div>
      <div className="flex items-start gap-4 py-2">
        <div className="rounded-xl bg-teal/10 p-3 text-teal"><Bot size={22} /></div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-ink">Your AI Customer Success Assistant</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Ask how to use your receptionist, understand call handling, calendar and CRM connections,
            notifications, billing, or request a change. Changes to your live receptionist are reviewed by our team first.
          </p>
          {isConfigured ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-teal"><MessageCircle size={15} /> Use the “Ask for help” chat button on this page.</p>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><ShieldCheck size={15} /> The chat assistant will appear here once the Retell support agent and domain-restricted public key are configured.</p>
          )}
        </div>
      </div>
    </section>
  );
}