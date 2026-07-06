import { useState } from "react";
import { generateSine, upsample, downsample } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  up: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
  down: { pt: "Fator de decimação D", en: "Decimation factor D" },
  xLabel: { pt: "x(n) — entrada (taxa Fx)", en: "x(n) — input (rate Fx)" },
  vLabel: { pt: "v(k) — após ↑I (zeros)", en: "v(k) — after ↑I (zeros)" },
  wLabel: { pt: "w(k) — após o filtro (taxa I·Fx)", en: "w(k) — after the filter (rate I·Fx)" },
  yLabel: { pt: "y(m) — após ↓D (taxa I/D·Fx)", en: "y(m) — after ↓D (rate I/D·Fx)" },
  note: {
    pt: "↑I insere zeros, o filtro os preenche (reconstruindo o sinal na taxa alta I·Fx), e ↓D pega 1 a cada D dessas amostras. A linha cinza é o sinal original: repare que w reconstrói ele por completo e y é uma reamostragem dele na taxa I/D·Fx.",
    en: "↑I inserts zeros, the filter fills them in (rebuilding the signal at the high rate I·Fx), and ↓D keeps 1 of every D of those samples. The grey line is the original signal: notice that w rebuilds it fully and y is a resampling of it at rate I/D·Fx.",
  },
} satisfies Record<string, Localized>;

const NX = 6;
const dirichlet = (x: number) => {
  const r = x / NX;
  if (Math.abs(r - Math.round(r)) < 1e-9) return 1;
  return Math.sin(Math.PI * x) / (NX * Math.tan((Math.PI * x) / NX));
};

// Time-domain view of rational I/D conversion (book Fig. 9.16): x(n) → ↑I → v(k)
// → filter → w(k) → ↓D → y(m), with the original continuous signal as a grey
// reference under every stage.
export default function RationalTimeView({ language }: { language: Language }) {
  const [I, setI] = useState(3);
  const [D, setD] = useState(2);

  const x = generateSine(1, NX, NX);
  const v = upsample(x, I);
  // ideal (periodic) reconstruction of x at the high rate I·Fx
  const w = Array.from({ length: NX * I }, (_, k) => {
    let s = 0;
    for (let j = 0; j < NX; j++) s += x[j] * dirichlet(k / I - j);
    return s;
  });
  const y = downsample(w, D);

  const yMax = 1.2;
  const refLen = 300;
  const hi = NX * I - 1; // shared high-rate time axis, so all four plots line up
  const g = (nIdx: number) => Math.cos((2 * Math.PI * nIdx) / NX);
  const refCommon = Array.from({ length: refLen }, (_, j) => g(((j / (refLen - 1)) * hi) / I));

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>{pick(t.up, language)}: <span className="control-value">{I}</span></span>
          <input type="range" min={2} max={4} step={1} value={I} onChange={(e) => setI(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>{pick(t.down, language)}: <span className="control-value">{D}</span></span>
          <input type="range" min={2} max={4} step={1} value={D} onChange={(e) => setD(Number(e.target.value))} />
        </label>
      </div>

      <p className="plot-label">{pick(t.xLabel, language)}</p>
      <StemPlot language={language} samples={x} yMax={yMax} dt={I} xDomain={hi} reference={refCommon} height={110} label={pick(t.xLabel, language)} />

      <p className="plot-label">{pick(t.vLabel, language)}</p>
      <StemPlot language={language} samples={v} yMax={yMax} keep={I} dt={1} xDomain={hi} reference={refCommon} height={110} label={pick(t.vLabel, language)} />

      <p className="plot-label">{pick(t.wLabel, language)}</p>
      <StemPlot language={language} samples={w} yMax={yMax} dt={1} xDomain={hi} reference={refCommon} height={110} label={pick(t.wLabel, language)} />

      <p className="plot-label">{pick(t.yLabel, language)}</p>
      <StemPlot language={language} samples={y} yMax={yMax} color="var(--brand-trace)" dt={D} xDomain={hi} reference={refCommon} height={110} label={pick(t.yLabel, language)} />

      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
