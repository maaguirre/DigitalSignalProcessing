import { useState } from "react";
import { generateSine, downsample } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  delay: { pt: "Atraso k (amostras)", en: "Delay k (samples)" },
  equal: { pt: "Iguais", en: "Equal" },
  diff: {
    pt: "Diferentes → variante no deslocamento!",
    en: "Different → shift-varying!",
  },
} satisfies Record<string, Localized>;

function delayBy(a: number[], k: number): number[] {
  return [...new Array<number>(k).fill(0), ...a];
}

function sameSignal(a: number[], b: number[]): boolean {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (Math.abs((a[i] ?? 0) - (b[i] ?? 0)) > 1e-6) return false;
  }
  return true;
}

export default function ShiftVaryingView({
  language,
  numSamples = 16,
  factor = 2,
  toneFreq = 2,
}: {
  language: Language;
  numSamples?: number;
  factor?: number;
  toneFreq?: number;
}) {
  const [k, setK] = useState(1);

  const x = generateSine(toneFreq, numSamples, numSamples);
  const pathA = downsample(delayBy(x, k), factor);
  const pathB = delayBy(downsample(x, factor), k);
  const equal = sameSignal(pathA, pathB);

  const labelA: Localized = {
    pt: `Atrasar a entrada por ${k}, depois ↓${factor}`,
    en: `Delay the input by ${k}, then ↓${factor}`,
  };
  const labelB: Localized = {
    pt: `↓${factor}, depois atrasar a saída por ${k}`,
    en: `↓${factor}, then delay the output by ${k}`,
  };

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.delay, language)}: <span className="control-value">{k}</span>
          </span>
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="plot-label">{pick(labelA, language)}</p>
      <StemPlot samples={pathA} yMax={1} label={pick(labelA, language)} />

      <p className="plot-label">{pick(labelB, language)}</p>
      <StemPlot samples={pathB} yMax={1} label={pick(labelB, language)} />

      <p className="readout">
        <span className={equal ? "badge badge--ok" : "badge badge--alias"}>
          {equal ? pick(t.equal, language) : pick(t.diff, language)}
        </span>
      </p>
    </div>
  );
}
