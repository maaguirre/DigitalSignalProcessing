import { useState } from "react";
import { generateSine, upsample } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
} satisfies Record<string, Localized>;

// Interactive rate conversion as linear filtering.
//  Input x(n) at Fx → insert I-1 zeros (↑I) → the filter fills the
// zeros → output y(m) at Fy = I·Fx. Same signal, denser.
export default function RateConversionView({
  language,
  baseRate = 16,
  numSamples = 16,
  toneFreq = 1,
}: {
  language: Language;
  baseRate?: number;
  numSamples?: number;
  toneFreq?: number;
}) {
  const [factor, setFactor] = useState(3);

  const x = generateSine(toneFreq, baseRate, numSamples);
  const zeros = upsample(x, factor);
  const y = generateSine(toneFreq, baseRate * factor, numSamples * factor);

  const inputLabel: Localized = {
    pt: `Entrada x(n) — Fx = ${baseRate}`,
    en: `Input x(n) — Fx = ${baseRate}`,
  };
  const zerosLabel: Localized = {
    pt: `Após ↑${factor}: zeros a preencher`,
    en: `After ↑${factor}: zeros to fill`,
  };
  const outputLabel: Localized = {
    pt: `Saída y(m) — Fy = ${baseRate * factor} (o filtro preencheu os zeros)`,
    en: `Output y(m) — Fy = ${baseRate * factor} (the filter filled the zeros)`,
  };

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.factor, language)}:{" "}
            <span className="control-value">{factor}</span>
          </span>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="plot-label">{pick(inputLabel, language)}</p>
      <StemPlot language={language} samples={x} yMax={1} label={pick(inputLabel, language)} />

      <p className="plot-label">{pick(zerosLabel, language)}</p>
      <StemPlot language={language} samples={zeros} yMax={1} label={pick(zerosLabel, language)} />

      <p className="plot-label">{pick(outputLabel, language)}</p>
      <StemPlot language={language} samples={y} yMax={1} label={pick(outputLabel, language)} />
    </div>
  );
}
