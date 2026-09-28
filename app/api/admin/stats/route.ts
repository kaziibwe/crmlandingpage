import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration, type RegistrationDoc } from "@/lib/models/Registration";
import { requirePermission } from "@/lib/auth";
import type { PipelineStage } from "mongoose";

/** GET /api/admin/stats — onboarding metrics ONLY (no CRM analytics). */
export async function GET() {
  const admin = await requirePermission("VIEW_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();

    const [total, pending, active, inactive, demoPending, demoScheduled, demoCompleted, setupPending, setupCompleted] =
      await Promise.all([
        Registration.countDocuments({}),
        Registration.countDocuments({ registrationStatus: "PENDING" }),
        Registration.countDocuments({ registrationStatus: "ACTIVE" }),
        Registration.countDocuments({ registrationStatus: "INACTIVE" }),
        Registration.countDocuments({ demoStatus: { $in: ["NOT_SCHEDULED", "MISSED", "CANCELLED"] } }),
        Registration.countDocuments({ demoStatus: "SCHEDULED" }),
        Registration.countDocuments({ demoStatus: "COMPLETED" }),
        Registration.countDocuments({ setupStatus: { $ne: "COMPLETED" } }),
        Registration.countDocuments({ setupStatus: "COMPLETED" }),
      ]);

    const upcoming = (await Registration.aggregate([
      { $match: { demoStatus: "SCHEDULED", demoDate: { $gte: new Date() } } },
      { $sort: { demoDate: 1 } },
      { $limit: 8 },
      {
        $project: {
          name: 1,
          company: 1,
          demoDate: 1,
          demoStatus: 1,
          assignedAdminEmail: 1,
        },
      },
    ] as PipelineStage[]) ) as unknown as RegistrationDoc[];

    const recent = (await Registration.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("name company email createdAt demoStatus setupStatus registrationStatus")
      .lean()) as unknown as RegistrationDoc[];

    return NextResponse.json({
      stats: {
        total,
        pending,
        active,
        inactive,
        demoPending,
        demoScheduled,
        demoCompleted,
        setupPending,
        setupCompleted,
      },
      upcoming,
      recent,
    });
  } catch (err) {
    console.error("[admin/stats GET]", err);
    return NextResponse.json({ error: "Failed to load statistics." }, { status: 500 });
  }
}
