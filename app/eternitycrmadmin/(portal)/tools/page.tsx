"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ToolLink {
  id: string;
  name: string;
  description: string;
  path: string;
}

const TOOLS: ToolLink[] = [
  {
    id: "document-number-extractor",
    name: "Document Number Extractor",
    description:
      "Upload a text-based document and extract, validate, clean and download comma-separated phone numbers entirely in the user's browser. Nothing is uploaded or stored.",
    path: "/eternitycrmadmin/tools/document-number-extractor",
  },
];

export default function ToolsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tools");
      if (res.status === 401 || res.status === 403) {
        router.replace("/eternitycrmadmin/login");
        return;
      }
      const data = await res.json().catch(() => null);
      if (res.ok && Array.isArray(data?.items)) {
        TOOLS.splice(0, TOOLS.length, ...data.items.map((item: ToolLink) => ({
          ...item,
          id: String(item.id),
          path: String(item.path),
        })));
        return;
      }
    } catch {
      // Keep the seeded stable list if the API is unavailable during bootstrap.
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tools</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Client-side utilities that keep documents and phone numbers on the user's device.
            </p>
          </div>
        </header>
        <div className="grid gap-3">
          {TOOLS.map((tool) => (
            <div key={tool.id} className="admin-card p-5">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tool.name}</p>
              <p className="text-xs text-slate-400 mt-1">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tools</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fully client-side utilities that never leave the user&apos;s browser.
          </p>
        </div>
        <a
          href="/eternitycrmadmin/tools/document-number-extractor"
          className="admin-btn-primary text-xs"
        >
          <i className="fas fa-plus"></i> Add new tool
        </a>
      </header>

      <section className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Tool</th>
                <th className="px-5 py-3 font-semibold">Description</th>
                <th className="px-5 py-3 font-semibold">Page</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TOOLS.map((tool) => (
                <tr key={tool.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{tool.name}</p>
                    <p className="text-xs text-slate-400">{tool.id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{tool.description}</td>
                  <td className="px-5 py-3.5">
                    <a href={tool.path} className="admin-btn-ghost !px-3 !py-1.5 text-xs">
                      Open
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="admin-badge bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <i className="fas fa-check text-[10px]"></i> Implemented
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
