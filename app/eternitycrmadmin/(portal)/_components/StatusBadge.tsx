import type { ReactNode } from "react";

type Tone = string;

const TONES: Record<string, Tone> = {
  // demo
  NOT_SCHEDULED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  SCHEDULED: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
  COMPLETED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
  MISSED: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
  CANCELLED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  // attendance
  PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
  ATTENDED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
  NOT_ATTENDED: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
  // acceptance
  ACCEPTED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
  DECLINED: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
  // setup
  NOT_STARTED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  IN_PROGRESS: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
  // account
  ACTIVE: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
  INACTIVE: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  // admins
  SUPER_ADMIN: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
  ADMIN: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
  ONBOARDING_ADMIN: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-300",
  VIEWER: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const LABELS: Record<string, string> = {
  NOT_SCHEDULED: "Not scheduled",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  MISSED: "Missed",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
  ATTENDED: "Attended",
  NOT_ATTENDED: "Did not attend",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  ONBOARDING_ADMIN: "Onboarding admin",
  VIEWER: "Viewer",
};

export function statusTone(value: string): string {
  return TONES[value] ?? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
}

export function statusLabel(value: string): string {
  return LABELS[value] ?? value;
}

export default function StatusBadge({ value, children }: { value: string; children?: ReactNode }) {
  return (
    <span className={`admin-badge ${statusTone(value)}`} title={value}>
      {children ?? statusLabel(value)}
    </span>
  );
}
