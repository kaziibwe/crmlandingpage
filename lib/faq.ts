/**
 * Landing-page FAQ. Single source of truth: rendered in the visible FAQ
 * section AND serialized into FAQPage JSON-LD — they must never diverge.
 */
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What is EternityCrm?",
    a: "EternityCrm is an AI-powered CRM that unifies your leads, sales pipeline, campaigns, and every customer conversation — WhatsApp, email, SMS, and calls — into one intelligent workspace, with AI agents working alongside your team.",
  },
  {
    q: "Which messaging channels does EternityCrm support?",
    a: "WhatsApp, email, SMS, and voice calls are all built in and unified per customer. Inbound and outbound messages from every channel land on the same customer timeline, so your team always has the full conversation in one place.",
  },
  {
    q: "How does the AI work inside the CRM?",
    a: "AI drafts and refines your replies, scores lead sentiment, summarizes long conversation histories, and can run campaign follow-ups automatically — from lead capture to follow-up, on autopilot. You stay in control: every AI action is logged on the customer record.",
  },
  {
    q: "Can I run campaigns across multiple channels?",
    a: "Yes. Build a campaign once and deliver it over WhatsApp, SMS, or email with automatic channel fallback — if one channel fails or is unavailable, the next configured channel takes over so your message still gets through.",
  },
  {
    q: "Does EternityCrm include a sales pipeline?",
    a: "Yes. Track leads, accounts, and opportunities through customizable pipeline stages with due-date follow-ups, activity feeds, and AI-suggested next steps so your team always knows what happens next.",
  },
  {
    q: "Is my data secure?",
    a: "EternityCrm uses role-based access control with granular permissions, session-based authentication, per-record visibility scoping, and full auditability — stage history, decision logs, and a cross-entity activity feed.",
  },
  {
    q: "Can EternityCrm handle event registration and door check-in?",
    a: "Yes. Invite guests through a campaign, collect payments with built-in payment links, and every guest receives a QR ticket — paid or free. At the venue, staff scan tickets with the built-in door check-in scanner for fast, verified entry and live attendance counts.",
  },
  {
    q: "How do I get started?",
    a: "Book a demo or start exploring free — no credit card required. Setup takes minutes: connect your channels, import your leads, and your AI copilot is ready to work alongside your team.",
  },
];
