import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/lib/models/Registration";
import { requirePermission } from "@/lib/auth";

/**
 * POST /api/admin/users/[id]/activate — requires ACTIVATE_USERS.
 * Explicit activation only. Guardrail: setup must be COMPLETED unless the
 * admin also holds DEACTIVATE_USERS (treated as the workflow-override privilege).
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("ACTIVATE_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const user = await Registration.findById(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (user.setupStatus !== "COMPLETED" && !admin.permissions.includes("DEACTIVATE_USERS")) {
      return NextResponse.json(
        { error: "Setup must be completed before activation. (Override requires elevated permission.)" },
        { status: 409 }
      );
    }

    const now = new Date();
    user.registrationStatus = "ACTIVE";
    user.activatedAt = now;
    user.activatedBy = admin.email;
    user.deactivatedAt = null;
    user.deactivatedBy = null;
    await user.save();

    return NextResponse.json({ ok: true, user: user.toObject() });
  } catch (err) {
    console.error("[admin/users/[id]/activate POST]", err);
    return NextResponse.json({ error: "Activation failed." }, { status: 500 });
  }
}
