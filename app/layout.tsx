import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { SITE_URL, SITE_NAME, SEO_TITLE, SEO_DESCRIPTION, SEO_KEYWORDS } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 600,
        height: 600,
        alt: "EternityCrm — AI-Powered CRM",
      },
    ],
  },
  twitter: {
    card: "summary",
    site: SITE_NAME,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "business software",
};

export const viewport: Viewport = {
  themeColor: "#0b1120",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        {/* Dark mode before paint to prevent flash (same logic as the approved page) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('ecrm-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var c=document.documentElement.classList;d?c.add('dark'):c.remove('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-700 dark:bg-[#0b1120] dark:text-slate-300">
        {children}
      </body>
    </html>
  );
}
