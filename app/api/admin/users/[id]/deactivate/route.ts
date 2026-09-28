import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/lib/models/Registration";
import { requirePermission } from "@/lib/auth";

/** POST /api/admin/users/[id]/deactivate — requires DEACTIVATE_USERS. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("DEACTIVATE_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const user = await Registration.findById(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date();
    user.registrationStatus = "INACTIVE";
    user.deactivatedAt = now;
    user.deactivatedBy = admin.email;
    await user.save();

    return NextResponse.json({ ok: true, user: user.toObject() });
  } catch (err) {
    console.error("[admin/users/[id]/deactivate POST]", err);
    return NextResponse.json({ error: "Deactivation failed." }, { status: 500 });
  }
}
