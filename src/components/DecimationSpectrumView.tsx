import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  band: { pt: "Largura de banda do sinal ω_c", en: "Signal bandwidth ω_c" },
  factor: { pt: "Fator de decimação D", en: "Decimation factor D" },
  clean: { pt: "Sem aliasing — cópias separadas", en: "No aliasing — copies separated" },
  alias: { pt: "Aliasing — cópias se sobrepõem", en: "Aliasing — copies overlap" },
  inLabel: {
    pt: "|X(ω_x)| — espectro do sinal (pico 1)",
    en: "|X(ω_x)| — signal spectrum (peak 1)",
  },
  outLabel: {
    pt: "|Y(ω_y)| — depois de ↓D: D cópias somadas (pico 1/D)",
    en: "|Y(ω_y)| — after ↓D: D copies summed (peak 1/D)",
  },
} satisfies Record<string, Localized>;

const TAU = 2 * Math.PI;
const wrapPi = (a: number) => {
  const x = (((a + Math.PI) % TAU) + TAU) % TAU;
  return x - Math.PI;
};
function piLabel(v: number): string {
  const m = v / Math.PI;
  const near = (a: number) => Math.abs(m - a) < 1e-6;
  if (near(0)) return "0";
  if (near(1)) return "π";
  if (near(-1)) return "−π";
  if (near(0.5)) return "π/2";
  if (near(-0.5)) return "−π/2";
  return `${m.toFixed(1)}π`;
}
const axis = "var(--ink-soft)";
const copyColor = (k: number) => (k === 0 ? "var(--signal)" : "var(--brand-trace)");

