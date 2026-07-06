import type { Localized } from "../i18n.ts";

export type FormalizationStep = {
  latex: string;
  ref: string;
  caption: Localized;
};

export type ExampleStep = {
  text: Localized;
  latex?: string;
};

export type QuizData = {
  question: Localized;
  options: Localized[];
  correctIndex: number;
  solution?: ExampleStep[];
};

export type InstrumentName =
  | "SpectrumExplorer"
  | "SamplingView"
  | "SamplingFigure"
  | "BandwidthExplorer"
  | "RateConversionView"
  | "DownsampleView"
  | "ShiftVaryingView"
  | "ImpulseTrainView"
  | "UnitCircleView"
  | "AliasingView"
  | "AliasCircleView"
  | "DecimationSpectrumView"
  | "DecimatorStructureView"
  | "IdealDecimatorView"
  | "UpsampleView"
  | "InterpolatorStructureView"
  | "InterpolatorView"
  | "ImagingCircleView"
  | "InterpolatorGainView"
  | "RationalStructureView"
  | "RationalTimeView"
  | "ConvolutionView"
  | "TimeVaryingFilterView"
  | "FIRInterpolationView"
  | "FIRDecimationView"
  | "FIRInterpSpectrumView"
  | "FIRDecimSpectrumView"
  | "SpectrumPlot"
  | "StemPlot"
  | "FilterDesigner"
  | "PolyphaseCommutator";

export type InstrumentRef = {
  component: InstrumentName;
  config?: Record<string, unknown>;
};

export type Section =
  // Prose sections (introduction, concepts, application, intuition…) share the
  // same shape; each carries its OWN eyebrow `label`, so a lecture names them as
  // it needs — the section vocabulary is not a fixed arc.
  | {
      kind: "prose";
      label: Localized;
      title: Localized;
      text: Localized;
      reviewLink?: { slug: string; label: Localized };
    }
  | { kind: "formalization"; title: Localized; steps: FormalizationStep[] }
  | {
      kind: "playground";
      title: Localized;
      intro: Localized;
      instrument: InstrumentRef;
    }
  | { kind: "example"; title: Localized; statement: Localized; steps: ExampleStep[] }
  | { kind: "synthesis"; title: Localized; points: Localized[] }
  | { kind: "quiz"; title: Localized; quizzes: QuizData[] };

export type Lecture = {
  id: number;
  lectureLabel: Localized;
  sections: Section[];
};

// Fixed eyebrow labels for the structural section kinds (prose brings its own).
export const sectionKindLabel = {
  formalization: { pt: "Formalização", en: "Formalization" },
  playground: { pt: "Playground", en: "Playground" },
  example: { pt: "Exemplo", en: "Example" },
  synthesis: { pt: "Síntese", en: "Synthesis" },
  quiz: { pt: "Quiz", en: "Quiz" },
} satisfies Record<string, Localized>;

// The eyebrow label of any section.
export function sectionLabel(section: Section): Localized {
  return section.kind === "prose" ? section.label : sectionKindLabel[section.kind];
}
