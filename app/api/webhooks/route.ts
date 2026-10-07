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

async function getOne(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body.id ?? body._id ?? body.webhookId;
  if (!id) return notFound();

  const conn = await connectDB();
  const doc = await conn.models.Webhook?.findById(id).lean() as Record<string, unknown> | null;
  if (!doc) return notFound();

  return NextResponse.json({ webhook: toWebhookConfig(doc) });
}

async function listActive() {
  const conn = await connectDB();
  const items = (await conn.models.Webhook?.find({ status: "enabled" })
    .select("_id name targetUrl events status lastDeliveryAt lastErrorAt failCount successCount")
    .lean() as unknown[]) as WebhookConfig[];

  return NextResponse.json({ items });
}

async function createOne(req: Request) {
  const body = await req.json().catch(() => ({}));

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const targetUrl = typeof body.targetUrl === "string" ? body.targetUrl.trim() : "";
  const eventsRaw = Array.isArray(body.events) ? body.events : [];

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
    headerToken: typeof body.headerToken === "string" && body.headerToken.trim() ? body.headerToken.trim() : "intellipro-webhook",
    secret,
    secretStatus: "active",
    events: eventList,
    status: "enabled",
    description: typeof body.description === "string" ? body.description.trim() : "",
    lastDeliveryAt: null,
    lastErrorAt: null,
    failCount: 0,
    successCount: 0,
    deliverHeaders: {},
  });

  return NextResponse.json({ ok: true, webhook: toWebhookConfig(doc) }, { status: 201 });
}

async function updateOne(req: Request) {
  const body = await req.json().catch(() => ({}));

  const id = body.id ?? body._id ?? body.webhookId;
  if (!id) return notFound();

  const conn = await connectDB();
  const doc = await conn.models.Webhook?.findById(id).lean() as Record<string, unknown> | null;
  if (!doc) return notFound();

  if (body.name !== undefined) doc.name = typeof body.name === "string" ? body.name.trim() : doc.name;
  if (body.targetUrl !== undefined) doc.targetUrl = typeof body.targetUrl === "string" ? body.targetUrl.trim() : doc.targetUrl;
  if (body.events !== undefined) {
    const eventList = Array.from(new Set(body.events.map((e: unknown) => String(e).trim()))).filter(isWebhookEvent);
    if (eventList.length === 0) {
      return NextResponse.json({ error: "events[] must contain valid Intelli Partner events" }, { status: 400 });
    }
    doc.events = eventList;
  }
  if (body.status !== undefined) {
    if (!isWebhookStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status; use enabled|disabled|paused" }, { status: 400 });
    }
    doc.status = body.status;
  }
  if (body.description !== undefined) doc.description = typeof body.description === "string" ? body.description.trim() : doc.description;

  const updated = await conn.models.Webhook?.findByIdAndUpdate({ _id: id }, { $set: doc }, { new: true, runValidators: true })
    .lean() as Record<string, unknown> | null;

  if (!updated) return NextResponse.json({ error: "Could not update" }, { status: 500 });

  return NextResponse.json({ ok: true, webhook: toWebhookConfig(updated) });
}

async function deleteOne(req: Request) {
  const body = await req.json().catch(() => ({}));

  const id = body.id ?? body._id ?? body.webhookId;
  if (!id) return notFound();

  const conn = await connectDB();
  const deleted = await conn.models.Webhook?.findOneAndDelete({ _id: id, status: "enabled" }).lean();

  if (!deleted) return notFound();

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const q = new URL(req.url, "https://example.test").searchParams;

  if (q.get("active") === "1") return listActive();
  if (q.get("disabled") === "1") {
    const conn = await connectDB();
    const items = (await conn.models.Webhook?.find({ status: { $in: ["disabled", "paused"] } })
      .select("_id name targetUrl events status lastDeliveryAt lastErrorAt failCount successCount")
      .lean() as unknown[]) as WebhookConfig[];
    return NextResponse.json({ items });
  }

  return getOne(req);
}

export async function POST(req: Request) {
  const p = new URL(req.url, "https://example.test").searchParams;
  const action = p.get("action");

  if (action === "list") return listActive();

  if (action === "get" || action === "create") return createOne(req);
  if (action === "update") return updateOne(req);
  if (action === "delete") return deleteOne(req);

  return getOne(req);
}
