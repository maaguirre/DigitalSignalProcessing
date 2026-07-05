import { useEffect, useRef, useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";
import type { Lecture } from "../content/types.ts";
import { renderSection, sectionStepCount } from "./sectionRenderer.tsx";

const t = {
  prev: { pt: "Anterior", en: "Previous" },
  next: { pt: "Próximo", en: "Next" },
} satisfies Record<string, Localized>;

export default function PresentationView({
  lecture,
  language,
}: {
  lecture: Lecture;
  language: Language;
}) {
  const lectureLabel = pick(lecture.lectureLabel, language);
  const total = lecture.sections.length;

  // `index` = which section; `revealed` = how many steps shown in a stepped
  // section (starts at 1 going forward, all steps when arriving backward).
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(1);

  const section = lecture.sections[index];
  const steps = sectionStepCount(section);

  const slideRef = useRef<HTMLDivElement>(null);
  const prevIndex = useRef(index);

  const atStart = index === 0 && revealed <= 1;
  const atEnd = index === total - 1 && (steps === 0 || revealed >= steps);

  function advance() {
    if (steps > 0 && revealed < steps) {
      setRevealed(revealed + 1);
    } else if (index < total - 1) {
      setIndex(index + 1);
      setRevealed(1);
    }
  }

  function back() {
    if (steps > 0 && revealed > 1) {
      setRevealed(revealed - 1);
    } else if (index > 0) {
      const prev = index - 1;
      const prevSteps = sectionStepCount(lecture.sections[prev]);
      setIndex(prev);
      setRevealed(prevSteps > 0 ? prevSteps : 1);
    }
  }

  // Keyboard navigation. Re-subscribes when state changes so the handler sees
  // the current index/revealed. Ignore keys while a form control is focused
  // (so the Playground sliders still take arrow keys).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        back();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, revealed]);

  // Keep the newly revealed content in view: on a new section scroll to the top;
  // on a revealed step scroll that step into view if it fell below the fold.
  useEffect(() => {
    const sectionChanged = prevIndex.current !== index;
    prevIndex.current = index;
    if (sectionChanged) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (steps > 0) {
      const stepEls = slideRef.current?.querySelectorAll(".step");
      const last = stepEls?.[stepEls.length - 1];
      last?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [index, revealed]);

  return (
    <div className="presentation">
      <div className="present-slide" ref={slideRef}>
        {renderSection(
          section,
          lectureLabel,
          language,
          steps > 0 ? revealed : undefined
        )}
      </div>

      <div className="present-bar">
        <button className="present-btn" onClick={back} disabled={atStart}>
          ‹ {pick(t.prev, language)}
        </button>
        <span className="present-progress">
          {index + 1} / {total}
        </span>
        <button className="present-btn" onClick={advance} disabled={atEnd}>
          {pick(t.next, language)} ›
        </button>
      </div>
    </div>
  );
}
