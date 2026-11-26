"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/*
 * A CSS 3D port of the reference site's WebGL letter: a tri-folded sheet that
 * opens as it scrolls toward the middle of the screen. The top third stays put;
 * the middle third is hinged under it and carries the bottom third, folded in
 * between. Opening reverses the folds: the outer fold first, then the inner.
 */

// Crease positions from the original shader: the top third is a touch larger,
// so a sliver of it peeks out above the folded flap.
const TOP_H = 1 / 3 + 0.005;
const PANEL_H = (1 - TOP_H) / 2;

const OUTER_OPEN_BY = 0.55;
const INNER_OPEN_FROM = 0.45;

// Spring that eases the fold toward its scroll target (stiffness, damping, mass).
const SPRING = { k: 70, c: 20, m: 1 };

// Lighting, matching the shader so a flat sheet resolves to full brightness.
const LIGHT = normalize([-0.3, 0.5, 0.85]);
const HALF = normalize([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);
const AMBIENT = 0.84;
const DIFFUSE = 0.2;
const FLAT = AMBIENT + DIFFUSE * LIGHT[2];

// Camera distance in sheet heights, from the original's 45° camera with a 0.4 margin.
const CAMERA = (1 + 2 * 0.4) / (2 * Math.tan((45 * Math.PI) / 360));

function normalize(v: number[]) {
  const len = Math.hypot(v[0], v[1], v[2]);
  return v.map((x) => x / len);
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smoothstep = (x: number) => x * x * (3 - 2 * x);

/** Brightness veil for a panel tilted `angle` radians about its crease. */
function shade(angle: number) {
  let ny = Math.sin(angle);
  let nz = Math.cos(angle);
  if (nz < 0) {
    ny = -ny;
    nz = -nz;
  }
  const diffuse = Math.max(ny * LIGHT[1] + nz * LIGHT[2], 0);
  const sheen = Math.max(ny * HALF[1] + nz * HALF[2], 0) ** 22 * 0.04 * (1 - nz);
  const rel = (AMBIENT + diffuse * DIFFUSE + sheen) / FLAT;
  return { dark: Math.max(0, 1 - rel), light: Math.max(0, rel - 1) };
}

function setShade(el: HTMLElement | null, angle: number) {
  if (!el) return;
  const { dark, light } = shade(angle);
  el.style.setProperty("--dark", dark.toFixed(4));
  el.style.setProperty("--light", light.toFixed(4));
}

function largeViewportHeight() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none;";
  document.body.append(probe);
  const { height } = probe.getBoundingClientRect();
  probe.remove();
  return height || window.innerHeight;
}

function faceStyle(offset: number, height: number): CSSProperties {
  return {
    backgroundImage: "var(--letter)",
    backgroundSize: `100% ${(100 / height).toFixed(4)}%`,
    backgroundPosition: `0 ${height >= 1 ? 0 : ((offset / (1 - height)) * 100).toFixed(4)}%`,
  };
}

export function LetterFold({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    const mid = midRef.current;
    const bot = botRef.current;
    if (!frame || !stage || !sheet || !mid || !bot) return;

    const render = (fold: number) => {
      const open = 1 - fold;
      const outerOpen = smoothstep(clamp01(open / OUTER_OPEN_BY));
      const innerOpen = smoothstep(clamp01((open - INNER_OPEN_FROM) / (1 - INNER_OPEN_FROM)));
      const outer = (1 - outerOpen) * Math.PI;
      const inner = (1 - innerOpen) * Math.PI;
      // Depth gap between stacked layers so they never z-fight; gone once flat.
      const stack = 3 * fold;

      sheet.style.transform = `rotateX(${-0.12 * fold}rad) rotateZ(${-0.015 * fold}rad)`;
      mid.style.transform = `rotateX(${outer}rad) translateZ(${-stack}px)`;
      bot.style.transform = `rotateX(${inner}rad) translateZ(${-stack / 2}px)`;

      setShade(topRef.current, 0);
      setShade(mid, outer);
      setShade(bot, outer + inner);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(0);
      return;
    }

    let vh = largeViewportHeight();
    let vw = window.innerWidth;
    let target = 1;
    let x = 1;
    let v = 0;
    let raf = 0;
    let last = 0;

    const layout = () => {
      if (window.innerWidth !== vw) {
        vh = largeViewportHeight();
        vw = window.innerWidth;
      }
      stage.style.perspective = `${CAMERA * frame.clientHeight}px`;
    };

    const readTarget = () => {
      const r = frame.getBoundingClientRect();
      const centre = r.top + r.height / 2;
      target = 1 - clamp01((1.05 * vh - centre) / (0.5 * vh));
    };

    const tick = (now: number) => {
      let dt = Math.min((now - last) / 1000, 0.064);
      last = now;
      while (dt > 0) {
        const step = Math.min(dt, 1 / 120);
        const a = (-SPRING.k * (x - target) - SPRING.c * v) / SPRING.m;
        v += a * step;
        x += v * step;
        dt -= step;
      }
      if (Math.abs(x - target) < 1e-4 && Math.abs(v) < 1e-4) {
        x = target;
        v = 0;
        render(x);
        raf = 0;
        return;
      }
      render(x);
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      readTarget();
      if (raf === 0 && (x !== target || v !== 0)) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    layout();
    readTarget();
    x = target;
    render(x);

    const onResize = () => {
      layout();
      wake();
    };
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="letter-frame"
      role="img"
      aria-label={alt}
      style={{ aspectRatio: `${width} / ${height}`, ["--letter" as string]: `url("${src}")` }}
    >
      <div ref={stageRef} className="letter-stage" aria-hidden="true">
        <div ref={sheetRef} className="sheet">
          <div ref={topRef} className="panel-top">
            <div className="face face--front" style={faceStyle(0, TOP_H)}>
              <span className="crease crease--bottom" />
            </div>
            <div className="face face--back" />
          </div>
          <div ref={midRef} className="hinge hinge-mid">
            <div className="face face--front" style={faceStyle(TOP_H, PANEL_H)}>
              <span className="crease crease--top" />
              <span className="crease crease--bottom" />
            </div>
            <div className="face face--back" />
            <div ref={botRef} className="hinge hinge-bot">
              <div className="face face--front" style={faceStyle(TOP_H + PANEL_H, PANEL_H)}>
                <span className="crease crease--top" />
              </div>
              <div className="face face--back" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
