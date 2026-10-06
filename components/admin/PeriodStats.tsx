"use client";

import { useMemo, useState } from "react";

export interface PeriodStatsRow {
  /** ISO date (YYYY-MM-DD) of the tracked download event. */
  date: string;
  /** Unique valid numbers exported (what the user downloaded). */
  valid: number;
  /** Every number found in the uploaded document (valid + duplicates + rejected). */
  uploaded: number;
  rejected: number;
  duplicates: number;
  /** Numbers matched to registered CRM leads. */
  leadCount: number;
}

export interface PeriodTotals {
  uploads: number;
  uploaded: number;
  downloaded: number;
  rejected: number;
  duplicates: number;
  leads: number;
}

type PeriodKey = "week" | "month" | "year" | "custom";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "week", label: "Last week" },
  { key: "month", label: "Last month" },
  { key: "year", label: "Last year" },
  { key: "custom", label: "Custom" },
];

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function periodStart(key: PeriodKey, now: Date, customFrom: string): string {
  if (key === "custom") return customFrom || "0000-01-01";
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === "week") start.setDate(start.getDate() - 6);
  else if (key === "month") start.setMonth(start.getMonth() - 1);
  else if (key === "year") start.setFullYear(start.getFullYear() - 1);
  return isoDate(start);
}

function computeTotals(rows: PeriodStatsRow[], from: string, to: string): PeriodTotals {
  const inRange = rows.filter((r) => r.date >= from && r.date <= to);
  return {
    uploads: inRange.length,
    uploaded: inRange.reduce((a, r) => a + r.uploaded, 0),
    downloaded: inRange.reduce((a, r) => a + r.valid, 0),
    rejected: inRange.reduce((a, r) => a + r.rejected, 0),
    duplicates: inRange.reduce((a, r) => a + r.duplicates, 0),
    leads: inRange.reduce((a, r) => a + r.leadCount, 0),
  };
}

const inputCls =
  "h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200";

export default function PeriodStats({ rows }: { rows: PeriodStatsRow[] }) {
  const [period, setPeriod] = useState<PeriodKey>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const today = isoDate(new Date());
  const from = useMemo(() => periodStart(period, new Date(), customFrom), [period, customFrom]);
  const to = period === "custom" && customTo ? customTo : today;
  const totals = useMemo(() => computeTotals(rows, from, to), [rows, from, to]);

  // "Uploaded" counts every number found in the docs (valid + duplicates + rejected),
  // so it is always >= "Downloaded" (unique valid numbers exported).
  const cards: { label: string; value: number; hint: string; cls?: string }[] = [
    {
      label: "Total downloads",
      value: totals.downloaded,
      hint: "Unique valid numbers exported",
      cls: "text-slate-900 dark:text-white",
    },
    {
      label: "Total leads uploaded",
      value: totals.uploaded,
      hint: "Every number found in uploaded docs",
      cls: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total rejects",
      value: totals.rejected,
      hint: `${totals.duplicates} duplicates removed`,
    },
    {
      label: "Number of uploads",
      value: totals.uploads,
      hint: `${totals.leads} matched to registered leads`,
    },
  ];

  const rangeLabel =
    period === "custom" ? `${customFrom || "start"} → ${to}` : `${from} → ${to}`;

  return (
    <section className="admin-card p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Period</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-semibold transition ${
                  period === p.key
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customFrom}
                max={customTo || today}
                onChange={(e) => setCustomFrom(e.target.value)}
                aria-label="Start date"
                className={inputCls}
              />
              <span className="text-xs text-slate-400">→</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                max={today}
                onChange={(e) => setCustomTo(e.target.value)}
                aria-label="End date"
                className={inputCls}
              />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 -mt-2">{rangeLabel}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{c.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${c.cls ?? "text-slate-900 dark:text-white"}`}>{c.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{c.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
