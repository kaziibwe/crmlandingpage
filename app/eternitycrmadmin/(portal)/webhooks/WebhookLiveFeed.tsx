"use client";

import { useEffect, useRef, useState } from "react";

const MAX_LINES = 400;

export default function WebhookLiveFeed() {
  const [lines, setLines] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(
      `/api/webhooks/events/sse?client_ref=portal-${Date.now()}&events=message.received,message.status,message.reaction,message.read,message.postback,message.echo,template.status,user.preferences,webhook.test`
    );
    esRef.current = es;

    es.addEventListener("open", () => setConnected(true));
    es.addEventListener("error", () => {
      setConnected(false);
      // Reconnect is automatic by the browser; we do not hard-close here so
      // the EventSource keeps retrying. A manual close is possible via the
      // cleanup function below.
    });

    es.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data) as { t?: string; ts?: number; event?: string; channel?: string; status?: string; error?: string | null; requestId?: string; webhookId?: string };
        if (data.t === "heartbeat") return;

        const ts = data.ts != null ? new Date(data.ts).toLocaleTimeString() : new Date().toLocaleTimeString();
        const line = `[${ts}] ${data.event ?? "?"} ${data.channel ?? ""} — ${data.status ?? "?"} ${data.error ? `(${data.error})` : ""} ${data.requestId ? `id=${data.requestId}` : ""}`.trim();
        setLines((prev) => {
          const next = [...prev, line].slice(-MAX_LINES);
          return next;
        });
      } catch {
        // ignore malformed frames
      }
    });

    return () => {
      try {
        es.close();
      } finally {
        esRef.current = null;
        setConnected(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  const joined = lines.join("\n");

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950 text-slate-200 font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-700">
        <span className="text-[11px] uppercase tracking-wider text-slate-400">
          {connected ? "connected" : "connecting…"}
        </span>
        <span className="text-[11px] text-slate-400">{lines.length} events</span>
      </div>
      <pre
        ref={logRef as unknown as React.Ref<HTMLPreElement>}
        className="flex-1 overflow-auto p-3 whitespace-pre-wrap break-words"
      >
        {joined || <span className="text-slate-500">Waiting for deliveries…</span>}
      </pre>
    </div>
  );
}
