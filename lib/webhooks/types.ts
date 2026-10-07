import type { WebhookEvent, WebhookStatus, WebhookSecretStatus, WebhookConfig } from "@/lib/models/Webhook";

export interface WebhookSender {
  clientRef: string;
  accountId: string;
}

export interface WebhookDelivery {
  requestId: string;
  sender: WebhookSender;
  channel: string;
  eventName: WebhookEvent;
  payload: unknown;
  receivedAt: Date;
  processedAt: Date | null;
  status: "accepted" | "rejected" | "processing" | "failed" | "done" | "retry";
  error: string | null;
  attempts: number;
  requestHeaders: Record<string, string>;
  statusCode: number | null;
}

export type WebhookEventName = WebhookEvent;
export type WebhookStatusName = WebhookStatus;
export type WebhookSecretStatusName = WebhookSecretStatus;

export interface DeliveryOutcome {
  status: WebhookStatusName;
  message: string;
  receivers: Array<{
    id: string;
    targetUrl: string;
    status: WebhookStatusName;
    successCount: number;
    failCount: number;
    lastDeliveryAt: Date | null;
    lastErrorAt: Date | null;
  }>;
}

export interface WebhookEventContext {
  event: string;
  channel: string;
  sender: {
    client_ref: string;
    account_id: string;
  };
}

export interface WebhookJob {
  id: string;
  requestId: string;
  receiverId: string;
  event: string;
  channel: string;
  clientRef: string;
  payload: unknown;
  status: "pending" | "retrying" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookSetup {
  id: string;
  name: string;
  targetUrl: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  secret: string;
  secretStatus: WebhookSecretStatus;
}

export interface WebhookDeliveryLog {
  requestId: string;
  event: string;
  channel: string;
  sender: {
    client_ref: string;
    account_id: string;
  };
  status: string;
  error: string | null;
  attempts: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string> | null;
  rawBody: string;
  receivedAt: Date;
  lastAttemptAt: Date | null;
  createdAt: Date;
}

export interface WebhookReadiness {
  syncing: boolean;
  error: string | null;
  syncedAt: Date | null;
}

export interface WebhookHealth {
  healthy: boolean;
  error: string | null;
  lastCheckedAt: Date | null;
}

export interface WebhookReplayEvent {
  eventId: string;
  requestId: string;
  webhookId: string;
  webhookName: string | null;
  payload: unknown;
  responseStatus: number | null;
  responseBody: string | null;
  attemptedAt: Date;
  result: "queued" | "retry" | "skipped" | "failed" | null;
}

export interface WebhookSubscribeOptions {
  name: string;
  targetUrl: string;
  events: WebhookEvent[];
  description?: string;
  headerToken?: string;
  deliverHeaders?: Record<string, string>;
}

export type WebhookOutboundEvent = {
  t: "webhook_event";
  ts: number;
  event: string;
  channel: string;
  sender: {
    client_ref: string;
    account_id: string;
  };
  status: string;
  error: string | null;
  requestId: string;
  webhookId?: string;
};
