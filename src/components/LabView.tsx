import { type Language, pick } from "../i18n.ts";
import type { Lab } from "../content/labTypes.ts";
import { renderLabSection } from "./labSectionRenderer.tsx";
import { sectionAnchor } from "./LectureView.tsx";

const t = {
  goal: { pt: "Objetivo", en: "Goal" },
  duration: { pt: "Duração", en: "Duration" },
  prereqs: { pt: "Pré-requisitos", en: "Prerequisites" },
};

// The header of a lab: goal, estimated time and prerequisites at a glance,
// before the step-by-step body.
function LabHeader({ lab, language }: { lab: Lab; language: Language }) {
  return (
    <section className="section lab-header">
      <span className="eyebrow">
        EA-269 · {pick(lab.labLabel, language)}
      </span>
      <h1 className="section-title">{pick(lab.title, language)}</h1>
      <p className="section-text section-lead">{pick(lab.goal, language)}</p>
      <div className="lab-meta">
        <span className="lab-meta-item">
          <strong>{pick(t.duration, language)}:</strong> {pick(lab.duration, language)}
        </span>
      </div>
      {lab.prereqs && lab.prereqs.length > 0 && (
        <div className="lab-prereqs">
          <span className="lab-prereqs-label">{pick(t.prereqs, language)}</span>
          <ul>
            {lab.prereqs.map((p, i) => (
              <li key={i}>{pick(p, language)}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function LabView({
  lab,
  language,
}: {
  lab: Lab;
  language: Language;
}) {
  const labLabel = pick(lab.labLabel, language);

  return (
    <div className="lecture">
      <LabHeader lab={lab} language={language} />
      {lab.sections.map((section, i) => (
        <div className="lecture-section" id={sectionAnchor(i)} key={i}>
          {renderLabSection(section, labLabel, language)}
        </div>
      ))}
    </div>
  );
}
