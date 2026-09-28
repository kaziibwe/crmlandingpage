import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/lib/models/Registration";
import { requirePermission } from "@/lib/auth";

/**
 * POST /api/admin/users/[id]/setup
 * Body: { action: "start" }  → MANAGE_SETUP
 *       { action: "complete" } → MANAGE_SETUP
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("MANAGE_SETUP");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json().catch(() => null);
    const action = String(body?.action ?? "");

    const user = await Registration.findById(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date();

    if (action === "start") {
      user.setupStatus = "IN_PROGRESS";
      if (!user.setupStartedAt) user.setupStartedAt = now;
    } else if (action === "complete") {
      if (user.setupStatus === "NOT_STARTED") {
        return NextResponse.json(
          { error: "Setup has not started yet — start it first." },
          { status: 409 }
        );
      }
      user.setupStatus = "COMPLETED";
      user.setupCompletedAt = now;
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    user.setupUpdatedBy = admin.email;
    await user.save();
    return NextResponse.json({ ok: true, user: user.toObject() });
  } catch (err) {
    console.error("[admin/users/[id]/setup POST]", err);
    return NextResponse.json({ error: "Setup update failed." }, { status: 500 });
  }
}
