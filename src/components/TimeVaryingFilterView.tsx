import { useEffect, useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  up: { pt: "Fator I", en: "Factor I" },
  down: { pt: "Fator D", en: "Factor D" },
  play: { pt: "▶ Animar m", en: "▶ Play m" },
  pause: { pt: "⏸ Pausar", en: "⏸ Pause" },
  out: { pt: "Saída m", en: "Output m" },
  timelineLabel: {
    pt: "Sequência de saídas — a cor é a fase que cada uma usa. O padrão se repete (o ciclo):",
    en: "Sequence of outputs — the colour is the phase each one uses. The pattern repeats (the cycle):",
  },
  phasesLabel: {
    pt: "As I fases (fatias) do filtro — a fase da saída atual fica acesa:",
    en: "The I phases (slices) of the filter — the current output's phase lights up:",
  },
  phase: { pt: "fase", en: "phase" },
  note: {
    pt: "O filtro h é fatiado em I fases: a fase p junta os coeficientes h(p), h(p+I), h(p+2I)… A saída m usa a fase p = (mD) mod I — por isso a saída atual e a sua fase acendem na mesma cor. Existem I fases: mudar I muda o número de fases; mudar D muda a ORDEM em que são visitadas. Quando I e D não têm fator comum, as cores se repetem a cada I saídas. Guardar essas fases separadas, cada uma cuidando de uma saída, é a estrutura polifásica da Aula 8.",
    en: "The filter h is sliced into I phases: phase p gathers the coefficients h(p), h(p+I), h(p+2I)… Output m uses phase p = (mD) mod I — that is why the current output and its phase light up in the same colour. There are I phases: changing I changes the number of phases; changing D changes the ORDER they are visited. When I and D share no common factor, the colours repeat every I outputs. Storing those phases separately, each handling one output, is Lecture 8's polyphase structure.",
  },
} satisfies Record<string, Localized>;

const COLORS = ["var(--signal)", "var(--brand-trace)", "var(--ok)", "#b58cf0"];
const phaseColor = (p: number) => COLORS[p % COLORS.length];
const axis = "var(--ink-soft)";

// The rational converter as a time-varying filter: h is sliced into I phases;
// output m uses phase p = (mD) mod I. The current output and its phase share a
// colour; the phase cycles with period I.
export default function TimeVaryingFilterView({ language }: { language: Language }) {
  const [I, setI] = useState(3);
  const [D, setD] = useState(2);
  const [m, setM] = useState(0);
  const [playing, setPlaying] = useState(true);

  const taps = 3; // coefficients per phase (filter length = taps·I)
  const mCount = 2 * I; // two cycles of outputs
  const mSafe = ((m % mCount) + mCount) % mCount;
  const phaseOf = (mm: number) => (((mm * D) % I) + I) % I;
  const active = phaseOf(mSafe);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setM((p) => (p + 1) % mCount), 850);
    return () => clearInterval(id);
  }, [playing, mCount]);

  const changeI = (ni: number) => {
    setI(ni);
    setM((mm) => mm % (2 * ni)); // keep m in range for the new mCount
  };

  const W = 600;
  // timeline
  const tlPad = 14;
  const tlStep = (W - 2 * tlPad) / mCount;
  const box = Math.min(30, tlStep - 5);
  const boxX = (mm: number) => tlPad + mm * tlStep + (tlStep - box) / 2;
  const tlBoxY = 6;
  const tlH = tlBoxY + box + 20;
  // phase rows
  const rowH = 44;
  const rowY = (p: number) => 12 + p * rowH + rowH / 2;
  const phH = I * rowH + 24;
  const coefX = (n: number) => 118 + n * 150;

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <button className="toggle-btn present-btn" onClick={() => setPlaying((q) => !q)}>
          {playing ? pick(t.pause, language) : pick(t.play, language)}
        </button>
        <label className="control">
          <span>{pick(t.up, language)}: <span className="control-value">{I}</span></span>
          <input type="range" min={2} max={4} step={1} value={I} onChange={(e) => changeI(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>{pick(t.down, language)}: <span className="control-value">{D}</span></span>
          <input type="range" min={2} max={4} step={1} value={D} onChange={(e) => setD(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>{pick(t.out, language)}: <span className="control-value">{mSafe}</span></span>
          <input type="range" min={0} max={mCount - 1} step={1} value={mSafe} onChange={(e) => { setM(Number(e.target.value)); setPlaying(false); }} />
        </label>
      </div>

      <p className="readout">
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>
          m = {mSafe} → p = ({mSafe}·{D}) mod {I} = {active}
        </span>{" "}
        <span className="badge" style={{ background: phaseColor(active), color: "#0c1620" }}>
          {pick(t.phase, language)} {active}
        </span>
      </p>

      <p className="plot-label">{pick(t.timelineLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${tlH}`} width="100%" style={{ display: "block" }}>
        {Array.from({ length: mCount }, (_, mm) => {
          const p = phaseOf(mm);
          const cur = mm === mSafe;
          return (
            <g key={mm}>
              <rect x={boxX(mm)} y={tlBoxY} width={box} height={box} rx="4" fill={phaseColor(p)} fillOpacity={cur ? 0.9 : 0.32} stroke={cur ? "var(--ink)" : "none"} strokeWidth={cur ? 2.5 : 0} />
              <text x={boxX(mm) + box / 2} y={tlBoxY + box / 2 + 4} fill={cur ? "#0c1620" : "var(--ink)"} fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">{mm}</text>
              <text x={boxX(mm) + box / 2} y={tlBoxY + box + 13} fill={axis} fontSize="8.5" fontFamily="var(--font-mono)" textAnchor="middle">{p}</text>
            </g>
          );
        })}
      </svg>

      <p className="plot-label">{pick(t.phasesLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${phH}`} width="100%" style={{ display: "block" }}>
        {Array.from({ length: I }, (_, p) => {
          const on = p === active;
          return (
            <g key={p}>
              {on && <rect x={6} y={rowY(p) - rowH / 2 + 5} width={W - 12} height={rowH - 10} rx="6" fill={phaseColor(p)} fillOpacity="0.13" stroke={phaseColor(p)} strokeOpacity="0.6" />}
              <text x={16} y={rowY(p) + 4} fill={on ? phaseColor(p) : axis} fontSize="12" fontFamily="var(--font-mono)" fontWeight={on ? 700 : 400}>
                {pick(t.phase, language)} {p}
              </text>
              {Array.from({ length: taps }, (_, n) => {
                const idx = p + n * I;
                return (
                  <g key={n}>
                    <circle cx={coefX(n)} cy={rowY(p)} r={on ? 6 : 4} fill={phaseColor(p)} fillOpacity={on ? 0.95 : 0.4} />
                    <text x={coefX(n) + 14} y={rowY(p) + 4} fill={on ? "var(--ink)" : axis} fontSize="10.5" fontFamily="var(--font-mono)">h({idx})</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
