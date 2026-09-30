import type { ReactNode } from "react";
import Navbar from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Sections";
import { SITE_NAME } from "@/lib/site";

interface LegalPageProps {
  title: string;
  description: string;
  path: string;
}

/**
 * Shared shell for standalone legal pages: same navbar/footer as the landing
 * page (linkPrefix="/" so section links jump back to the landing anchors),
 * with a centered "coming soon" notice.
 */
export default function LegalComingSoonPage({ title, description, path }: LegalPageProps): ReactNode {
  return (
    <>
      <Navbar linkPrefix="/" />
      <main className="min-h-[70vh] pt-32 md:pt-44 pb-20 md:pb-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
            <i className="fas fa-scale-balanced"></i> Legal
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mt-6">
            {title}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mt-5 max-w-xl mx-auto">
            {description}
          </p>

          {/* No .reveal here — the reveal observer only mounts on the landing page. */}
          <div className="card p-8 md:p-10 mt-10">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto shadow-lg">
              <i className="fas fa-hourglass-half text-white text-xl"></i>
            </span>
            <p className="chip bg-amber-50 text-amber-600 border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60 mt-5 mx-auto">
              <i className="fas fa-pen"></i> Coming soon
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
              We&apos;re finalizing this document. It will be published here shortly.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Questions in the meantime?{" "}
              <a href="mailto:info@eternitycrm.com" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                info@eternitycrm.com
              </a>
            </p>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-8">
            {SITE_NAME} — Believe in endless connections.
          </p>
        </div>
      </main>
      <Footer linkPrefix="/" />
    </>
  );
}
