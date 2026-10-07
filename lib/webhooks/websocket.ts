import type { Readable } from "node:stream";
import type { WebhookEventName, WebhookDelivery } from "./types";
import { connectDB } from "@/lib/mongodb";
import { toWebhookConfig, type WebhookConfig } from "@/lib/models/Webhook";

// ---------------------------------------------------------------------------
// In-memory event store + emitter (server-side only; re-created on each
// fast-refresh in dev, intentional — the real broadcast target is the
// WebSocket route below, which holds the live connections).
// ---------------------------------------------------------------------------

type Subscriber = {
  id: string;
  clientRef?: string;
  ref?: string;
  events?: Set<string>;
  send: (data: unknown) => void;
};

const subscribers = new Set<Subscriber>();
let nextSubId = 1;

export function subscribe(sub: Omit<Subscriber, "id"> & { send: (data: unknown) => void }): () => void {
  const s: Subscriber = { ...sub, id: `sub-${nextSubId++}` };
  subscribers.add(s);
  return () => {
    subscribers.delete(s);
  };
}

export function broadcast(data: unknown): void {
  for (const s of subscribers) {
    try {
      s.send(data);
    } catch {
      // best-effort broadcast — never crash the sender
    }
  }
}

// ---------------------------------------------------------------------------
// Dispatch an incoming webhook delivery to interested WebSocket subscribers
// AND write an event record to the DB (idempotency handled in the receiver
// route; this is the "notify + queue" side-effect).
// ---------------------------------------------------------------------------

export interface BroadcastPayload {
  event: string;
  channel: string;
  sender: {
    client_ref: string;
    account_id: string;
  };
  receivedAt: string;
  webhookId?: string;
  status: "accepted" | "rejected" | "processing" | "failed" | "done" | "retry";
  error: string | null;
  requestId: string;
}

export async function dispatchEvent(p: BroadcastPayload): Promise<void> {
  // 1) write the event to the DB so the Delivery Log UI has a source of truth
  try {
    const conn = await connectDB();
    const EventModel = (conn.models.Event as any) || (conn.model("Event", {
      eventId: String,
      idempotencyKey: String,
      webhookId: String,
      status: String,
      attempts: Number,
      lastError: String,
      createdAt: Date,
      updatedAt: Date,
    } as any) as any);

    await EventModel.create({
      eventId: p.requestId,
      idempotencyKey: p.requestId,
      webhookId: p.webhookId ?? null,
      status: p.status,
      attempts: 0,
      lastError: p.error,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  } catch {
    // DB write should not prevent broadcast
  }

  // 2) broadcast to in-memory subscribers + WS route handles its own connections
  const payload: unknown = {
    t: "webhook_event",
    ts: Date.now(),
    event: p.event,
    channel: p.channel,
    sender: p.sender,
    status: p.status,
    error: p.error,
    requestId: p.requestId,
    webhookId: p.webhookId,
  };

  broadcast(payload);
}
