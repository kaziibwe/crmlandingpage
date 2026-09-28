"use client";

import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const navRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  // null = pre-hydration (SSR markup uses CSS to show the right icon);
  // once mounted, React renders exactly one icon based on real state.
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const close = () => setOpen(false);
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    return () => {
      menu.querySelectorAll("a").forEach((a) => a.removeEventListener("click", close));
    };
  }, []);

  const toggleDark = () => {
    const next = !(dark ?? document.documentElement.classList.contains("dark"));
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ecrm-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  return (
    <nav id="siteNav" ref={navRef} className="fixed top-0 inset-x-0 z-50 border-b border-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          <a href="#top" className="flex items-center gap-3">
            <img src="/logo.png" alt="EternityCRM logo" className="w-10 h-10 rounded-xl object-contain shadow-md ring-1 ring-slate-900/5 dark:ring-white/10" />
            <span className="leading-tight">
              <span className="block text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Eternity<span className="text-blue-600 dark:text-blue-400">CRM</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Believe in endless connections
              </span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <a href="#platform" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Platform</a>
            <a href="#channels" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Channels</a>
            <a href="#ai" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">AI</a>
            <a href="#pipeline" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Sales</a>
            <a href="#security" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Security</a>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {dark === null ? (
                <>
                  <i className="fas fa-moon dark:hidden text-sm"></i>
                  <i className="fas fa-sun hidden dark:inline text-sm"></i>
                </>
              ) : dark ? (
                <i className="fas fa-sun text-sm"></i>
              ) : (
                <i className="fas fa-moon text-sm"></i>
              )}
            </button>
            <a href="https://crm.eternitycrm.com/login" className="hidden sm:inline-flex text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 transition">
              Sign in
            </a>
            <a href="#demo" className="btn-primary hidden sm:inline-flex !py-2.5 !px-5 text-sm">Book a demo</a>
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="lg:hidden w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={menuRef}
        className={`lg:hidden ${open ? "" : "hidden"} bg-white dark:bg-slate-950/95 backdrop-blur border-t border-slate-100 dark:border-slate-800 px-6 py-5 space-y-4 text-[15px] font-medium`}
      >
        <a href="#platform" className="block text-slate-600 dark:text-slate-300">Platform</a>
        <a href="#channels" className="block text-slate-600 dark:text-slate-300">Channels</a>
        <a href="#ai" className="block text-slate-600 dark:text-slate-300">AI</a>
        <a href="#pipeline" className="block text-slate-600 dark:text-slate-300">Sales</a>
        <a href="#security" className="block text-slate-600 dark:text-slate-300">Security</a>
        <a href="https://crm.eternitycrm.com/login" className="block text-slate-600 dark:text-slate-300">Sign in</a>
        <a href="#demo" className="btn-primary w-full">Book a demo</a>
      </div>
    </nav>
  );
}
