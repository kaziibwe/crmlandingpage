import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-[#0b1120] py-16">
      <div className="max-w-md w-full text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
          <i className="fas fa-compass mr-1.5"></i> Lost signal
        </p>
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-4">
          404
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 font-semibold mt-2">
          This page doesn&apos;t exist.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-3">
          The link may be broken, or the page may have been moved. Let&apos;s get you back to solid ground.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <i className="fas fa-house text-sm"></i> Back to home
          </Link>
          <a
            href="/#demo"
            className="inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Book a demo
          </a>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-8">
          Need help?{" "}
          <a href="mailto:info@eternitycrm.com" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            info@eternitycrm.com
          </a>
        </p>
      </div>
    </main>
  );
}
