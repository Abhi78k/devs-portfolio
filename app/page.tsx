import Image from "next/image";
import { events, tenure } from "@/app/data/events";
import { ChromaHeading } from "@/components/ChromaHeading";
import { FitText } from "@/components/FitText";
import { Grain } from "@/components/Grain";
import { Header } from "@/components/Header";
import { LetterFold } from "@/components/LetterFold";
import { ScrollOverHero } from "@/components/ScrollOverHero";
import { SmoothScroll } from "@/components/SmoothScroll";

function YearBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="hero-badge" aria-hidden="true">
      {!compact && <span>DEVS REC</span>}
      <span className="hero-badge-ring fx-ring">25–26</span>
    </span>
  );
}

function Hero() {
  return (
    <section id="introduction" className="hero">
      <div className="container">
        <h1 className="font-display hero-title" aria-label="Impact Report">
          <FitText className="hero-fit hero-lines-lg">
            <span className="fit-line">Impact</span>
            <YearBadge />
            <span className="fit-line">Report</span>
          </FitText>
          <FitText className="hero-fit hero-lines-sm">
            <span className="fit-line">Imp</span>
            <span className="fit-line">act</span>
            <YearBadge compact />
            <span className="fit-line">Rep</span>
            <span className="fit-line">ort</span>
          </FitText>
        </h1>
      </div>
      <ChromaHeading
        headingColour="--color-mist"
        stops={[
          "--color-ink",
          "--color-twilight",
          "--color-mauve",
          "--color-scarlet",
          "--color-straw",
          "--color-mist",
        ]}
      />
      <Grain id="hero" flavour="hero" />
      <div className="hero-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4v16M5 13l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}

function QuickLook() {
  return (
    <section className="quick-look">
      <div className="container">
        <h2 className="font-display quick-look-title" aria-label="A Quick Look at My Tenure">
          <FitText className="quick-look-fit lines-lg">
            {["A Quick", "Look at", "My", "Tenure"].map((l) => (
              <span key={l} className="fit-line">
                {l}
              </span>
            ))}
          </FitText>
          <FitText className="quick-look-fit lines-sm">
            {["A", "Quick", "Look", "At", "My", "Tenure"].map((l) => (
              <span key={l} className="fit-line">
                {l}
              </span>
            ))}
          </FitText>
        </h2>
      </div>
      <ChromaHeading headingColour="--color-ink" stops={["--color-mist"]} />
      <Grain id="quick-look" flavour="hero" />
    </section>
  );
}

function ImagePlaceholder() {
  return (
    <div className="event-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M21 16l-5-5-9 8" strokeLinejoin="round" />
      </svg>
      <span className="font-sans">16:9 image</span>
    </div>
  );
}

function Events() {
  return (
    <section id="contributions" className="events section-pad">
      <div className="container">
        <header className="events-head">
          <h2 className="font-display">Contributions</h2>
          <p>
            {events.length} events and projects, {tenure.from} to {tenure.to}. Every poster, mail,
            line of code and on spot hour I gave to {tenure.club}.
          </p>
        </header>

        {events.map((event, i) => (
          <article key={event.slug} id={event.slug} className="event">
            <div className="event-media">
              {event.image ? (
                <Image src={event.image} alt={event.title} fill sizes="(max-width: 768px) 100vw, 416px" />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            <div className="event-meta">
              <p className="event-index font-sans">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="event-title font-sans">{event.title}</h3>
              <dl className="event-facts font-sans">
                <div>
                  <dt>When</dt>
                  <dd>{event.month}</dd>
                </div>
                <div>
                  <dt>Work Covered</dt>
                  {event.areas.map((a) => (
                    <dd key={a}>{a}</dd>
                  ))}
                </div>
                {event.highlight && (
                  <div>
                    <dt>Highlight</dt>
                    <dd>{event.highlight}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="event-body">
              <div
                className={`event-text${event.contributions.length > 1 ? " event-text--cols" : ""}`}
              >
                {event.contributions.map((c, j) => (
                  <p key={j}>
                    <span className="event-label">{c.label}</span>
                    {c.text}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header events={events} />
      <main>
        <Hero />
        <ScrollOverHero hero={<QuickLook />} anchorId="letter">
          <section className="section-pad">
            <div className="container">
              <LetterFold
                src="/letter.png"
                width={1191}
                height={1684}
                alt={`Appointment letter from ${tenure.club}, ${tenure.college}, dated 23 September 2025, appointing ${tenure.name} as a ${tenure.role}.`}
              />
            </div>
          </section>
        </ScrollOverHero>
        <Events />
      </main>
      <footer id="colophon" className="footer">
        <div className="footer-inner">
          <p>
            This report collects the work of <strong>{tenure.name}</strong>, {tenure.role} at{" "}
            {tenure.club}, {tenure.college}, from {tenure.from} to {tenure.to}.
          </p>
          <p>
            Copyright © 2026 {tenure.name}
          </p>
        </div>
      </footer>
    </>
  );
}
