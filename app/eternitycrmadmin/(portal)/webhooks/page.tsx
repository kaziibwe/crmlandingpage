import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Webhook, toWebhookConfig } from "@/lib/models/Webhook";
import { getSessionAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import WebhookLiveFeed from "./WebhookLiveFeed";

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Manage Intelli Partner webhook subscriptions and monitor live deliveries.",
};

async function getWebhooks() {
  try {
    await connectDB();
    const docs = await Webhook.find({}).lean();
    return docs.map((d) => toWebhookConfig(d as Record<string, unknown>));
  } catch {
    return [];
  }
}

export default async function WebhooksPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/eternitycrmadmin/login");

  const webhooks = await getWebhooks();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Webhooks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Intelli Partner incoming deliveries — create subscriptions, copy the signing secret, and watch live events stream in.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="admin-badge bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
            <i className="fas fa-bolt text-[10px]"></i> Live alerts
          </span>
        </div>
      </header>

      {/* Secret + SSE status card */}
      <section className="admin-card p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Receiver status</h2>
        <div className="space-y-3 text-sm">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <dt className="text-slate-500">Receiver endpoint</dt>
              <dd className="font-mono text-slate-900 dark:text-white break-all">POST {BASE_URL}/api/webhooks/events</dd>
            </div>
            <div>
              <dt className="text-slate-500">Live alert feed (SSE)</dt>
              <dd className="font-mono text-slate-900 dark:text-white break-all">/api/webhooks/events/sse?client_ref=&amp;events=message.received,webhook.test</dd>
            </div>
            <div>
              <dt className="text-slate-500">WebSocket contract (future)</dt>
              <dd className="font-mono text-slate-500 dark:text-slate-400 break-all">GET /api/webhooks/events/ws?client_ref=&amp;events=...</dd>
            </div>
            <div>
              <dt className="text-slate-500">HMAC header</dt>
              <dd className="font-mono text-slate-900 dark:text-white">X-Intelli-Signature: sha256=&lt;hex&gt;</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              SSE listener ready — connect from the client component below.
            </div>
          </div>
        </div>
      </section>

      {/* Subscription table */}
      <section className="admin-card p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Subscriptions</h2>
        {webhooks.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No webhook subscriptions yet. Create one on the Webhooks API page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-3 py-2.5 font-semibold">Name</th>
                  <th className="px-3 py-2.5 font-semibold">Target URL</th>
                  <th className="px-3 py-2.5 font-semibold">Events</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Secret status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {webhooks.map((w) => (
                  <tr key={w.id} className="text-slate-700 dark:text-slate-200">
                    <td className="px-3 py-2.5 font-semibold truncate max-w-[180px]">{w.name}</td>
                    <td className="px-3 py-2.5 font-mono text-xs break-all">{w.targetUrl}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {w.events.map((e) => (
                          <span key={e} className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        w.status === "enabled" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300" :
                        w.status === "disabled" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" :
                        "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        w.secretStatus === "active" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300" :
                        w.secretStatus === "rotated" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {w.secretStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Live events feed */}
      <section className="admin-card p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Live deliveries</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Events arriving at the receiver are broadcast to connected SSE clients. The card below streams them in real time.
        </p>
        <div className="h-64 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 font-mono text-xs">            <WebhookLiveFeed />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Client-side SSE listener (rendered as a client component inside the server
// page — no special server support needed beyond the /events/sse route).
// ---------------------------------------------------------------------------

