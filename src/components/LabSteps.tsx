import { type Language, pick } from "../i18n.ts";
import type { LabStep } from "../content/labTypes.ts";
import LabCode from "./LabCode.tsx";
import LabCallout from "./LabCallout.tsx";
import { renderRich } from "./richText.tsx";

// A numbered procedure — the backbone of a hands-on guide. Each step can carry
// an optional code block and an optional inline note (tip/warning/…).
export default function LabSteps({
  steps,
  language,
}: {
  steps: LabStep[];
  language: Language;
}) {
  return (
    <ol className="lab-steps">
      {steps.map((step, i) => (
        <li className="lab-step" key={i}>
          <div className="lab-step-num" aria-hidden="true">
            {i + 1}
          </div>
          <div className="lab-step-body">
            {step.title && (
              <h3 className="lab-step-title">{pick(step.title, language)}</h3>
            )}
            <p className="lab-step-text">{renderRich(pick(step.text, language))}</p>
            {step.code && <LabCode block={step.code} language={language} />}
            {step.note && (
              <LabCallout variant={step.note.variant} language={language}>
                {renderRich(pick(step.note.text, language))}
              </LabCallout>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
