import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  const admin = await requirePermission("VIEW_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ ok: true, resume: false });
}
