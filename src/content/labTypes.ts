import type { Localized } from "../i18n.ts";
import type { QuizData } from "./types.ts";

export type CodeLang = "verilog" | "xdc" | "tcl" | "text";

export type CodeBlock = {
  language: CodeLang;
  filename?: string;
  code: Localized;
  caption?: Localized;
};

export type CalloutVariant = "tip" | "warning" | "note" | "check";

// One numbered step of a procedure. A step is a small unit: a localized
// instruction plus, optionally, a code block and a short inline note.
export type LabStep = {
  title?: Localized;
  text: Localized;
  code?: CodeBlock;
  note?: { variant: CalloutVariant; text: Localized };
};

export type LabInstrumentName =
  | "BoardDiagram"
  | "ClockDividerCalc"
  | "CpuVsFpga"
  | "DevFlow"
  | "SwitchLedSim";

export type LabFigure = {
  src: string;
  alt: Localized;
  caption?: Localized;
  /** Optional pixel width cap so screenshots don't blow up the column. */
  maxWidth?: number;
};

export type LabInstrumentRef = {
  component: LabInstrumentName;
  config?: Record<string, unknown>;
};

export type LabSection =
  // Explanatory prose — same shape as the lecture prose (own eyebrow label).
  | { kind: "prose"; label: Localized; title: Localized; text: Localized }
  // A numbered, step-by-step procedure — the heart of a hands-on guide.
  | { kind: "steps"; title: Localized; intro?: Localized; steps: LabStep[] }
  // A standalone source-code listing (a whole file, e.g. the module or XDC).
  | { kind: "code"; title: Localized; intro?: Localized; block: CodeBlock }
  // A highlighted aside: tip / warning / note / verification check.
  | { kind: "callout"; variant: CalloutVariant; title?: Localized; text: Localized }
  // A verification checklist the student ticks off before moving on.
  | { kind: "checklist"; title: Localized; items: Localized[] }
  // An interactive helper (board pin map, clock-divider calculator).
  | { kind: "playground"; title: Localized; intro: Localized; instrument: LabInstrumentRef }
  // A didactic image / screenshot with an optional caption.
  | { kind: "figure"; title?: Localized; figure: LabFigure }
  // Reuses the lecture quiz data shape so the quiz component can be shared.
  | { kind: "quiz"; title: Localized; quizzes: QuizData[] };

export type Lab = {
  id: number;
  labLabel: Localized; // "Lab 1"
  title: Localized;
  goal: Localized; // one-line objective, shown in the header
  duration: Localized; // estimated time, e.g. "40–60 min"
  prereqs?: Localized[]; // what the student should have done first
  sections: LabSection[];
};

// Fixed eyebrow labels for the structural section kinds (prose brings its own).
export const labSectionKindLabel = {
  steps: { pt: "Passo a passo", en: "Step by step" },
  code: { pt: "Código", en: "Code" },
  playground: { pt: "Interativo", en: "Interactive" },
  figure: { pt: "Figura", en: "Figure" },
  checklist: { pt: "Verificação", en: "Checklist" },
  quiz: { pt: "Quiz", en: "Quiz" },
} satisfies Record<string, Localized>;

export const calloutLabel = {
  tip: { pt: "Dica", en: "Tip" },
  warning: { pt: "Atenção", en: "Warning" },
  note: { pt: "Nota", en: "Note" },
  check: { pt: "Confira", en: "Check" },
} satisfies Record<CalloutVariant, Localized>;

// The short label used for a section in the right-side outline. Prose brings its
// own; callouts fold under their variant; the rest use the fixed kind label.
export function labSectionLabel(section: LabSection): Localized {
  if (section.kind === "prose") return section.label;
  if (section.kind === "callout") return calloutLabel[section.variant];
  return labSectionKindLabel[section.kind];
}
