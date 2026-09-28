"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusBadge from "../../_components/StatusBadge";

interface User {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  companySize: string;
  message: string;
  registrationStatus: string;
  demoStatus: string;
  demoDate: string | null;
  demoAttendance: string;
  demoNotes: string;
  demoUpdatedBy: string | null;
  setupUpdatedBy: string | null;
  acceptanceStatus: string;
  setupStatus: string;
  setupStartedAt: string | null;
  setupCompletedAt: string | null;
  activatedAt: string | null;
  activatedBy: string | null;
  deactivatedAt: string | null;
  deactivatedBy: string | null;
  assignedAdminEmail: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
}

interface Note {
  _id: string;
  body: string;
  createdBy: string;
  createdAt: string;
}

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocal(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // action state
  const [demoDateInput, setDemoDateInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  // notes state
  const [noteText, setNoteText] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/eternitycrmadmin/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load.");
        return;
      }
      setUser(data.user);
      setForm({
        name: data.user.name ?? "",
        company: data.user.company ?? "",
        email: data.user.email ?? "",
        phone: data.user.phone ?? "",
      });
      setDemoDateInput(toDatetimeLocal(data.user.demoDate));
    } catch {
      setError("Failed to load registration.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(url: string, body: unknown, okMsg: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(url, {
        method: "POST",
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
    } finally {
      setBusy(false);
    }
  }

  async function saveEdits() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }
      setNotice("Registration details saved.");
      setEditMode(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function addNote() {
    const text = noteText.trim();
    if (!text || noteBusy) return;
    setNoteBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to add note.");
        return;
      }
      setNoteText("");
      setNotice("Note added.");
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setNoteBusy(false);
    }
  }

  async function deleteNote(noteId: string) {
    if (noteBusy) return;
    setNoteBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/notes?noteId=${noteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to delete note.");
        return;
      }
      setNotice("Note removed.");
      await load();
    } catch {
      setError("Network error.");
    } finally {
      setNoteBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading registration…</p>;
  }

  if (error && !user) {
    return (
      <div className="admin-card p-8 text-center">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        <button onClick={() => router.back()} className="admin-btn-ghost mt-4 text-xs">Go back</button>
      </div>
    );
  }

  if (!user) return null;

  const STEPS = [
    { label: "Registered", done: true, current: false },
    { label: "Demo", done: user.demoStatus === "COMPLETED", current: user.demoStatus === "SCHEDULED" },
    { label: "Accepted", done: user.acceptanceStatus === "ACCEPTED", current: false },
    { label: "Setup", done: user.setupStatus === "COMPLETED", current: user.setupStatus === "IN_PROGRESS" },
    { label: "Active", done: user.registrationStatus === "ACTIVE", current: false },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <a href="/eternitycrmadmin/users" className="text-xs font-semibold text-slate-400 hover:text-blue-600">← All registrations</a>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{user.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.company || "—"} · {user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={user.registrationStatus} />
          <StatusBadge value={user.demoStatus} />
          <StatusBadge value={user.setupStatus} />
        </div>
      </header>

      {/* Onboarding progress stepper */}
      <section className="admin-card p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Onboarding progress</h2>
        <ol className="flex flex-wrap items-center gap-y-3">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex items-center">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${s.done ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300" : s.current ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                <i className={`fas ${s.done ? "fa-check" : s.current ? "fa-arrow-right" : "fa-circle text-[6px]"}`}></i>
                {s.label}{s.current ? " (current)" : ""}
              </span>
              {i < STEPS.length - 1 && <span className="mx-2 h-px w-5 bg-slate-200 dark:bg-slate-700"></span>}
            </li>
          ))}
        </ol>
      </section>

      {notice && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3.5 py-2.5">{notice}</p>
      )}
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Account information */}
        <section className="admin-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Account information</h2>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="admin-btn-ghost !px-3 !py-1.5 text-xs"><i className="fas fa-pen"></i> Edit</button>
            )}
          </div>
          {editMode ? (
            <div className="space-y-3">
              <div><label className="admin-label">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" /></div>
              <div><label className="admin-label">Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="admin-input" /></div>
              <div><label className="admin-label">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="admin-input" /></div>
              <div><label className="admin-label">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="admin-input" /></div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdits} disabled={busy} className="admin-btn-primary text-xs">Save changes</button>
                <button onClick={() => setEditMode(false)} className="admin-btn-ghost text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
              <dt className="text-slate-400">Name</dt><dd className="text-slate-800 dark:text-slate-100 font-medium">{user.name}</dd>
              <dt className="text-slate-400">Company</dt><dd className="text-slate-800 dark:text-slate-100">{user.company || "—"}</dd>
              <dt className="text-slate-400">Email</dt><dd className="text-slate-800 dark:text-slate-100">{user.email}</dd>
              <dt className="text-slate-400">WhatsApp</dt>
              <dd className="text-slate-800 dark:text-slate-100">
                {user.phone ? (
                  <>
                    <i className="fab fa-whatsapp text-emerald-500 mr-1.5"></i>{user.phone}
                    <a
                      href={`https://wa.me/${user.phone.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Open chat
                    </a>
                  </>
                ) : (
                  "—"
                )}
              </dd>
              <dt className="text-slate-400">Team size</dt><dd className="text-slate-800 dark:text-slate-100">{user.companySize || "—"}</dd>
              <dt className="text-slate-400">Registered</dt><dd className="text-slate-800 dark:text-slate-100">{fmt(user.createdAt)}</dd>
              <dt className="text-slate-400">Wants to see</dt><dd className="text-slate-600 dark:text-slate-300">{user.message || "—"}</dd>
            </dl>
          )}
        </section>

        {/* Demo */}
        <section className="admin-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Demo</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="admin-label">Status</p><StatusBadge value={user.demoStatus} /></div>
            <div><p className="admin-label">Attendance</p><StatusBadge value={user.demoAttendance} /></div>
            <div><p className="admin-label">Demo date</p><p className="text-slate-800 dark:text-slate-100 font-medium">{fmt(user.demoDate)}</p></div>
            <div><p className="admin-label">Last update by</p><p className="text-slate-800 dark:text-slate-100">{user.demoUpdatedBy ?? "—"}</p></div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <label className="admin-label">Schedule / reschedule demo date</label>
            <input type="datetime-local" value={demoDateInput} onChange={(e) => setDemoDateInput(e.target.value)} className="admin-input" />
            <div className="flex flex-wrap gap-2">
              <button
                disabled={busy || !demoDateInput}
                onClick={() => act(`/api/admin/users/${id}/demo`, { action: "schedule", date: new Date(demoDateInput).toISOString() }, "Demo scheduled.")}
                className="admin-btn-primary text-xs"
              >
                <i className="fas fa-calendar-plus"></i> {user.demoStatus === "SCHEDULED" ? "Reschedule demo" : "Schedule demo"}
              </button>
              <button
                disabled={busy}
                onClick={() => act(`/api/admin/users/${id}/demo`, { action: "status", status: "COMPLETED" }, "Demo marked completed.")}
                className="admin-btn-ghost text-xs"
              >
                Mark completed
              </button>
              <button
                disabled={busy}
                onClick={() => act(`/api/admin/users/${id}/demo`, { action: "status", status: "MISSED" }, "Demo marked missed.")}
                className="admin-btn-ghost text-xs"
              >
                Mark missed
              </button>
              <button
                disabled={busy}
                onClick={() => act(`/api/admin/users/${id}/demo`, { action: "attendance", value: "ATTENDED" }, "Attendance recorded.")}
                className="admin-btn-ghost text-xs"
              >
                Attended
              </button>
              <button
                disabled={busy}
                onClick={() => act(`/api/admin/users/${id}/demo`, { action: "attendance", value: "NOT_ATTENDED" }, "Attendance recorded.")}
                className="admin-btn-ghost text-xs"
              >
                Did not attend
              </button>
            </div>
          </div>
        </section>

        {/* Customer decision */}
        <section className="admin-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Customer decision</h2>
          <div className="flex items-center gap-3">
            <StatusBadge value={user.acceptanceStatus} />
            <span className="text-xs text-slate-400">Updated by {user.demoUpdatedBy ?? "—"}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy || user.acceptanceStatus === "ACCEPTED"}
              onClick={() => act(`/api/admin/users/${id}/demo`, { action: "acceptance", value: "ACCEPTED" }, "Customer accepted — setup can begin.")}
              className="admin-btn-primary text-xs"
            >
              <i className="fas fa-check"></i> Mark accepted
            </button>
            <button
              disabled={busy || user.acceptanceStatus === "DECLINED"}
              onClick={() => act(`/api/admin/users/${id}/demo`, { action: "acceptance", value: "DECLINED" }, "Customer declined.")}
              className="admin-btn-ghost text-xs"
            >
              Mark declined
            </button>
            <button
              disabled={busy || user.acceptanceStatus === "PENDING"}
              onClick={() => act(`/api/admin/users/${id}/demo`, { action: "acceptance", value: "PENDING" }, "Decision set back to pending.")}
              className="admin-btn-ghost text-xs"
            >
              Reset to pending
            </button>
          </div>
        </section>

        {/* Setup */}
        <section className="admin-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Setup</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="admin-label">Status</p><StatusBadge value={user.setupStatus} /></div>
            <div><p className="admin-label">Started</p><p className="text-slate-800 dark:text-slate-100">{fmt(user.setupStartedAt)}</p></div>
            <div><p className="admin-label">Completed</p><p className="text-slate-800 dark:text-slate-100">{fmt(user.setupCompletedAt)}</p></div>
            <div><p className="admin-label">Updated by</p><p className="text-slate-800 dark:text-slate-100">{user.setupUpdatedBy ?? "—"}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy || user.setupStatus === "COMPLETED"}
              onClick={() => act(`/api/admin/users/${id}/setup`, { action: "start" }, "Setup started.")}
              className="admin-btn-primary text-xs"
            >
              <i className="fas fa-play"></i> Start setup
            </button>
            <button
              disabled={busy || user.setupStatus !== "IN_PROGRESS"}
              onClick={() => act(`/api/admin/users/${id}/setup`, { action: "complete" }, "Setup completed.")}
              className="admin-btn-primary text-xs"
            >
              <i className="fas fa-flag-checkered"></i> Complete setup
            </button>
          </div>
        </section>

        {/* Activation */}
        <section className="admin-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Activation</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="admin-label">Status</p><StatusBadge value={user.registrationStatus} /></div>
            <div><p className="admin-label">Activated</p><p className="text-slate-800 dark:text-slate-100">{fmt(user.activatedAt)}</p></div>
            <div><p className="admin-label">Activated by</p><p className="text-slate-800 dark:text-slate-100">{user.activatedBy ?? "—"}</p></div>
            <div><p className="admin-label">Deactivated by</p><p className="text-slate-800 dark:text-slate-100">{user.deactivatedBy ?? "—"}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy || user.registrationStatus === "ACTIVE"}
              onClick={() => act(`/api/admin/users/${id}/activate`, null, "Account activated.")}
              className="admin-btn-primary text-xs"
            >
              <i className="fas fa-power-off"></i> Activate account
            </button>
            <button
              disabled={busy || user.registrationStatus !== "ACTIVE"}
              onClick={() => setConfirmDeactivate(true)}
              className="admin-btn-danger text-xs"
            >
              <i className="fas fa-user-slash"></i> Deactivate account
            </button>
          </div>
        </section>

        {/* Administrative information */}
        <section className="admin-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Administrative information</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
            <dt className="text-slate-400">Assigned admin</dt><dd className="text-slate-800 dark:text-slate-100">{user.assignedAdminEmail ?? "Unassigned"}</dd>
            <dt className="text-slate-400">Created</dt><dd className="text-slate-800 dark:text-slate-100">{fmt(user.createdAt)}</dd>
            <dt className="text-slate-400">Updated</dt><dd className="text-slate-800 dark:text-slate-100">{fmt(user.updatedAt)}</dd>
          </dl>
        </section>

        {/* Notes */}
        <section className="admin-card p-5 space-y-4 lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            <i className="fas fa-sticky-note text-amber-400 mr-2"></i>Notes
            <span className="ml-2 text-xs font-normal text-slate-400">internal only — visible to administrators</span>
          </h2>

          {/* Add note */}
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              maxLength={4000}
              placeholder="Add an internal note about this account… (calls, agreements, follow-ups)"
              className="admin-input resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{noteText.length}/4000</span>
              <button onClick={addNote} disabled={noteBusy || !noteText.trim()} className="admin-btn-primary text-xs">
                <i className="fas fa-plus"></i> Add note
              </button>
            </div>
          </div>

          {/* Notes list */}
          {user.notes?.length ? (
            <ul className="space-y-3">
              {[...user.notes]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((n) => (
                  <li key={n._id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words flex-1">{n.body}</p>
                      <button
                        onClick={() => deleteNote(n._id)}
                        disabled={noteBusy}
                        title="Delete note"
                        aria-label="Delete note"
                        className="text-slate-300 hover:text-rose-500 transition shrink-0"
                      >
                        <i className="fas fa-trash-can text-xs"></i>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      {n.createdBy} · {fmt(n.createdAt)}
                    </p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No notes yet.</p>
          )}
        </section>
      </div>

      {/* Deactivate confirmation dialog */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4" role="dialog" aria-modal="true">
          <div className="admin-card p-6 max-w-sm w-full">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 flex items-center justify-center"><i className="fas fa-triangle-exclamation"></i></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deactivate this account?</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              {user.name} ({user.company || user.email}) will lose access. You can re-activate the account later.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirmDeactivate(false)} className="admin-btn-ghost text-xs">Cancel</button>
              <button
                onClick={async () => {
                  setConfirmDeactivate(false);
                  await act(`/api/admin/users/${id}/deactivate`, null, "Account deactivated.");
                }}
                disabled={busy}
                className="admin-btn-danger text-xs"
              >
                Yes, deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
