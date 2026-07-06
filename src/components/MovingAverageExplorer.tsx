import { useMemo, useState } from "react";
import { type Language, pick } from "../i18n.ts";

// A moving-average FIR smoothing a sum of two sinusoids (low + high frequency).
// Averaging M samples attenuates the high-frequency one and keeps the low — a
// lowpass. Sliding M shows stronger smoothing with more coefficients.

const N = 48;
const SLOW_CYCLES = 1.5;
const FAST_CYCLES = 9;

function inputSignal(): number[] {
  const x: number[] = [];
  for (let n = 0; n < N; n++) {
    x.push(
      40 * Math.sin((2 * Math.PI * SLOW_CYCLES * n) / N) +
        22 * Math.sin((2 * Math.PI * FAST_CYCLES * n) / N)
    );
  }
  return x;
}

// Causal M-point moving average: y(n) = (1/M) Σ_{k=0}^{M-1} x(n-k).
function movingAverage(x: number[], m: number): number[] {
  return x.map((_, n) => {
    let acc = 0;
    for (let k = 0; k < m; k++) acc += n - k >= 0 ? x[n - k] : 0;
    return acc / m;
  });
}

// Plot geometry.
const PX0 = 44;
const PX1 = 648;
const PY0 = 18;
const PY1 = 196;
const MID = (PY0 + PY1) / 2;
const AMP = 62;

const xPix = (n: number) => PX0 + (n * (PX1 - PX0)) / (N - 1);
const yPix = (v: number) => MID - (v * (PY1 - PY0)) / 2 / AMP;
const poly = (a: number[]) => a.map((v, n) => `${xPix(n)},${yPix(v)}`).join(" ");

export default function MovingAverageExplorer({ language }: { language: Language }) {
  const [m, setM] = useState(4);
  const x = useMemo(inputSignal, []);
  const y = useMemo(() => movingAverage(x, m), [x, m]);

  const t = {
    taps: { pt: "Coeficientes (M)", en: "Coefficients (M)" },
    input: { pt: "entrada x(n)", en: "input x(n)" },
    output: { pt: "saída y(n)", en: "output y(n)" },
    ir: {
      pt: `resposta ao impulso: ${m} coeficientes iguais a 1/${m}`,
      en: `impulse response: ${m} coefficients equal to 1/${m}`,
    },
    note: {
      pt: "A entrada é uma senoide de baixa frequência somada a uma de alta frequência. A média de M amostras deixa passar a componente lenta e apaga a rápida: é um passa-baixas. Aumente M e veja a suavização ficar mais forte. É esse o papel do filtro anti-aliasing que vem ANTES do ↓D (Aula 3).",
      en: "The input is a low-frequency sinusoid plus a high-frequency one. Averaging M samples lets the slow component through and kills the fast one: a lowpass. Raise M and watch the smoothing get stronger. That's the job of the anti-aliasing filter that comes BEFORE the ↓D (Lecture 3).",
    },
  };

  return (
    <div className="mavg">
      <div className="control">
        <label>
          {pick(t.taps, language)}: <span className="control-value">{m}</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={m}
          onChange={(e) => setM(Number(e.target.value))}
        />
      </div>

      <svg viewBox="0 0 660 210" className="mavg-plot" role="img">
        {/* zero axis */}
        <line x1={PX0} y1={MID} x2={PX1} y2={MID} stroke="var(--line)" strokeWidth="1" />
        {/* input (faint) */}
        <polyline
          points={poly(x)}
          fill="none"
          stroke="var(--ink-soft)"
          strokeWidth="1.5"
          opacity="0.5"
        />
        {/* output (bright) */}
        <polyline
          points={poly(y)}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="2.5"
        />
      </svg>

      <div className="mavg-legend">
        <span className="mavg-key mavg-key--in">{pick(t.input, language)}</span>
        <span className="mavg-key mavg-key--out">{pick(t.output, language)}</span>
      </div>

      {/* impulse response: M equal bars of height 1/M */}
      <div className="mavg-ir">
        <div className="mavg-ir-bars">
          {Array.from({ length: m }).map((_, k) => (
            <span key={k} className="mavg-bar" style={{ height: `${Math.max(8, 40 / m)}px` }} />
          ))}
        </div>
        <span className="mavg-ir-label">{pick(t.ir, language)}</span>
      </div>

      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
