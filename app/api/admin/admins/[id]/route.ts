import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin, type AdminDoc } from "@/lib/models/Admin";
import { requirePermission, hashPassword } from "@/lib/auth";
import { ROLES, PERMISSIONS, type Role } from "@/lib/permissions";

/**
 * PATCH /api/admin/admins/[id] — edit an administrator.
 * Requires MANAGE_ADMINS; changing role/permissions additionally requires MANAGE_PERMISSIONS.
 * Safeguard: cannot deactivate or demote the last active SUPER_ADMIN.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("MANAGE_ADMINS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const target = (await Admin.findById(params.id)) as AdminDoc | null;
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isLastActiveSuper =
      target.role === "SUPER_ADMIN" &&
      target.isActive &&
      (await Admin.countDocuments({ role: "SUPER_ADMIN", isActive: true })) <= 1;

    // --- Profile fields ---
    if (typeof body.name === "string" && body.name.trim()) target.name = body.name.trim();

    // --- Status (active/inactive) ---
    if (typeof body.isActive === "boolean") {
      if (!body.isActive && isLastActiveSuper) {
        return NextResponse.json(
          { error: "Cannot deactivate the last active SUPER_ADMIN." },
          { status: 409 }
        );
      }
      if (!body.isActive && String(target._id) === admin.id) {
        return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 409 });
      }
      target.isActive = body.isActive;
    }

    // --- Credentials reset ---
    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }
      target.passwordHash = hashPassword(body.password);
    }

    // --- Role & permissions (MANAGE_PERMISSIONS required) ---
    const touchesRole = body.role !== undefined && body.role !== target.role;
    const touchesPerms = Array.isArray(body.permissions);
    if (touchesRole || touchesPerms) {
      if (!admin.permissions.includes("MANAGE_PERMISSIONS")) {
        return NextResponse.json(
          { error: "Changing roles or permissions requires the MANAGE_PERMISSIONS permission." },
          { status: 403 }
        );
      }
      if (touchesRole) {
        const role = String(body.role) as Role;
        if (!(ROLES as readonly string[]).includes(role)) {
          return NextResponse.json({ error: "Invalid role." }, { status: 400 });
        }
        if (isLastActiveSuper && role !== "SUPER_ADMIN") {
          return NextResponse.json(
            { error: "Cannot demote the last active SUPER_ADMIN." },
            { status: 409 }
          );
        }
        target.role = role;
      }
      if (touchesPerms) {
        const valid = (PERMISSIONS as readonly string[]).filter((p) => body.permissions.includes(p));
        target.permissions = [...valid];
      }
    }

    await target.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/admins/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update administrator." }, { status: 500 });
  }
}
