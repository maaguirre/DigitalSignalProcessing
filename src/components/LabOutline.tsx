import { useEffect, useRef, useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";
import { type Lab, type LabSection, labSectionLabel } from "../content/labTypes.ts";
import { sectionAnchor } from "./LectureView.tsx";

const t = {
  title: { pt: "Neste lab", en: "In this lab" },
} satisfies Record<string, Localized>;

// Scroll to a section without touching the URL hash (which drives the router).
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Captions read "Figura 1 — …"; the rail already shows a "Figura" eyebrow, so
// drop that lead-in to avoid "Figura · Figura 1 — …".
function stripFigurePrefix(s: string): string {
  return s.replace(/^(Figura|Figure)\s+\d+\s*[—–:-]\s*/i, "");
}

// The descriptive part shown after the eyebrow label. Figures rarely have a
// title, so fall back to their caption (or alt) instead of a bare "Figura".
function sectionDesc(section: LabSection): Localized | undefined {
  if (section.title) return section.title;
  if (section.kind === "figure") {
    const cap = section.figure.caption;
    if (cap) return { pt: stripFigurePrefix(cap.pt), en: stripFigurePrefix(cap.en) };
    return section.figure.alt;
  }
  return undefined;
}

// Right-side outline for a lab — the same rail the lectures use, listing the
// hands-on sections and tracking which one is at the top of the viewport.
export default function LabOutline({
  lab,
  language,
}: {
  lab: Lab;
  language: Language;
}) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      let current = 0;
      lab.sections.forEach((_, i) => {
        const el = document.getElementById(sectionAnchor(i));
        if (el && el.getBoundingClientRect().top <= 140) current = i;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lab]);

  // Keep the highlighted item visible when the rail scrolls internally (tall
  // outlines) — scroll only the rail, never the page.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const item = rail.querySelector<HTMLElement>(".rail-link.active");
    if (!item) return;
    const r = rail.getBoundingClientRect();
    const it = item.getBoundingClientRect();
    if (it.top < r.top) rail.scrollTop -= r.top - it.top + 8;
    else if (it.bottom > r.bottom) rail.scrollTop += it.bottom - r.bottom + 8;
  }, [active]);

  return (
    <aside className="rail" aria-label={pick(t.title, language)} ref={railRef}>
      <p className="rail-title">{pick(t.title, language)}</p>
      <ul className="rail-list">
        {lab.sections.map((section, i) => {
          const desc = sectionDesc(section);
          return (
            <li key={i}>
              <button
                className={i === active ? "rail-link active" : "rail-link"}
                aria-current={i === active ? "true" : undefined}
                onClick={() => scrollToSection(sectionAnchor(i))}
              >
                <span className="rail-kind">{pick(labSectionLabel(section), language)}</span>
                {desc ? <>{" · "}{pick(desc, language)}</> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
