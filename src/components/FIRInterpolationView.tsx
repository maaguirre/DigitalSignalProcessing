import { useState } from "react";
import { generateSine, upsample, designLowpassFIR } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
  length: { pt: "Comprimento do filtro M", en: "Filter length M" },
  xLabel: { pt: "x(n) — entrada cos(0,5πn)", en: "x(n) — input cos(0.5πn)" },
  yLabel: { pt: "y(m) — interpolado (↑I + filtro FIR)", en: "y(m) — interpolated (↑I + FIR filter)" },
  clean: { pt: "Reconstrução limpa", en: "Clean reconstruction" },
  distorted: { pt: "Distorcido — imagens vazaram pelo filtro", en: "Distorted — images leaked through the filter" },
  peak: { pt: "pico de y", en: "peak of y" },
  note: {
    pt: "Interpolando cos(0,5πn) por I. O ideal seria uma cossenoide de pico 1 (linha cinza). Com um filtro CURTO (M pequeno), a transição é larga e a rejeição fraca: as imagens criadas pelo ↑I vazam e se somam ao sinal — o pico passa de 1 e a forma se distorce. Aumente M: a rejeição melhora, as imagens somem e y volta a ser a cossenoide correta. Um bom projeto de filtro é decisivo, mesmo num sinal simples.",
    en: "Interpolating cos(0.5πn) by I. The ideal would be a cosine of peak 1 (grey line). With a SHORT filter (small M), the transition is wide and the attenuation weak: the images created by ↑I leak and add to the signal — the peak goes above 1 and the shape distorts. Raise M: the attenuation improves, the images vanish and y becomes the correct cosine again. A good filter design is decisive, even for a simple signal.",
  },
} satisfies Record<string, Localized>;

const NX = 8;

// Interpolate cos(0.5πn) by I with an FIR filter. A short filter
// lets the images leak and distorts the signal; a long one reconstructs it.
export default function FIRInterpolationView({ language, initialM }: { language: Language; initialM?: number }) {
  const [I, setI] = useState(5);
  const [M, setM] = useState(initialM ?? 13);

  const x = generateSine(1, 4, NX); // cos(2π·n/4) = cos(0.5πn)
  const v = upsample(x, I);
  const L = v.length;
  const h = designLowpassFIR(Math.PI / I, M, "hamming", I);
  const c = Math.floor((M - 1) / 2);
  // circular (periodic) filtering — no edge transient, so distortion is only the filter's
  const y = Array.from({ length: L }, (_, m) => {
    let s = 0;
    for (let k = 0; k < M; k++) s += h[k] * v[(((m + c - k) % L) + L) % L];
    return s;
  });
  const peak = Math.max(...y.map((v0) => Math.abs(v0)));
  const distorted = peak > 1.08;

  const refLen = 300;
  const ref = Array.from({ length: refLen }, (_, j) => Math.cos((0.5 * Math.PI * ((j / (refLen - 1)) * (L - 1))) / I));
  const yMax = 1.6;

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>{pick(t.factor, language)}: <span className="control-value">{I}</span></span>
          <input type="range" min={2} max={5} step={1} value={I} onChange={(e) => setI(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>{pick(t.length, language)}: <span className="control-value">{M}</span></span>
          <input type="range" min={7} max={61} step={2} value={M} onChange={(e) => setM(Number(e.target.value))} />
        </label>
      </div>

      <p className="plot-label">{pick(t.xLabel, language)}</p>
      <StemPlot language={language} samples={x} yMax={yMax} dt={I} xDomain={L - 1} reference={ref} height={120} label={pick(t.xLabel, language)} />

      <p className="plot-label">{pick(t.yLabel, language)}</p>
      <StemPlot language={language} samples={y} yMax={yMax} dt={1} xDomain={L - 1} reference={ref} color={distorted ? "var(--brand-trace)" : "var(--signal)"} height={120} label={pick(t.yLabel, language)} />

      <p className="readout">
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>{pick(t.peak, language)} ≈ {peak.toFixed(2)}</span>{" "}
        <span className={distorted ? "badge badge--alias" : "badge badge--ok"}>
          {distorted ? pick(t.distorted, language) : pick(t.clean, language)}
        </span>
      </p>
      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
