import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  cutoff: { pt: "Largura de banda fc", en: "Bandwidth fc" },
} satisfies Record<string, Localized>;

// Interactive: a signal whose energy sits in a low band [0, fc]. As fc
// shrinks, the minimum rate 2·fc drops and the achievable decimation factor
// D = ⌊Fs / 2·fc⌋ grows — the motivation, made visible.
export default function BandwidthExplorer({
  language,
  sampleRate = 20,
}: {
  language: Language;
  sampleRate?: number;
}) {
  const nyquist = sampleRate / 2;
  const [fc, setFc] = useState(2);
  const minRate = 2 * fc;
  const factor = Math.max(1, Math.floor(sampleRate / minRate));

  const width = 600;
  const height = 200;
  const pad = { left: 40, right: 20, top: 20, bottom: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const baseline = pad.top + plotH;
  const topY = pad.top + 6;
  const xOf = (f: number) => pad.left + (f / nyquist) * plotW;
  const xfc = xOf(fc);
  const hump = `M ${pad.left} ${baseline} L ${pad.left} ${topY} Q ${
    (pad.left + xfc) / 2
  } ${topY} ${xfc} ${baseline} Z`;

  const readout: Localized = {
    pt: `O sinal ocupa 0–${fc} kHz. Basta a taxa 2·fc = ${minRate} kHz (hoje: Fs = ${sampleRate} kHz) → dá para decimar por`,
    en: `The signal occupies 0–${fc} kHz. Rate 2·fc = ${minRate} kHz suffices (now: Fs = ${sampleRate} kHz) → you can decimate by`,
  };

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.cutoff, language)}:{" "}
            <span className="control-value">{fc} kHz</span>
          </span>
          <input
            type="range"
            min={1}
            max={nyquist}
            step={1}
            value={fc}
            onChange={(e) => setFc(Number(e.target.value))}
          />
        </label>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={pick(t.cutoff, language)}
        style={{ display: "block" }}
      >
        <rect
          x={xfc}
          y={topY}
          width={pad.left + plotW - xfc}
          height={baseline - topY}
          fill="var(--brand-trace)"
          fillOpacity="0.07"
        />
        <line
          x1={pad.left}
          y1={baseline}
          x2={pad.left + plotW}
          y2={baseline}
          stroke="var(--line)"
        />
        <path d={hump} fill="var(--signal)" fillOpacity="0.35" stroke="var(--signal)" />
        <line
          x1={xfc}
          y1={topY}
          x2={xfc}
          y2={baseline}
          stroke="var(--signal)"
          strokeDasharray="4 3"
        />
        <text
          x={pad.left}
          y={height - 14}
          fill="var(--ink-soft)"
          fontSize="12"
          fontFamily="var(--font-mono)"
          textAnchor="start"
        >
          0
        </text>
        <text
          x={xfc}
          y={height - 14}
          fill="var(--signal)"
          fontSize="12"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
        >
          fc
        </text>
        <text
          x={pad.left + plotW}
          y={height - 14}
          fill="var(--ink-soft)"
          fontSize="12"
          fontFamily="var(--font-mono)"
          textAnchor="end"
        >
          fs/2 = {nyquist} kHz
        </text>
      </svg>

      <p className="readout">
        {pick(readout, language)}{" "}
        <span className="badge badge--alias">D = {factor}</span>
      </p>
    </div>
  );
}
