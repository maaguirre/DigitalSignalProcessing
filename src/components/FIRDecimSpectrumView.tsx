import { useState } from "react";
import { designLowpassFIR, frequencyResponse } from "../dsp";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  length: { pt: "Comprimento do filtro M", en: "Filter length M" },
  inLabel: { pt: "|X(ω)| e o filtro FIR (corte π/2) — antes do ↓2", en: "|X(ω)| and the FIR filter (cutoff π/2) — before ↓2" },
  outLabel: { pt: "|Y(ω_y)| — depois do ↓2: a alta dobra em 0,8π", en: "|Y(ω_y)| — after ↓2: the high folds to 0.8π" },
  aliased: { pt: "Aliasing — a componente alta vazou e dobrou", en: "Aliasing — the high component leaked and folded" },
  clean: { pt: "Limpo — a componente alta foi rejeitada", en: "Clean — the high component was rejected" },
  leak: { pt: "componente dobrada", en: "folded component" },
  alias: { pt: "aliasing", en: "aliasing" },
  note: {
    pt: "O sinal tem uma componente baixa (0,2π, deve sobreviver) e uma alta (0,6π, acima do corte π/2). O filtro FIR (azul) deveria zerar a alta. Com M pequeno ele desce devagar e a alta PASSA (barra laranja em cima); ao decimar por 2, ela DOBRA para 0,8π e contamina a saída (aliasing). Aumente M: a alta cai no zero do filtro e a saída fica só com a baixa (que aparece em 0,4π). É o mesmo problema da interpolação, do outro lado.",
    en: "The signal has a low component (0.2π, should survive) and a high one (0.6π, above the π/2 cutoff). The FIR filter (blue) should zero the high one. With a small M it rolls off slowly and the high PASSES (orange bar on top); when decimating by 2, it FOLDS to 0.8π and contaminates the output (aliasing). Raise M: the high lands on the filter's zero and the output keeps only the low one (which appears at 0.4π). It is the same problem as interpolation, from the other side.",
  },
} satisfies Record<string, Localized>;

const PI = Math.PI;
const LOW = 0.2 * PI;
const HIGH = 0.6 * PI;
const FOLD = 2 * PI - 2 * HIGH; // 0.8π: where 0.6π lands after ↓2

export default function FIRDecimSpectrumView({ language, initialM }: { language: Language; initialM?: number }) {
  const [M, setM] = useState(initialM ?? 7);

  const h = designLowpassFIR(PI / 2, M, "hamming", 1);
  const Pn = 400;
  const resp = frequencyResponse(h, Pn);
  const maxMag = Math.max(...resp.mag, 1e-9);
  const Hn = (w: number) => (resp.mag[Math.max(0, Math.min(Pn - 1, Math.round((w / PI) * (Pn - 1))))] ?? 0) / maxMag;
  const passed = Hn(HIGH);
  const aliased = passed > 0.1;

  const W = 600;
  const PH = 132;
  const pad = { left: 30, right: 14, top: 12, bottom: 22 };
  const pw = W - pad.left - pad.right;
  const ph = PH - pad.top - pad.bottom;
  const base = pad.top + ph;
  const xMap = (w: number) => pad.left + (w / PI) * pw;
  const yMap = (v: number) => base - v * ph * 0.82;
  const axis = "var(--ink-soft)";

  const curve = resp.omega
    .map((w, i) => `${i === 0 ? "M" : "L"} ${xMap(w).toFixed(1)} ${yMap(resp.mag[i] / maxMag).toFixed(1)}`)
    .join(" ");
  const xticks = [0, PI / 2, PI];
  const xlab = (w: number) => (Math.abs(w) < 1e-6 ? "0" : Math.abs(w - PI) < 1e-6 ? "π" : "π/2");

  const bar = (w: number, hgt: number, col: string, op = 0.75) => (
    <rect x={xMap(w) - 4} y={yMap(hgt)} width={8} height={base - yMap(hgt)} fill={col} fillOpacity={op} />
  );
  const xaxis = (
    <>
      {xticks.map((w, i) => (
        <text key={i} x={xMap(w)} y={PH - 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor={i === xticks.length - 1 ? "end" : "middle"}>{xlab(w)}</text>
      ))}
    </>
  );

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>{pick(t.length, language)}: <span className="control-value">{M}</span></span>
          <input type="range" min={5} max={61} step={2} value={M} onChange={(e) => setM(Number(e.target.value))} />
        </label>
      </div>

      <p className="plot-label">{pick(t.inLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${PH}`} width="100%" style={{ display: "block" }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={base} stroke="var(--line)" />
        <line x1={pad.left} y1={base} x2={pad.left + pw} y2={base} stroke="var(--line)" />
        <line x1={xMap(PI / 2)} y1={pad.top} x2={xMap(PI / 2)} y2={base} stroke="var(--brand-trace)" strokeOpacity="0.5" strokeDasharray="3 2" />
        {/* low passes, high: dashed before + solid what passes */}
        {bar(LOW, 1, "var(--signal)", 0.85)}
        <line x1={xMap(HIGH)} y1={base} x2={xMap(HIGH)} y2={yMap(1)} stroke={axis} strokeOpacity="0.35" strokeDasharray="3 3" />
        {bar(HIGH, passed, "var(--brand-trace)")}
        <path d={curve} fill="none" stroke="var(--signal)" strokeWidth="1.8" strokeOpacity="0.9" />
        {xaxis}
      </svg>

      <p className="plot-label">{pick(t.outLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${PH}`} width="100%" style={{ display: "block" }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={base} stroke="var(--line)" />
        <line x1={pad.left} y1={base} x2={pad.left + pw} y2={base} stroke="var(--line)" />
        {bar(2 * LOW, 1, "var(--signal)", 0.85)}
        {passed > 0.01 && (
          <>
            {bar(FOLD, passed, "var(--brand-trace)")}
            <text x={xMap(FOLD)} y={yMap(passed) - 4} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">{pick(t.alias, language)}</text>
          </>
        )}
        {xaxis}
      </svg>

      <p className="readout">
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>{pick(t.leak, language)} ≈ {passed.toFixed(2)}</span>{" "}
        <span className={aliased ? "badge badge--alias" : "badge badge--ok"}>
          {aliased ? pick(t.aliased, language) : pick(t.clean, language)}
        </span>
      </p>
      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
