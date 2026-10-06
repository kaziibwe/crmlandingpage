import { NextResponse } from "next/server";
import { trackToolUsage } from "@/lib/toolUsage";

/**
 * Records one Document Number Extractor download event.
 * The browser posts here after a successful download; the write itself
 * is fire-and-forget and must never break the extractor flow.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const clamp = (v: unknown) => {
    const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
    return Math.min(Math.max(n, 0), 1_000_000);
  };

  const userAgent = req.headers.get("user-agent");

  const sessionId = await trackToolUsage({
    toolId: "document-number-extractor",
    toolName: "Document Number Extractor",
    downloadCount: clamp(body.downloadCount),
    validCount: clamp(body.validCount),
    rejectedCount: clamp(body.rejectedCount),
    duplicateCount: clamp(body.duplicateCount),
    leadCount: clamp(body.leadCount),
    status: "done",
    device: userAgent ? userAgent.slice(0, 200) : null,
    userAgent: userAgent,
  });

  return NextResponse.json({ ok: true, sessionId });
}
