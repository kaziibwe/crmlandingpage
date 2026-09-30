"use client";

import { useEffect, useRef } from "react";

const CHIPS: Array<[string, string]> = [
  ["fas fa-users text-emerald-500", "Leads & Accounts"],
  ["fas fa-bullhorn text-amber-500", "Campaigns"],
  ["fab fa-whatsapp text-emerald-500", "WhatsApp"],
  ["fas fa-envelope text-blue-500", "Email"],
  ["fas fa-comment-dots text-cyan-500", "SMS"],
  ["fas fa-phone text-amber-500", "Calls"],
  ["fas fa-robot text-violet-500", "AI Agents"],
  ["fas fa-chart-line text-indigo-400", "Analytics"],
  ["fas fa-spider text-orange-500", "Lead Scraper"],
  ["fas fa-book text-sky-500", "Knowledge Base"],
  ["fas fa-comments text-cyan-500", "Team Chat"],
  ["fas fa-qrcode text-rose-500", "QR Lead Capture"],
  ["fas fa-ticket text-fuchsia-500", "Event QR Tickets"],
  ["fas fa-barcode text-rose-400", "Door Check-in Scanner"],
];

export default function Marquee() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let setW = 0;
    const measure = () => {
      setW = track.children.length ? (track.children[0] as HTMLElement).getBoundingClientRect().width : 0;
    };
    const wrap = () => {
      if (setW > 0) offset = ((offset % setW) + setW) % setW;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    let offset = 0, dragging = false, moved = false, startX = 0, startOffset = 0;
    let vel = 0, lastX = 0, lastT = 0, raf: number | null = null, lastAuto = 0;
    let userHover = false;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (setW <= 0) return;
      if (dragging) {
        lastAuto = now;
      } else if (Math.abs(vel) > 0.05) {
        offset -= vel;
        vel *= 0.94;
        lastAuto = now;
      } else if (!RM && !document.hidden && !userHover && now - lastAuto > 2200) {
        offset = (offset + 0.4) % setW;
      }
      wrap();
    };

    const press = (x: number) => {
      dragging = true;
      moved = false;
      startX = lastX = x;
      startOffset = offset;
      lastT = performance.now();
      vel = 0;
      viewport.classList.add("dragging");
      if (raf == null) raf = requestAnimationFrame(tick);
    };
    const move = (x: number) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      vel = ((x - lastX) / dt) * 16;
      lastX = x;
      lastT = now;
      offset = startOffset + (startX - x);
      moved = moved || Math.abs(x - startX) > 6;
      wrap();
    };
    const release = () => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("dragging");
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      press(e.clientX);
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onMouseUp = () => release();
    const onDragStart = (e: DragEvent) => e.preventDefault();

    const onTouchStart = (e: TouchEvent) => press(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX);
    const onTouchEnd = () => release();

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      offset += e.deltaX;
      vel = 0;
      lastAuto = performance.now();
      wrap();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const step = setW / 12;
      offset += e.key === "ArrowLeft" ? -step : step;
      vel = 0;
      lastAuto = performance.now();
      wrap();
    };

    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    measure();
    window.addEventListener("resize", onResize);
    viewport.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    viewport.addEventListener("dragstart", onDragStart);
    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: true });
    viewport.addEventListener("touchend", onTouchEnd);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("keydown", onKeyDown);
    viewport.addEventListener("click", onClickCapture, true);
    viewport.addEventListener("mouseenter", onEnter);
    viewport.addEventListener("mouseleave", onLeave);

    function onResize() {
      measure();
      wrap();
    }
    function onEnter() {
      userHover = true;
    }
    function onLeave() {
      userHover = false;
    }

    raf = requestAnimationFrame(tick);

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      viewport.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      viewport.removeEventListener("dragstart", onDragStart);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("touchend", onTouchEnd);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("keydown", onKeyDown);
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("mouseenter", onEnter);
      viewport.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const set = (key: string) => (
    <div className="marquee-set" key={key}>
      {CHIPS.map(([icon, label]) => (
        <span key={label} className="chip bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 !py-2 !px-4">
          <i className={`${icon}`}></i> {label}
        </span>
      ))}
    </div>
  );

  return (
    <section className="py-10 md:py-14 border-y border-slate-100 dark:border-slate-800/70 bg-white/60 dark:bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="reveal text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-6">
          Everything your team needs to build better customer relationships
        </p>
      </div>
      <div
        className="marquee"
        ref={viewportRef}
        role="region"
        aria-label="Product capabilities — drag, scroll or use arrow keys to explore"
        tabIndex={0}
      >
        <div className="marquee-track" ref={trackRef}>
          {set("a")}
          {set("b")}
        </div>
      </div>
    </section>
  );
}
