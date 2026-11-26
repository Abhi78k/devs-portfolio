"use client";

import { useEffect, useRef } from "react";

/*
 * Port of the reference site's hero heading shader. The heading is redrawn into
 * a WebGL canvas behind the (now transparent) DOM text, and the pointer fringes
 * the type with chroma: the red and blue channels of the glyph mask are sampled
 * a little apart around the cursor while green stays put, so the letters split
 * into colour without moving. The fringe is driven by a ripple around the
 * cursor scaled by how fast the pointer moves, plus a drag along its velocity.
 * Scrolling adds a vertical split that grows with scroll speed.
 *
 * Every distance is measured in rendered letter heights, so the effect looks
 * the same on any heading at any size.
 */

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const MAX_STOPS = 8;

const FRAGMENT = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform float uEnergy;
uniform float uLetter;
uniform float uScrollChroma;
uniform vec3 uHeading;
uniform vec3 uStops[${MAX_STOPS}];
uniform int uStopCount;

const float radiusInLetters = 0.5;
const float rippleFrequencyPerLetter = 3.0;
const float rippleSpeed = 4.0;
const float rippleAmplitudeInLetters = 0.08;
const float dragStrength = 0.1;
const float maxOffsetInLetters = 0.3;
const float chromaGain = 0.4;

vec3 stopAt(int i) {
  for (int k = 0; k < ${MAX_STOPS}; k++) {
    if (k == i) return uStops[k];
  }
  return uStops[0];
}

// The section's CSS gradient: evenly spaced stops from top (y = 0) to bottom (y = 1).
vec3 gradient(float y) {
  float segments = float(uStopCount - 1);
  if (segments <= 0.0) return uStops[0];
  float s = clamp(y, 0.0, 1.0) * segments;
  float seg = min(floor(s), segments - 1.0);
  return mix(stopAt(int(seg)), stopAt(int(seg) + 1), s - seg);
}

float sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  return texture2D(uTexture, uv).a;
}

