import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  freq: { pt: "Frequência do sinal f", en: "Signal frequency f" },
  factor: { pt: "Fator de decimação D", en: "Decimation factor D" },
  alias: { pt: "Aliasing!", en: "Aliasing!" },
  ok: { pt: "Sem aliasing", en: "No aliasing" },
  baseband: { pt: "banda que sobrevive", en: "surviving band" },
  foldZone: { pt: "aqui dobra → alias", en: "folds here → alias" },
} satisfies Record<string, Localized>;

function fold(f: number, rate: number): number {
  const mod = ((f % rate) + rate) % rate;
  return mod <= rate / 2 ? mod : rate - mod;
}

// Slide: intuitive aliasing. Decimating by D makes the new Nyquist drop to fs/2D.
// A signal above it does not vanish — it reappears (folds) at a lower, false
// frequency inside the new baseband. The fold is drawn as a curved arrow.
export default function AliasingView({ language }: { language: Language }) {
  const fs = 32;
  const [f, setF] = useState(6);
  const [D, setD] = useState(2);

  const newRate = fs / D;
  const newNyquist = newRate / 2;
  const apparent = fold(f, newRate);
  const aliasing = f > newNyquist;

  const width = 600;
  const height = 210;
  const pad = { left: 30, right: 16, top: 40, bottom: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const yb = pad.top + plotH;
  const top = pad.top + 4;
  const xOf = (freq: number) => pad.left + (freq / (fs / 2)) * plotW;
  const axis = "var(--ink-soft)";

  const xf = xOf(f);
  const xa = xOf(apparent);
  const arrow = `M ${xf} ${top} Q ${(xf + xa) / 2} ${top - 26} ${xa} ${top}`;

  const readout: Localized = {
    pt: `Ao decimar por ${D}, a banda base cai para [0, ${newNyquist}] Hz. O sinal em ${f} Hz reaparece em ${apparent} Hz.`,
    en: `Decimating by ${D}, the baseband drops to [0, ${newNyquist}] Hz. The signal at ${f} Hz reappears at ${apparent} Hz.`,
  };

  const foldLabel: Localized = {
    pt: `reaparece em ${apparent} Hz`,
    en: `reappears at ${apparent} Hz`,
  };

  const nyquistNote: Localized = {
    pt: "A linha tracejada é o novo limite de Nyquist: depois de ↓D a taxa vira fs/D, então a maior frequência que sobrevive cai para fs/2D. Acima dela, o sinal dobra de volta para dentro da banda base.",
    en: "The dashed line is the new Nyquist limit: after ↓D the sample rate becomes fs/D, so the highest surviving frequency drops to fs/2D. Above it, the signal folds back into the baseband.",
  };

  const axisTicks: number[] = [];
  for (let hz = 0; hz <= fs / 2; hz += 2) axisTicks.push(hz);

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.freq, language)}: <span className="control-value">{f}</span>
          </span>
          <input type="range" min={1} max={fs / 2} step={1} value={f} onChange={(e) => setF(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>
            {pick(t.factor, language)}: <span className="control-value">{D}</span>
          </span>
          <input type="range" min={2} max={8} step={1} value={D} onChange={(e) => setD(Number(e.target.value))} />
        </label>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={pick(t.freq, language)} style={{ display: "block" }}>
        {/* new baseband (safe zone) */}
        <rect x={pad.left} y={top} width={xOf(newNyquist) - pad.left} height={yb - top} fill="var(--ok)" fillOpacity="0.08" />
        {/* danger zone */}
        <rect x={xOf(newNyquist)} y={top} width={pad.left + plotW - xOf(newNyquist)} height={yb - top} fill="var(--brand-trace)" fillOpacity="0.07" />

        {/* zone names */}
        <text x={(pad.left + xOf(newNyquist)) / 2} y={yb - 6} fill="var(--ok)" fillOpacity="0.75" fontSize="9" fontFamily="var(--font-body)" textAnchor="middle">
          {pick(t.baseband, language)}
        </text>
        <text x={(xOf(newNyquist) + pad.left + plotW) / 2} y={yb - 6} fill="var(--brand-trace)" fillOpacity="0.75" fontSize="9" fontFamily="var(--font-body)" textAnchor="middle">
          {pick(t.foldZone, language)}
        </text>

        <line x1={pad.left} y1={top} x2={pad.left} y2={yb} stroke="var(--line)" />
        <line x1={pad.left} y1={yb} x2={pad.left + plotW} y2={yb} stroke="var(--line)" />

        {/* new Nyquist marker */}
        <line x1={xOf(newNyquist)} y1={top} x2={xOf(newNyquist)} y2={yb} stroke="var(--ink-soft)" strokeDasharray="4 3" />
        <text x={xOf(newNyquist)} y={pad.top - 6} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
          fs/2D = {newNyquist} Hz
        </text>

        {/* the signal */}
        <line x1={xf} y1={yb} x2={xf} y2={top} stroke="var(--signal)" />
        <circle cx={xf} cy={top} r={3.5} fill="var(--signal)" />
        <text x={xf} y={top - 6} fill="var(--signal)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
          f = {f} Hz
        </text>

        {/* the folded (aliased) reappearance */}
        {aliasing && (
          <>
            <path d={arrow} fill="none" stroke="var(--brand-trace)" strokeDasharray="3 3" />
            <line x1={xa} y1={yb} x2={xa} y2={top} stroke="var(--brand-trace)" />
            <circle cx={xa} cy={top} r={3.5} fill="var(--brand-trace)" />
            <text x={xa} y={yb + 30} fill="var(--brand-trace)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
              {pick(foldLabel, language)}
            </text>
          </>
        )}

        {axisTicks.map((tk, i) => (
          <g key={i}>
            <line x1={xOf(tk)} y1={yb} x2={xOf(tk)} y2={yb + 4} stroke={axis} />
            <text x={xOf(tk)} y={yb + 15} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
              {tk}
            </text>
          </g>
        ))}
        <text x={pad.left + plotW} y={height - 3} fill={axis} fontSize="10" fontFamily="var(--font-body)" textAnchor="end">f (Hz)</text>
      </svg>

      <p className="plot-note">{pick(nyquistNote, language)}</p>

      <p className="readout">
        {pick(readout, language)}{" "}
        <span className={aliasing ? "badge badge--alias" : "badge badge--ok"}>
          {aliasing ? pick(t.alias, language) : pick(t.ok, language)}
        </span>
      </p>
    </div>
  );
}
