"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, type Country } from "@/lib/countryCodes";

interface CountrySelectProps {
  name: string;
  id: string;
  value: string; // country name, e.g. "Uganda"
  onChange(name: string): void;
  required?: boolean;
}

/**
 * Searchable country select — type "Uganda" to find Uganda.
 * Same interaction model as PhoneField's country picker: type-to-filter,
 * arrow keys + Enter to choose, closes on outside click or Escape.
 */
export default function CountrySelect({ name, id, value, onChange, required }: CountrySelectProps) {
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
      (c) => c.name.toLowerCase().includes(q) || c.iso.toLowerCase() === q
    );
  }, [search]);

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

  useEffect(() => {
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  function choose(c: Country) {
    onChange(c.name);
    setOpen(false);
  }

  const selected = COUNTRIES.find((c) => c.name === value);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm text-left transition ${
          value
            ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400"
        }`}
      >
        <span className="text-base leading-none">{selected?.flag ?? "🌍"}</span>
        <span className={`flex-1 truncate ${value ? "" : "text-slate-400"}`}>
          {value || "Select your country…"}
        </span>
        <i className={`fas fa-chevron-down text-[9px] text-slate-400 transition ${open ? "rotate-180" : ""}`}></i>
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
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
              placeholder="Search country… e.g. Uganda"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <ul ref={listRef} role="listbox" className="max-h-60 overflow-y-auto">
            {results.map((c, i) => (
              <li key={c.iso} role="option" aria-selected={c.name === value}>
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
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-400">No country matches “{search}”.</li>
            )}
          </ul>
        </div>
      )}

      {/* Hidden input so form validation picks up the value */}
      <input type="hidden" name={name} id={id} value={value} required={required} />
    </div>
  );
}
