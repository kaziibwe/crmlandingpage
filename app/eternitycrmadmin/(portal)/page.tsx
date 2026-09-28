import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/lib/models/Registration";
import { getSessionAdmin } from "@/lib/auth";
import StatusBadge, { statusTone } from "./_components/StatusBadge";

export const dynamic = "force-dynamic";

function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  await connectDB();
  const admin = await getSessionAdmin();

  const [total, pending, demoPending, demoScheduled, setupPending, active, inactive, setupCompleted] =
    await Promise.all([
      Registration.countDocuments({}),
      Registration.countDocuments({ registrationStatus: "PENDING" }),
      Registration.countDocuments({ demoStatus: { $in: ["NOT_SCHEDULED", "MISSED", "CANCELLED"] } }),
      Registration.countDocuments({ demoStatus: "SCHEDULED" }),
      Registration.countDocuments({ setupStatus: { $ne: "COMPLETED" } }),
      Registration.countDocuments({ registrationStatus: "ACTIVE" }),
      Registration.countDocuments({ registrationStatus: "INACTIVE" }),
      Registration.countDocuments({ setupStatus: "COMPLETED" }),
    ]);

  const now = new Date();
  const upcoming = await Registration.find({ demoStatus: "SCHEDULED", demoDate: { $gte: now } })
    .sort({ demoDate: 1 })
    .limit(6)
    .lean();
  const overdue = await Registration.find({ demoStatus: "SCHEDULED", demoDate: { $lt: now } })
    .sort({ demoDate: 1 })
    .limit(6)
    .lean();
  const recent = await Registration.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .select("name company email phone createdAt demoStatus setupStatus registrationStatus")
    .lean();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Administration &amp; onboarding overview{admin ? `, ${admin.name}` : ""}
        </p>
      </header>

      {/* Overview cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: "Registrations", value: total, icon: "fas fa-users", tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/60" },
          { label: "Demo pending", value: demoPending, icon: "fas fa-calendar-plus", tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/60" },
          { label: "Setup pending", value: setupPending, icon: "fas fa-gears", tone: "text-violet-600 bg-violet-50 dark:bg-violet-950/60" },
          { label: "Active accounts", value: active, icon: "fas fa-circle-check", tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60" },
        ].map((c) => (
          <div key={c.label} className="admin-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.label}</p>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.tone}`}><i className={`${c.icon} text-xs`}></i></span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{c.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: "New / pending", value: pending },
          { label: "Demos scheduled", value: demoScheduled },
          { label: "Setup completed", value: setupCompleted },
          { label: "Inactive accounts", value: inactive },
        ].map((c) => (
          <div key={c.label} className="admin-card px-4 py-3.5 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.value}</p>
          </div>
        ))}
      </section>

      {/* Upcoming demos */}
      <section className="admin-card">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Upcoming demos</h2>
          <a href="/eternitycrmadmin/users?demo=SCHEDULED" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View all</a>
        </div>
        {upcoming.length === 0 && overdue.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No scheduled demos. Schedule one from a registration page.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {overdue.map((u) => (
              <DemoRow key={String(u._id)} u={u} overdue />
            ))}
            {upcoming.map((u) => (
              <DemoRow key={String(u._id)} u={u} />
            ))}
          </div>
        )}
      </section>

      {/* Recent registrations */}
      <section className="admin-card">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent registrations</h2>
          <a href="/eternitycrmadmin/users" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Registered</th>
                <th className="px-5 py-3 font-semibold">Demo</th>
                <th className="px-5 py-3 font-semibold">Setup</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((u) => (
                <tr key={String(u._id)} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.company || u.email}</p>
                    {u.phone && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        <i className="fab fa-whatsapp mr-1"></i>{u.phone}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{fmtDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5"><StatusBadge value={u.demoStatus} /></td>
                  <td className="px-5 py-3.5"><StatusBadge value={u.setupStatus} /></td>
                  <td className="px-5 py-3.5"><StatusBadge value={u.registrationStatus} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <a href={`/eternitycrmadmin/users/${u._id}`} className="admin-btn-ghost !px-3 !py-1.5 text-xs">View</a>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No registrations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DemoRow({ u, overdue = false }: { u: Record<string, unknown>; overdue?: boolean }) {
  const name = String(u.name ?? "");
  const company = String(u.company ?? "");
  const demoDate = u.demoDate ? new Date(String(u.demoDate)) : null;
  const assigned = u.assignedAdminEmail ? String(u.assignedAdminEmail) : "Unassigned";
  return (
    <div className={`px-5 py-4 flex flex-wrap items-center gap-3 ${overdue ? "bg-rose-50/50 dark:bg-rose-950/20" : ""}`}>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${overdue ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300" : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"}`}>
        <i className={`fas ${overdue ? "fa-triangle-exclamation" : "fa-calendar-check"} text-xs`}></i>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {company || name} <span className="font-normal text-slate-400">· {name}</span>
        </p>
        <p className="text-xs text-slate-400">
          {overdue ? "Overdue — " : ""}{fmtDate(demoDate)} · {assigned}
        </p>
      </div>
      <span className={`admin-badge ${overdue ? statusTone("MISSED") : statusTone("SCHEDULED")}`}>
        {overdue ? "Overdue" : "Upcoming demo"}
      </span>
      <a href={`/eternitycrmadmin/users/${u._id}`} className="admin-btn-ghost !px-3 !py-1.5 text-xs">View</a>
    </div>
  );
}
