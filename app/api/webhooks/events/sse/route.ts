import { NextRequest } from "next/server";
import { subscribe, type BroadcastPayload } from "@/lib/webhooks/websocket";

// This SSE route module only exposes the GET handler above. The main receiver
// imports the broadcaster directly from @/lib/webhooks/websocket, so this module
// never re-exports dispatchEvent at module scope (Next.js' route validator
// rejects unknown route exports).
