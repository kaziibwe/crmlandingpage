"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SessionAdmin } from "@/lib/auth";

const NAV = [
  { href: "/eternitycrmadmin", label: "Dashboard", icon: "fas fa-tachometer-alt" },
  { href: "/eternitycrmadmin/users", label: "Registrations", icon: "fas fa-users" },
  { href: "/eternitycrmadmin/admins", label: "Administrators", icon: "fas fa-user-shield" },
  { href: "/eternitycrmadmin/profile", label: "My profile", icon: "fas fa-id-badge" },
];

export default function AdminShell({ admin, children }: { admin: SessionAdmin; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.replace("/eternitycrmadmin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500"
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg object-contain shadow-md" />
            <div className="leading-tight min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Eternity<span className="text-blue-600 dark:text-blue-400">CRM</span> Administration
              </p>
              <p className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Onboarding &amp; account management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{admin.name}</p>
              <p className="text-[10px] text-slate-400">{admin.role.replaceAll("_", " ")}</p>
            </div>
            <button onClick={logout} className="admin-btn-ghost !px-3 !py-2 text-xs">
              <i className="fas fa-right-from-bracket"></i> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className={`${open ? "block" : "hidden"} lg:block w-full lg:w-56 shrink-0`}>
          <nav className="lg:sticky lg:top-24 space-y-1.5">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/eternitycrmadmin" && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <i className={`${item.icon} w-4 text-center`}></i> {item.label}
                </a>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <a href="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                <i className="fas fa-arrow-left w-4 text-center"></i> Back to website
              </a>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
