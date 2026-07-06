import { useEffect, useMemo, useState } from "react";
import { sumSines, magnitudeSpectrum } from "../dsp";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de decimação D", en: "Decimation factor D" },
  angle: { pt: "Ângulo de saída ω_y", en: "Output angle ω_y" },
  play: { pt: "▶ Animar", en: "▶ Play" },
  pause: { pt: "⏸ Pausar", en: "⏸ Pause" },
  circle: { pt: "Círculo — os D pontos avaliados", en: "Circle — the D evaluated points" },
  sampled: { pt: "|X(ω_x)| — amostrado nos D pontos", en: "|X(ω_x)| — sampled at the D points" },
  copies: {
    pt: "As D cópias de X (esticada por D, deslocada e com amplitude ÷ D) e sua soma Y — onde se sobrepõem, é o aliasing",
    en: "The D copies of X (stretched by D, shifted, amplitude ÷ D) and their sum Y — where they overlap, that is aliasing",
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
  if (near(1.5)) return "3π/2";
  if (near(2)) return "2π";
  return `${m.toFixed(1)}π`;
}
const axis = "var(--ink-soft)";
const copyColor = (k: number) => (k === 0 ? "var(--signal)" : "var(--brand-trace)");

// Visualizes eq (9.17): Y(ω_y) = (1/D) Σ_k X((ω_y − 2πk)/D). Left: the D points on
// the input circle. Right: |X| sampled at them. Bottom: the D copies of X (each
// stretched by D and shifted) and their sum Y — where copies overlap, that is the
// "folding" (aliasing).
export default function AliasCircleView({ language }: { language: Language }) {
  const mags = useMemo(() => {
    // a band (a few neighbouring tones) so the stretched copies actually overlap
    const signal = sumSines(
      [
        { frequency: 1, amplitude: 0.6 },
        { frequency: 2, amplitude: 1 },
        { frequency: 3, amplitude: 0.6 },
      ],
      32,
      64
    );
    const s = magnitudeSpectrum(signal, 32).magnitudes;
    const max = Math.max(...s, 1e-9);
    return s.map((m) => m / max);
  }, []);
  const M = mags.length;
  const magX = (w: number) => mags[Math.round((Math.abs(wrapPi(w)) / Math.PI) * (M - 1))] ?? 0;

  const [D, setD] = useState(3);
  const [wy, setWy] = useState(0.6);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setWy((w) => (w + 0.04) % TAU), 40);
    return () => clearInterval(id);
  }, [playing]);

  const angles = Array.from({ length: D }, (_, k) => wrapPi((wy - TAU * k) / D));
  const copyAt = (k: number, w: number) => magX((w - TAU * k) / D) / D;
  const yAt = (w: number) => Array.from({ length: D }, (_, k) => copyAt(k, w)).reduce((a, b) => a + b, 0);

  // circle
  const CW = 190;
  const CH = 180;
  const cx = CW / 2;
  const cy = CH / 2;
  const r = 62;

  // input spectrum |X| over [-π, π]
  const SW = 360;
  const SH = 180;
  const sp = { left: 32, right: 12, top: 14, bottom: 28 };
  const spw = SW - sp.left - sp.right;
  const sph = SH - sp.top - sp.bottom;
  const sBase = sp.top + sph;
  const xIn = (w: number) => sp.left + ((w + Math.PI) / TAU) * spw;
  const yIn = (v: number) => sBase - v * sph * 0.9;
  const inTicks = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const xCurve = Array.from({ length: 121 }, (_, i) => {
    const w = -Math.PI + (i / 120) * TAU;
    return `${i === 0 ? "M" : "L"} ${xIn(w).toFixed(1)} ${(sBase - magX(w) * sph * 0.9).toFixed(1)}`;
  }).join(" ");

  // output spectrum: copies + sum, over [0, 2π]
  const OW = 580;
  const OH = 180;
  const op = { left: 32, right: 12, top: 14, bottom: 28 };
  const opw = OW - op.left - op.right;
  const oph = OH - op.top - op.bottom;
  const oBase = op.top + oph;
  const xOut = (w: number) => op.left + (w / TAU) * opw;
  const outTicks = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, TAU];
  const NP = 181;
  const yOut = (v: number) => oBase - v * oph * 0.9;
  const copyArea = (k: number) => {
    const top = Array.from({ length: NP }, (_, i) => {
      const w = (i / (NP - 1)) * TAU;
      return `${xOut(w).toFixed(1)} ${yOut(copyAt(k, w)).toFixed(1)}`;
    }).join(" L ");
    return `M ${op.left.toFixed(1)} ${oBase} L ${top} L ${(op.left + opw).toFixed(1)} ${oBase} Z`;
  };
  const sumPath = Array.from({ length: NP }, (_, i) => {
    const w = (i / (NP - 1)) * TAU;
    return `${i === 0 ? "M" : "L"} ${xOut(w).toFixed(1)} ${yOut(yAt(w)).toFixed(1)}`;
  }).join(" ");

  const tickRow = (ticks: number[], xf: (w: number) => number, baseY: number) =>
    ticks.map((w, i) => (
      <g key={i}>
        <line x1={xf(w)} y1={baseY} x2={xf(w)} y2={baseY + 4} stroke={axis} />
        <text x={xf(w)} y={baseY + 14} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
          {piLabel(w)}
        </text>
      </g>
    ));

  const yTickRow = (yf: (v: number) => number, x0: number) =>
    [0, 0.5, 1].map((v, i) => (
      <g key={`y${i}`}>
        <line x1={x0 - 3} y1={yf(v)} x2={x0} y2={yf(v)} stroke={axis} />
        <text x={x0 - 5} y={yf(v) + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
          {v}
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
            {pick(t.factor, language)}: <span className="control-value">{D}</span>
          </span>
          <input type="range" min={2} max={4} step={1} value={D} onChange={(e) => setD(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>
            {pick(t.angle, language)}: <span className="control-value">{piLabel(wy)}</span>
          </span>
          <input type="range" min={0} max={TAU} step={0.01} value={wy} onChange={(e) => { setWy(Number(e.target.value)); setPlaying(false); }} />
        </label>
      </div>

      <div className="fig-row">
        <div className="fig-cell" style={{ flexBasis: "190px", flexGrow: 0 }}>
          <p className="plot-label">{pick(t.circle, language)}</p>
          <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }}>
            <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke="var(--line)" />
            <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy + r + 10} stroke="var(--line)" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-soft)" strokeOpacity="0.6" />
            {angles.map((a, k) => (
              <g key={k}>
                <line x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy - r * Math.sin(a)} stroke={copyColor(k)} strokeOpacity="0.7" />
                <circle cx={cx + r * Math.cos(a)} cy={cy - r * Math.sin(a)} r={4} fill={copyColor(k)} />
              </g>
            ))}
          </svg>
        </div>
        <div className="fig-cell">
          <p className="plot-label">{pick(t.sampled, language)}</p>
          <svg viewBox={`0 0 ${SW} ${SH}`} width="100%" style={{ display: "block" }}>
            <line x1={sp.left} y1={sp.top} x2={sp.left} y2={sBase} stroke="var(--line)" />
            <line x1={sp.left} y1={sBase} x2={sp.left + spw} y2={sBase} stroke="var(--line)" />
            {yTickRow(yIn, sp.left)}
            <path d={xCurve} fill="none" stroke="var(--ink-soft)" strokeWidth="1.5" />
            {angles.map((a, k) => (
              <g key={k}>
                <line x1={xIn(a)} y1={sBase} x2={xIn(a)} y2={sBase - magX(a) * sph * 0.9} stroke={copyColor(k)} />
                <circle cx={xIn(a)} cy={sBase - magX(a) * sph * 0.9} r={3} fill={copyColor(k)} />
              </g>
            ))}
            {tickRow(inTicks, xIn, sBase)}
            <text x={sp.left + spw} y={SH - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_x</text>
          </svg>
        </div>
      </div>

      <p className="plot-label">{pick(t.copies, language)}</p>
      <svg viewBox={`0 0 ${OW} ${OH}`} width="100%" style={{ display: "block" }}>
        <line x1={op.left} y1={op.top} x2={op.left} y2={oBase} stroke="var(--line)" />
        <line x1={op.left} y1={oBase} x2={op.left + opw} y2={oBase} stroke="var(--line)" />
        {yTickRow(yOut, op.left)}
        {Array.from({ length: D }, (_, k) => (
          <path key={k} d={copyArea(k)} fill={copyColor(k)} fillOpacity="0.22" stroke={copyColor(k)} strokeOpacity="0.6" strokeWidth="1" strokeDasharray={k === 0 ? undefined : "4 3"} />
        ))}
        <path d={sumPath} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeOpacity="0.85" />
        <line x1={xOut(wy)} y1={op.top} x2={xOut(wy)} y2={oBase} stroke="var(--signal)" strokeOpacity="0.4" />
        <circle cx={xOut(wy)} cy={yOut(yAt(wy))} r={4} fill="var(--ink)" />
        {tickRow(outTicks, xOut, oBase)}
        <text x={op.left + opw} y={OH - 2} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="end">ω_y</text>
      </svg>
    </div>
  );
}
