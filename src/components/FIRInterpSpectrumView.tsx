import { useState } from "react";
import { designLowpassFIR, frequencyResponse } from "../dsp";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  length: { pt: "Comprimento do filtro M", en: "Filter length M" },
  label: { pt: "Espectro após ↑5 — o filtro FIR (azul) sobre as imagens", en: "Spectrum after ↑5 — the FIR filter (blue) over the images" },
  leaking: { pt: "Imagens vazando — o filtro não as rejeita", en: "Images leaking — the filter doesn't reject them" },
  clean: { pt: "Imagens rejeitadas — só a banda base passa", en: "Images rejected — only the baseband passes" },
  leak: { pt: "vazamento máx.", en: "max leak" },
  note: {
    pt: "Interpolar cos(0,5πn) por 5 cria a banda base (em 0,1π) e 4 imagens (em 0,3π, 0,5π, 0,7π, 0,9π) — as barras tracejadas. O filtro FIR (curva azul, corte π/5) deveria zerar em cima de todas as imagens. Com M pequeno, ele desce devagar: as imagens caem sobre a parte alta do filtro e PASSAM (barras laranja), vazando para a saída. Aumente M: a curva desce rápido, as imagens caem no zero e só a banda base sobra. É esse vazamento que distorce o sinal no tempo (playground a seguir).",
    en: "Interpolating cos(0.5πn) by 5 creates the baseband (at 0.1π) and 4 images (at 0.3π, 0.5π, 0.7π, 0.9π) — the dashed bars. The FIR filter (blue curve, cutoff π/5) should be zero on top of every image. With a small M, it rolls off slowly: the images land on the filter's high part and PASS (orange bars), leaking to the output. Raise M: the curve drops fast, the images land on zero and only the baseband remains. It is this leakage that distorts the signal in time (playground next).",
  },
} satisfies Record<string, Localized>;

const IFAC = 5;
const PI = Math.PI;
const imageFreqs = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => f * PI);

// Frequency-domain view of interpolation: the images of cos(0.5πn) after ↑5, the
// FIR filter over them, and how much of each image passes through (leaks).
export default function FIRInterpSpectrumView({ language, initialM }: { language: Language; initialM?: number }) {
  const [M, setM] = useState(initialM ?? 9);

  const h = designLowpassFIR(PI / IFAC, M, "hamming", 1);
  const P = 400;
  const resp = frequencyResponse(h, P);
  const maxMag = Math.max(...resp.mag, 1e-9);
  const Hn = (w: number) => (resp.mag[Math.max(0, Math.min(P - 1, Math.round((w / PI) * (P - 1))))] ?? 0) / maxMag;

  const leak = Math.max(...imageFreqs.filter((f) => Math.abs(f - 0.1 * PI) > 1e-6).map(Hn));
  const leaking = leak > 0.1;

  const W = 600;
  const H = 200;
  const pad = { left: 32, right: 14, top: 14, bottom: 26 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;
  const base = pad.top + ph;
  const xMap = (w: number) => pad.left + (w / PI) * pw;
  const yMap = (v: number) => base - v * ph * 0.86;
  const axis = "var(--ink-soft)";
  const cutoff = PI / IFAC;

  const curve = resp.omega
    .map((w, i) => `${i === 0 ? "M" : "L"} ${xMap(w).toFixed(1)} ${yMap(resp.mag[i] / maxMag).toFixed(1)}`)
    .join(" ");
  const xticks = [0, PI / 2, PI];
  const xlab = (w: number) => (Math.abs(w) < 1e-6 ? "0" : Math.abs(w - PI) < 1e-6 ? "π" : "π/2");

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>{pick(t.length, language)}: <span className="control-value">{M}</span></span>
          <input type="range" min={5} max={61} step={2} value={M} onChange={(e) => setM(Number(e.target.value))} />
        </label>
      </div>

      <p className="plot-label">{pick(t.label, language)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={base} stroke="var(--line)" />
        <line x1={pad.left} y1={base} x2={pad.left + pw} y2={base} stroke="var(--line)" />

        {/* cutoff */}
        <line x1={xMap(cutoff)} y1={pad.top} x2={xMap(cutoff)} y2={base} stroke="var(--brand-trace)" strokeOpacity="0.5" strokeDasharray="3 2" />
        <text x={xMap(cutoff)} y={pad.top + 9} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">π/I</text>

        {/* images: dashed full-height marker (before) + solid bar of what passes (after) */}
        {imageFreqs.map((f, i) => {
          const baseband = Math.abs(f - 0.1 * PI) < 1e-6;
          const passed = Hn(f);
          const col = baseband ? "var(--signal)" : "var(--brand-trace)";
          return (
            <g key={i}>
              <line x1={xMap(f)} y1={base} x2={xMap(f)} y2={yMap(1)} stroke={axis} strokeOpacity="0.35" strokeDasharray="3 3" />
              <rect x={xMap(f) - 4} y={yMap(passed)} width={8} height={base - yMap(passed)} fill={col} fillOpacity={baseband ? 0.85 : 0.7} />
            </g>
          );
        })}

        {/* filter response */}
        <path d={curve} fill="none" stroke="var(--signal)" strokeWidth="1.8" strokeOpacity="0.9" />

        {xticks.map((w, i) => (
          <text key={i} x={xMap(w)} y={H - 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor={i === xticks.length - 1 ? "end" : "middle"}>{xlab(w)}</text>
        ))}
      </svg>

      <p className="readout">
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>{pick(t.leak, language)} ≈ {leak.toFixed(2)}</span>{" "}
        <span className={leaking ? "badge badge--alias" : "badge badge--ok"}>
          {leaking ? pick(t.leaking, language) : pick(t.clean, language)}
        </span>
      </p>
      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
