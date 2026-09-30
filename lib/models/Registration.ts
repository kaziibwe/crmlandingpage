import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

/**
 * Registration = an EternityCrm customer account created via the website.
 * This is ADMINISTRATION/ONBOARDING data only — no CRM features live here.
 */

export const REGISTRATION_STATUSES = ["PENDING", "ACTIVE", "INACTIVE"] as const;
export const DEMO_STATUSES = [
  "NOT_SCHEDULED",
  "SCHEDULED",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
] as const;
export const DEMO_ATTENDANCE = ["PENDING", "ATTENDED", "NOT_ATTENDED"] as const;
export const ACCEPTANCE_STATUSES = ["PENDING", "ACCEPTED", "DECLINED"] as const;
export const SETUP_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];
export type DemoStatus = (typeof DEMO_STATUSES)[number];
export type DemoAttendance = (typeof DEMO_ATTENDANCE)[number];
export type AcceptanceStatus = (typeof ACCEPTANCE_STATUSES)[number];
export type SetupStatus = (typeof SETUP_STATUSES)[number];

const RegistrationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" }, // e.g. "Uganda"
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    companySize: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" }, // what the customer wants to see
    registrationStatus: {
      type: String,
      enum: REGISTRATION_STATUSES,
      default: "PENDING",
      required: true,
    },

    // --- Demo ---
    demoStatus: { type: String, enum: DEMO_STATUSES, default: "NOT_SCHEDULED", required: true },
    demoDate: { type: Date, default: null }, // stored as a real Date (UTC), never a display string
    demoAttendance: { type: String, enum: DEMO_ATTENDANCE, default: "PENDING", required: true },
    demoNotes: { type: String, trim: true, default: "" },
    demoUpdatedBy: { type: String, default: null },
    demoUpdatedAt: { type: Date, default: null },

    // --- Customer decision ---
    acceptanceStatus: {
      type: String,
      enum: ACCEPTANCE_STATUSES,
      default: "PENDING",
      required: true,
    },
    acceptanceUpdatedBy: { type: String, default: null },
    acceptanceUpdatedAt: { type: Date, default: null },

    // --- Setup / onboarding ---
    setupStatus: { type: String, enum: SETUP_STATUSES, default: "NOT_STARTED", required: true },
    setupStartedAt: { type: Date, default: null },
    setupCompletedAt: { type: Date, default: null },
    setupUpdatedBy: { type: String, default: null },

    // --- Activation ---
    activatedAt: { type: Date, default: null },
    activatedBy: { type: String, default: null },
    deactivatedAt: { type: Date, default: null },
    deactivatedBy: { type: String, default: null },

    // --- Assignment / audit ---
    assignedAdminId: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    assignedAdminEmail: { type: String, default: null },

    // --- Administrative notes (audit trail: author + timestamp per note) ---
    notes: [
      {
        body: { type: String, required: true, trim: true },
        createdBy: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: "registrations" }
);

RegistrationSchema.index({ email: 1 });
RegistrationSchema.index({ registrationStatus: 1 });
RegistrationSchema.index({ demoStatus: 1, demoDate: 1 });
RegistrationSchema.index({ setupStatus: 1 });
RegistrationSchema.index({ registrationStatus: 1, setupStatus: 1 });
RegistrationSchema.index({ name: "text", email: "text", company: "text" });
RegistrationSchema.index({ "notes.createdAt": -1 });

export type RegistrationDoc = InferSchemaType<typeof RegistrationSchema>;

export const Registration: Model<RegistrationDoc> =
  (mongoose.models.Registration as Model<RegistrationDoc>) ||
  mongoose.model<RegistrationDoc>("Registration", RegistrationSchema);
