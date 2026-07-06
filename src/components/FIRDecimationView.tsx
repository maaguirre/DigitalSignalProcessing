import { useState } from "react";
import { sumSines, downsample, designLowpassFIR } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  length: { pt: "Comprimento do filtro M", en: "Filter length M" },
  xLabel: { pt: "x(n) — entrada: baixa (0,2π) + alta (0,6π)", en: "x(n) — input: low (0.2π) + high (0.6π)" },
  yLabel: { pt: "y(m) — filtrado e decimado por D = 2", en: "y(m) — filtered and decimated by D = 2" },
  clean: { pt: "Limpo — só a componente baixa sobrou", en: "Clean — only the low component remains" },
  aliased: { pt: "Aliasing — a componente alta vazou e dobrou", en: "Aliasing — the high component leaked and folded" },
  err: { pt: "erro vs. ideal", en: "error vs. ideal" },
  note: {
    pt: "Decimar por D exige um passa-baixas de corte π/D ANTES do ↓D. Aqui o sinal tem uma componente na banda (0,2π, deve sobreviver) e uma acima do corte (0,6π, deve ser removida). Com um filtro CURTO, a rejeição é fraca: a componente alta passa e, ao decimar, DOBRA para dentro da banda (aliasing) — a saída se afasta da cossenoide baixa ideal (linha cinza). Aumente M: a alta é atenuada e y volta a ser a componente baixa limpa.",
    en: "Decimating by D needs a lowpass of cutoff π/D BEFORE ↓D. Here the signal has a component in band (0.2π, should survive) and one above the cutoff (0.6π, should be removed). With a SHORT filter, the attenuation is weak: the high component passes and, when decimated, FOLDS into the band (aliasing) — the output drifts from the ideal low cosine (grey line). Raise M: the high is attenuated and y becomes the clean low component again.",
  },
} satisfies Record<string, Localized>;

const NX = 20;
const D = 2;

// Filter + decimate. A short filter lets the out-of-band component
// alias into the band of interest; a long one removes it cleanly.
export default function FIRDecimationView({ language, initialM }: { language: Language; initialM?: number }) {
  const [M, setM] = useState(initialM ?? 9);

  const x = sumSines(
    [
      { frequency: 2, amplitude: 1 }, // 0.2π (in band)
      { frequency: 6, amplitude: 1 }, // 0.6π (just above the π/2 cutoff)
    ],
    NX,
    NX
  );
  const h = designLowpassFIR(Math.PI / D, M, "hamming", 1);
  const c = Math.floor((M - 1) / 2);
  const v = Array.from({ length: NX }, (_, n) => {
    let s = 0;
    for (let k = 0; k < M; k++) s += h[k] * x[(((n + c - k) % NX) + NX) % NX];
    return s;
  });
  const y = downsample(v, D); // NX/D samples

  // ideal: only the low component survives, decimated
  const ideal = y.map((_, m) => Math.cos(0.2 * Math.PI * m * D));
  const rms = Math.sqrt(y.reduce((a, v0, m) => a + (v0 - ideal[m]) ** 2, 0) / y.length);
  const aliased = rms > 0.1;

  const refLen = 300;
  const xRef = Array.from({ length: refLen }, (_, j) => {
    const tt = (j / (refLen - 1)) * (NX - 1);
    return Math.cos(0.2 * Math.PI * tt) + Math.cos(0.6 * Math.PI * tt);
  });
  const yRef = Array.from({ length: refLen }, (_, j) => Math.cos(0.2 * Math.PI * (j / (refLen - 1)) * (NX - 1)));
  const yMax = 1.9;

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>{pick(t.length, language)}: <span className="control-value">{M}</span></span>
          <input type="range" min={5} max={61} step={2} value={M} onChange={(e) => setM(Number(e.target.value))} />
        </label>
      </div>

      <p className="plot-label">{pick(t.xLabel, language)}</p>
      <StemPlot language={language} samples={x} yMax={yMax} dt={1} xDomain={NX - 1} reference={xRef} height={120} label={pick(t.xLabel, language)} />

      <p className="plot-label">{pick(t.yLabel, language)}</p>
      <StemPlot language={language} samples={y} yMax={yMax} dt={D} xDomain={NX - 1} reference={yRef} color={aliased ? "var(--brand-trace)" : "var(--signal)"} height={120} label={pick(t.yLabel, language)} />

      <p className="readout">
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>{pick(t.err, language)} ≈ {rms.toFixed(2)}</span>{" "}
        <span className={aliased ? "badge badge--alias" : "badge badge--ok"}>
          {aliased ? pick(t.aliased, language) : pick(t.clean, language)}
        </span>
      </p>
      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
