import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Webhook, toWebhookConfig, WEBHOOK_EVENTS, WEBHOOK_STATUS, type WebhookEvent } from "@/lib/models/Webhook";
import type { WebhookEventName } from "@/lib/webhooks/types";
import { dispatchEvent } from "@/lib/webhooks/websocket";

type ParsedBody = {
  webhookId?: string;
  idempotencyKey?: string;
  event?: string;
  channel?: string;
  payload: unknown;
};

const ALLOWED_OUTGOING = new Set<string>([
  "X-Intelli-Delivery-Id",
  "X-Intelli-Message-Id",
  "X-Intelli-Idempotency-Key",
  "X-Intelli-Channel",
  "X-Intelli-Sender-Client-Ref",
  "X-Intelli-Sender-Account-Id",
  "X-Intelli-Event",
  "Content-Type",
]);

const WEBHOOK_SECRET = (process.env.INTELLI_WEBHOOK_SECRET ?? "").trim();

function outputHeaders(headers: Headers): Headers {
  const out = new Headers();
  for (const [key, value] of headers.entries()) {
    if (ALLOWED_OUTGOING.has(key)) out.set(key, value);
  }
  return out;
}

function parseReceiverId(req: NextRequest): string | null {
  const id = req.nextUrl.searchParams.get("id") ?? req.nextUrl.searchParams.get("webhookId");
  return id ?? null;
}

async function runVerify(raw: Buffer, req: NextRequest): Promise<{ ok: boolean; webhookId: string | null }> {
  if (!WEBHOOK_SECRET) {
    console.error("[webhook] INTELLI_WEBHOOK_SECRET is not set in env.");
    return { ok: false, webhookId: null };
  }

  const incoming = req.headers.get("X-Intelli-Signature") ?? "";
  if (!incoming) return { ok: false, webhookId: null };

  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(raw.toString("utf8"))
    .digest("hex") as string;

  const a = Buffer.from(incoming, "ascii");
  const b = Buffer.from(`sha256=${expected}`, "ascii");

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, webhookId: null };
  }

  return { ok: true, webhookId: null };
}

function isAllowedEvent(event: string | undefined, channel: string | undefined): boolean {
  const eventKey = (event ?? "").toLowerCase();
  if (eventKey && !WEBHOOK_EVENTS.includes(eventKey as WebhookEvent)) return false;

  const channelKey = (channel ?? "").toLowerCase();
  if (channelKey && channelKey !== "whatsapp" && channelKey !== "instagram") return false;

  return true;
}

function makeReplayKey(eventId: string, payload: unknown): string {
  return `${eventId}:${JSON.stringify(payload)}`;
}

function parsePayloadBody(body: unknown): ParsedBody | null {
  if (body == null || typeof body !== "object") return null;

  const raw = body as Record<string, unknown>;
  const payload = raw.payload ?? raw;

  const webhookId = typeof raw.webhookId === "string" ? raw.webhookId : undefined;
  const idempotencyKey = typeof raw.idempotencyKey === "string" ? raw.idempotencyKey : undefined;
  const event = typeof raw.event === "string" ? raw.event : undefined;
  const channel = typeof raw.channel === "string" ? raw.channel : undefined;

  if (idempotencyKey && webhookId && event && payload != null) {
    return { webhookId, idempotencyKey, event, channel, payload };
  }

  return null;
}

function blankResponse(status = 202) {
  return NextResponse.json({ ok: true, status, message: "Delivered" });
}

async function processQueuedItem(eventId: string, payload: unknown, webhookId: string | null) {
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

  const jobs = await EventModel.find({ eventId }).sort({ createdAt: -1 }).limit(1);
  const job = jobs[0] as { _id: any; status: string; attempts: number } | undefined;

  if (!job) {
    await EventModel.create({
      eventId,
      idempotencyKey: makeReplayKey(eventId, payload),
      webhookId: webhookId ?? null,
      status: "queued",
      attempts: 0,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    return;
  }

  const updateJob = async (updates: Record<string, unknown>) => {
    await EventModel.updateOne({ _id: job._id }, { $set: updates } as any);
  };

  if (job.status === "queued" || job.status === "retry") {
    if (job.status === "retry" && job.attempts >= 3) {
      await updateJob({ status: "failed" });
      return;
    }

    await updateJob({
      status: "retrying",
      attempts: job.attempts + 1,
      lastError: null,
      updatedAt: new Date(),
    });
  } else if (job.status === "completed" || job.status === "failed") {
    await updateJob({
      status: "completed",
      updatedAt: new Date(),
    });
  }
}

function buildSenderHeaders(req: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of ALLOWED_OUTGOING) {
    const value = req.headers.get(key);
    if (value) out[key] = value;
  }
  return out;
}

export async function POST(req: NextRequest) {
  const rawText = await req.text();
  const raw = Buffer.from(rawText, "utf8");

  const parsed = parsePayloadBody(JSON.parse(rawText));
  if (parsed) {
    await processQueuedItem(parsed.idempotencyKey as string, parsed.payload as unknown, parsed.webhookId ?? null);
    return blankResponse();
  }

  const { ok, webhookId } = await runVerify(raw, req);

  if (!ok) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const eventName = (req.headers.get("X-Intelli-Event") ?? "webhook.test").toLowerCase() as WebhookEventName;
  const channel = req.headers.get("X-Intelli-Channel") ?? "";

  if (!isAllowedEvent(eventName, channel)) {
    return NextResponse.json({ error: "Event not subscribed to" }, { status: 400 });
  }

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

  const deliveryId =
    req.headers.get("X-Intelli-Delivery-Id") ??
    require("crypto").randomBytes(16).toString("hex") ??
    "";

  await EventModel.create({
    eventId: deliveryId as string,
    idempotencyKey: makeReplayKey(
      (req.headers.get("X-Intelli-Message-Id") ?? req.headers.get("X-Intelli-Delivery-Id") ?? "") as string,
      {}
    ),
    webhookId: webhookId ?? null,
    status: "queued",
    attempts: 0,
    lastError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  // Broadcast to SSE subscribers + DB outbox
  await dispatchEvent({
    event: eventName,
    channel,
    sender: {
      client_ref: req.headers.get("X-Intelli-Sender-Client-Ref") ?? "",
      account_id: req.headers.get("X-Intelli-Sender-Account-Id") ?? "",
    },
    receivedAt: new Date().toISOString(),
    webhookId: webhookId ?? null,
    status: "accepted",
    error: null,
    requestId: deliveryId,
  });

  return new NextResponse(
    JSON.stringify({ ok: true, status: 202, message: "Delivered" }),
    {
      status: 202,
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(
          Object.entries(buildSenderHeaders(req)).map(([k, v]) => [k, v])
        ),
      },
    }
  );
}
