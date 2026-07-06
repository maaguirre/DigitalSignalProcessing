import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  band: { pt: "Largura de banda ω_c", en: "Bandwidth ω_c" },
  factor: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
  filterOnBtn: { pt: "Filtro interpolador: ligado", en: "Interpolation filter: on" },
  filterOffBtn: { pt: "Filtro interpolador: desligado", en: "Interpolation filter: off" },
  interp: { pt: "Interpolado — só a banda base", en: "Interpolated — baseband only" },
  imaging: { pt: "Imaging — I cópias no espectro", en: "Imaging — I copies in the spectrum" },
  inLabel: {
    pt: "|X(ω_x)| — o espectro de entrada",
    en: "|X(ω_x)| — the input spectrum",
  },
  outLabel: {
    pt: "|V(ω_y)| — depois de ↑I e do filtro H_I (corte π/I)",
    en: "|V(ω_y)| — after ↑I and the filter H_I (cutoff π/I)",
  },
  removed: { pt: "imagens cortadas", en: "images cut" },
  noteOn: {
    pt: "Filtro ligado: o passa-baixas H_I (corte π/I) mantém só a imagem em banda base e corta as outras I−1 (parte cinza). O ganho C = I repõe a energia. A saída é o sinal original, agora na taxa I·Fx (eq. 9.31, 9.33).",
    en: "Filter on: the lowpass H_I (cutoff π/I) keeps only the baseband image and cuts the other I−1 (grey part). The gain C = I restores the energy. The output is the original signal, now at rate I·Fx (eq. 9.31, 9.33).",
  },
  noteOff: {
    pt: "Filtro desligado: ↑I comprime o espectro por I e cria I cópias — as imagens (eq. 9.28). Sem filtrar, o sinal fica cheio de réplicas de alta frequência. Ligue o filtro para reconstruir só a banda base.",
    en: "Filter off: ↑I compresses the spectrum by I and creates I copies — the images (eq. 9.28). Without filtering, the signal is full of high-frequency replicas. Turn the filter on to reconstruct only the baseband.",
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
const imageColor = (baseband: boolean) => (baseband ? "var(--signal)" : "var(--brand-trace)");

// The interpolator, in the spectrum. ↑I compresses X by I, making I images:
// V(ω_y) = X(I·ω_y). The filter H_I (cutoff π/I) keeps only the baseband image;
// toggling it shows the output go from I images to the clean interpolated signal.
export default function InterpolatorView({ language }: { language: Language }) {
  const [wcFrac, setWcFrac] = useState(0.6);
  const [I, setI] = useState(3);
  const [filterOn, setFilterOn] = useState(true);

  const wc = wcFrac * Math.PI;
  const limit = Math.PI / I;
  const Xtri = (w: number) => Math.max(0, 1 - Math.abs(wrapPi(w)) / wc);
  // Upsampled spectrum: X compressed by I (images). Baseband image at |ω_y| ≤ π/I.
  const Vraw = (wy: number) => Xtri(I * wy);

  const W = 600;
  const H = 150;
  const pad = { left: 34, right: 14, top: 12, bottom: 26 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;
  const base = pad.top + ph;
  const xMap = (w: number) => pad.left + ((w + Math.PI) / TAU) * pw;
  const yMap = (v: number) => base - v * ph * 0.9;
  const xticks = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI];

  const triPath = `M ${xMap(-wc)} ${yMap(0)} L ${xMap(0)} ${yMap(1)} L ${xMap(wc)} ${yMap(0)} Z`;

  // one path per image (centred at k·2π/I), so the baseband one can be coloured apart
  const imageCentres: number[] = [];
  for (let k = -Math.floor(I / 2) - 1; k <= Math.floor(I / 2) + 1; k++) {
    const c = (k * TAU) / I;
    if (c > -Math.PI - 0.01 && c < Math.PI + 0.01) imageCentres.push(c);
  }
  const imageArea = (centre: number) => {
    const half = wc / I + 0.02;
    const pts: string[] = [];
    const N = 120;
    for (let i = 0; i < N; i++) {
      const w = centre - half + (i / (N - 1)) * (2 * half);
      pts.push(`${xMap(w).toFixed(1)} ${yMap(Vraw(w)).toFixed(1)}`);
    }
    return `M ${xMap(centre - half).toFixed(1)} ${base} L ${pts.join(" L ")} L ${xMap(centre + half).toFixed(1)} ${base} Z`;
  };

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
      <text x={xMap(limit)} y={pad.top + 9} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">π/I</text>
      <text x={xMap(-limit)} y={pad.top + 9} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">−π/I</text>
    </>
  );

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.band, language)}: <span className="control-value">{piLabel(wc)}</span>
          </span>
          <input type="range" min={0.1} max={1} step={0.02} value={wcFrac} onChange={(e) => setWcFrac(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>
            {pick(t.factor, language)}: <span className="control-value">{I}</span>
          </span>
          <input type="range" min={2} max={4} step={1} value={I} onChange={(e) => setI(Number(e.target.value))} />
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
        <path d={triPath} fill="var(--signal)" fillOpacity="0.22" stroke="var(--signal)" strokeWidth="1.5" />
        {xTicks}
        <text x={pad.left + pw} y={H - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_x</text>
      </svg>

      <p className="plot-label">{pick(t.outLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={base} stroke="var(--line)" />
        <line x1={pad.left} y1={base} x2={pad.left + pw} y2={base} stroke="var(--line)" />
        {yTicks}
        {filterOn && limitLines}
        {imageCentres.map((c, i) => {
          const baseband = Math.abs(c) < 1e-6;
          const cut = filterOn && !baseband;
          return (
            <path
              key={i}
              d={imageArea(c)}
              fill={cut ? "var(--ink-soft)" : imageColor(baseband)}
              fillOpacity={cut ? 0.16 : 0.24}
              stroke={cut ? "var(--ink-soft)" : imageColor(baseband)}
              strokeOpacity={cut ? 0.5 : 0.7}
              strokeWidth="1"
              strokeDasharray={cut ? "3 2" : baseband ? undefined : "4 3"}
            />
          );
        })}
        {xTicks}
        <text x={pad.left + pw} y={H - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_y</text>
      </svg>

      <p className="readout">
        <span className={filterOn ? "badge badge--ok" : "badge badge--alias"}>
          {filterOn ? pick(t.interp, language) : pick(t.imaging, language)}
        </span>
      </p>
      <p className="plot-note">{filterOn ? pick(t.noteOn, language) : pick(t.noteOff, language)}</p>
    </div>
  );
}
