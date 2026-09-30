import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { SITE_NAME, SEO_DESCRIPTION } from "@/lib/site";

export const alt = "EternityCrm — One CRM for every customer conversation.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  let logoDataUri = "";
  try {
    const logo = await readFile(path.join(process.cwd(), "public", "logo.png"));
    logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;
  } catch {
    // Card still renders without the logo mark if the file is unavailable.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0b1120",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(124,58,237,0.35), transparent 45%), radial-gradient(circle at 10% 90%, rgba(37,99,235,0.35), transparent 45%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {logoDataUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoDataUri}
              width={84}
              height={84}
              alt=""
              style={{ borderRadius: 20 }}
            />
          ) : (
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 20,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              E
            </div>
          )}
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Eternity
            <span style={{ color: "#60a5fa" }}>CRM</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              maxWidth: 940,
            }}
          >
            One CRM for every{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              customer conversation.
            </span>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#94a3b8", maxWidth: 860 }}>
            {SEO_DESCRIPTION}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(96,165,250,0.4)",
              backgroundColor: "rgba(37,99,235,0.15)",
              fontSize: 22,
              fontWeight: 600,
              color: "#93c5fd",
            }}
          >
            AI agents · WhatsApp · Email · SMS · Calls
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#64748b" }}>{SITE_NAME}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
