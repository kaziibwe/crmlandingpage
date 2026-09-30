import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/lib/models/Registration";
import { requirePermission } from "@/lib/auth";

/** GET /api/admin/users/[id] — full onboarding record. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("VIEW_USERS");
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const user = await Registration.findById(params.id).lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[admin/users/[id] GET]", err);
    return NextResponse.json({ error: "Failed to load registration." }, { status: 500 });
  }
}

/** PATCH /api/admin/users/[id] — edit registration/account info (EDIT_USERS). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("EDIT_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const update: Record<string, unknown> = {};
    for (const key of ["name", "company", "country", "email", "phone", "companySize", "message"] as const) {
      if (typeof body[key] === "string") update[key] = body[key].trim();
    }
    if (typeof body.assignedAdminEmail === "string") {
      update.assignedAdminEmail = body.assignedAdminEmail.trim() || null;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const user = await Registration.findByIdAndUpdate(params.id, update, { new: true }).lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("[admin/users/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update registration." }, { status: 500 });
  }
}
