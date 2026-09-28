"use client";

import { useCallback, useEffect, useState } from "react";
import StatusBadge from "../_components/StatusBadge";

interface AdminRow {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdBy: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

const ALL_PERMISSIONS = [
  "VIEW_USERS",
  "EDIT_USERS",
  "MANAGE_DEMOS",
  "MANAGE_SETUP",
  "ACTIVATE_USERS",
  "DEACTIVATE_USERS",
  "MANAGE_ADMINS",
  "MANAGE_PERMISSIONS",
];

const ROLES = ["SUPER_ADMIN", "ADMIN", "ONBOARDING_ADMIN", "VIEWER"];

export default function AdminsPage() {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [viewer, setViewer] = useState<{ id: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [create, setCreate] = useState({ name: "", email: "", password: "", role: "VIEWER" });

  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmToggle, setConfirmToggle] = useState<AdminRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      if (res.status === 401 || res.status === 403) {
        setError("You need the MANAGE_ADMINS permission to view this page.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRows(data.items ?? []);
      setViewer(data.viewer ?? null);
    } catch {
      setError("Failed to load administrators.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function post(url: string, method: string, body: unknown, okMsg: string) {
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Action failed.");
        return false;
      }
      setNotice(okMsg);
      await load();
      return true;
    } catch {
      setError("Network error.");
      return false;
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading administrators…</p>;

  if (error && rows.length === 0 && !viewer) {
    return (
      <div className="admin-card p-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Administrators</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Portal administrators — separate from registered customers.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="admin-btn-primary text-xs">
          <i className="fas fa-user-plus"></i> Add administrator
        </button>
      </header>

      {notice && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3.5 py-2.5">{notice}</p>
      )}
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <section className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Administrator</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Permissions</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Last login</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.email}</p>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge value={a.role} /></td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{a.permissions.length ? a.permissions.join(", ").replaceAll("_", " ") : "Role defaults"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`admin-badge ${a.isActive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditing(a); setEditPerms(a.permissions); setNewPassword(""); }}
                        className="admin-btn-ghost !px-3 !py-1.5 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmToggle(a)}
                        disabled={viewer?.id === a.id}
                        className={`text-xs ${a.isActive ? "admin-btn-danger" : "admin-btn-ghost"} !px-3 !py-1.5`}
                      >
                        {a.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create drawer */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4" role="dialog" aria-modal="true">
          <div className="admin-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add administrator</h3>
            <div className="space-y-3 mt-4">
              <div><label className="admin-label">Name</label><input value={create.name} onChange={(e) => setCreate({ ...create, name: e.target.value })} className="admin-input" /></div>
              <div><label className="admin-label">Email</label><input type="email" value={create.email} onChange={(e) => setCreate({ ...create, email: e.target.value })} className="admin-input" /></div>
              <div><label className="admin-label">Temporary password (min 8 chars)</label><input type="text" value={create.password} onChange={(e) => setCreate({ ...create, password: e.target.value })} className="admin-input" /></div>
              <div>
                <label className="admin-label">Role</label>
                <select value={create.role} onChange={(e) => setCreate({ ...create, role: e.target.value })} className="admin-input">
                  {ROLES.map((r) => <option key={r} value={r}>{r.replaceAll("_", " ")}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowCreate(false)} className="admin-btn-ghost text-xs">Cancel</button>
              <button
                onClick={async () => {
                  const ok = await post("/api/admin/admins", "POST", create, "Administrator created.");
                  if (ok) {
                    setShowCreate(false);
                    setCreate({ name: "", email: "", password: "", role: "VIEWER" });
                  }
                }}
                className="admin-btn-primary text-xs"
              >
                Create administrator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4" role="dialog" aria-modal="true">
          <div className="admin-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit {editing.name}</h3>
            <p className="text-xs text-slate-400">{editing.email}</p>
            <div className="space-y-4 mt-4">
              <div>
                <label className="admin-label">Permissions (on top of role defaults)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={editPerms.includes(p)}
                        onChange={(e) =>
                          setEditPerms(e.target.checked ? [...editPerms, p] : editPerms.filter((x) => x !== p))
                        }
                      />
                      {p.replaceAll("_", " ")}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="admin-label">Reset password (optional, min 8 chars)</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="admin-input" placeholder="Leave blank to keep current" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="admin-btn-ghost text-xs">Cancel</button>
              <button
                onClick={async () => {
                  const body: Record<string, unknown> = { permissions: editPerms };
                  if (newPassword) body.password = newPassword;
                  const ok = await post(`/api/admin/admins/${editing.id}`, "PATCH", body, "Administrator updated.");
                  if (ok) setEditing(null);
                }}
                className="admin-btn-primary text-xs"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate/activate confirmation */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4" role="dialog" aria-modal="true">
          <div className="admin-card p-6 max-w-sm w-full">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 flex items-center justify-center"><i className="fas fa-triangle-exclamation"></i></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {confirmToggle.isActive ? "Deactivate administrator?" : "Activate administrator?"}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              {confirmToggle.isActive
                ? `${confirmToggle.name} will no longer be able to sign in to the portal.`
                : `${confirmToggle.name} will regain portal access with their current role.`}
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirmToggle(null)} className="admin-btn-ghost text-xs">Cancel</button>
              <button
                onClick={async () => {
                  const target = confirmToggle;
                  setConfirmToggle(null);
                  await post(`/api/admin/admins/${target.id}`, "PATCH", { isActive: !target.isActive }, "Administrator updated.");
                }}
                className={`${confirmToggle.isActive ? "admin-btn-danger" : "admin-btn-primary"} text-xs`}
              >
                Yes, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
