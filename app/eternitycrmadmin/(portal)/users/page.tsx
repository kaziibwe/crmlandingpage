"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StatusBadge from "../_components/StatusBadge";
import { formatDateTime, formatDate } from "@/lib/datetime";

interface Row {
  _id: string;
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  registrationStatus: string;
  demoStatus: string;
  demoDate: string | null;
  setupStatus: string;
  assignedAdminEmail: string | null;
  createdAt: string;
}

interface AdminOption {
  email: string;
}

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [demo, setDemo] = useState("");
  const [setup, setSetup] = useState("");
  const [account, setAccount] = useState("");
  const [assigned, setAssigned] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [admins, setAdmins] = useState<AdminOption[]>([]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (demo) p.set("demo", demo);
    if (setup) p.set("setup", setup);
    if (account) p.set("account", account);
    if (assigned) p.set("assigned", assigned);
    p.set("sort", sort);
    p.set("dir", dir);
    p.set("page", String(page));
    p.set("limit", String(PAGE_SIZE));
    return p.toString();
  }, [q, status, demo, setup, account, assigned, sort, dir, page]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?${query}`);
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/eternitycrmadmin/login";
        return;
      }
      const data = await res.json();
      setRows(data.items ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch {
      setError("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    fetch("/api/admin/admins")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setAdmins(d.items ?? []))
      .catch(() => setAdmins([]));
  }, []);

  function resetFilters() {
    setQ("");
    setStatus("");
    setDemo("");
    setSetup("");
    setAccount("");
    setAssigned("");
    setSort("createdAt");
    setDir("desc");
    setPage(1);
  }

  function toggleSort(field: string) {
    if (sort === field) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setDir("asc");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Registrations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {loading ? "Loading…" : `${total} registered account${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <button onClick={resetFilters} className="admin-btn-ghost text-xs">
          <i className="fas fa-rotate-left"></i> Reset filters
        </button>
      </header>

      {/* Filters */}
      <section className="admin-card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2">
          <label className="admin-label">Search</label>
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Name, email, company…" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Account</label>
          <select value={account} onChange={(e) => { setAccount(e.target.value); setPage(1); }} className="admin-input">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Demo status</label>
          <select value={demo} onChange={(e) => { setDemo(e.target.value); setPage(1); }} className="admin-input">
            <option value="">All</option>
            <option value="NOT_SCHEDULED">Not scheduled</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="MISSED">Missed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Setup status</label>
          <select value={setup} onChange={(e) => { setSetup(e.target.value); setPage(1); }} className="admin-input">
            <option value="">All</option>
            <option value="NOT_STARTED">Not started</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Assigned admin</label>
          <select value={assigned} onChange={(e) => { setAssigned(e.target.value); setPage(1); }} className="admin-input">
            <option value="">All</option>
            {admins.map((a) => (
              <option key={a.email} value={a.email}>{a.email}</option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      {/* Desktop table */}
      <section className="admin-card hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold cursor-pointer" onClick={() => toggleSort("name")}>Name {sort === "name" ? (dir === "asc" ? "↑" : "↓") : ""}</th>
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 font-semibold">Country</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold cursor-pointer" onClick={() => toggleSort("createdAt")}>Registered {sort === "createdAt" ? (dir === "asc" ? "↑" : "↓") : ""}</th>
                <th className="px-5 py-3 font-semibold cursor-pointer" onClick={() => toggleSort("demoDate")}>Demo</th>
                <th className="px-5 py-3 font-semibold">Setup</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Assigned</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-100">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{u.company || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{u.country || "—"}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-600 dark:text-slate-300">{u.email}</p>
                    {u.phone && <p className="text-xs text-emerald-600 dark:text-emerald-400"><i className="fab fa-whatsapp mr-1"></i>{u.phone}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge value={u.demoStatus} />
                    {u.demoDate && u.demoStatus === "SCHEDULED" && (
                      <p className="text-[11px] text-blue-500 mt-1">{formatDateTime(u.demoDate)}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge value={u.setupStatus} /></td>
                  <td className="px-5 py-3.5"><StatusBadge value={u.registrationStatus} /></td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{u.assignedAdminEmail ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <a href={`/eternitycrmadmin/users/${u._id}`} className="admin-btn-ghost !px-3 !py-1.5 text-xs">Open</a>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-400">No registrations match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile cards */}
      <section className="md:hidden space-y-3">
        {rows.map((u) => (
          <div key={u._id} className="admin-card p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{u.name}</p>
                <p className="text-xs text-slate-400">{u.company || u.email}{u.country ? ` · ${u.country}` : ""}</p>
              </div>
              <StatusBadge value={u.registrationStatus} />
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={u.demoStatus} />
              <StatusBadge value={u.setupStatus} />
            </div>
            {u.demoDate && u.demoStatus === "SCHEDULED" && (
              <p className="text-xs text-blue-500">Demo: {formatDateTime(u.demoDate)}</p>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Registered {formatDate(u.createdAt)}</span>
              <a href={`/eternitycrmadmin/users/${u._id}`} className="admin-btn-ghost !px-3 !py-1.5 text-xs">Open</a>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && (
          <p className="admin-card p-8 text-center text-slate-400 text-sm">No registrations match these filters.</p>
        )}
      </section>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Page {page} of {Math.max(pages, 1)}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="admin-btn-ghost !px-3 !py-1.5 text-xs">Previous</button>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="admin-btn-ghost !px-3 !py-1.5 text-xs">Next</button>
        </div>
      </div>
    </div>
  );
}
