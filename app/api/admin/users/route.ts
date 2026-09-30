import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration, type RegistrationDoc } from "@/lib/models/Registration";
import { requirePermission } from "@/lib/auth";

/** GET /api/admin/users — list registrations with search, filters, sorting, pagination. */
export async function GET(req: Request) {
  const admin = await requirePermission("VIEW_USERS");
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const status = url.searchParams.get("status") ?? "";
    const demo = url.searchParams.get("demo") ?? "";
    const setup = url.searchParams.get("setup") ?? "";
    const account = url.searchParams.get("account") ?? "";
    const assigned = url.searchParams.get("assigned") ?? "";
    const sort = url.searchParams.get("sort") ?? "createdAt";
    const dir = url.searchParams.get("dir") === "asc" ? 1 : -1;
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20));

    const filter: Record<string, unknown> = {};
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { company: rx }, { country: rx }, { phone: rx }];
    }
    if (status) filter.registrationStatus = status;
    if (demo) filter.demoStatus = demo;
    if (setup) filter.setupStatus = setup;
    if (account) filter.registrationStatus = account; // account active/inactive filter
    if (assigned) filter.assignedAdminEmail = assigned;

    const sortField = ["createdAt", "name", "demoDate", "registrationStatus", "setupStatus"].includes(sort)
      ? sort
      : "createdAt";

    const [items, total] = await Promise.all([
      Registration.find(filter)
        .sort({ [sortField]: dir })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-message")
        .lean() as unknown as RegistrationDoc[],
      Registration.countDocuments(filter),
    ]);

    return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json({ error: "Failed to load registrations." }, { status: 500 });
  }
}
