import { useState } from "react";
import { generateSine, downsample } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Período D do trem de impulsos", en: "Impulse-train period D" },
} satisfies Record<string, Localized>;

// Downsampling seen as a multiplication by an impulse train.
// x(n) · p(n) = x̄(n) (zeros between kept samples) → compress → y(m) = x̄(mD).
export default function ImpulseTrainView({
  language,
  numSamples = 36,
  toneFreq = 2,
}: {
  language: Language;
  numSamples?: number;
  toneFreq?: number;
}) {
  const [factor, setFactor] = useState(3);

  const x = generateSine(toneFreq, numSamples, numSamples);
  const p = x.map((_, i) => (i % factor === 0 ? 1 : 0));
  const xbar = x.map((v, i) => v * p[i]);
  const y = downsample(x, factor);

  const labels = {
    x: { pt: "x(n) — sinal original", en: "x(n) — original signal" },
    p: {
      pt: `p(n) — trem de impulsos (período D = ${factor})`,
      en: `p(n) — impulse train (period D = ${factor})`,
    },
    xbar: {
      pt: "x̄(n) = x(n) · p(n) — o produto (zeros entre as mantidas)",
      en: "x̄(n) = x(n) · p(n) — the product (zeros between kept samples)",
    },
    y: {
      pt: `y(m) — as mesmas amostras mantidas, agora sem os zeros (na taxa menor Fy)`,
      en: `y(m) — the same kept samples, now without the zeros (at the lower rate Fy)`,
    },
  } satisfies Record<string, Localized>;

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
            max={9}
            step={1}
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="plot-label">{pick(labels.x, language)}</p>
      <StemPlot language={language} samples={x} yMax={1} keep={factor} label={pick(labels.x, language)} />

      <p className="plot-label">{pick(labels.p, language)}</p>
      <StemPlot language={language} samples={p} yMax={1} label={pick(labels.p, language)} />

      <p className="plot-label">{pick(labels.xbar, language)}</p>
      <StemPlot language={language} samples={xbar} yMax={1} label={pick(labels.xbar, language)} />

      <p className="plot-label">{pick(labels.y, language)}</p>
      <StemPlot language={language} samples={y} yMax={1} label={pick(labels.y, language)} />
    </div>
  );
}
