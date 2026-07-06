import type { ReactNode } from "react";
import { type Language, pick } from "../i18n.ts";
import {
  type Section,
  type InstrumentName,
  sectionKindLabel,
} from "../content/types.ts";
import Prose from "./Prose.tsx";
import Formalization from "./Formalization.tsx";
import Example from "./Example.tsx";
import Synthesis from "./Synthesis.tsx";
import QuizBlock from "./QuizBlock.tsx";
import SpectrumExplorer from "./SpectrumExplorer.tsx";
import BandwidthExplorer from "./BandwidthExplorer.tsx";
import RateConversionView from "./RateConversionView.tsx";
import SamplingView from "./SamplingView.tsx";
import SamplingFigure from "./SamplingFigure.tsx";
import DownsampleView from "./DownsampleView.tsx";
import ShiftVaryingView from "./ShiftVaryingView.tsx";
import ImpulseTrainView from "./ImpulseTrainView.tsx";
import UnitCircleView from "./UnitCircleView.tsx";
import AliasingView from "./AliasingView.tsx";
import AliasCircleView from "./AliasCircleView.tsx";
import DecimationSpectrumView from "./DecimationSpectrumView.tsx";
import DecimatorStructureView from "./DecimatorStructureView.tsx";
import IdealDecimatorView from "./IdealDecimatorView.tsx";
import UpsampleView from "./UpsampleView.tsx";
import InterpolatorStructureView from "./InterpolatorStructureView.tsx";
import InterpolatorView from "./InterpolatorView.tsx";
import ImagingCircleView from "./ImagingCircleView.tsx";
import InterpolatorGainView from "./InterpolatorGainView.tsx";
import RationalStructureView from "./RationalStructureView.tsx";
import RationalTimeView from "./RationalTimeView.tsx";
import ConvolutionView from "./ConvolutionView.tsx";
import TimeVaryingFilterView from "./TimeVaryingFilterView.tsx";
import FilterDesigner from "./FilterDesigner.tsx";
import FIRInterpolationView from "./FIRInterpolationView.tsx";
import FIRDecimationView from "./FIRDecimationView.tsx";
import FIRInterpSpectrumView from "./FIRInterpSpectrumView.tsx";
import FIRDecimSpectrumView from "./FIRDecimSpectrumView.tsx";

function renderInstrument(name: InstrumentName, language: Language, config?: Record<string, unknown>) {
  const initialM = typeof config?.initialM === "number" ? (config.initialM as number) : undefined;
  switch (name) {
    case "SpectrumExplorer":
      return <SpectrumExplorer language={language} />;
    case "SamplingView":
      return <SamplingView language={language} />;
    case "SamplingFigure":
      return <SamplingFigure language={language} />;
    case "DownsampleView":
      return <DownsampleView language={language} />;
    case "ShiftVaryingView":
      return <ShiftVaryingView language={language} />;
    case "ImpulseTrainView":
      return <ImpulseTrainView language={language} />;
    case "UnitCircleView":
      return <UnitCircleView language={language} />;
    case "AliasingView":
      return <AliasingView language={language} />;
    case "AliasCircleView":
      return <AliasCircleView language={language} />;
    case "DecimationSpectrumView":
      return <DecimationSpectrumView language={language} />;
    case "DecimatorStructureView":
      return <DecimatorStructureView language={language} />;
    case "IdealDecimatorView":
      return <IdealDecimatorView language={language} />;
    case "UpsampleView":
      return <UpsampleView language={language} />;
    case "InterpolatorStructureView":
      return <InterpolatorStructureView language={language} />;
    case "InterpolatorView":
      return <InterpolatorView language={language} />;
    case "ImagingCircleView":
      return <ImagingCircleView language={language} />;
    case "InterpolatorGainView":
      return <InterpolatorGainView language={language} />;
    case "RationalStructureView":
      return <RationalStructureView language={language} />;
    case "RationalTimeView":
      return <RationalTimeView language={language} />;
    case "ConvolutionView":
      return <ConvolutionView language={language} />;
    case "TimeVaryingFilterView":
      return <TimeVaryingFilterView language={language} />;
    case "FilterDesigner":
      return <FilterDesigner language={language} />;
    case "FIRInterpolationView":
      return <FIRInterpolationView language={language} initialM={initialM} />;
    case "FIRDecimationView":
      return <FIRDecimationView language={language} initialM={initialM} />;
    case "FIRInterpSpectrumView":
      return <FIRInterpSpectrumView language={language} initialM={initialM} />;
    case "FIRDecimSpectrumView":
      return <FIRDecimSpectrumView language={language} initialM={initialM} />;
    case "BandwidthExplorer":
      return <BandwidthExplorer language={language} />;
    case "RateConversionView":
      return <RateConversionView language={language} />;
    default:
      return null; // other instruments arrive in later lectures
  }
}

// How many progressive sub-steps a section has (for the step-by-step reveal in
// Presentation mode). Only stepped sections count; others show fully.
export function sectionStepCount(section: Section): number {
  if (section.kind === "formalization" || section.kind === "example") {
    return section.steps.length;
  }
  return 0;
}

// Renders one section. `revealed`, when given, limits how many steps show
// (used by Presentation mode); when undefined, everything shows (Study mode).
export function renderSection(
  section: Section,
  lectureLabel: string,
  language: Language,
  revealed?: number
): ReactNode {
  switch (section.kind) {
    case "prose":
      return (
        <Prose
          lecture={lectureLabel}
          kind={pick(section.label, language)}
          title={pick(section.title, language)}
          text={pick(section.text, language)}
          reviewLink={
            section.reviewLink
              ? {
                  slug: section.reviewLink.slug,
                  label: pick(section.reviewLink.label, language),
                }
              : undefined
          }
        />
      );
    case "formalization": {
      const steps =
        revealed !== undefined ? section.steps.slice(0, revealed) : section.steps;
      return (
        <Formalization
          lecture={lectureLabel}
          kind={pick(sectionKindLabel.formalization, language)}
          title={pick(section.title, language)}
          steps={steps.map((s) => ({
            latex: s.latex,
            ref: s.ref,
            caption: pick(s.caption, language),
          }))}
        />
      );
    }
    case "example": {
      const steps =
        revealed !== undefined ? section.steps.slice(0, revealed) : section.steps;
      return (
        <Example
          lecture={lectureLabel}
          kind={pick(sectionKindLabel.example, language)}
          title={pick(section.title, language)}
          statement={pick(section.statement, language)}
          steps={steps.map((s) => ({
            text: pick(s.text, language),
            latex: s.latex,
          }))}
        />
      );
    }
    case "playground":
      return (
        <section className="section">
          <span className="eyebrow">
            {lectureLabel} · {pick(sectionKindLabel.playground, language)}
          </span>
          <h2 className="section-title">{pick(section.title, language)}</h2>
          <p className="section-text section-lead">
            {pick(section.intro, language)}
          </p>
          {renderInstrument(section.instrument.component, language, section.instrument.config)}
        </section>
      );
    case "synthesis":
      return (
        <Synthesis
          lecture={lectureLabel}
          kind={pick(sectionKindLabel.synthesis, language)}
          title={pick(section.title, language)}
          points={section.points.map((p) => pick(p, language))}
        />
      );
    case "quiz":
      return (
        <QuizBlock
          lecture={lectureLabel}
          kind={pick(sectionKindLabel.quiz, language)}
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
