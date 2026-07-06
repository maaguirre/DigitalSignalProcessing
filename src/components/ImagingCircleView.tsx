import { useEffect, useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
  angle: { pt: "Ângulo de saída ω_y", en: "Output angle ω_y" },
  play: { pt: "▶ Animar", en: "▶ Play" },
  pause: { pt: "⏸ Pausar", en: "⏸ Pause" },
  circle: {
    pt: "Círculo — ω_y (azul, lento) e I·ω_y (laranja, rápido)",
    en: "Circle — ω_y (blue, slow) and I·ω_y (orange, fast)",
  },
  input: { pt: "|X(ω_x)| — lido no ângulo laranja ω_x = I·ω_y", en: "|X(ω_x)| — read at the orange angle ω_x = I·ω_y" },
  output: {
    pt: "|V(ω_y)| = X(I·ω_y) — as I imagens; só a base (|ω_y| ≤ π/I) sobrevive ao filtro",
    en: "|V(ω_y)| = X(I·ω_y) — the I images; only the baseband (|ω_y| ≤ π/I) survives the filter",
  },
  note: {
    pt: "Por que um ponto anda mais rápido? Porque V(ω_y) = X(I·ω_y): o ângulo em que lemos X é I·ω_y, o dobro/triplo/… do ângulo de saída. Multiplicar por I acelera o ponto laranja em I vezes, então ele dá I voltas enquanto o azul (ω_y) dá uma só — e o espectro X é lido I vezes. Por isso a saída tem I cópias (imagens), todas com a mesma altura. O filtro de corte π/I mantém só a primeira, em banda base.",
    en: "Why does one point move faster? Because V(ω_y) = X(I·ω_y): the angle at which we read X is I·ω_y, twice/three times/… the output angle. Multiplying by I speeds the orange point up I-fold, so it laps I times while the blue one (ω_y) goes around once — and the spectrum X is read I times. That is why the output has I copies (images), all at the same height. The cutoff-π/I filter keeps only the first, in the baseband.",
  },
} satisfies Record<string, Localized>;

const TAU = 2 * Math.PI;
const wrapPi = (a: number) => (((a + Math.PI) % TAU) + TAU) % TAU - Math.PI;
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

