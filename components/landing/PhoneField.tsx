"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countryCodes";

interface PhoneFieldProps {
  /** Full number including "+" (e.g. +256712345678) — the value submitted to the API. */
  value: string;
  onChange(full: string): void;
}

function splitFull(full: string): { country: Country; local: string } {
  const digits = full.replace(/[^\d]/g, "");
  const match =
    COUNTRIES.slice().sort((a, b) => b.code.length - a.code.length).find((c) =>
      digits.startsWith(c.code.slice(1))
    ) ?? DEFAULT_COUNTRY;
  const local = digits.slice(match.code.length - 1);
  return { country: match, local };
}

export default function PhoneField({ value, onChange }: PhoneFieldProps) {
  const { country: initialCountry, local: initialLocal } = useMemo(() => splitFull(value || ""), [value]);
  const [country, setCountry] = useState<Country>(initialCountry);
  const [local, setLocal] = useState(initialLocal);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase() === q
    );
  }, [search]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setHighlight(0);
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  // Keep the highlighted option visible
  useEffect(() => {
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  function choose(c: Country) {
    setCountry(c);
    setOpen(false);
    onChange(`${c.code}${local}`);
  }

  function onLocalChange(v: string) {
    const digits = v.replace(/[^\d]/g, "").slice(0, 12);
    setLocal(digits);
    onChange(`${country.code}${digits}`);
  }

  const btnLabel = `${country.flag} ${country.code}`;

  return (
    <div ref={boxRef} className="relative">
      <div className="flex">
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select country code"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <span>{country.flag}</span>
          <span>{country.code}</span>
          <i className={`fas fa-chevron-down text-[9px] text-slate-400 transition ${open ? "rotate-180" : ""}`}></i>
        </button>

        {/* Local number */}
        <input
          type="tel"
          inputMode="numeric"
          required
          value={local}
          onChange={(e) => onLocalChange(e.target.value)}
          placeholder="7XX XXX XXX"
          aria-label="WhatsApp number (national part)"
          className="flex-1 min-w-0 px-4 py-3 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:border-blue-500 outline-none transition"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-40 mt-1.5 w-72 sm:w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlight((h) => Math.min(h + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlight((h) => Math.max(h - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (results[highlight]) choose(results[highlight]);
                }
              }}
              placeholder="Search country or code…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <ul ref={listRef} role="listbox" className="max-h-60 overflow-y-auto">
            {results.map((c, i) => (
              <li key={c.iso} role="option" aria-selected={c.iso === country.iso}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(c)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left ${
                    i === highlight
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-200"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs font-semibold text-slate-400">{c.code}</span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-400">No country matches “{search}”.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
