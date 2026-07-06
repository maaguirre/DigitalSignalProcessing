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
  removed: { pt: "Removido pelo filtro", en: "Removed by the filter" },
  filterOn: { pt: "Filtro anti-aliasing: ligado", en: "Anti-aliasing filter: on" },
  filterOff: { pt: "Filtro anti-aliasing: desligado", en: "Anti-aliasing filter: off" },
  cutoff: { pt: "corte π/D", en: "cutoff π/D" },
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
  const [filterOn, setFilterOn] = useState(true);

  const original = generateSine(frequency, sampleRate, numSamples);
  const newRate = sampleRate / factor;
  const newNyquist = newRate / 2;
  // Ideal anti-aliasing lowpass: cutoff = Fs/(2D) = new Nyquist. A single tone
  // above it is simply removed before downsampling.
  const cutoff = newNyquist;
  const removed = filterOn && frequency > cutoff;
  const toDecimate = removed ? new Array<number>(numSamples).fill(0) : original;
  const decimated = downsample(toDecimate, factor);

  const originalSpectrum = magnitudeSpectrum(original, sampleRate);
  const decimatedSpectrum = magnitudeSpectrum(decimated, newRate);

  const apparent = foldFrequency(frequency, newRate);
  const isAliasing = !filterOn && frequency > newNyquist;

  const originalLabel: Localized = {
    pt: `Original — fs = ${sampleRate} Hz (Nyquist ${sampleRate / 2} Hz)`,
    en: `Original — fs = ${sampleRate} Hz (Nyquist ${sampleRate / 2} Hz)`,
  };
  const afterLabel: Localized = {
    pt: `Após ↓${factor} — fs/D = ${newRate} Hz (Nyquist ${newNyquist} Hz)`,
    en: `After ↓${factor} — fs/D = ${newRate} Hz (Nyquist ${newNyquist} Hz)`,
  };
  const readout: Localized = removed
    ? {
        pt: `O filtro (corte ${cutoff} Hz) removeu o sinal de ${frequency} Hz antes do ↓${factor} — nada dobra.`,
        en: `The filter (cutoff ${cutoff} Hz) removed the ${frequency} Hz signal before ↓${factor} — nothing folds.`,
      }
    : isAliasing
      ? {
          pt: `Sinal em ${frequency} Hz → após ↓${factor}, um pico FALSO aparece em ${apparent} Hz.`,
          en: `Signal at ${frequency} Hz → after ↓${factor}, a FALSE peak appears at ${apparent} Hz.`,
        }
      : {
          pt: `Sinal em ${frequency} Hz → após ↓${factor}, o pico aparece em ${apparent} Hz.`,
          en: `Signal at ${frequency} Hz → after ↓${factor}, the peak appears at ${apparent} Hz.`,
        };

  const badgeClass = removed || !isAliasing ? "badge badge--ok" : "badge badge--alias";
  const badgeText: Localized = removed
    ? t.removed
    : isAliasing
      ? t.aliasing
      : t.noAliasing;

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

        <button
          className="toggle-btn present-btn"
          onClick={() => setFilterOn((f) => !f)}
        >
          {filterOn ? pick(t.filterOn, language) : pick(t.filterOff, language)}
        </button>
      </div>

      <p className="plot-label">{pick(originalLabel, language)}</p>
      <SpectrumPlot
        spectrum={originalSpectrum}
        language={language}
        label={pick(originalLabel, language)}
        cutoffFreq={filterOn ? cutoff : undefined}
        cutoffLabel={pick(t.cutoff, language)}
      />

      <p className="plot-label">{pick(afterLabel, language)}</p>
      <SpectrumPlot
        spectrum={decimatedSpectrum}
        language={language}
        label={pick(afterLabel, language)}
      />

      <p className="readout">
        {pick(readout, language)}{" "}
        <span className={badgeClass}>{pick(badgeText, language)}</span>
      </p>
    </div>
  );
}
