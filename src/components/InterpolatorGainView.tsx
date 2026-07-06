import { useState } from "react";
import { generateSine, upsample } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
  gain: { pt: "Ganho do filtro C", en: "Filter gain C" },
  orig: { pt: "x(n) — sinal original", en: "x(n) — original signal" },
  up: { pt: "v(m) — após ↑I (zeros inseridos)", en: "v(m) — after ↑I (zeros inserted)" },
  rec: { pt: "y(m) — reconstruído pelo filtro (ganho C)", en: "y(m) — reconstructed by the filter (gain C)" },
  match: { pt: "y(0) = x(0) — reconstruído", en: "y(0) = x(0) — reconstructed" },
  low: { pt: "y(0) < x(0) — fraco demais", en: "y(0) < x(0) — too weak" },
  high: { pt: "y(0) > x(0) — forte demais", en: "y(0) > x(0) — too strong" },
  note: {
    pt: "O ↑I espalha a energia por I vezes mais amostras, então o filtro sozinho reconstrói o sinal com 1/I da altura. O ganho C multiplica de volta: a saída fica com (C/I) da amplitude original. Arraste C e compare a altura de y(m) com x(n) — só quando C = I a reconstrução bate exatamente com o original.",
    en: "↑I spreads the energy over I times more samples, so the filter alone rebuilds the signal at 1/I of the height. The gain C multiplies it back: the output ends up at (C/I) of the original amplitude. Drag C and compare the height of y(m) with x(n) — only when C = I does the reconstruction match the original exactly.",
  },
} satisfies Record<string, Localized>;

const N = 8;
// Periodic band-limited interpolation kernel (Dirichlet / aliased sinc) for N
// even. Unlike the plain sinc, it reconstructs a periodic sampled signal exactly
// — no edge droop at the ends of the window.
const dirichlet = (t: number) => {
  const r = t / N;
  if (Math.abs(r - Math.round(r)) < 1e-9) return 1; // t is a multiple of N
  return Math.sin(Math.PI * t) / (N * Math.tan((Math.PI * t) / N));
};

// Interactive companion to the C = I result, in the time domain. x(n) is
// upsampled (zeros) and reconstructed by an ideal lowpass; the gain C scales the
// output to (C/I)·amplitude. The reconstruction matches x only when C = I.
export default function InterpolatorGainView({ language }: { language: Language }) {
  const [I, setI] = useState(3);
  const [C, setC] = useState(1);

  const cMax = 2 * I;
  const Cc = Math.min(C, cMax);
  const ratio = Cc / I; // output amplitude relative to x
  const match = Cc === I;

  const x = generateSine(1, N, N);
  const v = upsample(x, I);
  // ideal bandlimited reconstruction of the upsampled signal, scaled by C/I
  const y = Array.from({ length: N * I }, (_, m) => {
    let s = 0;
    for (let k = 0; k < N; k++) s += x[k] * dirichlet(m / I - k);
    return (Cc / I) * s;
  });

  // the underlying continuous signal that was sampled (grey reference line)
  const refLen = 240;
  const refX = Array.from({ length: refLen }, (_, j) => Math.cos((2 * Math.PI * ((j / (refLen - 1)) * (N - 1))) / N));
  const refM = Array.from({ length: refLen }, (_, j) => Math.cos((2 * Math.PI * ((j / (refLen - 1)) * (N * I - 1))) / (I * N)));

  const status = match ? t.match : ratio < 1 ? t.low : t.high;
  const statusClass = match ? "badge badge--ok" : "badge badge--alias";
  const yMax = 2;

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.factor, language)}: <span className="control-value">{I}</span>
          </span>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={I}
            onChange={(e) => {
              const ni = Number(e.target.value);
              setI(ni);
              if (C > 2 * ni) setC(2 * ni);
            }}
          />
        </label>
        <label className="control">
          <span>
            {pick(t.gain, language)}: <span className="control-value">{Cc}</span>
          </span>
          <input type="range" min={1} max={cMax} step={1} value={Cc} onChange={(e) => setC(Number(e.target.value))} />
        </label>
      </div>

      <p className="plot-label">{pick(t.orig, language)}</p>
      <StemPlot language={language} samples={x} yMax={yMax} reference={refX} height={120} label={pick(t.orig, language)} />

      <p className="plot-label">{pick(t.up, language)}</p>
      <StemPlot language={language} samples={v} yMax={yMax} keep={I} reference={refM} height={120} label={pick(t.up, language)} />

      <p className="plot-label">{pick(t.rec, language)}</p>
      <StemPlot language={language} samples={y} yMax={yMax} color={match ? "var(--ok)" : "var(--brand-trace)"} reference={refM} height={120} label={pick(t.rec, language)} />

      <p className="readout">
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>
          y(0) = (C/I)·x(0) = ({Cc}/{I})·x(0) = {ratio.toFixed(2)}·x(0)
        </span>{" "}
        <span className={statusClass}>{pick(status, language)}</span>
      </p>
      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
