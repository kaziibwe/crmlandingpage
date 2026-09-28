import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin, type AdminDoc } from "@/lib/models/Admin";
import { requirePermission } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { ROLES, type Role } from "@/lib/permissions";

/** GET /api/admin/admins — list administrators (MANAGE_ADMINS). */
export async function GET() {
  const admin = await requirePermission("MANAGE_ADMINS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const admins = (await Admin.find()
      .sort({ createdAt: 1 })
      .lean()) as unknown as AdminDoc[];

    return NextResponse.json({
      items: admins.map((a) => ({
        id: String(a._id),
        name: a.name,
        email: a.email,
        role: a.role,
        permissions: a.permissions ?? [],
        isActive: a.isActive,
        createdBy: a.createdBy,
        lastLoginAt: a.lastLoginAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      viewer: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error("[admin/admins GET]", err);
    return NextResponse.json({ error: "Failed to load administrators." }, { status: 500 });
  }
}

/** POST /api/admin/admins — create an administrator (MANAGE_ADMINS). */
export async function POST(req: Request) {
  const admin = await requirePermission("MANAGE_ADMINS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json().catch(() => null);

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const role = String(body?.role ?? "VIEWER") as Role;
    const permissions: string[] = Array.isArray(body?.permissions) ? body.permissions : [];

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!(ROLES as readonly string[]).includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "An administrator with that email already exists." }, { status: 409 });
    }

    const created = await Admin.create({
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      permissions,
      isActive: true,
      createdBy: admin.email,
    });

    return NextResponse.json({ ok: true, id: String(created._id) }, { status: 201 });
  } catch (err) {
    console.error("[admin/admins POST]", err);
    return NextResponse.json({ error: "Failed to create administrator." }, { status: 500 });
  }
}
