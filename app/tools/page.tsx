import Navbar from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Sections";

export default function ToolsPage() {
  return (
    <>
      <Navbar linkPrefix="/" />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] pt-32 md:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Tools</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
              Tools
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto text-lg">
              Everything your team needs to get more out of your customer conversations — all in one place.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 mb-10">
            <a
              href="/tools/document-number-extractor"
              className="admin-card group flex items-center gap-4 p-6 sm:p-8 block"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <i className="fas fa-file-import text-2xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Document Number Extractor
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Upload a document — DOCX, TXT, MD, CSV — and extract, validate, clean and download comma-separated phone numbers entirely in the user&apos;s browser. Nothing is uploaded or stored.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full">
                  <i className="fas fa-check text-xs"></i> Browser-only
                </span>
              </div>
            </a>

            <div className="admin-card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 mb-2">
                <i className="fas fa-chart-pie text-blue-500"></i> Coming soon
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                A full suite of productivity tools is being built — URL shortener, bulk contact formatter, document summarizer and more. Use the Document Number Extractor in the meantime.
              </p>
            </div>
          </div>

          <div className="admin-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">How to use the extractor</h2>
            <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside">
              <li>Click <strong>Choose file</strong> and select a DOCX, TXT, MD or CSV document.</li>
              <li>The extractor reads the text client-side and lists every comma-separated phone number it finds.</li>
              <li>Review the counts: <strong>Total</strong>, <strong>Valid</strong>, <strong>Rejected</strong> and <strong>Duplicates</strong>.</li>
              <li>Search, select or delete individual numbers, then click <strong>Download CSV</strong> or <strong>Download Excel</strong>.</li>
              <li>Use <strong>Start Over</strong> to reset when you are done.</li>
            </ol>
          </div>
        </div>
      </div>
      <Footer linkPrefix="/" />
    </>
  );
}
