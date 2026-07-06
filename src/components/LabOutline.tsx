import { useEffect, useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";
import { type Lab, labSectionLabel } from "../content/labTypes.ts";
import { sectionAnchor } from "./LectureView.tsx";

const t = {
  title: { pt: "Neste lab", en: "In this lab" },
} satisfies Record<string, Localized>;

// Scroll to a section without touching the URL hash (which drives the router).
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  return (
    <aside className="rail" aria-label={pick(t.title, language)}>
      <p className="rail-title">{pick(t.title, language)}</p>
      <ul className="rail-list">
        {lab.sections.map((section, i) => (
          <li key={i}>
            <button
              className={i === active ? "rail-link active" : "rail-link"}
              aria-current={i === active ? "true" : undefined}
              onClick={() => scrollToSection(sectionAnchor(i))}
            >
              {pick(labSectionLabel(section), language)}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