void main() {
  vec2 position = vec2(vUv.x * uAspect, vUv.y);
  vec2 pointer = vec2(uMouse.x * uAspect, uMouse.y);
  vec2 toPointer = position - pointer;
  float dist = length(toPointer);

  float letter = max(uLetter, 0.001);
  float radius = radiusInLetters * letter;
  float rippleFrequency = rippleFrequencyPerLetter / letter;
  float rippleAmplitude = rippleAmplitudeInLetters * letter;
  float maxOffset = maxOffsetInLetters * letter;

  float falloff = exp(-(dist * dist) / (radius * radius));
  vec2 direction = toPointer / max(dist, 1e-4);

  float ripple = sin(dist * rippleFrequency - uTime * rippleSpeed);
  vec2 offset = direction * ripple * rippleAmplitude * falloff * uEnergy
              - uVelocity * dragStrength * falloff * letter;
  float offsetLength = length(offset);
  if (offsetLength > maxOffset) offset *= maxOffset / offsetLength;

  float chroma = length(offset) * chromaGain;
  vec2 cursorChroma = vec2(direction.x / uAspect, direction.y) * chroma;
  vec2 scrollChroma = vec2(0.0, uScrollChroma * letter);

  float r = sampleText(vUv + cursorChroma + scrollChroma);
  float g = sampleText(vUv);
  float b = sampleText(vUv - cursorChroma - scrollChroma);

  vec3 bg = gradient(1.0 - vUv.y);
  gl_FragColor = vec4(
    mix(bg.r, uHeading.r, r),
    mix(bg.g, uHeading.g, g),
    mix(bg.b, uHeading.b, b),
    1.0
  );
}
`;

const DRAG_VELOCITY_GAIN = 8;
const ENERGY_THRESHOLD = 0.01;
const MAX_SCROLL_CHROMA = 0.03;
const SCROLL_CHROMA_GAIN = 0.003;
// Koulen's cap height as a fraction of its font size.
const CAP_RATIO = 1462 / 2048;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.replaceAll(/./g, (c) => c + c);
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

function cssColour(value: string) {
  return value.startsWith("--")
    ? getComputedStyle(document.documentElement).getPropertyValue(value).trim()
    : value;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Draws every text node and `.fx-ring` outline of `heading` into a 2D canvas the
 * size of `section`, at the exact spot the browser laid it out.
 */
function rasterise(
  canvas: HTMLCanvasElement,
  section: HTMLElement,
  heading: HTMLElement,
  scale: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  const box = section.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(box.width * scale));
  canvas.height = Math.max(1, Math.round(box.height * scale));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, box.width, box.height);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.textBaseline = "alphabetic";

  let capPx = 0;
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    const el = node.parentElement;
    if (!el || text.trim() === "" || el.offsetParent === null) continue;
    const style = getComputedStyle(el);
    const fontSize = Number.parseFloat(style.fontSize);
    ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    ctx.fontKerning = "normal";
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0) continue;
    const metrics = ctx.measureText(text);
    // The range box spans the font's ascent + descent, so the baseline sits one ascent down.
    const baseline = rect.top - box.top + metrics.fontBoundingBoxAscent;
    ctx.fillText(text, rect.left - box.left, baseline);
    capPx = Math.max(capPx, fontSize * CAP_RATIO);
  }

  for (const ring of heading.querySelectorAll<HTMLElement>(".fx-ring")) {
    if (ring.offsetParent === null) continue;
    const r = ring.getBoundingClientRect();
    const bw = Number.parseFloat(getComputedStyle(ring).borderTopWidth) || 0;
    ctx.lineWidth = bw;
    ctx.beginPath();
    ctx.ellipse(
      r.left - box.left + r.width / 2,
      r.top - box.top + r.height / 2,
      Math.max(0, r.width / 2 - bw / 2),
      Math.max(0, r.height / 2 - bw / 2),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  return capPx / box.height;
}

export function ChromaHeading({
  headingColour,
  stops,
}: {
  /** Glyph colour: hex or a CSS custom property name such as "--color-mist". */
  headingColour: string;
  /** Background gradient, top to bottom, evenly spaced (same format as headingColour). */
  stops: string[];
}) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const section = layer?.parentElement;
    const heading = section?.querySelector<HTMLElement>("h1, h2");
    if (!layer || !section || !heading) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // A fresh canvas per mount: React's dev-mode double mount must never reuse a context the first cleanup lost.
    const canvas = document.createElement("canvas");
    layer.append(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) {
      canvas.remove();
      return;
    }
    let lost = false;
    const onLost = () => {
      lost = true;
      delete section.dataset.fx;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      canvas.remove();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.remove();
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uTime = u("uTime");
    const uAspect = u("uAspect");
    const uMouse = u("uMouse");
    const uVelocity = u("uVelocity");
    const uEnergy = u("uEnergy");
    const uLetter = u("uLetter");
    const uScrollChroma = u("uScrollChroma");

    gl.uniform3fv(u("uHeading"), hexToRgb(cssColour(headingColour)));
    const rgb = stops.slice(0, MAX_STOPS).map((s) => hexToRgb(cssColour(s)));
    const padded = Array.from({ length: MAX_STOPS }, (_, i) => rgb[Math.min(i, rgb.length - 1)]);
    gl.uniform3fv(u("uStops[0]"), padded.flat());
    gl.uniform1i(u("uStopCount"), rgb.length);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.uniform1i(u("uTexture"), 0);

    const text = document.createElement("canvas");
    let letter = 0.1;
    let width = 0;
    let height = 0;

    const layout = () => {
      const box = section.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2, 4096 / box.width, 4096 / box.height);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      letter = rasterise(text, section, heading, dpr);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, text);
      wake();
    };

    // Pointer state, in canvas UV (0..1, y up).
    let pointer: { x: number; y: number } | undefined;
    const mouse = { x: -1, y: -1 };
    const prev = { x: -1, y: -1 };
    const velocity = { x: 0, y: 0 };
    let tracking = false;
    let energy = 0;
    let scrollChroma = 0;
    let lastScroll = window.scrollY;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const frame = (now: number) => {
      raf = 0;
      const box = section.getBoundingClientRect();
      const inside =
        pointer !== undefined &&
        pointer.x >= box.left &&
        pointer.x <= box.right &&
        pointer.y >= box.top &&
        pointer.y <= box.bottom;

      prev.x = mouse.x;
      prev.y = mouse.y;
      if (inside && pointer) {
        const tx = (pointer.x - box.left) / box.width;
        const ty = 1 - (pointer.y - box.top) / box.height;
        if (tracking) {
          mouse.x += (tx - mouse.x) * 0.35;
          mouse.y += (ty - mouse.y) * 0.35;
        } else {
          mouse.x = prev.x = tx;
          mouse.y = prev.y = ty;
          tracking = true;
        }
      } else {
        tracking = false;
      }

      const dx = mouse.x - prev.x;
      const dy = mouse.y - prev.y;
      const speed = Math.hypot(dx, dy);
      velocity.x += (dx * DRAG_VELOCITY_GAIN - velocity.x) * 0.3;
      velocity.y += (dy * DRAG_VELOCITY_GAIN - velocity.y) * 0.3;
      energy += (Math.min(speed / ENERGY_THRESHOLD, 1) - energy) * 0.15;

      const scrollY = window.scrollY;
      const scrollVelocity = scrollY - lastScroll;
      lastScroll = scrollY;
      const targetChroma = Math.max(
        -MAX_SCROLL_CHROMA,
        Math.min(MAX_SCROLL_CHROMA, scrollVelocity * SCROLL_CHROMA_GAIN),
      );
      scrollChroma += (targetChroma - scrollChroma) * 0.2;

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uAspect, width / height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uVelocity, velocity.x, velocity.y);
      gl.uniform1f(uEnergy, energy);
      gl.uniform1f(uLetter, letter);
      gl.uniform1f(uScrollChroma, scrollChroma);
      if (lost) return;
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // Hide the DOM text only once the canvas has really drawn the heading.
      if (section.dataset.fx !== "on" && gl.getError() === gl.NO_ERROR) section.dataset.fx = "on";

      const settled =
        energy < 1e-3 &&
        Math.abs(scrollChroma) < 1e-5 &&
        Math.hypot(velocity.x, velocity.y) < 1e-4 &&
        (!tracking || speed < 1e-5);
      if (visible && !settled) raf = requestAnimationFrame(frame);
    };

    function wake() {
      if (raf === 0 && visible && width > 0) raf = requestAnimationFrame(frame);
    }

    const onPointer = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      wake();
    };
    const onScroll = () => wake();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        wake();
      },
      { rootMargin: "25%" },
    );
    io.observe(section);

    layout();
    document.fonts?.ready.then(layout);
    const ro = new ResizeObserver(layout);
    ro.observe(section);
    ro.observe(heading);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      delete section.dataset.fx;
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [headingColour, stops]);

  return <div ref={layerRef} className="chroma-canvas" aria-hidden="true" />;
}
