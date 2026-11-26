"use client";

import { useEffect, useRef, type ReactNode } from "react";

function largeViewportHeight() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none;";
  document.body.append(probe);
  const { height } = probe.getBoundingClientRect();
  probe.remove();
  return height || window.innerHeight;
}

/**
 * Port of the reference site's ScrollOverHero: the hero section holds still
 * (scrolling only as far as its heading overflows the viewport) while
 * `children` rise up over it from below on a fixed layer.
 */
export function ScrollOverHero({
  hero,
  children,
  anchorId,
}: {
  hero: ReactNode;
  children: ReactNode;
  /** Id for an anchor at the scroll position where the overlay has fully risen into view. */
  anchorId?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const heroEl = heroRef.current;
    const track = trackRef.current;
    if (!wrap || !heroEl || !track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wrap.dataset.static = "true";
      return;
    }

    let vh = 0;
    let vw = 0;
    let start = 0;
    let travel = 0;
    let heroShare = 0;

    const apply = () => {
      if (travel <= 0) return;
      const c = Math.min(Math.max(window.scrollY - start, 0), travel);
      heroEl.style.transform = `translate3d(0, ${c * (1 - heroShare)}px, 0)`;
      track.style.transform = `translate3d(0, ${vh - c}px, 0)`;
    };

    const measure = () => {
      if (vh === 0 || window.innerWidth !== vw) {
        vh = largeViewportHeight();
        vw = window.innerWidth;
      }
      start = wrap.getBoundingClientRect().top + window.scrollY;
      const heading = heroEl.querySelector("h1, h2");
      const overflow = Math.max(
        (heading
          ? heading.getBoundingClientRect().bottom - heroEl.getBoundingClientRect().top
          : vh) - vh,
        0,
      );
      const first = track.firstElementChild;
      const pad = first ? Number.parseFloat(getComputedStyle(first).paddingBottom) || 0 : 0;
      const content = track.getBoundingClientRect().height - pad;
      travel = vh + content;
      heroShare = travel > 0 ? overflow / travel : 0;
      wrap.style.height = `${travel + vh}px`;
      apply();
    };

    measure();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(heroEl);
    ro.observe(track);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      wrap.style.height = "";
      heroEl.style.transform = "";
      track.style.transform = "";
    };
  }, []);

  return (
    <div ref={wrapRef} className="scroll-over">
      {anchorId && <span id={anchorId} className="scroll-over-anchor" aria-hidden="true" />}
      <div ref={heroRef} className="scroll-over-hero">
        {hero}
      </div>
      <div className="scroll-over-layer">
        <div ref={trackRef} className="scroll-over-track">
          {children}
        </div>
      </div>
    </div>
  );
}
