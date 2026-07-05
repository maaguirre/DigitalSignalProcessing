import { useState } from "react";
import { generateSine, downsample } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de decimação D", en: "Decimation factor D" },
} satisfies Record<string, Localized>;

// Slide 4: the downsampler in time. x(n) keeps 1 of every D samples (highlighted);
// y(m) = x(mD) is the compressed result.
export default function DownsampleView({
  language,
  numSamples = 60,
  toneFreq = 2,
}: {
  language: Language;
  numSamples?: number;
  toneFreq?: number;
}) {
  const [factor, setFactor] = useState(3);

  const x = generateSine(toneFreq, numSamples, numSamples);
  const y = downsample(x, factor);

  const inLabel: Localized = {
    pt: `x(n) — mantendo 1 a cada ${factor} amostras`,
    en: `x(n) — keeping 1 of every ${factor} samples`,
  };
  const outLabel: Localized = {
    pt: `y(m) = x(${factor}m) — o sinal decimado`,
    en: `y(m) = x(${factor}m) — the decimated signal`,
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
            max={16}
            step={1}
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="plot-label">{pick(inLabel, language)}</p>
      <StemPlot samples={x} yMax={1} keep={factor} label={pick(inLabel, language)} />

      <p className="plot-label">{pick(outLabel, language)}</p>
      <StemPlot samples={y} yMax={1} label={pick(outLabel, language)} />
    </div>
  );
}
