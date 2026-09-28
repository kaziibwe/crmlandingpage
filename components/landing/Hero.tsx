"use client";

import { useEffect, useRef, useState } from "react";

interface LiveEvent {
  icon: string;
  bubble: string;
  bar: string;
  label: string;
  text: string;
  sub: string;
  log: string;
  logIcon: string;
  fx: string | null;
}

const EVENTS: LiveEvent[] = [
  { icon: "fab fa-whatsapp", bubble: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300", bar: "bg-emerald-500", label: "WhatsApp · inbound", text: "“Can you send the revised proposal today?”", sub: "Nakato Events · assigned to Aisha", log: "WhatsApp inbound · Nakato Events", logIcon: "fab fa-whatsapp text-emerald-500", fx: "conv" },
  { icon: "fas fa-envelope", bubble: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300", bar: "bg-blue-500", label: "Email · opened", text: "Proposal_v3.pdf opened by the client", sub: "Deal: Corporate event package", log: "Email opened · Proposal_v3.pdf", logIcon: "fas fa-envelope text-blue-500", fx: "conv" },
  { icon: "fas fa-comment-dots", bubble: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300", bar: "bg-cyan-500", label: "SMS · replied", text: "“Got it, reviewing now 👍”", sub: "Mugisha Logistics · thread updated", log: "SMS replied · Mugisha Logistics", logIcon: "fas fa-comment-dots text-cyan-500", fx: "conv" },
  { icon: "fas fa-phone-volume", bubble: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300", bar: "bg-amber-500", label: "Call · completed", text: "6 min · quality MOS 4.5 · notes saved", sub: "Logged to the customer timeline", log: "Call completed · 6 min · MOS 4.5", logIcon: "fas fa-phone-volume text-amber-500", fx: "conv" },
  { icon: "fas fa-robot", bubble: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300", bar: "bg-violet-500", label: "AI agent", text: "Reply drafted — awaiting human review", sub: "Human-in-the-loop enabled", log: "AI drafted a reply · review queue", logIcon: "fas fa-robot text-violet-500", fx: null },
  { icon: "fas fa-spider", bubble: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300", bar: "bg-orange-500", label: "Scraper", text: "24 new leads from Google Maps", sub: "Real estate · Kampala · merged to list", log: "Scraper +24 leads · Google Maps", logIcon: "fas fa-spider text-orange-500", fx: "lead" },
  { icon: "fas fa-qrcode", bubble: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300", bar: "bg-rose-500", label: "QR check-in", text: "New lead captured at Tech Summit", sub: "Booth B · event staff scan", log: "QR lead captured · Tech Summit", logIcon: "fas fa-qrcode text-rose-500", fx: "lead" },
  { icon: "fas fa-money-check-dollar", bubble: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300", bar: "bg-emerald-500", label: "Payment", text: "Invoice #1042 paid via link", sub: "$1,250 · receipt sent automatically", log: "Payment received · $1,250", logIcon: "fas fa-money-check-dollar text-emerald-500", fx: "pay" },
  { icon: "fas fa-chart-line", bubble: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300", bar: "bg-indigo-500", label: "Analytics", text: "Weekly pipeline report is ready", sub: "Conversion trending up week-over-week", log: "Analytics · weekly report ready", logIcon: "fas fa-chart-line text-indigo-500", fx: null },
  { icon: "fas fa-arrows-rotate", bubble: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300", bar: "bg-sky-500", label: "Delivery retry", text: "Failed WhatsApp delivered on retry", sub: "Automatic failover · no action needed", log: "Retry succeeded · WhatsApp delivered", logIcon: "fas fa-arrows-rotate text-sky-500", fx: null },
  { icon: "fas fa-bullhorn", bubble: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300", bar: "bg-amber-500", label: "Campaign", text: "Batch 3 dispatched · 120 recipients", sub: "WhatsApp template · spring promo", log: "Campaign batch 3 · 120 sent", logIcon: "fas fa-bullhorn text-amber-500", fx: null },
  { icon: "fas fa-circle-check", bubble: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", bar: "bg-slate-400", label: "Task", text: "Follow-up call scheduled for 10:00", sub: "Created from AI suggestion", log: "Task created · follow-up call", logIcon: "fas fa-circle-check text-slate-400", fx: null },
];

const INSIGHTS = [
  "Pipeline health is strong. Two deals in Negotiation haven't been contacted in 4 days — schedule follow-ups?",
  "Churn risk decreased by 12% this week — champions are re-engaging on WhatsApp and email.",
  "Forecast: closing 6 of 14 open deals lifts pipeline conversion to 43% this month.",
  "Leads from Google Maps engage 2x faster after a WhatsApp intro — 24 new leads are ready.",
  "Call quality steady at MOS 4.5 · SMS delivery at 99% this week. No action needed.",
  "Campaign batch 3 finished: 118 delivered, 2 auto-retried, 41 replies logged to timelines.",
];

type ToastSlot = "tl" | "tr" | "ml" | "mr" | "bl" | "br";
const SLOT_CLASS: Record<ToastSlot, string> = {
  tl: "slot-tl", tr: "slot-tr", ml: "slot-ml", mr: "slot-mr", bl: "slot-bl", br: "slot-br",
};
const SLOT_ORDER: ToastSlot[] = ["tl", "tr", "mr", "bl", "ml", "br"];

interface LogEntry {
  id: number;
  icon: string;
  text: string;
  time: string;
}

let logId = 0;

export default function Hero() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [toasts, setToasts] = useState<Record<ToastSlot, LiveEvent | null>>({
    tl: null, tr: null, ml: null, mr: null, bl: null, br: null,
  });
  const [activeSlots, setActiveSlots] = useState<Record<ToastSlot, boolean>>({
    tl: false, tr: false, ml: false, mr: false, bl: false, br: false,
  });
  const [log, setLog] = useState<LogEntry[]>([
    { id: logId++, icon: "fab fa-whatsapp text-emerald-500", text: "WhatsApp inbound · “Can you send the revised proposal?”", time: "09:41" },
    { id: logId++, icon: "fas fa-envelope text-blue-500", text: "Email opened · Proposal_v3.pdf", time: "09:38" },
    { id: logId++, icon: "fas fa-phone-volume text-amber-500", text: "Call completed · 6 min · MOS 4.5", time: "09:31" },
  ]);
  const [counters, setCounters] = useState({ leads: 128, conv: 1432, pipe: 84200 });
  const [bellCount, setBellCount] = useState<number | null>(null);

  const [insight, setInsight] = useState(
    "Pipeline health is strong. Two deals in Negotiation haven't been contacted in 4 days — schedule follow-ups?"
  );
  const [streamLabel, setStreamLabel] = useState("streaming");

  // ---------- Hero live simulation ----------
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let evIdx = 0, slotIdx = 0, paused = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    const hideTimers = new Map<ToastSlot, ReturnType<typeof setTimeout>>();

    const stamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const applyEvent = (ev: LiveEvent, slotKey?: ToastSlot) => {
      const key = slotKey ?? SLOT_ORDER[slotIdx++ % SLOT_ORDER.length];
      setToasts((prev) => ({ ...prev, [key]: ev }));
      setActiveSlots((prev) => ({ ...prev, [key]: true }));
      const prevTimer = hideTimers.get(key);
      if (prevTimer) clearTimeout(prevTimer);
      const t = setTimeout(() => {
        setActiveSlots((prev) => ({ ...prev, [key]: false }));
        hideTimers.delete(key);
      }, 4300);
      hideTimers.set(key, t);

      setLog((prev) =>
        [{ id: logId++, icon: ev.logIcon, text: ev.log, time: stamp() }, ...prev].slice(0, 4)
      );

      if (ev.fx === "conv") setCounters((c) => ({ ...c, conv: c.conv + 1 }));
      else if (ev.fx === "lead") setCounters((c) => ({ ...c, leads: c.leads + 2 + Math.floor(Math.random() * 9) }));
      else if (ev.fx === "pay") setCounters((c) => ({ ...c, pipe: c.pipe + 500 + Math.floor(Math.random() * 2500) }));

      setBellCount((b) => (b === null ? 1 : Math.min(b + 1, 10)));
    };

    const tick = () => {
      if (document.hidden || paused) return;
      applyEvent(EVENTS[evIdx++ % EVENTS.length]);
    };

    if (RM || !("IntersectionObserver" in window)) {
      // Static fallback: a few notifications, no motion
      applyEvent(EVENTS[0], "tl");
      applyEvent(EVENTS[1], "tr");
      applyEvent(EVENTS[7], "br");
      return;
    }

    // Pause while the visitor inspects the stage, or when the tab is hidden
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mouseleave", onLeave);
    stage.addEventListener("focusin", onEnter);
    stage.addEventListener("focusout", onLeave);

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      tick();
      interval = setInterval(tick, 3000);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(stage);

    return () => {
      io.disconnect();
      if (interval) clearInterval(interval);
      hideTimers.forEach((t) => clearTimeout(t));
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mouseleave", onLeave);
      stage.removeEventListener("focusin", onEnter);
      stage.removeEventListener("focusout", onLeave);
    };
  }, []);

  // ---------- AI insight typewriter ----------
  useEffect(() => {
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0, paused = false, started = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let card: HTMLElement | null = null;

    const typeNext = () => {
      const msg = INSIGHTS[i++ % INSIGHTS.length];
      let c = 0;
      setStreamLabel("streaming");
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (document.hidden || paused) return;
        c += 1;
        setInsight(msg.slice(0, c));
        if (c >= msg.length) {
          if (timer) clearInterval(timer);
          timer = null;
          setStreamLabel("updated");
          timeout = setTimeout(typeNext, 1600);
        }
      }, 16);
    };

    if (RM || !("IntersectionObserver" in window)) {
      const iv = setInterval(() => {
        if (!document.hidden) {
          i += 1;
          setInsight(INSIGHTS[i % INSIGHTS.length]);
        }
      }, 8000);
      return () => clearInterval(iv);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !started) {
            started = true;
            typeNext();
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    const raf = requestAnimationFrame(() => {
      card = document.getElementById("aiInsightCard");
      if (card) {
        const enter = () => { paused = true; };
        const leave = () => { paused = false; };
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        io.observe(card);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      if (timer) clearInterval(timer);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <header id="top" className="relative pt-32 md:pt-44 pb-16 md:pb-24 px-4 sm:px-6 overflow-hidden">
      <div className="glow w-[520px] h-[520px] bg-blue-400/40 dark:bg-blue-600/30 -top-40 -left-40"></div>
      <div className="glow w-[420px] h-[420px] bg-violet-400/35 dark:bg-violet-600/25 top-10 right-[-120px]"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
          <div className="reveal">
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
              <i className="fas fa-infinity"></i> Believe in endless connections
            </p>
          </div>
          <h1 className="reveal text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] mt-6" data-delay="1">
            One CRM for every<br className="hidden sm:block" />
            <span className="text-gradient">customer conversation.</span>
          </h1>
          <p className="reveal text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed mt-6 max-w-2xl mx-auto lg:mx-0" data-delay="2">
            EternityCRM brings leads, sales pipelines, campaigns, and every WhatsApp, email, SMS, and call into one intelligent workspace — with AI agents working alongside your team.
          </p>
          <div className="reveal flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 mt-9" data-delay="3">
            <a href="#demo" className="btn-primary w-full sm:w-auto">Get started</a>
            <a href="#demo" className="btn-secondary w-full sm:w-auto"><i className="fas fa-calendar-check text-blue-500"></i> Book a demo</a>
          </div>
          <p className="reveal text-xs text-slate-400 dark:text-slate-500 mt-5" data-delay="3">Free to explore · No credit card required · Setup in minutes</p>
        </div>

        {/* ===== Product mockup (pure CSS, no stock imagery) ===== */}
        <div className="reveal mt-14 md:mt-20 relative" data-delay="2">
          <div className="absolute inset-x-8 -top-6 h-40 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-blue-500/20 blur-3xl rounded-full"></div>
          <div className="relative max-w-5xl mx-auto" id="heroStage" ref={stageRef}>
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <span className="pulse-ring"></span>
              <span className="pulse-ring"></span>
              <span className="pulse-ring"></span>
            </div>
            <div className="mockup relative z-10">
              {/* window chrome */}
              <div className="mockup-bar">
                <span className="mockup-dot bg-rose-400"></span>
                <span className="mockup-dot bg-amber-400"></span>
                <span className="mockup-dot bg-emerald-400"></span>
                <img src="/logo.png" alt="" className="w-6 h-6 rounded-lg object-contain shadow-sm ml-2 shrink-0" />
                <div className="flex-1 min-w-0 max-w-xs">
                  <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-slate-400 flex items-center gap-2">
                    <i className="fas fa-lock text-[9px]"></i> <span className="truncate">app.eternitycrm.com/dashboard</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="relative w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <i className="fas fa-bell text-[11px] text-slate-500 dark:text-slate-400"></i>
                    {bellCount !== null && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                        {bellCount > 9 ? "9+" : String(bellCount)}
                      </span>
                    )}
                  </span>
                  <span className="chip bg-emerald-50 text-emerald-600 border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70"><i className="fas fa-circle text-[7px] animate-pulse"></i> Live</span>
                </div>
              </div>
              <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[180px_1fr]">
                {/* mini sidebar */}
                <div className="border-r border-slate-100 dark:border-slate-800 p-2.5 sm:p-3 space-y-1 bg-slate-50/60 dark:bg-slate-950/40">
                  <div className="hidden sm:flex items-center gap-2 px-2.5 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <img src="/logo.png" alt="" className="w-6 h-6 rounded-lg object-contain shadow-sm" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">Eternity<span className="text-blue-600 dark:text-blue-400">CRM</span></span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                    <i className="fas fa-tachometer-alt"></i> Dashboard
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-500 dark:text-slate-400 text-xs">
                    <i className="fas fa-users text-emerald-500"></i> Customers
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-500 dark:text-slate-400 text-xs">
                    <i className="fas fa-bullhorn text-amber-500"></i> Campaigns
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-500 dark:text-slate-400 text-xs">
                    <i className="fas fa-chart-line text-indigo-400"></i> AI Analytics
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-500 dark:text-slate-400 text-xs">
                    <i className="fas fa-comments text-cyan-500"></i> Team Chat
                  </div>
                  <div className="sm:hidden flex flex-col items-center gap-3 py-2 text-slate-400 text-xs">
                    <i className="fas fa-tachometer-alt text-blue-500"></i><i className="fas fa-users"></i><i className="fas fa-bullhorn"></i><i className="fas fa-chart-line"></i><i className="fas fa-comments"></i>
                  </div>
                </div>
                {/* main panel */}
                <div className="p-3.5 sm:p-5">
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="card !rounded-xl p-3 sm:p-4">
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Open leads</p>
                      <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">{fmt(counters.leads)}</p>
                      <p className="text-[9px] text-emerald-500 font-semibold mt-1"><i className="fas fa-arrow-trend-up"></i> live sync</p>
                    </div>
                    <div className="card !rounded-xl p-3 sm:p-4">
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Pipeline value</p>
                      <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">${(counters.pipe / 1000).toFixed(1)}k</p>
                      <p className="text-[9px] text-blue-500 font-semibold mt-1"><i className="fas fa-robot"></i> AI forecast</p>
                    </div>
                    <div className="card !rounded-xl p-3 sm:p-4">
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Conversations</p>
                      <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">{fmt(counters.conv)}</p>
                      <p className="text-[9px] text-violet-500 font-semibold mt-1"><i className="fas fa-tower-broadcast"></i> 4 channels</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 sm:gap-3 mt-3">
                    {/* pipeline mini */}
                    <div className="card !rounded-xl p-3 sm:p-4 md:col-span-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Sales pipeline</p>
                        <span className="text-[9px] text-slate-400">Qualification → Won</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] w-16 text-slate-400 shrink-0">Qualification</span>
                          <div className="h-2 rounded-full bg-blue-500/90" style={{ width: "62%" }}></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] w-16 text-slate-400 shrink-0">Proposal</span>
                          <div className="h-2 rounded-full bg-violet-500/90" style={{ width: "45%" }}></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] w-16 text-slate-400 shrink-0">Negotiation</span>
                          <div className="h-2 rounded-full bg-amber-500/90" style={{ width: "30%" }}></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] w-16 text-slate-400 shrink-0">Closed Won</span>
                          <div className="h-2 rounded-full bg-emerald-500/90" style={{ width: "18%" }}></div>
                        </div>
                      </div>
                    </div>
                    {/* AI insight */}
                    <div className="card !rounded-xl p-3 sm:p-4 md:col-span-2 bg-gradient-to-br from-blue-50/80 to-violet-50/80 dark:from-blue-950/40 dark:to-violet-950/40 !border-blue-100 dark:!border-blue-900/50" id="aiInsightCard">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center"><i className="fas fa-microchip text-white text-[10px]"></i></span>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">AI insight</p>
                        <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="stream-label">{streamLabel}</span>
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 min-h-[2.9em]">
                        {insight}
                        <span className="type-cursor" aria-hidden="true"></span>
                      </p>
                      <div className="flex gap-1.5 mt-2.5">
                        <span className="text-[9px] font-semibold text-white bg-blue-600 rounded-md px-2 py-1">Schedule</span>
                        <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1">Later</span>
                      </div>
                    </div>
                  </div>

                  {/* live activity feed (simulated) */}
                  <div className="card !rounded-xl p-3 sm:p-4 mt-2.5 sm:mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Live activity</p>
                      </div>
                      <span className="text-[9px] text-slate-400">All channels · simulated feed</span>
                    </div>
                    <ul className="mt-2.5 space-y-1.5">
                      {log.map((entry) => (
                        <li key={entry.id} className="log-line on">
                          <i className={entry.icon}></i>
                          <span>{entry.text}</span>
                          <span className="log-time">{entry.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* toast notifications surfacing from every direction (simulated) */}
            {(Object.keys(SLOT_CLASS) as ToastSlot[]).map((slot) => {
              const ev = toasts[slot];
              const on = activeSlots[slot];
              return (
                <div key={slot} className={`toast-slot ${SLOT_CLASS[slot]}`} aria-hidden="true">
                  <div className={`toast-card ${on ? "on" : ""}`}>
                    <span className={`toast-bar ${ev?.bar ?? "bg-blue-500"}`}></span>
                    <span className={`toast-icon ${ev?.bubble ?? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300"}`}>
                      <i className={ev?.icon ?? "fas fa-envelope"}></i>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="toast-label">{ev?.label ?? "…"}</p>
                        <span className="toast-time">{ev ? "now" : ""}</span>
                      </div>
                      <p className="toast-text">{ev?.text ?? ""}</p>
                      <p className="toast-sub">{ev?.sub ?? ""}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
