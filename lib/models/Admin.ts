import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";
import { PERMISSIONS, ROLES } from "../permissions";

/**
 * Administrator accounts for the EternityCrm Administration Portal.
 * Completely separate from registered EternityCrm customers.
 */

const AdminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    // scrypt hash "salt:hash" — passwords are NEVER stored in plain text.
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "VIEWER", required: true },
    /** Explicit permission overrides on top of the role defaults. */
    permissions: { type: [String], enum: PERMISSIONS, default: [] },
    isActive: { type: Boolean, default: true, required: true },
    createdBy: { type: String, default: null }, // email of the admin who created this account
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "admins" }
);

AdminSchema.index({ email: 1 }, { unique: true });

export interface AdminDoc extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: (typeof ROLES)[number];
  permissions: string[];
  isActive: boolean;
  createdBy: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminInfer = InferSchemaType<typeof AdminSchema>;

export const Admin: Model<AdminDoc> =
  (mongoose.models.Admin as Model<AdminDoc>) || mongoose.model<AdminDoc>("Admin", AdminSchema);
