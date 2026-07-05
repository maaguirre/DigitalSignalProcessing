import { type Language, pick } from "../i18n.ts";
import type { Lecture } from "../content/types.ts";
import { renderSection } from "./sectionRenderer.tsx";

// Shared anchor id for a section — the right-side outline scrolls to these.
export function sectionAnchor(index: number) {
  return `sec-${index}`;
}

export default function LectureView({
  lecture,
  language,
}: {
  lecture: Lecture;
  language: Language;
}) {
  const lectureLabel = pick(lecture.lectureLabel, language);

  return (
    <div className="lecture">
      {lecture.sections.map((section, i) => (
        <div className="lecture-section" id={sectionAnchor(i)} key={i}>
          {renderSection(section, lectureLabel, language)}
        </div>
      ))}
    </div>
  );
}
