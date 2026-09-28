"use client";

import { useEffect } from "react";

/**
 * Reliable in-page anchor navigation.
 * Default anchor scrolling can misbehave with the stacked sticky deck:
 * smooth scrolling races the scroll-snap + pin watcher, so the target card
 * can end up 1-2px off (never pinned) and the click appears to do nothing.
 * This handler scrolls instantly to the exact pinned offset, nudges the
 * scroll position by 1px so the pin watcher re-evaluates, and updates the
 * URL hash without jumping.
 */
export default function AnchorNav() {
  useEffect(() => {
    const offset = () => (window.matchMedia("(min-width: 1024px)").matches ? 88 : 76);

    // Document-flow Y of an element, unaffected by sticky/transformed ancestors.
    // getBoundingClientRect() lies for sticky deck cards (returns the STUCK
    // position), which broke anchor links clicked from the footer/below-deck.
    const documentOffsetTop = (el: HTMLElement): number => {
      let y = 0;
      let node: HTMLElement | null = el;
      while (node) {
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return y;
    };

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;

      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = (hash === "#top" ? document.getElementById("top") : document.querySelector(hash)) as HTMLElement | null;
      if (!target) return;

      e.preventDefault();

      const top = documentOffsetTop(target) - offset();
      window.scrollTo({ top, behavior: "instant" as ScrollBehavior });

      // Nudge 1px so the stack pin watcher recomputes is-pinned state
      requestAnimationFrame(() => {
        window.scrollBy(0, -1);
        requestAnimationFrame(() => window.scrollBy(0, 1));
      });

      try {
        history.pushState(null, "", hash);
      } catch {}

      // Close the mobile menu if the link lives inside it
      const menu = link.closest("#mobileMenu");
      if (menu) {
        menu.classList.add("hidden");
        const btn = document.getElementById("mobileMenuBtn");
        btn?.setAttribute("aria-expanded", "false");
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
