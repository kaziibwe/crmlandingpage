import type { Metadata } from "next";

/**
 * The administration portal must never appear in search results.
 * robots.ts already disallows /eternitycrmadmin for crawlers; this meta noindex
 * also covers cases where the URL is fetched by services that ignore robots.txt.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
