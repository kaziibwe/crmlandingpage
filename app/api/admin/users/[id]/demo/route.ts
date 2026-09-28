import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  Registration,
  DEMO_STATUSES,
  DEMO_ATTENDANCE,
  ACCEPTANCE_STATUSES,
  type DemoStatus,
  type DemoAttendance,
  type AcceptanceStatus,
} from "@/lib/models/Registration";
import { requirePermission } from "@/lib/auth";

/**
 * POST /api/admin/users/[id]/demo
 * Body (all optional, applied in order):
 *  - { action: "schedule", date: ISO }        → MANAGE_DEMOS  (also used to reschedule)
 *  - { action: "status", status: DemoStatus } → MANAGE_DEMOS
 *  - { action: "attendance", value: DemoAttendance } → MANAGE_DEMOS
 *  - { action: "acceptance", value: AcceptanceStatus } → MANAGE_DEMOS (customer decision recorded by admin)
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("MANAGE_DEMOS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json().catch(() => null);
    const action = String(body?.action ?? "");

    const user = await Registration.findById(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date();

    if (action === "schedule") {
      const date = body?.date ? new Date(String(body.date)) : null;
      if (!date || isNaN(date.getTime())) {
        return NextResponse.json({ error: "A valid demo date is required." }, { status: 400 });
      }
      user.demoStatus = "SCHEDULED";
      user.demoDate = date;
      user.demoAttendance = "PENDING";
    } else if (action === "status") {
      const status = String(body?.status ?? "") as DemoStatus;
      if (!(DEMO_STATUSES as readonly string[]).includes(status)) {
        return NextResponse.json({ error: "Invalid demo status." }, { status: 400 });
      }
      user.demoStatus = status;
    } else if (action === "attendance") {
      const value = String(body?.value ?? "") as DemoAttendance;
      if (!(DEMO_ATTENDANCE as readonly string[]).includes(value)) {
        return NextResponse.json({ error: "Invalid attendance value." }, { status: 400 });
      }
      user.demoAttendance = value;
    } else if (action === "acceptance") {
      const value = String(body?.value ?? "") as AcceptanceStatus;
      if (!(ACCEPTANCE_STATUSES as readonly string[]).includes(value)) {
        return NextResponse.json({ error: "Invalid acceptance value." }, { status: 400 });
      }
      user.acceptanceStatus = value;
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    user.demoUpdatedBy = admin.email;
    user.demoUpdatedAt = now;
    if (action === "acceptance") {
      user.acceptanceUpdatedBy = admin.email;
      user.acceptanceUpdatedAt = now;
    }

    await user.save();
    return NextResponse.json({ ok: true, user: user.toObject() });
  } catch (err) {
    console.error("[admin/users/[id]/demo POST]", err);
    return NextResponse.json({ error: "Demo update failed." }, { status: 500 });
  }
}