// The decimation spectrum, schematic. X is a triangular band of half-width ω_c
// (DTFT, so 2π-periodic). After ↓D the spectrum is eq (9.17): (1/D) Σ_k
// X((ω_y − 2πk)/D). Slide ω_c across the π/D limit (9.18) to see the copies go
// from separated (clean, 9.19) to overlapping (aliasing).
export default function DecimationSpectrumView({ language }: { language: Language }) {
  const [wcFrac, setWcFrac] = useState(0.3);
  const [D, setD] = useState(2);
  const wc = wcFrac * Math.PI;
  const limit = Math.PI / D;
  const aliasing = wc > limit + 1e-9;

  const Xtri = (w: number) => Math.max(0, 1 - Math.abs(wrapPi(w)) / wc);
  const copyAt = (k: number, wy: number) => Xtri((wy - TAU * k) / D) / D;
  const yAt = (wy: number) =>
    Array.from({ length: D }, (_, k) => copyAt(k, wy)).reduce((a, b) => a + b, 0);

  const W = 600;
  const H = 148;
  const pad = { left: 34, right: 14, top: 12, bottom: 26 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;
  const base = pad.top + ph;
  const xMap = (w: number) => pad.left + ((w + Math.PI) / TAU) * pw;
  const yMap = (v: number) => base - v * ph * 0.9;
  const xticks = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI];

  const triPath = `M ${xMap(-wc)} ${yMap(0)} L ${xMap(0)} ${yMap(1)} L ${xMap(wc)} ${yMap(0)} Z`;
  const hAt = 1 - limit / wc; // triangle height at ω = π/D
  const spillR = aliasing ? `M ${xMap(limit)} ${yMap(0)} L ${xMap(limit)} ${yMap(hAt)} L ${xMap(wc)} ${yMap(0)} Z` : "";
  const spillL = aliasing ? `M ${xMap(-limit)} ${yMap(0)} L ${xMap(-limit)} ${yMap(hAt)} L ${xMap(-wc)} ${yMap(0)} Z` : "";

  const NP = 241;
  const copyPath = (k: number) => {
    const top = Array.from({ length: NP }, (_, i) => {
      const w = -Math.PI + (i / (NP - 1)) * TAU;
      return `${xMap(w).toFixed(1)} ${yMap(copyAt(k, w)).toFixed(1)}`;
    }).join(" L ");
    return `M ${xMap(-Math.PI)} ${base} L ${top} L ${xMap(Math.PI)} ${base} Z`;
  };
  const sumPath = Array.from({ length: NP }, (_, i) => {
    const w = -Math.PI + (i / (NP - 1)) * TAU;
    return `${i === 0 ? "M" : "L"} ${xMap(w).toFixed(1)} ${yMap(yAt(w)).toFixed(1)}`;
  }).join(" ");

  const note: Localized = {
    pt: "Cada cópia tem pico 1/D. Enquanto o sinal cabe em |ω_x| ≤ π/D (eq. 9.18), as cópias não se tocam e a saída é só a cópia central, Y = (1/D)·X(ω_y/D) (eq. 9.19): decimação limpa. Se a banda passa de π/D, as cópias vizinhas invadem a banda base e se somam — surge energia onde não havia: aliasing.",
    en: "Each copy peaks at 1/D. While the signal fits within |ω_x| ≤ π/D (eq. 9.18), the copies don't touch and the output is just the central copy, Y = (1/D)·X(ω_y/D) (eq. 9.19): clean decimation. If the band exceeds π/D, the neighbouring copies invade the baseband and add up — energy appears where there was none: aliasing.",
  };

  const yTicks = (base0: number, hh: number) =>
    [0, 0.5, 1].map((v, i) => {
      const y = base0 - v * hh * 0.9;
      return (
        <g key={`y${i}`}>
          <line x1={pad.left - 3} y1={y} x2={pad.left} y2={y} stroke={axis} />
          <text x={pad.left - 5} y={y + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
            {v}
          </text>
        </g>
      );
    });

  const xTicks = xticks.map((w, i) => (
    <g key={`x${i}`}>
      <line x1={xMap(w)} y1={base} x2={xMap(w)} y2={base + 4} stroke={axis} />
      <text x={xMap(w)} y={base + 15} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
        {piLabel(w)}
      </text>
    </g>
  ));

  const limitLines = (
    <>
      {[limit, -limit].map((w, i) => (
        <g key={`lim${i}`}>
          <line x1={xMap(w)} y1={pad.top} x2={xMap(w)} y2={base} stroke="var(--signal)" strokeOpacity="0.5" strokeDasharray="4 3" />
        </g>
      ))}
      <text x={xMap(limit)} y={pad.top + 8} fill="var(--signal)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
        π/D
      </text>
      <text x={xMap(-limit)} y={pad.top + 8} fill="var(--signal)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
        −π/D
      </text>
    </>
  );

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.band, language)}: <span className="control-value">{piLabel(wc)}</span>
          </span>
          <input type="range" min={0.1} max={0.9} step={0.02} value={wcFrac} onChange={(e) => setWcFrac(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>
            {pick(t.factor, language)}: <span className="control-value">{D}</span>
          </span>
          <input type="range" min={2} max={4} step={1} value={D} onChange={(e) => setD(Number(e.target.value))} />
        </label>
      </div>

      <p className="plot-label">{pick(t.inLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={base} stroke="var(--line)" />
        <line x1={pad.left} y1={base} x2={pad.left + pw} y2={base} stroke="var(--line)" />
        {yTicks(base, ph)}
        {limitLines}
        <path d={triPath} fill="var(--signal)" fillOpacity="0.2" stroke="var(--signal)" strokeWidth="1.5" />
        {aliasing && <path d={spillR} fill="var(--alias, #e0554e)" fillOpacity="0.5" stroke="none" />}
        {aliasing && <path d={spillL} fill="var(--alias, #e0554e)" fillOpacity="0.5" stroke="none" />}
        {xTicks}
        <text x={pad.left + pw} y={H - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_x</text>
      </svg>

      <p className="plot-label">{pick(t.outLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={base} stroke="var(--line)" />
        <line x1={pad.left} y1={base} x2={pad.left + pw} y2={base} stroke="var(--line)" />
        {yTicks(base, ph)}
        {Array.from({ length: D }, (_, k) => (
          <path key={k} d={copyPath(k)} fill={copyColor(k)} fillOpacity="0.22" stroke={copyColor(k)} strokeOpacity="0.6" strokeWidth="1" strokeDasharray={k === 0 ? undefined : "4 3"} />
        ))}
        <path d={sumPath} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeOpacity="0.85" />
        {xTicks}
        <text x={pad.left + pw} y={H - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_y</text>
      </svg>

      <p className="readout">
        <span className={aliasing ? "badge badge--alias" : "badge badge--ok"}>
          {aliasing ? pick(t.alias, language) : pick(t.clean, language)}
        </span>
      </p>
      <p className="plot-note">{pick(note, language)}</p>
    </div>
  );
}
