"use client";

import { useCallback, useEffect, useState } from "react";
import { extractDocxText } from "@/lib/docxExtract";
import { exportNumbers } from "@/lib/exportNumbers";
import Navbar from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Sections";

type ProcessingState =
  | "idle"
  | "uploading"
  | "reading"
  | "extracting"
  | "validating"
  | "deduplicating"
  | "ready"
  | "error"
  | "done";

interface ExtractResult {
  total: number;
  valid: number;
  rejected: number;
  duplicates: number;
  numbers: string[];
  details: {
    index: number;
    value: string;
    status: "valid" | "rejected";
    reason?: string;
  }[];
}

function resetToolState() {
  (window as unknown as Record<string, unknown>)["__ecrmNumbers"] = null;
  (window as unknown as Record<string, unknown>)["__ecrmResult"] = null;
  (window as unknown as Record<string, unknown>)["__ecrmProcessing"] = "idle";
}

export default function DocumentNumberExtractorPage() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [valid, setValid] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [duplicates, setDuplicates] = useState(0);
  const [freqGroups, setFreqGroups] = useState<{ times: number; numbers: number }[]>([]);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectedCount, setSelectedCount] = useState(0);

  function toggleSelect(index: number) {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
    setSelectedCount(next.size);
  }

  function selectAll() {
    const next = new Set(numbers.map((_, i) => i));
    setSelected(next);
    setSelectedCount(next.size);
  }

  function clearSelection() {
    setSelected(new Set());
    setSelectedCount(0);
  }

  function handleFile(file: File) {
    if (!file) return;
    const name = file.name.toLowerCase();

    if (name.endsWith(".pdf")) {
      setState("idle");
      setError("PDF text extraction isn't supported yet. Please export the numbers to TXT, CSV or DOCX and try again.");
      return;
    }

    const isDocx = name.endsWith(".docx");
    if (
      !isDocx &&
      !file.type.startsWith("text/") &&
      !name.match(/\.(txt|md|csv|tsv|json|log|ini|xml|yaml|yml|html|xhtml)$/i)
    ) {
      setError("We currently support DOCX and readable text formats (TXT, MD, CSV, TSV, JSON, LOG, INI, XML, YAML, HTML).");
      return;
    }

    setState("uploading");
    setError(null);
    setNotice(null);

    if (isDocx) {
      // Real DOCX parsing: unzip in the browser and read word/document.xml.
      file
        .arrayBuffer()
        .then((buf) => extractDocxText(buf))
        .then((text) => {
          (window as unknown as Record<string, unknown>)["__ecrmProcessedText"] = text;
          setState("reading");
          setError(null);
          setNotice(null);
          setTimeout(() => extractText(text), 300);
        })
        .catch((err: Error) => {
          setState("idle");
          const reason =
            err?.message === "UNSUPPORTED_BROWSER"
              ? "This browser can't uncompress DOCX files. Please try a recent version of Chrome, Edge, Firefox or Safari."
              : err?.message === "NO_DOCUMENT_XML"
              ? "That DOCX file doesn't contain a readable document body."
              : "Could not read that DOCX file. It may be corrupt or password-protected — please try another file.";
          setError(reason);
        });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      (window as unknown as Record<string, unknown>)["__ecrmProcessedText"] = reader.result;
      setState("reading");
      setError(null);
      setNotice(null);
      setTimeout(() => {
        if (typeof reader.result === "string") extractText(reader.result);
      }, 300);
    };
    reader.onerror = () => {
      setState("idle");
      setError("Could not read that document. Please try another file.");
    };
    reader.readAsText(file);
  }

  function extractText(text: string) {
    if (typeof window === "undefined") return;
    (window as unknown as Record<string, unknown>)["__ecrmProcessing"] = "extracting";
    setState("extracting");
    setError(null);
    const numbers = parsePhoneNumbers(text);
    (window as unknown as Record<string, unknown>)["__ecrmNumbers"] = numbers;
    (window as unknown as Record<string, unknown>)["__ecrmResult"] = {
      total: numbers.length,
      valid: 0,
      rejected: 0,
      duplicates: 0,
      numbers,
      details: numbers.map((value) => ({ index: 0, value, status: "valid" as const })),
    };
    setState("validating");
    validateNumbers(numbers);
  }

  function parsePhoneNumbers(text: string) {
    const tokens = text.split(",");
    const numbers: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      // Keep digits, plus and dash only - strips spaces, letters and any other
      // noise so "+256 793 676138" becomes the compact "+256793676138".
      const value = tokens[i].replace(/[^0-9+\-]/g, "").trim();
      if (value) numbers.push(value);
    }
    return numbers;
  }

  function validateNumbers(numbers: string[]) {
    if (typeof window === "undefined") return;
    (window as unknown as Record<string, unknown>)["__ecrmProcessing"] = "validating";
    setState("validating");
    setError(null);
    setNotice(null);

    const details = numbers.map((value) => {
      // Remove +, dashes and whitespace so only the digits remain for checks.
      const stripped = value.replace(/[+\-\s]/g, "");
      if (stripped.length < 7) {
        return { index: 0, value, status: "rejected" as const, reason: "Too short / incomplete" };
      }
      if (/[A-Za-z]/.test(stripped)) {
        return { index: 0, value, status: "rejected" as const, reason: "Contains letters" };
      }
      if (/^\d{4,}$/.test(stripped)) {
        return { index: 0, value, status: "valid" as const };
      }
      return { index: 0, value, status: "rejected" as const, reason: "Invalid phone number format" };
    });

    const rejected = details.filter((d) => d.status === "rejected").length;
    const seen = new Set<string>();
    const unique: string[] = [];
    let duplicateCount = 0;
    details.forEach((d) => {
      if (d.status === "valid") {
        // Dedup on the digits themselves (keeping the + prefix distinct) so
        // format variants like "+256 793 676138" and "+256793676138" collapse,
        // without ever collapsing different numbers that share a country code.
        const key = (d.value.startsWith("+") ? "+" : "") + d.value.replace(/[^0-9]/g, "");
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(d.value);
        } else {
          duplicateCount++;
        }
      }
    });

    // Frequency breakdown: how many distinct numbers appear once, twice, three
    // times, ... so the user can see exactly how the duplicates are spread.
    const byKey = new Map<string, number>();
    details.forEach((d) => {
      if (d.status !== "valid") return;
      const key = (d.value.startsWith("+") ? "+" : "") + d.value.replace(/[^0-9]/g, "");
      byKey.set(key, (byKey.get(key) || 0) + 1);
    });
    const timesCount = new Map<number, number>();
    byKey.forEach((occurrences) => {
      timesCount.set(occurrences, (timesCount.get(occurrences) || 0) + 1);
    });
    const freq = Array.from(timesCount.entries())
      .map(([times, nums]) => ({ times, numbers: nums }))
      .sort((a, b) => a.times - b.times);

    (window as unknown as Record<string, unknown>)["__ecrmResult"] = {
      total: details.length,
      valid: unique.length,
      rejected,
      duplicates: duplicateCount,
      numbers: unique,
      details,
    };

    setNumbers(unique);
    setTotal(details.length);
    setValid(unique.length);
    setRejected(rejected);
    setDuplicates(duplicateCount);
    setFreqGroups(freq);
    setSelected(new Set());
    setSelectedCount(0);
    setSearch("");
    setState("ready");
  }

  function download(format: "csv" | "xls") {
    if (typeof window === "undefined") return;
    if (numbers.length === 0) {
      const empty = document.createElement("div");
      empty.className =
        "admin-card p-8 text-center text-sm text-slate-500 dark:text-slate-400";
      empty.innerHTML =
        "<i class=\"fas fa-info-circle text-slate-400\"></i> <span>There are no numbers to download yet.</span>";
      const slot = document.getElementById("extractor-toast-slot");
      if (slot) {
        slot.appendChild(empty);
        setTimeout(() => slot.removeChild(empty), 4000);
      }
      return;
    }
    // Timestamped filename (date + time), header block and footer line are
    // built by the shared export helper.
    exportNumbers(format, numbers);

    setState("done");
    setNumbers([]);
    setTotal(0);
    setValid(0);
    setRejected(0);
    setDuplicates(0);
    setFreqGroups([]);
    setSelected(new Set());
    setSelectedCount(0);
    setSearch("");
    setError(null);
    setNotice("Download complete — all working data has been cleared.");

    // Record the download so the admin tools/usage page can show per-tool analytics.
    // Fire-and-forget POST; the server does the Mongo write.
    try {
      fetch("/api/tools/document-number-extractor/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          downloadCount: total,
          validCount: valid,
          rejectedCount: rejected,
          duplicateCount: duplicates,
          leadCount: 0,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Tracking must never break the download flow.
    }
  }

  function clearAll() {
    resetToolState();
    setNumbers([]);
    setTotal(0);
    setValid(0);
    setRejected(0);
    setDuplicates(0);
    setFreqGroups([]);
    setSelected(new Set());
    setSelectedCount(0);
    setSearch("");
    setError(null);
    setNotice("Everything cleared. Back to the start screen.");
    setState("idle");
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  const filtered = numbers.filter((_, i) => {
    const index = i + 1;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      String(index).includes(query) ||
      numbers[i].toLowerCase().includes(query)
    );
  });

  const showEmpty =
    numbers.length === 0 &&
    state !== "uploading" &&
    state !== "reading" &&
    state !== "extracting" &&
    state !== "validating" &&
    state !== "deduplicating" &&
    state !== "ready";

  // UI guard: only show the "invalid document" card when no document has been
  // uploaded at all (the tool itself runs client-side and returns results after a
  // successful parse). If a file was uploaded but parsing failed, show a distinct
  // error card instead.
  const noDocumentUploaded = state === "idle";
  const uploadFailed = state === "error" && showEmpty;

  return (
    <>
      <Navbar linkPrefix="/" />
      <main className="min-h-screen pt-28 md:pt-36 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Document Number Extractor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload a text-based document and extract phone numbers entirely in the browser.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state === "done" && (
            <button onClick={clearAll} className="admin-btn-ghost text-xs">
              <i className="fas fa-redo"></i> Start Over
            </button>
          )}
          {state === "ready" && selected.size > 0 && (
            <button onClick={clearAll} className="admin-btn-ghost text-xs">
              <i className="fas fa-trash-can"></i> Clear Selection
            </button>
          )}
        </div>
      </header>

      {/* Extraction summary — the math, up top */}
      {state === "ready" && (
        <div className="admin-card border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80">
            Extraction summary
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
            {total} found = {valid} unique valid + {duplicates} duplicate {duplicates === 1 ? "copy" : "copies"} + {rejected} rejected
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {freqGroups.map((g) => (
              <span
                key={g.times}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  g.times === 1
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {g.times === 1
                  ? `${g.numbers} number${g.numbers === 1 ? "" : "s"} appear once`
                  : `${g.numbers} number${g.numbers === 1 ? "" : "s"} appear ${g.times} times`}
              </span>
            ))}
          </div>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-2">
            The download exports one copy of each — {valid} number{valid === 1 ? "" : "s"} in total.
          </p>
        </div>
      )}

      {state !== "idle" && state !== "ready" && state !== "error" && state !== "done" && (
        <div className="admin-card border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 shrink-0 rounded-full border-2 border-blue-500 border-t-transparent bg-blue-500 animate-spin"></span>
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {state === "uploading"
                  ? "Uploading document…"
                  : state === "reading"
                  ? "Reading document…"
                  : state === "extracting"
                  ? "Extracting numbers…"
                  : state === "validating"
                  ? "Validating numbers…"
                  : "Removing duplicates…"}
              </p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                {state === "validating" && numbers.length > 0
                  ? `Found ${numbers.length} candidate number${numbers.length === 1 ? "" : "s"} — checking each one.`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadFailed && (
        <div className="admin-card border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 shrink-0 rounded-full bg-rose-500/20 flex items-center justify-center">
              <i className="fas fa-exclamation-circle text-rose-600 text-sm"></i>
            </span>
            <div>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error ?? "Could not read that document"}</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
                Please upload a document containing comma-separated phone numbers and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {state === "done" && (
        <div className="admin-card border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <i className="fas fa-check-circle text-emerald-600 text-sm"></i>
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Download complete</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                {notice ?? "All working data has been cleared."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <i className="fas fa-file-import"></i>
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload document</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Supported: DOCX, TXT, MD, CSV, TSV, JSON, LOG, INI, XML, YAML, HTML and more readable text formats. (PDF coming soon.)
              </p>
            </div>
          </div>

          <label className="card relative cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 text-center hover:border-blue-400 dark:hover:border-blue-500 transition">
            <input
              type="file"                accept=".docx,.txt,.md,.csv,.tsv,.json,.log,.ini,.xml,.yaml,.yml,.html,.xhtml"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <div className="text-slate-400">
              <i className="fas fa-cloud-upload-alt text-3xl inline-block mb-3"></i>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {noDocumentUploaded
                  ? "Drop your document here or click to browse — no file selected yet"
                  : "Drop your document here or click to browse"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                DOCX, TXT, MD, CSV and readable text formats. Everything stays in your browser.
              </p>
            </div>
          </label>

          {showEmpty && (
            <div className="mt-4 border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/10 rounded-2xl p-5 text-center">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {noDocumentUploaded
                  ? "No document uploaded yet. Please upload a document containing comma-separated phone numbers."
                  : "Could not read that document. Please upload a document containing comma-separated phone numbers and try again."}
              </p>
              <p className="text-xs text-rose-500/80 dark:text-rose-500/70 mt-2">
                {noDocumentUploaded ? "Example: +256701234567,+254712345678,+447911123456" : "The file could not be parsed. Try a text-based document (TXT/CSV/JSON/MD) and make sure it contains comma-separated phone numbers."}
              </p>
            </div>
          )}
        </section>

        {state === "ready" && !showEmpty && (
          <section className="space-y-5">
            <div className="admin-card p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Extracted numbers</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {total} found = {valid} unique valid + {duplicates} duplicate {duplicates === 1 ? "copy" : "copies"} + {rejected} rejected
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => download("csv")}
                    className="admin-btn-primary text-xs"
                  >
                    <i className="fas fa-file-csv"></i> Download CSV
                  </button>
                  <button
                    onClick={() => download("xls")}
                    className="admin-btn-ghost text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <i className="fas fa-file-excel"></i> Download Excel
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Unique valid</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">{valid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Rejected</p>
                    <p className="font-semibold text-rose-600 dark:text-rose-400">{rejected}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Duplicate copies</p>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">{duplicates}</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <input
                    value={search}
                    onChange={handleSearch}
                    placeholder="Search numbers…"
                    className="admin-input W-48!"
                  />
                  <button onClick={selectAll} className="admin-btn-ghost text-xs">Select all</button>
                  <button onClick={clearSelection} className="admin-btn-ghost text-xs">Clear</button>
                </div>
              </div>

              {/* Duplicate frequency breakdown */}
              <div className="pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Duplicate breakdown — how many times each number appears
                </p>
                <div className="flex flex-wrap gap-2">
                  {freqGroups.map((g) => (
                    <span
                      key={g.times}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        g.times === 1
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                      }`}
                    >
                      {g.times === 1
                        ? `${g.numbers} number${g.numbers === 1 ? "" : "s"} appear once`
                        : `${g.numbers} number${g.numbers === 1 ? "" : "s"} appear ${g.times} times`}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  The download exports one copy of each — {valid} number{valid === 1 ? "" : "s"} in total.
                </p>
              </div>

              <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((number, i) => {
                    const index = i + 1;
                    const isSelected = selected.has(i);
                    return (
                      <li key={`${number}-${index}`}>
                        <button
                          type="button"
                          onClick={() => toggleSelect(i)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${isSelected ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-900/50"}`}
                        >
                          <span
                            className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-semibold ${isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 dark:border-slate-600 text-transparent"}`}
                          >
                            {isSelected ? <i className="fas fa-check"></i> : index}
                          </span>
                          <span className="flex-1 truncate text-sm font-mono text-slate-700 dark:text-slate-200">{number}</span>
                          <span className={`shrink-0 text-xs ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                            {isSelected ? "Selected" : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {filtered.length === 0 && (
                    <li>
                      <p className="px-4 py-6 text-sm text-slate-400 text-center">
                        {search ? "No matches." : "No numbers yet."}
                      </p>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-xs text-slate-400">
                  {selected.size} of {numbers.length} selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => download("csv")}
                    disabled={selected.size === 0}
                    className="admin-btn-primary text-xs disabled:opacity-50"
                  >
                    <i className="fas fa-file-csv"></i> Download CSV
                  </button>
                  <button
                    onClick={() => download("xls")}
                    disabled={selected.size === 0}
                    className="admin-btn-ghost text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  >
                    <i className="fas fa-file-excel"></i> Download Excel
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <div id="extractor-toast-slot" className="hidden" />

      {notice && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3.5 py-2.5">
          {notice}
        </p>
      )}
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}
      </div>
      </main>
      <Footer linkPrefix="/" />
    </>
  );
}
