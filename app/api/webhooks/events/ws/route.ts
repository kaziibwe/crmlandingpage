import { NextRequest } from "next/server";
import { subscribe, dispatchEvent, type BroadcastPayload } from "@/lib/webhooks/websocket";

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();

  // … this is a placeholder for a real WebSocket upgrade path.
  // In this codebase we route webhook events back to the admin portal via
  // Server-Sent Events (SSE) on /api/webhooks/events/sse (same /events tree),
  // because the project has no socket.io / native WebSocket transport
  // configured yet. The /events/ws route documents the intended contract:
  //
  //   Expected upgrade: GET /api/webhooks/events/ws
  //   Query params:      ?client_ref=<string>&account_id=<string>&events=message.received,webhook.test
  //   Direction:         server -> client text frames, JSON { t: "webhook_event", ... }
  //
  // SSE route (Next.js app router) is the pragmatic default without adding
  // a WebSocket server; the same BroadcastPayload type is used by both paths
  // so switching to a real WS server later is a one-file change.

  return new Response(
    JSON.stringify({
      ok: true,
      status: 200,
      upgrades: ["sse", "websocket"],
      note: "Subscribe to /api/webhooks/events/sse for live alerts until a WS server is wired.",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
