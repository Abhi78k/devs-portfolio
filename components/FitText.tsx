"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Sizes a display heading so its widest `.fit-line` spans the container,
 * the way the reference site's hero words run edge to edge. The size is set
 * on the wrapper, so anything sized in `em` inside it (the year badge) scales too.
 */
export function FitText({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    const box = root?.parentElement;
    if (!root || !box) return;

    const fit = () => {
      root.style.fontSize = "100px";
      const lines = [...root.querySelectorAll<HTMLElement>(".fit-line")].filter(
        (el) => el.offsetParent !== null,
      );
      const widest = Math.max(0, ...lines.map((el) => el.getBoundingClientRect().width));
      root.style.fontSize = widest > 0 ? `${(box.clientWidth * 100) / widest}px` : "";
    };

    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <span ref={ref} className={className} style={style}>
      {children}
    </span>
  );
}
