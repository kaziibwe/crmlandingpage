import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

/** One row per document-number-extractor download event. */
const ToolUsageSchema = new Schema(
  {
    toolId: { type: String, required: true, index: true }, // e.g. "document-number-extractor"
    toolName: { type: String, required: true }, // human label for this tool
    browserSessionId: { type: String, required: true, index: true }, // per-browser session; reset on tab clear
    ip: { type: String, default: null }, // best-effort; privacy-safe, optional
    downloadCount: { type: Number, required: true, default: 0 }, // numbers in this download
    validCount: { type: Number, required: true, default: 0 }, // numbers submitted
    rejectedCount: { type: Number, required: true, default: 0 }, // numbers rejected by the extractor
    duplicateCount: { type: Number, required: true, default: 0 }, // duplicates removed
    leadCount: { type: Number, required: true, default: 0 }, // numbers matched to a registered lead (admin pulls via email)
    status: {
      type: String,
      enum: ["idle", "uploading", "reading", "extracting", "validating", "deduplicating", "ready", "error", "done"],
      default: "idle",
    },
    device: { type: String, default: null }, // ua fragment
    userAgent: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, collection: "tool_usage" }
);

ToolUsageSchema.index({ toolId: 1, createdAt: -1 });

export interface ToolUsageDoc extends mongoose.Document {
  toolId: string;
  toolName: string;
  browserSessionId: string;
  ip: string | null;
  downloadCount: number;
  validCount: number;
  rejectedCount: number;
  duplicateCount: number;
  leadCount: number;
  status: string;
  device: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export const ToolUsage: Model<ToolUsageDoc> =
  (mongoose.models.ToolUsage as Model<ToolUsageDoc>) ||
  mongoose.model<ToolUsageDoc>("ToolUsage", ToolUsageSchema);
