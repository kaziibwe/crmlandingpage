"use client";

import { useEffect } from "react";

/**
 * Port of the stacked-deck scroll watcher: toggles `.is-pinned` on each
 * `.stack > section` when its top aligns with the stack offset, which
 * enables inner scrolling via CSS.
 */
export default function StackDeck() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".stack > section"));
    if (!cards.length) return;

    const compute = () => {
      const top = window.matchMedia("(min-width: 1024px)").matches ? 88 : 76;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        // Tolerance of a few px absorbs scroll-snap alignment differences
        // (proximity snap can rest the card a few px from the exact offset).
        card.classList.toggle("is-pinned", Math.abs(r.top - top) < 8);
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        compute();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return null;
}
