import { cookies } from "next/headers";
import { ToolUsage } from "./models/ToolUsage";
import { connectDB } from "./mongodb";

export function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(buf, (b) => b.toString(16)).join("");
  }
  return "unknown";
}

export async function trackToolUsage({
  toolId,
  toolName,
  downloadCount,
  validCount,
  rejectedCount,
  duplicateCount,
  leadCount,
  status,
  device,
  userAgent,
}: {
  toolId: string;
  toolName: string;
  downloadCount: number;
  validCount: number;
  rejectedCount: number;
  duplicateCount: number;
  leadCount: number;
  status: string;
  device?: string | null;
  userAgent?: string | null;
}) {
  const id = generateSessionId();
  try {
    // The model buffers operations until a connection exists — without this
    // the write silently timed out and nothing was ever recorded.
    await connectDB();
    await ToolUsage.create({
      toolId,
      toolName,
      browserSessionId: id,
      ip: null,
      downloadCount,
      validCount,
      rejectedCount,
      duplicateCount,
      leadCount,
      status,
      device,
      userAgent,
    });
  } catch (e) {
    // Fire-and-forget: the extractor must never depend on a successful write,
    // but never swallow the reason silently either.
    console.error("[toolUsage] failed to record usage:", (e as Error)?.message);
  }
  return id;
}
