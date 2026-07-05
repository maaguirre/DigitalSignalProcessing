import { useState } from "react";
import { generateSine, downsample, magnitudeSpectrum } from "../dsp";
import SpectrumPlot from "./SpectrumPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

type SpectrumExplorerProps = {
  language: Language;
  sampleRate?: number;
  numSamples?: number;
  initialFrequency?: number;
  initialFactor?: number;
  maxFactor?: number;
};

// Fold a frequency into [0, sampleRate/2] — the frequency a tone appears at
// once it is (re)sampled at `sampleRate`. This is what makes aliasing visible.
function foldFrequency(frequency: number, sampleRate: number): number {
  const mod = ((frequency % sampleRate) + sampleRate) % sampleRate;
  return mod <= sampleRate / 2 ? mod : sampleRate - mod;
}

const t = {
  toneFrequency: { pt: "Frequência do sinal", en: "Signal frequency" },
  decimation: { pt: "Fator de decimação D", en: "Decimation factor D" },
  aliasing: { pt: "Aliasing!", en: "Aliasing!" },
  noAliasing: { pt: "Sem aliasing", en: "No aliasing" },
} satisfies Record<string, Localized>;

export default function SpectrumExplorer({
  language,
  sampleRate = 64,
  numSamples = 256,
  initialFrequency = 6,
  initialFactor = 2,
  maxFactor = 8,
}: SpectrumExplorerProps) {
  const [frequency, setFrequency] = useState(initialFrequency);
  const [factor, setFactor] = useState(initialFactor);

  const original = generateSine(frequency, sampleRate, numSamples);
  const decimated = downsample(original, factor);
  const newRate = sampleRate / factor;

  const originalSpectrum = magnitudeSpectrum(original, sampleRate);
  const decimatedSpectrum = magnitudeSpectrum(decimated, newRate);

  const newNyquist = newRate / 2;
  const apparent = foldFrequency(frequency, newRate);
  const isAliasing = frequency > newNyquist;

  const originalLabel: Localized = {
    pt: `Original — fs = ${sampleRate} Hz (Nyquist ${sampleRate / 2} Hz)`,
    en: `Original — fs = ${sampleRate} Hz (Nyquist ${sampleRate / 2} Hz)`,
  };
  const afterLabel: Localized = {
    pt: `Após ↓${factor} — fs/D = ${newRate} Hz (Nyquist ${newNyquist} Hz)`,
    en: `After ↓${factor} — fs/D = ${newRate} Hz (Nyquist ${newNyquist} Hz)`,
  };
  const readout: Localized = {
    pt: `Tom em ${frequency} Hz → após ↓${factor}, o pico aparece em ${apparent} Hz.`,
    en: `Tone at ${frequency} Hz → after ↓${factor}, the peak appears at ${apparent} Hz.`,
  };

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.toneFrequency, language)}:{" "}
            <span className="control-value">{frequency} Hz</span>
          </span>
          <input
            type="range"
            min={1}
            max={sampleRate / 2}
            step={1}
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
          />
        </label>

        <label className="control">
          <span>
            {pick(t.decimation, language)}:{" "}
            <span className="control-value">{factor}</span>
          </span>
          <input
            type="range"
            min={1}
            max={maxFactor}
            step={1}
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="plot-label">{pick(originalLabel, language)}</p>
      <SpectrumPlot
        spectrum={originalSpectrum}
        label={pick(originalLabel, language)}
      />

      <p className="plot-label">{pick(afterLabel, language)}</p>
      <SpectrumPlot
        spectrum={decimatedSpectrum}
        label={pick(afterLabel, language)}
      />

      <p className="readout">
        {pick(readout, language)}{" "}
        <span className={isAliasing ? "badge badge--alias" : "badge badge--ok"}>
          {isAliasing ? pick(t.aliasing, language) : pick(t.noAliasing, language)}
        </span>
      </p>
    </div>
  );
}
