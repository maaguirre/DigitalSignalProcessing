import { useState } from "react";
import { generateSine } from "../dsp";
import { type Language, type Localized, pick } from "../i18n.ts";

const W = 300;
const H = 124;
const P = { left: 32, right: 12, top: 14, bottom: 30 };
const pw = W - P.left - P.right;
const ph = H - P.top - P.bottom;
const base = P.top + ph / 2; // amplitude zero line (time plots)
const yb = P.top + ph; // bottom x-axis
const ampScale = (ph / 2) * 0.85;
const ampY = (v: number) => base - v * ampScale;
const axis = "var(--ink-soft)";

function AmpAxis() {
  return (
    <>
      <line x1={P.left} y1={P.top} x2={P.left} y2={yb} stroke="var(--line)" />
      <line x1={P.left} y1={base} x2={P.left + pw} y2={base} stroke="var(--line)" strokeOpacity="0.5" />
      <text x={P.left - 4} y={ampY(1) + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">+1</text>
      <text x={P.left - 4} y={base + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">0</text>
      <text x={P.left - 4} y={ampY(-1) + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">−1</text>
    </>
  );
}

function BottomAxis({
  ticks,
  title,
}: {
  ticks: { x: number; label: string }[];
  title: string;
}) {
  return (
    <>
      <line x1={P.left} y1={yb} x2={P.left + pw} y2={yb} stroke="var(--line)" />
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={t.x} y1={yb} x2={t.x} y2={yb + 4} stroke={axis} />
          <text x={t.x} y={yb + 13} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
            {t.label}
          </text>
        </g>
      ))}
      <text x={P.left + pw} y={H - 3} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">
        {title}
      </text>
    </>
  );
}

