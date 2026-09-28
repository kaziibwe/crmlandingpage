import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/lib/models/Admin";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await connectDB();
    const admin = await Admin.findOne({ email });
    if (!admin || !admin.isActive) {
      // Same message for unknown email / wrong password / deactivated (no account enumeration)
      return NextResponse.json({ error: "Invalid credentials or account disabled." }, { status: 401 });
    }

    if (!verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials or account disabled." }, { status: 401 });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = createSessionToken(String(admin._id), admin.email);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, email: admin.email, role: admin.role });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
