import type { ReactNode } from "react";
import { type Language, pick } from "../i18n.ts";
import {
  type LabSection,
  type LabInstrumentName,
  labSectionKindLabel,
} from "../content/labTypes.ts";
import Prose from "./Prose.tsx";
import QuizBlock from "./QuizBlock.tsx";
import LabCode from "./LabCode.tsx";
import LabSteps from "./LabSteps.tsx";
import LabCallout from "./LabCallout.tsx";
import LabChecklist from "./LabChecklist.tsx";
import LabFigure from "./LabFigure.tsx";
import { renderRich } from "./richText.tsx";
import BoardDiagram from "./BoardDiagram.tsx";
import ClockDividerCalc from "./ClockDividerCalc.tsx";
import CpuVsFpga from "./CpuVsFpga.tsx";
import DevFlow from "./DevFlow.tsx";
import SwitchLedSim from "./SwitchLedSim.tsx";
import MovingAverageExplorer from "./MovingAverageExplorer.tsx";

function renderInstrument(name: LabInstrumentName, language: Language) {
  switch (name) {
    case "BoardDiagram":
      return <BoardDiagram language={language} />;
    case "ClockDividerCalc":
      return <ClockDividerCalc language={language} />;
    case "CpuVsFpga":
      return <CpuVsFpga language={language} />;
    case "DevFlow":
      return <DevFlow language={language} />;
    case "SwitchLedSim":
      return <SwitchLedSim language={language} />;
    case "MovingAverageExplorer":
      return <MovingAverageExplorer language={language} />;
    default:
      return null;
  }
}

// Renders one lab section. Mirrors the lecture sectionRenderer, but for the
// hands-on section vocabulary (steps / code / callout / checklist / …).
export function renderLabSection(
  section: LabSection,
  labLabel: string,
  language: Language
): ReactNode {
  switch (section.kind) {
    case "prose":
      return (
        <Prose
          lecture={labLabel}
          kind={pick(section.label, language)}
          title={pick(section.title, language)}
          text={pick(section.text, language)}
        />
      );
    case "steps":
      return (
        <section className="section">
          <span className="eyebrow">
            {labLabel} · {pick(labSectionKindLabel.steps, language)}
          </span>
          <h2 className="section-title">{pick(section.title, language)}</h2>
          {section.intro && (
            <p className="section-text section-lead">
              {pick(section.intro, language)}
            </p>
          )}
          <LabSteps steps={section.steps} language={language} />
        </section>
      );
    case "code":
      return (
        <section className="section">
          <span className="eyebrow">
            {labLabel} · {pick(labSectionKindLabel.code, language)}
          </span>
          <h2 className="section-title">{pick(section.title, language)}</h2>
          {section.intro && (
            <p className="section-text section-lead">
              {pick(section.intro, language)}
            </p>
          )}
          <LabCode block={section.block} language={language} />
        </section>
      );
    case "callout":
      return (
        <LabCallout
          variant={section.variant}
          title={section.title ? pick(section.title, language) : undefined}
          language={language}
        >
          {renderRich(pick(section.text, language))}
        </LabCallout>
      );
    case "checklist":
      return (
        <section className="section">
          <span className="eyebrow">
            {labLabel} · {pick(labSectionKindLabel.checklist, language)}
          </span>
          <h2 className="section-title">{pick(section.title, language)}</h2>
          <LabChecklist items={section.items} language={language} />
        </section>
      );
    case "playground":
      return (
        <section className="section">
          <span className="eyebrow">
            {labLabel} · {pick(labSectionKindLabel.playground, language)}
          </span>
          <h2 className="section-title">{pick(section.title, language)}</h2>
          <p className="section-text section-lead">
            {pick(section.intro, language)}
          </p>
          {renderInstrument(section.instrument.component, language)}
        </section>
      );
    case "figure":
      return (
        <section className="section">
          <span className="eyebrow">
            {labLabel} · {pick(labSectionKindLabel.figure, language)}
          </span>
          {section.title && (
            <h2 className="section-title">{pick(section.title, language)}</h2>
          )}
          <LabFigure figure={section.figure} language={language} />
        </section>
      );
    case "quiz":
      return (
        <QuizBlock
          lecture={labLabel}
          kind={pick(labSectionKindLabel.quiz, language)}
          title={pick(section.title, language)}
          quizzes={section.quizzes.map((q) => ({
            question: pick(q.question, language),
            options: q.options.map((o) => pick(o, language)),
            correctIndex: q.correctIndex,
            solution: q.solution?.map((s) => ({
              text: pick(s.text, language),
              latex: s.latex,
            })),
          }))}
          language={language}
        />
      );
  }
}