function TimeLine({ data }: { data: number[] }) {
  const path = data
    .map((v, i) => {
      const x = P.left + (i / (data.length - 1)) * pw;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ampY(v).toFixed(1)}`;
    })
    .join(" ");
  const ticks = [0, 0.5, 1].map((frac) => ({
    x: P.left + frac * pw,
    label: frac === 0.5 ? "0,5" : `${frac}`,
  }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <AmpAxis />
      <path d={path} fill="none" stroke="var(--signal)" strokeWidth="1.5" />
      <BottomAxis ticks={ticks} title="t (s)" />
    </svg>
  );
}

function TimeStem({ samples }: { samples: number[] }) {
  const n = samples.length;
  const xOf = (i: number) => P.left + (i / (n - 1)) * pw;
  const ticks = [0, Math.floor((n - 1) / 2), n - 1].map((k) => ({
    x: xOf(k),
    label: `${k}`,
  }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <AmpAxis />
      {samples.map((v, i) => {
        const x = xOf(i);
        return (
          <g key={i}>
            <line x1={x} y1={base} x2={x} y2={ampY(v)} stroke="var(--signal)" />
            <circle cx={x} cy={ampY(v)} r={2} fill="var(--signal)" />
          </g>
        );
      })}
      <BottomAxis ticks={ticks} title="n (amostra)" />
    </svg>
  );
}

function Spec({
  spikes,
  axisMax,
  ticks,
  passband,
}: {
  spikes: number[];
  axisMax: number;
  ticks: number[];
  passband?: number;
}) {
  const xOf = (f: number) => P.left + (f / axisMax) * pw;
  const specTop = P.top + 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {passband !== undefined && (
        <rect x={P.left} y={specTop} width={xOf(passband) - P.left} height={yb - specTop} fill="var(--signal)" fillOpacity="0.1" />
      )}
      {ticks.map((f, i) => (
        <line key={"g" + i} x1={xOf(f)} y1={specTop - 2} x2={xOf(f)} y2={yb} stroke="var(--line)" strokeOpacity="0.5" />
      ))}
      <line x1={P.left} y1={specTop - 4} x2={P.left} y2={yb} stroke="var(--line)" />
      <line x1={P.left} y1={yb} x2={P.left + pw} y2={yb} stroke="var(--line)" />
      <text x={P.left - 4} y={specTop + 2} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">|X|</text>

      {spikes.map((f, i) => {
        const x = xOf(f);
        return (
          <g key={i}>
            <line x1={x} y1={yb} x2={x} y2={specTop} stroke="var(--signal)" />
            <circle cx={x} cy={specTop} r={2} fill="var(--signal)" />
            <text x={x} y={specTop - 3} fill="var(--signal)" fontSize="8.5" fontFamily="var(--font-mono)" textAnchor="middle">
              {f}
            </text>
          </g>
        );
      })}

      {ticks.map((f, i) => (
        <g key={"t" + i}>
          <line x1={xOf(f)} y1={yb} x2={xOf(f)} y2={yb + 4} stroke={axis} />
          <text x={xOf(f)} y={yb + 13} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
            {f}
          </text>
        </g>
      ))}
      <text x={P.left + pw} y={H - 3} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">f (Hz)</text>
    </svg>
  );
}

export default function SamplingFigure({ language }: { language: Language }) {
  const fs = 16;
  const [f, setF] = useState(3);

  const cont = generateSine(f, 200, 200);
  const samp = generateSine(f, fs, fs);
  const axisMax = 2 * fs;
  const replicas = [f, fs - f, fs + f, 2 * fs - f].filter((v) => v >= 0 && v <= axisMax);
  const ticks = [0, fs / 2, fs, (3 * fs) / 2, 2 * fs];

  const labels = {
    freq: { pt: "Frequência do sinal f (Hz)", en: "Signal frequency f (Hz)" },
    sigT: { pt: "Sinal — tempo", en: "Signal — time" },
    sigF: { pt: "Sinal — espectro", en: "Signal — spectrum" },
    sampT: { pt: "Amostrado — tempo", en: "Sampled — time" },
    sampF: { pt: "Amostrado — espectro (réplicas a cada fs)", en: "Sampled — spectrum (replicas every fs)" },
    outT: { pt: "Saída após filtro — tempo", en: "Output after filter — time" },
    outF: { pt: "Saída após filtro — espectro (só a banda base)", en: "Output after filter — spectrum (baseband only)" },
  } satisfies Record<string, Localized>;

  const readout: Localized = {
    pt: `f = ${f} Hz · fs = ${fs} Hz · Nyquist fs/2 = ${fs / 2} Hz`,
    en: `f = ${f} Hz · fs = ${fs} Hz · Nyquist fs/2 = ${fs / 2} Hz`,
  };

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(labels.freq, language)}: <span className="control-value">{f}</span>
          </span>
          <input type="range" min={1} max={7} step={1} value={f} onChange={(e) => setF(Number(e.target.value))} />
        </label>
      </div>

      <div className="fig-row">
        <div className="fig-cell">
          <p className="plot-label">{pick(labels.sigT, language)}</p>
          <TimeLine data={cont} />
        </div>
        <div className="fig-cell">
          <p className="plot-label">{pick(labels.sigF, language)}</p>
          <Spec spikes={[f]} axisMax={axisMax} ticks={ticks} />
        </div>
      </div>

      <div className="fig-row">
        <div className="fig-cell">
          <p className="plot-label">{pick(labels.sampT, language)}</p>
          <TimeStem samples={samp} />
        </div>
        <div className="fig-cell">
          <p className="plot-label">{pick(labels.sampF, language)}</p>
          <Spec spikes={replicas} axisMax={axisMax} ticks={ticks} />
        </div>
      </div>

      <div className="fig-row">
        <div className="fig-cell">
          <p className="plot-label">{pick(labels.outT, language)}</p>
          <TimeLine data={cont} />
        </div>
        <div className="fig-cell">
          <p className="plot-label">{pick(labels.outF, language)}</p>
          <Spec spikes={[f]} axisMax={axisMax} ticks={ticks} passband={fs / 2} />
        </div>
      </div>

      <p className="readout">{pick(readout, language)}</p>
    </div>
  );
}
