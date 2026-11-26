"use client";

import { useEffect, useState } from "react";
import type { DevsEvent } from "@/app/data/events";

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "letter", label: "Appointment" },
  { id: "contributions", label: "Contributions" },
  { id: "colophon", label: "Colophon" },
];

export function Header({ events }: { events: Pick<DevsEvent, "slug" | "title" | "month">[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const onScroll = () => {
      const probe = window.innerHeight * 0.4;
      let current = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="header">
        <button
          type="button"
          className="pill"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 8h16M4 16h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <nav aria-label="Sections" className="nav font-sans">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="nav-link"
              aria-label={label}
              aria-current={active === id}
              onClick={() => setOpen(false)}
            >
              <span className="nav-collapse nav-collapse--dot" aria-hidden="true">
                <span>
                  <span className="nav-dot" />
                </span>
              </span>
              <span className="nav-collapse nav-collapse--label">
                <span>
                  <span className="nav-label">{label}</span>
                </span>
              </span>
            </a>
          ))}
        </nav>
      </header>

      <div id="menu" className="menu" data-open={open} data-lenis-prevent inert={!open}>
        <div className="container">
          <ul className="menu-list">
            {events.map((e) => (
              <li key={e.slug}>
                <a href={`#${e.slug}`} onClick={() => setOpen(false)}>
                  <span>{e.title}</span>
                  <small>{e.month}</small>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
