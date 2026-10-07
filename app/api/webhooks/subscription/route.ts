import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Webhook, toWebhookConfig, WEBHOOK_EVENTS, WEBHOOK_STATUS, type WebhookConfig, type WebhookEvent, type WebhookStatus } from "@/lib/models/Webhook";

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

function isWebhookEvent(value: unknown): value is WebhookEvent {
  return typeof value === "string" && WEBHOOK_EVENTS.includes(value as WebhookEvent);
}

function isWebhookStatus(value: unknown): value is WebhookStatus {
  return typeof value === "string" && WEBHOOK_STATUS.includes(value as WebhookStatus);
}

async function createSubscription(req: Request) {
  const body = await req.json().catch(() => ({}));

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const targetUrl = typeof body.targetUrl === "string" ? body.targetUrl.trim() : "";
  const eventsRaw = Array.isArray(body.events) ? body.events : [];
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const headerToken = typeof body.headerToken === "string" ? body.headerToken.trim() : "intellipro-webhook";
  const deliverHeaders = body.deliverHeaders ?? {};

  if (!name || !targetUrl || eventsRaw.length === 0) {
    return NextResponse.json(
      { error: "name, targetUrl and events[] are required" },
      { status: 400 }
    );
  }

  const conn = await connectDB();
  const eventList = Array.from(new Set(eventsRaw.map((e: unknown) => String(e).trim()))).filter(isWebhookEvent);
  if (eventList.length === 0) {
    return NextResponse.json({ error: "events[] must contain valid Intelli Partner events" }, { status: 400 });
  }

  const existing = await conn.models.Webhook?.findOne({ targetUrl, status: "enabled" }).lean() as Record<string, unknown> | null;
  const secret = existing?.secret ?? require("crypto").randomBytes(32).toString("hex");

  const doc = await conn.models.Webhook?.create({
    name,
    targetUrl,
    headerToken,
    secret,
    secretStatus: "active",
    events: eventList,
    status: "enabled",
    description,
    lastDeliveryAt: null,
    lastErrorAt: null,
    failCount: 0,
    successCount: 0,
    deliverHeaders: Object.entries(deliverHeaders).reduce<Record<string, string>>((acc, [k, v]) => {
      if (typeof v === "string" && v) acc[k] = v;
      return acc;
    }, {}),
  });

  return NextResponse.json({ ok: true, webhook: toWebhookConfig(doc) }, { status: 201 });
}

async function listSubscriptions(req: Request) {
  const q = new URL(req.url, "https://example.test").searchParams;
  const status = q.get("status");

  const conn = await connectDB();
  const filter: Record<string, unknown> = status
    ? { status: { $in: Array.isArray(status) ? status : [status] } }
    : {};

  const items = (await conn.models.Webhook?.find(filter)
    .select("_id name targetUrl events status lastDeliveryAt lastErrorAt failCount successCount")
    .lean() as unknown[]) as WebhookConfig[];

  return NextResponse.json({ items });
}

export async function GET(req: Request) {
  return listSubscriptions(req);
}

export async function POST(req: Request) {
  return createSubscription(req);
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));

  const id = body.id ?? body._id ?? body.webhookId;
  if (!id) return notFound();

  const conn = await connectDB();
  const deleted = await conn.models.Webhook?.findOneAndDelete({ _id: id, status: "enabled" }).lean();

  if (!deleted) return notFound();

  return NextResponse.json({ ok: true });
}
