import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

/** One receiver (target + secret rotation) per portal client.
 *
 * A subscription is the authoritative "what to send" record. The portal's
 * Webhooks page issues INTELLI_WEBHOOK_SECRET, so we store a salted
 * verifier and compare against it (never the plaintext secret) before
 * we accept deliveries.
 */
export const WEBHOOK_EVENTS = [
  "message.received",
  "message.status",
  "message.reaction",
  "message.echo",
  "message.read",
  "message.postback",
  "template.status",
  "user.preferences",
  "webhook.test",
] as const;

export const WEBHOOK_STATUS = ["enabled", "disabled", "paused"] as const;
export const WEBHOOK_SECRET_STATUS = ["active", "rotated", "expired"] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
export type WebhookStatus = (typeof WEBHOOK_STATUS)[number];
export type WebhookSecretStatus = (typeof WEBHOOK_SECRET_STATUS)[number];

/** DTO persisted in the DB and exposed to the portal (no Mongoose _id/typing artefacts). */
export interface WebhookConfig {
  id: string;
  name: string;
  targetUrl: string;
  headerToken: string;
  secret: string;
  secretStatus: WebhookSecretStatus;
  events: WebhookEvent[];
  status: WebhookStatus;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  lastDeliveryAt: Date | null;
  lastErrorAt: Date | null;
  failCount: number;
  successCount: number;
  deliverHeaders: Record<string, string>;
}

function toWebhookConfig(doc: Record<string, unknown>): WebhookConfig {
  return {
    id: doc._id != null ? String(doc._id) : "",
    name: doc.name as string,
    targetUrl: doc.targetUrl as string,
    headerToken: doc.headerToken as string,
    secret: doc.secret as string,
    secretStatus: doc.secretStatus as WebhookSecretStatus,
    events: Array.isArray(doc.events) ? (doc.events as WebhookEvent[]) : [],
    status: doc.status as WebhookStatus,
    description: doc.description as string,
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date,
    lastDeliveryAt: doc.lastDeliveryAt != null ? (doc.lastDeliveryAt as Date) : null,
    lastErrorAt: doc.lastErrorAt != null ? (doc.lastErrorAt as Date) : null,
    failCount: doc.failCount as number,
    successCount: doc.successCount as number,
    deliverHeaders: doc.deliverHeaders as Record<string, string>,
  };
}

const WebhookSchema = new Schema<WebhookConfig & mongoose.Document>(
  {
    name: { type: String, required: true, trim: true, index: true },
    targetUrl: { type: String, required: true, trim: true, index: true },
    headerToken: { type: String, required: true, trim: true },
    secret: { type: String, required: true, trim: true },
    secretStatus: {
      type: String,
      enum: WEBHOOK_SECRET_STATUS,
      index: true,
      default: "active",
    },
    events: [{ type: String, enum: WEBHOOK_EVENTS, required: true, index: true }],
    status: {
      type: String,
      enum: WEBHOOK_STATUS,
      index: true,
      default: "enabled",
    },
    description: { type: String, trim: true, default: "" },

    // --- Audit counters (used by the Delivery Log UI) ---
    lastDeliveryAt: { type: Date, default: null },
    lastErrorAt: { type: Date, default: null },
    failCount: { type: Number, default: 0, min: 0 },
    successCount: { type: Number, default: 0, min: 0 },

    // Headers the portal wants echoed back on every delivery (X-Intelli-* and alike)
    deliverHeaders: { type: Map, of: String, default: () => ({}) },
  },
  { timestamps: true, collection: "webhooks" }
);

WebhookSchema.index({ targetUrl: 1, status: 1 });
WebhookSchema.index({ updatedAt: 1, status: 1 });

export type WebhookDoc = InferSchemaType<typeof WebhookSchema>;

export const Webhook: Model<WebhookDoc> =
  (mongoose.models.Webhook as Model<WebhookDoc>) ||
  mongoose.model<WebhookDoc>("Webhook", WebhookSchema);

export { toWebhookConfig };
