import { useEffect, useRef, useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";
import { type Lecture, sectionLabel } from "../content/types.ts";
import { sectionAnchor } from "./LectureView.tsx";

const t = {
  title: { pt: "Nesta aula", en: "In this lecture" },
} satisfies Record<string, Localized>;

// Scroll to a section without touching the URL hash (which drives the router).
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LectureOutline({
  lecture,
  language,
}: {
  lecture: Lecture;
  language: Language;
}) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLElement>(null);

  // Track which section is currently at the top of the viewport.
  useEffect(() => {
    const onScroll = () => {
      let current = 0;
      lecture.sections.forEach((_, i) => {
        const el = document.getElementById(sectionAnchor(i));
        if (el && el.getBoundingClientRect().top <= 140) current = i;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lecture]);

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
        {lecture.sections.map((section, i) => (
          <li key={i}>
            <button
              className={i === active ? "rail-link active" : "rail-link"}
              aria-current={i === active ? "true" : undefined}
              onClick={() => scrollToSection(sectionAnchor(i))}
            >
              <span className="rail-kind">{pick(sectionLabel(section), language)}</span>
              {" · "}
              {pick(section.title, language)}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
