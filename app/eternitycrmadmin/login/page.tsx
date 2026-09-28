"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.replace("/eternitycrmadmin");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-[#0b1120] py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="EternityCRM logo" className="w-12 h-12 rounded-xl object-contain shadow-md ring-1 ring-slate-900/5 dark:ring-white/10" />
          <div className="leading-tight">
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Eternity<span className="text-blue-600 dark:text-blue-400">CRM</span></p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Administration Portal</p>
          </div>
        </div>

        <div className="admin-card p-7 md:p-8">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Administrator sign in</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Authorized personnel only. All actions are audited.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin_email" className="admin-label">Email</label>
              <input
                id="admin_email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                placeholder="admin@eternitycrm.com"
              />
            </div>
            <div>
              <label htmlFor="admin_password" className="admin-label">Password</label>
              <input
                id="admin_password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="admin-btn-primary w-full">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">← Back to website</a>
        </p>
      </div>
    </main>
  );
}
