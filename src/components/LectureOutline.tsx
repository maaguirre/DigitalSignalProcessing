import { useEffect, useState } from "react";
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

  return (
    <aside className="rail" aria-label={pick(t.title, language)}>
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
