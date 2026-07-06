import { useState } from "react";
import { generateSine, upsample } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
} satisfies Record<string, Localized>;

// The upsampler in time. v(m) = x(m/I): the original samples (highlighted) with
// I-1 zeros interlaced between them; the signal is I times longer.
export default function UpsampleView({
  language,
  numSamples = 10,
  toneFreq = 1,
}: {
  language: Language;
  numSamples?: number;
  toneFreq?: number;
}) {
  const [factor, setFactor] = useState(3);

  const x = generateSine(toneFreq, numSamples, numSamples);
  const v = upsample(x, factor);

  const inLabel: Localized = {
    pt: "x(n) — o sinal original",
    en: "x(n) — the original signal",
  };
  const outLabel: Localized = {
    pt: `v(m) — com ${factor - 1} zero(s) entre as amostras (↑${factor})`,
    en: `v(m) — with ${factor - 1} zero(s) between samples (↑${factor})`,
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
            max={6}
            step={1}
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="plot-label">{pick(inLabel, language)}</p>
      <StemPlot language={language} samples={x} yMax={1} label={pick(inLabel, language)} />

      <p className="plot-label">{pick(outLabel, language)}</p>
      <StemPlot language={language} samples={v} yMax={1} keep={factor} label={pick(outLabel, language)} />
    </div>
  );
}