// Unit-circle view of imaging: as ω_y sweeps one lap, the argument I·ω_y sweeps
// I laps, so X is traced I times → I images. Justifies the π/I cutoff.
export default function ImagingCircleView({ language }: { language: Language }) {
  const [I, setI] = useState(3);
  const [wy, setWy] = useState(0.4);
  const [playing, setPlaying] = useState(true);

  const wc = 0.7 * Math.PI;
  const Xtri = (w: number) => Math.max(0, 1 - Math.abs(wrapPi(w)) / wc);
  const limit = Math.PI / I;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setWy((w) => wrapPi(w + 0.03)), 40);
    return () => clearInterval(id);
  }, [playing]);

  const wx = wrapPi(I * wy); // where X is read

  // circle
  const CW = 200;
  const CH = 190;
  const cx = CW / 2;
  const cy = CH / 2;
  const r = 64;

  // input |X| panel
  const SW = 360;
  const SH = 190;
  const sp = { left: 32, right: 12, top: 14, bottom: 28 };
  const spw = SW - sp.left - sp.right;
  const sph = SH - sp.top - sp.bottom;
  const sBase = sp.top + sph;
  const xIn = (w: number) => sp.left + ((w + Math.PI) / TAU) * spw;
  const yIn = (v: number) => sBase - v * sph * 0.9;

  // output |V| panel
  const OW = 580;
  const OH = 190;
  const op = { left: 32, right: 12, top: 16, bottom: 28 };
  const opw = OW - op.left - op.right;
  const oph = OH - op.top - op.bottom;
  const oBase = op.top + oph;
  const xOut = (w: number) => op.left + ((w + Math.PI) / TAU) * opw;
  const yOut = (v: number) => oBase - v * oph * 0.9;

  const NP = 361;
  const curve = (xf: (w: number) => number, yf: (v: number) => number, fn: (w: number) => number) =>
    Array.from({ length: NP }, (_, i) => {
      const w = -Math.PI + (i / (NP - 1)) * TAU;
      return `${i === 0 ? "M" : "L"} ${xf(w).toFixed(1)} ${yf(fn(w)).toFixed(1)}`;
    }).join(" ");
  const areaBaseband = () => {
    const N = 120;
    const pts = Array.from({ length: N }, (_, i) => {
      const w = -limit + (i / (N - 1)) * 2 * limit;
      return `${xOut(w).toFixed(1)} ${yOut(Xtri(I * w)).toFixed(1)}`;
    }).join(" L ");
    return `M ${xOut(-limit)} ${oBase} L ${pts} L ${xOut(limit)} ${oBase} Z`;
  };

  const yTickRow = (yf: (v: number) => number, x0: number) =>
    [0, 0.5, 1].map((v, i) => (
      <g key={`y${i}`}>
        <line x1={x0 - 3} y1={yf(v)} x2={x0} y2={yf(v)} stroke={axis} />
        <text x={x0 - 5} y={yf(v) + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
          {v}
        </text>
      </g>
    ));

  const xticks = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const tickRow = (xf: (w: number) => number, baseY: number) =>
    xticks.map((w, i) => (
      <g key={i}>
        <line x1={xf(w)} y1={baseY} x2={xf(w)} y2={baseY + 4} stroke={axis} />
        <text x={xf(w)} y={baseY + 14} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
          {piLabel(w)}
        </text>
      </g>
    ));

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <button className="toggle-btn present-btn" onClick={() => setPlaying((p) => !p)}>
          {playing ? pick(t.pause, language) : pick(t.play, language)}
        </button>
        <label className="control">
          <span>
            {pick(t.factor, language)}: <span className="control-value">{I}</span>
          </span>
          <input type="range" min={2} max={6} step={1} value={I} onChange={(e) => setI(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>
            {pick(t.angle, language)}: <span className="control-value">{piLabel(wy)}</span>
          </span>
          <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={wy} onChange={(e) => { setWy(Number(e.target.value)); setPlaying(false); }} />
        </label>
      </div>

      <div className="fig-row">
        <div className="fig-cell" style={{ flexBasis: "200px", flexGrow: 0 }}>
          <p className="plot-label">{pick(t.circle, language)}</p>
          <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }}>
            <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke="var(--line)" />
            <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy + r + 10} stroke="var(--line)" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-soft)" strokeOpacity="0.6" />
            {/* fast point I·ω_y (amber) */}
            <line x1={cx} y1={cy} x2={cx + r * Math.cos(wx)} y2={cy - r * Math.sin(wx)} stroke="var(--brand-trace)" strokeOpacity="0.7" />
            <circle cx={cx + r * Math.cos(wx)} cy={cy - r * Math.sin(wx)} r={4} fill="var(--brand-trace)" />
            {/* slow point ω_y (teal) */}
            <line x1={cx} y1={cy} x2={cx + r * Math.cos(wy)} y2={cy - r * Math.sin(wy)} stroke="var(--signal)" />
            <circle cx={cx + r * Math.cos(wy)} cy={cy - r * Math.sin(wy)} r={4.5} fill="var(--signal)" />
          </svg>
        </div>
        <div className="fig-cell">
          <p className="plot-label">{pick(t.input, language)}</p>
          <svg viewBox={`0 0 ${SW} ${SH}`} width="100%" style={{ display: "block" }}>
            <line x1={sp.left} y1={sp.top} x2={sp.left} y2={sBase} stroke="var(--line)" />
            <line x1={sp.left} y1={sBase} x2={sp.left + spw} y2={sBase} stroke="var(--line)" />
            {yTickRow(yIn, sp.left)}
            <path d={curve(xIn, yIn, Xtri)} fill="var(--signal)" fillOpacity="0.18" stroke="var(--ink-soft)" strokeWidth="1.5" />
            <line x1={xIn(wx)} y1={sp.top} x2={xIn(wx)} y2={sBase} stroke="var(--brand-trace)" strokeOpacity="0.5" />
            <circle cx={xIn(wx)} cy={yIn(Xtri(wx))} r={4} fill="var(--brand-trace)" />
            {tickRow(xIn, sBase)}
            <text x={sp.left + spw} y={SH - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_x</text>
          </svg>
        </div>
      </div>

      <p className="plot-label">{pick(t.output, language)}</p>
      <svg viewBox={`0 0 ${OW} ${OH}`} width="100%" style={{ display: "block" }}>
        <line x1={op.left} y1={op.top} x2={op.left} y2={oBase} stroke="var(--line)" />
        <line x1={op.left} y1={oBase} x2={op.left + opw} y2={oBase} stroke="var(--line)" />
        {yTickRow(yOut, op.left)}
        {/* all images (amber) */}
        <path d={`M ${xOut(-Math.PI)} ${oBase} ${curve(xOut, yOut, (w) => Xtri(I * w)).slice(1)} L ${xOut(Math.PI)} ${oBase} Z`} fill="var(--brand-trace)" fillOpacity="0.16" stroke="var(--brand-trace)" strokeOpacity="0.55" strokeWidth="1" />
        {/* baseband image (teal) */}
        <path d={areaBaseband()} fill="var(--signal)" fillOpacity="0.28" stroke="var(--signal)" strokeWidth="1.5" />
        {/* cutoff lines */}
        {[limit, -limit].map((w, i) => (
          <line key={i} x1={xOut(w)} y1={op.top} x2={xOut(w)} y2={oBase} stroke="var(--signal)" strokeOpacity="0.5" strokeDasharray="4 3" />
        ))}
        <text x={xOut(limit)} y={op.top + 9} fill="var(--signal)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">π/I</text>
        <text x={xOut(-limit)} y={op.top + 9} fill="var(--signal)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">−π/I</text>
        {/* current ω_y marker */}
        <line x1={xOut(wy)} y1={op.top} x2={xOut(wy)} y2={oBase} stroke="var(--ink)" strokeOpacity="0.4" />
        <circle cx={xOut(wy)} cy={yOut(Xtri(I * wy))} r={4} fill="var(--ink)" />
        {tickRow(xOut, oBase)}
        <text x={op.left + opw} y={OH - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_y</text>
      </svg>

      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
