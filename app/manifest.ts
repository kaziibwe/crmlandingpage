import type { MetadataRoute } from "next";
import { SITE_NAME, SEO_DESCRIPTION } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — AI-Powered CRM`,
    short_name: SITE_NAME,
    description: SEO_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0b1120",
    theme_color: "#0b1120",
    icons: [
      {
        src: "/logo.png",
        sizes: "600x600",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
