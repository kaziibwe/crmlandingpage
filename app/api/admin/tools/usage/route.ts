import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth";
import { ToolUsage } from "@/lib/models/ToolUsage";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let rows;
  try {
    rows = await ToolUsage.find({ toolId: "document-number-extractor" })
      .sort({ createdAt: -1 })
      .limit(200);
  } catch {
    return NextResponse.json({ error: "Bad gateway" }, { status: 500 });
  }

  const totals: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const downloads = [];
  let totalDownload = 0;
  let totalValid = 0;
  let totalRejected = 0;
  let totalDuplicates = 0;
  let totalLeads = 0;

  for (const r of rows) {
    totals[r.toolId] = (totals[r.toolId] || 0) + 1;
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    downloads.push({
      date: r.createdAt?.toISOString()?.slice(0, 10) || "unknown",
      count: r.downloadCount,
      valid: r.validCount,
      rejected: r.rejectedCount,
      duplicates: r.duplicateCount,
      leadCount: r.leadCount,
    });
    totalDownload += r.downloadCount;
    totalValid += r.validCount;
    totalRejected += r.rejectedCount;
    totalDuplicates += r.duplicateCount;
    totalLeads += r.leadCount;
  }

  const today = downloads.filter((d) => d.date === new Date().toISOString().slice(0, 10)).reduce((a, b) => a + b.count, 0);
  const last7 = downloads.filter((d) => {
    const dd = new Date(d.date);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return dd >= sevenDaysAgo;
  }).reduce((a, b) => a + b.count, 0);

  return NextResponse.json({
    admin: { name: admin.name, email: admin.email, role: admin.role },
    period: { today, last7 },
    // uploads = number of rows = number of upload/download events;
    // downloaded = unique valid numbers exported (validCount);
    // uploaded = every number found in the docs: valid + duplicates + rejected (always >= downloaded).
    metrics: { uploads: rows.length, downloads: totalValid, uploaded: totalValid + totalRejected + totalDuplicates, rejected: totalRejected, duplicates: totalDuplicates, matchedLeads: totalLeads },
    byStatus,
    downloads,
  });
}
