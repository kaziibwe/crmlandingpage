# Intelli Partner webhook receiver

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/webhooks/events` | Verified receiver — HMAC-SHA256 signature check, event allow-listing, DB queue + SSE broadcast. Returns `202` on success. |
| `GET`  | `/api/webhooks/events/sse` | Server-Sent Events stream of live deliveries. Connect from the admin portal (`/eternitycrmadmin/webhooks`) or any client. |
| `GET`  | `/api/webhooks/events/ws` | WebSocket contract (not yet wired to a WS server). Documents the intended upgrade path. Returns a JSON note describing the SSE fallback. |
| `GET/POST` | `/api/webhooks` | Subscription CRUD: list active, create, update, delete. |
| `GET/POST/DELETE` | `/api/webhooks/subscription` | Subscription creation / list / delete (same backing model). |

## Signature verification

The receiver reads the raw request body as a UTF-8 string and computes:

```
HMAC-SHA256(secret, rawBody)
```

It then requires the header:

```
X-Intelli-Signature: sha256=<hex>
```

If the signature does not match any enabled subscription, the receiver returns `401`.

Required headers on a valid delivery:

- `X-Intelli-Event` — must be one of the allowed events for the matched subscription.
- `X-Intelli-Channel` — must be `whatsapp` or `instagram`.

Allowed events (per subscription, stored in the Webhook document):

```
message.received, message.status, message.reaction, message.echo,
message.read, message.postback, template.status, user.preferences, webhook.test
```

## Idempotency

The receiver uses the `X-Intelli-Delivery-Id` header (or a generated one) plus the
payload fingerprint to de-duplicate replays. If the same event arrives twice, the
existing queue row is updated rather than a new one being created.

## Retry queue

Each accepted delivery creates a row in the `events` collection with status
`queued`. The async worker (not yet implemented) drains that queue and retries
failed deliveries up to 3 attempts. After 3 failures the row is marked `failed`.

## SSE live alerts

The receiver calls `dispatchEvent()` (from `lib/webhooks/websocket.ts`) after
writing the queue row. That function broadcasts to every connected SSE client
and writes the event row to the DB.

The SSE route (`/api/webhooks/events/sse`) keeps an in-memory `Set` of
subscribers (one per `EventSource` connection) and forwards every
`dispatchEvent` call to them as a `text/event-stream` frame.

Connect from the browser:

```js
const es = new EventSource(
  `/api/webhooks/events/sse?client_ref=portal-${Date.now()}&events=message.received,webhook.test`
);
es.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.t === "heartbeat") return;
  console.log("webhook event:", data);
});
```

The admin portal page (`/eternitycrmadmin/webhooks`) ships a client component
(`WebhookLiveFeed`) that does exactly this and renders a scrolling log.

## Environment variables

```bash
# .env
INTELLI_WEBHOOK_SECRET=<32-byte hex string>
```

- `INTELLI_WEBHOOK_SECRET` — the shared secret used to verify signatures.
  The portal Webhooks API generates a new secret per subscription; keep the
  DB-stored secret in sync with whatever the portal writes.
- The `.env.example` template has a placeholder for this variable.

Generate a secret once:

```bash
openssl rand -hex 32
```

## Smoke test

Run the provided script while the server is up:

```bash
bash app/api/webhooks/webhook-test.sh
```

The script:

1. Fetches the list of enabled webhook configs from `POST /api/webhooks?action=list`
2. Signs a test payload with the first config's secret
3. Sends it to `POST /api/webhooks/events`
4. Expects `202` and prints the response body

Override the webhook to use with env vars:

```bash
WEBHOOK_ID=... WEBHOOK_SECRET=... bash app/api/webhooks/webhook-test.sh
```

## Files

```
lib/models/Webhook.ts          — Webhook Mongoose model + toWebhookConfig DTO
lib/webhooks/types.ts          — shared types/interfaces
lib/webhooks/websocket.ts      — SSE subscriber store + dispatchEvent broadcaster
app/api/webhooks/route.ts      — subscription CRUD (GET/POST)
app/api/webhooks/subscription/route.ts — create/list/delete subscriptions
app/api/webhooks/events/route.ts       — verified receiver
app/api/webhooks/events/sse/route.ts  — SSE stream
app/api/webhooks/events/ws/route.ts   — WS contract (placeholder)
app/eternitycrmadmin/(portal)/webhooks/ — portal page + WebhookLiveFeed client
```

## Notes

- The SSE subscriber store is in-memory and per-process. In a multi-instance
  deployment (or behind a load balancer), each instance only sees its own
  subscribers. A real deployment would use a pub/sub bus (Redis Streams, NATS,
  etc.) instead of the in-memory broadcast. The `dispatchEvent` signature is
  already shaped for that swap — only the body of `lib/webhooks/websocket.ts`
  needs to change.
- The WS route documents the intended upgrade contract but does not yet run a
  WebSocket server; SSE is the default transport until a WS server is wired.
