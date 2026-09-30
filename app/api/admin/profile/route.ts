import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/lib/models/Admin";
import { getSessionAdmin, requirePermission, verifyPassword, hashPassword } from "@/lib/auth";

/**
 * GET /api/admin/profile — the signed-in administrator's own details.
 */
export async function GET() {
  const admin = await requirePermission("VIEW_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
}

/**
 * PATCH /api/admin/profile — update own name and/or email (login username).
 * Email must remain unique across administrators.
 */
export async function PATCH(req: Request) {
  const admin = await requirePermission("VIEW_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const doc = await Admin.findById(admin.id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (email !== doc.email) {
      const clash = await Admin.findOne({ email });
      if (clash) {
        return NextResponse.json({ error: "That email is already used by another administrator." }, { status: 409 });
      }
    }

    doc.name = name;
    doc.email = email;
    await doc.save();

    return NextResponse.json({
      admin: { id: String(doc._id), name: doc.name, email: doc.email, role: doc.role },
    });
  } catch (err) {
    console.error("[admin/profile PATCH]", err);
    return NextResponse.json({ error: "Profile update failed." }, { status: 500 });
  }
}

/**
 * PUT /api/admin/profile — change own password.
 * Always requires the CURRENT password; new password is stored scrypt-hashed.
 */
export async function PUT(req: Request) {
  const session = await getSessionAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json().catch(() => null);
    const currentPassword = String(body?.currentPassword ?? "");
    const newPassword = String(body?.newPassword ?? "");

    if (!currentPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Current password is required and the new password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const doc = await Admin.findById(session.id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!verifyPassword(currentPassword, doc.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    doc.passwordHash = hashPassword(newPassword);
    await doc.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/profile PUT]", err);
    return NextResponse.json({ error: "Password change failed." }, { status: 500 });
  }
}
