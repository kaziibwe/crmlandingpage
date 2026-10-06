import { Metadata } from "next";
import { getSessionAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { ToolUsage } from "@/lib/models/ToolUsage";
import PeriodStats, { type PeriodStatsRow } from "@/components/admin/PeriodStats";

export const metadata: Metadata = {
  title: "Tool analytics",
  description: "Downloads, leads and rejects for the Document Number Extractor.",
};

interface UsageRow {
  date: string;
  /** Unique valid numbers exported (downloaded). */
  valid: number;
  /** Every number found in the uploaded doc: valid + duplicates + rejected. */
  uploaded: number;
  rejected: number;
  duplicates: number;
  leadCount: number;
}

interface UsageSummary {
  rows: UsageRow[];
  byStatus: Record<string, number>;
}

const EMPTY_SUMMARY: UsageSummary = {
  rows: [],
  byStatus: {},
};

async function getUsageSummary(): Promise<UsageSummary> {
  try {
    await connectDB();
    const docs = await ToolUsage.find({ toolId: "document-number-extractor" })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const rows: UsageRow[] = docs.map((r) => {
      const valid = r.validCount ?? 0;
      const rejected = r.rejectedCount ?? 0;
      const duplicates = r.duplicateCount ?? 0;
      return {
        date: r.createdAt instanceof Date ? r.createdAt.toISOString().slice(0, 10) : "unknown",
        valid,
        // Uploaded is the full token count so it is always >= downloaded (valid).
        uploaded: valid + rejected + duplicates,
        rejected,
        duplicates,
        leadCount: r.leadCount ?? 0,
      };
    });

    const byStatus: Record<string, number> = {};
    for (const r of docs) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }

    return { rows, byStatus };
  } catch {
    // DB unavailable — render the page with zeros instead of crashing.
    return EMPTY_SUMMARY;
  }
}

export default async function UsagePage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/eternitycrmadmin/login");

  const { rows, byStatus } = await getUsageSummary();

  // Newest first for the table; oldest first for the time chart.
  const chartData = [...rows].reverse();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tool analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Downloads, leads and rejects for the Document Number Extractor, across the website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="admin-badge bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
            <i className="fas fa-chart-line text-[10px]"></i> Analytics
          </span>
        </div>
      </header>

      <PeriodStats rows={rows as PeriodStatsRow[]} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="admin-card p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Numbers over time</h2>
          <div className="flex flex-wrap items-end gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Valid (leads)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Rejected</span>
            </div>
          </div>
          <div className="mt-2 h-48">
            {chartData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No downloads recorded yet.</p>
            ) : (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.06"
                    strokeWidth="0.5"
                  />
                ))}
                {(() => {
                  const max = Math.max(...chartData.map((d) => Math.max(d.valid, d.rejected)), 1) || 1;
                  const pts = chartData.map((d, i) => {
                    const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                    const y = 100 - (d.valid / max) * 80 - 10;
                    return `${x.toFixed(2)},${y.toFixed(2)}`;
                  }).join(" ");
                  const ptsR = chartData.map((d, i) => {
                    const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                    const y = 100 - (d.rejected / max) * 80 - 10;
                    return `${x.toFixed(2)},${y.toFixed(2)}`;
                  }).join(" ");
                  return (
                    <>
                      <polygon points={`0,100 ${pts} 100,100`} fill="url(#lineGrad)" />
                      <polyline
                        points={pts}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points={ptsR}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
              </svg>
            )}
          </div>
        </section>

        <section className="admin-card p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Status breakdown</h2>
          <div className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => {
              if (typeof count !== "number") return null;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-slate-500 truncate">{status}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max((count / Math.max(Object.values(byStatus).reduce((a, b) => a + b, 0), 1)), 2)}%`,
                        backgroundColor:
                          status === "ready" ? "#10b981" :
                          status === "done" ? "#6366f1" :
                          status === "error" ? "#ef4444" :
                          status === "uploading" ? "#f59e0b" : "#94a3b8",
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-8">{count}</span>
                </div>
              );
            })}
            {Object.values(byStatus).length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
          </div>
        </section>
      </div>

      <section className="admin-card p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent uploads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold text-right">Uploaded</th>
                <th className="px-3 py-2.5 font-semibold text-right">Valid (leads)</th>
                <th className="px-3 py-2.5 font-semibold text-right">Rejected</th>
                <th className="px-3 py-2.5 font-semibold text-right">Duplicates</th>
                <th className="px-3 py-2.5 font-semibold text-right">Downloaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.slice(0, 15).map((d, i) => (
                <tr key={`${d.date}-${i}`}>
                  <td className="px-3 py-2.5 text-slate-500">{d.date}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-700 dark:text-slate-200">{d.uploaded}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-emerald-600">{d.valid}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-rose-600">{d.rejected}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-amber-600">{d.duplicates}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-blue-600">{d.valid}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-sm text-slate-400 text-center">No uploads recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
