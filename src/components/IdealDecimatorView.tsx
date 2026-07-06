import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  band: { pt: "Largura de banda ω_c", en: "Bandwidth ω_c" },
  factor: { pt: "Fator de decimação D", en: "Decimation factor D" },
  filterOnBtn: { pt: "Filtro anti-aliasing: ligado", en: "Anti-aliasing filter: on" },
  filterOffBtn: { pt: "Filtro anti-aliasing: desligado", en: "Anti-aliasing filter: off" },
  clean: { pt: "Saída limpa — sem aliasing", en: "Clean output — no aliasing" },
  alias: { pt: "Aliasing — cópias se sobrepõem", en: "Aliasing — copies overlap" },
  removed: { pt: "cortado", en: "cut" },
  inLabel: {
    pt: "|X(ω_x)| e o filtro H_D (corte π/D)",
    en: "|X(ω_x)| and the filter H_D (cutoff π/D)",
  },
  outLabel: {
    pt: "|Y(ω_y)| — depois do decimador (cópias + soma)",
    en: "|Y(ω_y)| — after the decimator (copies + sum)",
  },
  noteOn: {
    pt: "Filtro ligado: o passa-baixas H_D corta tudo acima de π/D (parte cinza). Sem energia lá, as cópias deslocadas somem e a saída é uma cópia limpa — Y(ω_y) = (1/D)·X(ω_y/D) (eq. 9.25).",
    en: "Filter on: the lowpass H_D cuts everything above π/D (grey part). With no energy there, the shifted copies vanish and the output is a clean copy — Y(ω_y) = (1/D)·X(ω_y/D) (eq. 9.25).",
  },
  noteOff: {
    pt: "Filtro desligado: a energia acima de π/D (parte vermelha) sobrevive, as cópias vizinhas invadem a banda base e se somam — aliasing. Ligue o filtro para ver a saída ficar limpa.",
    en: "Filter off: the energy above π/D (red part) survives, the neighbouring copies invade the baseband and add up — aliasing. Turn the filter on to see the output go clean.",
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

// The ideal decimator, in the spectrum. X is a triangular band of half-width
// ω_c. The filter H_D keeps only |ω_x| ≤ π/D; toggling it shows the output go
// from overlapping copies (aliasing) to a single clean copy (eq. 9.25).
export default function IdealDecimatorView({ language }: { language: Language }) {
  const [wcFrac, setWcFrac] = useState(0.7);
  const [D, setD] = useState(2);
  const [filterOn, setFilterOn] = useState(true);

  const wc = wcFrac * Math.PI;
  const limit = Math.PI / D;
  const passes = (w: number) => Math.abs(wrapPi(w)) <= limit;
  const Xtri = (w: number) => Math.max(0, 1 - Math.abs(wrapPi(w)) / wc);
  const Xeff = (w: number) => (filterOn ? (passes(w) ? Xtri(w) : 0) : Xtri(w));
  const copyAt = (k: number, wy: number) => Xeff((wy - TAU * k) / D) / D;
  const yAt = (wy: number) =>
    Array.from({ length: D }, (_, k) => copyAt(k, wy)).reduce((a, b) => a + b, 0);
  const aliasing = !filterOn && wc > limit + 1e-9;

  const W = 600;
  const H = 150;
  const pad = { left: 34, right: 14, top: 12, bottom: 26 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;
  const base = pad.top + ph;
  const xMap = (w: number) => pad.left + ((w + Math.PI) / TAU) * pw;
  const yMap = (v: number) => base - v * ph * 0.9;
  const xticks = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI];

  const wide = wc > limit;
  const hAt = wide ? 1 - limit / wc : 0; // triangle height at ω = π/D
  const keptPath = wide
    ? `M ${xMap(-limit)} ${yMap(0)} L ${xMap(-limit)} ${yMap(hAt)} L ${xMap(0)} ${yMap(1)} L ${xMap(limit)} ${yMap(hAt)} L ${xMap(limit)} ${yMap(0)} Z`
    : `M ${xMap(-wc)} ${yMap(0)} L ${xMap(0)} ${yMap(1)} L ${xMap(wc)} ${yMap(0)} Z`;
  const fullPath = `M ${xMap(-wc)} ${yMap(0)} L ${xMap(0)} ${yMap(1)} L ${xMap(wc)} ${yMap(0)} Z`;
  const tipR = wide ? `M ${xMap(limit)} ${yMap(0)} L ${xMap(limit)} ${yMap(hAt)} L ${xMap(wc)} ${yMap(0)} Z` : "";
  const tipL = wide ? `M ${xMap(-limit)} ${yMap(0)} L ${xMap(-limit)} ${yMap(hAt)} L ${xMap(-wc)} ${yMap(0)} Z` : "";
  const filterBox = `M ${xMap(-limit)} ${yMap(0)} L ${xMap(-limit)} ${yMap(1.03)} L ${xMap(limit)} ${yMap(1.03)} L ${xMap(limit)} ${yMap(0)}`;

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

  const yTicks = [0, 0.5, 1].map((v, i) => (
    <g key={`y${i}`}>
      <line x1={pad.left - 3} y1={yMap(v)} x2={pad.left} y2={yMap(v)} stroke={axis} />
      <text x={pad.left - 5} y={yMap(v) + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
        {v}
      </text>
    </g>
  ));
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
        <line key={`lim${i}`} x1={xMap(w)} y1={pad.top} x2={xMap(w)} y2={base} stroke="var(--brand-trace)" strokeOpacity="0.6" strokeDasharray="4 3" />
      ))}
      <text x={xMap(limit)} y={pad.top + 9} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">π/D</text>
      <text x={xMap(-limit)} y={pad.top + 9} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">−π/D</text>
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
        <button className="toggle-btn present-btn" onClick={() => setFilterOn((f) => !f)}>
          {filterOn ? pick(t.filterOnBtn, language) : pick(t.filterOffBtn, language)}
        </button>
      </div>

      <p className="plot-label">{pick(t.inLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={base} stroke="var(--line)" />
        <line x1={pad.left} y1={base} x2={pad.left + pw} y2={base} stroke="var(--line)" />
        {yTicks}
        {limitLines}
        {filterOn && <path d={filterBox} fill="none" stroke="var(--brand-trace)" strokeOpacity="0.55" strokeWidth="1" />}
        {/* kept band (teal) */}
        <path d={filterOn ? keptPath : fullPath} fill="var(--signal)" fillOpacity="0.22" stroke="var(--signal)" strokeWidth="1.5" />
        {/* tips beyond π/D: grey if filtered out, red if it will alias */}
        {wide && filterOn && (
          <>
            <path d={tipR} fill="var(--ink-soft)" fillOpacity="0.18" stroke="var(--ink-soft)" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 2" />
            <path d={tipL} fill="var(--ink-soft)" fillOpacity="0.18" stroke="var(--ink-soft)" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 2" />
            <text x={xMap((limit + wc) / 2)} y={yMap(hAt) - 4} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="middle">{pick(t.removed, language)}</text>
          </>
        )}
        {wide && !filterOn && (
          <>
            <path d={tipR} fill="var(--alias)" fillOpacity="0.5" stroke="none" />
            <path d={tipL} fill="var(--alias)" fillOpacity="0.5" stroke="none" />
          </>
        )}
        {xTicks}
        <text x={pad.left + pw} y={H - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_x</text>
      </svg>

      <p className="plot-label">{pick(t.outLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={base} stroke="var(--line)" />
        <line x1={pad.left} y1={base} x2={pad.left + pw} y2={base} stroke="var(--line)" />
        {yTicks}
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
      <p className="plot-note">{filterOn ? pick(t.noteOn, language) : pick(t.noteOff, language)}</p>
    </div>
  );
}
