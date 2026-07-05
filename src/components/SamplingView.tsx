import { useState } from "react";
import { generateSine } from "../dsp";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  rate: { pt: "Taxa de amostragem Fs (Hz)", en: "Sampling rate Fs (Hz)" },
} satisfies Record<string, Localized>;

// Slide 2: a continuous signal (a 2 Hz tone over a 1 s window) and the samples
// taken from it at rate Fs. Axes carry real numbers; the readout tracks the
// slider (Fs, the interval T = 1/Fs, and the sample count).
export default function SamplingView({ language }: { language: Language }) {
  const signalFreq = 2; // Hz
  const windowSec = 1; // s
  const [fs, setFs] = useState(12);

  const width = 600;
  const height = 210;
  const pad = { left: 46, right: 16, top: 16, bottom: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const baseline = pad.top + plotH / 2;
  const axis = "var(--ink-soft)";

  const xOf = (time: number) => pad.left + (time / windowSec) * plotW;
  const yOf = (v: number) => baseline - v * (plotH / 2) * 0.9;

  const N = 400;
  const contPath = Array.from({ length: N }, (_, i) => {
    const time = (i / (N - 1)) * windowSec;
    const v = Math.cos(2 * Math.PI * signalFreq * time);
    return `${i === 0 ? "M" : "L"} ${xOf(time).toFixed(1)} ${yOf(v).toFixed(1)}`;
  }).join(" ");

  const samples = generateSine(signalFreq, fs, Math.round(fs * windowSec));

  const readout: Localized = {
    pt: `Fs = ${fs} Hz · T = 1/Fs = ${(1000 / fs).toFixed(1)} ms · ${samples.length} amostras em ${windowSec}s`,
    en: `Fs = ${fs} Hz · T = 1/Fs = ${(1000 / fs).toFixed(1)} ms · ${samples.length} samples in ${windowSec}s`,
  };

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.rate, language)}: <span className="control-value">{fs}</span>
          </span>
          <input
            type="range"
            min={4}
            max={40}
            step={1}
            value={fs}
            onChange={(e) => setFs(Number(e.target.value))}
          />
        </label>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={pick(t.rate, language)} style={{ display: "block" }}>
        {/* axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="var(--line)" />
        <line x1={pad.left} y1={baseline} x2={pad.left + plotW} y2={baseline} stroke="var(--line)" />

        {/* y ticks: amplitude */}
        <text x={pad.left - 6} y={pad.top + 4} fill={axis} fontSize="11" fontFamily="var(--font-mono)" textAnchor="end">+1</text>
        <text x={pad.left - 6} y={baseline + 4} fill={axis} fontSize="11" fontFamily="var(--font-mono)" textAnchor="end">0</text>
        <text x={pad.left - 6} y={pad.top + plotH + 2} fill={axis} fontSize="11" fontFamily="var(--font-mono)" textAnchor="end">−1</text>

        <path d={contPath} fill="none" stroke="var(--ink-soft)" strokeWidth="1.5" />
        {samples.map((v, i) => {
          const time = (i / fs) * 1;
          const x = xOf(time);
          const y = yOf(v);
          return (
            <g key={i}>
              <line x1={x} y1={baseline} x2={x} y2={y} stroke="var(--signal)" />
              <circle cx={x} cy={y} r={3} fill="var(--signal)" />
            </g>
          );
        })}

        {/* x ticks: time */}
        <text x={pad.left} y={height - 16} fill={axis} fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">0</text>
        <text x={xOf(0.5)} y={height - 16} fill={axis} fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">0,5</text>
        <text x={pad.left + plotW} y={height - 16} fill={axis} fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">1</text>
        <text x={pad.left + plotW / 2} y={height - 4} fill={axis} fontSize="11" fontFamily="var(--font-body)" textAnchor="middle">tempo (s)</text>
        <text x={pad.left - 30} y={pad.top - 4} fill={axis} fontSize="11" fontFamily="var(--font-body)" textAnchor="start">amplitude</text>
      </svg>

      <p className="readout">{pick(readout, language)}</p>
    </div>
  );
}
