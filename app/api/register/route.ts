import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/lib/models/Registration";

/**
 * POST /api/register — public demo-request form on the landing page.
 * Creates a PENDING registration that appears in the Administration Portal.
 * Never activates the account and never exposes admin data.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const company = String(body?.company ?? "").trim();
    const country = String(body?.country ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const companySize = String(body?.size ?? "").trim();
    const message = String(body?.message ?? "").trim();

    if (!name || !email || !company || !country || !phone || !message) {
      return NextResponse.json(
        { error: "Name, work email, company, country, WhatsApp number and message are required." },
        { status: 400 }
      );
    }
    // Must be E.164 (country code + number) — the form's country picker always sends this format.
    if (!/^\+\d{7,15}$/.test(phone.replace(/[\s()-]/g, ""))) {
      return NextResponse.json(
        { error: "Please select a country code and enter a valid WhatsApp number (e.g. +256 7XX XXX XXX)." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await connectDB();
    const existing = await Registration.findOne({ email });
    if (existing) {
      // Do not duplicate registrations for the same email.
      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: "We already have your request — our team will reach out shortly.",
      });
    }

    await Registration.create({
      name,
      email,
      company,
      country,
      phone,
      companySize,
      message,
    });

    return NextResponse.json({
      ok: true,
      message: "Thanks! Your demo request has been received — we will reach out shortly.",
    });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please email us directly at alfredkaziibwe19@gmail.com." },
      { status: 500 }
    );
  }
}
