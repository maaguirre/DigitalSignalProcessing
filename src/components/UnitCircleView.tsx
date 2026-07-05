import { useEffect, useMemo, useState } from "react";
import { sumSines, magnitudeSpectrum } from "../dsp";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  angle: { pt: "Ângulo ω (rad)", en: "Angle ω (rad)" },
  play: { pt: "▶ Animar", en: "▶ Play" },
  pause: { pt: "⏸ Pausar", en: "⏸ Pause" },
} satisfies Record<string, Localized>;

const TAU = 2 * Math.PI;

// Animation of "evaluating on the unit circle": as z = e^{jω} walks around the
// unit circle (ω from 0 to 2π), we read off the spectrum X(e^{jω}). The point on
// the circle and the marker on the spectrum move together.
export default function UnitCircleView({ language }: { language: Language }) {
  const mags = useMemo(() => {
    const signal = sumSines(
      [
        { frequency: 2, amplitude: 1 },
        { frequency: 5, amplitude: 0.6 },
      ],
      32,
      64
    );
    const s = magnitudeSpectrum(signal, 32).magnitudes;
    const max = Math.max(...s, 1e-9);
    return s.map((m) => m / max);
  }, []);
  const M = mags.length;
  const magAt = (w: number) => {
    const wf = w <= Math.PI ? w : TAU - w; // real signal: spectrum is symmetric
    return mags[Math.round((wf / Math.PI) * (M - 1))] ?? 0;
  };

  const [omega, setOmega] = useState(0.6);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setOmega((w) => (w + 0.05) % TAU), 40);
    return () => clearInterval(id);
  }, [playing]);

  // z-plane panel
  const CW = 220;
  const CH = 200;
  const cx = CW / 2;
  const cy = CH / 2;
  const r = 74;
  const px = cx + r * Math.cos(omega);
  const py = cy - r * Math.sin(omega);
  const axis = "var(--ink-soft)";

  // spectrum panel
  const SW = 340;
  const SH = 200;
  const sp = { left: 30, right: 14, top: 16, bottom: 30 };
  const spw = SW - sp.left - sp.right;
  const sph = SH - sp.top - sp.bottom;
  const sBase = sp.top + sph;
  const xOfW = (w: number) => sp.left + (w / TAU) * spw;
  const yOfM = (m: number) => sBase - m * sph * 0.92;
  const curve = Array.from({ length: 121 }, (_, i) => {
    const w = (i / 120) * TAU;
    return `${i === 0 ? "M" : "L"} ${xOfW(w).toFixed(1)} ${yOfM(magAt(w)).toFixed(1)}`;
  }).join(" ");

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <button
          className="toggle-btn present-btn"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? pick(t.pause, language) : pick(t.play, language)}
        </button>
        <label className="control">
          <span>
            {pick(t.angle, language)}:{" "}
            <span className="control-value">{omega.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={TAU}
            step={0.01}
            value={omega}
            onChange={(e) => {
              setOmega(Number(e.target.value));
              setPlaying(false);
            }}
          />
        </label>
      </div>

      <div className="fig-row">
        <div className="fig-cell" style={{ flexBasis: "220px", flexGrow: 0 }}>
          <p className="plot-label">Plano z — z = e^{"{jω}"}</p>
          <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }}>
            <line x1={cx - r - 12} y1={cy} x2={cx + r + 12} y2={cy} stroke="var(--line)" />
            <line x1={cx} y1={cy - r - 12} x2={cx} y2={cy + r + 12} stroke="var(--line)" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-soft)" strokeOpacity="0.6" />
            <line x1={cx} y1={cy} x2={px} y2={py} stroke="var(--signal)" />
            <circle cx={px} cy={py} r={4} fill="var(--signal)" />
            <text x={cx + r + 4} y={cy - 4} fill={axis} fontSize="10" fontFamily="var(--font-body)">Re</text>
            <text x={cx + 4} y={cy - r - 4} fill={axis} fontSize="10" fontFamily="var(--font-body)">Im</text>
          </svg>
        </div>
        <div className="fig-cell">
          <p className="plot-label">|X(e^{"{jω}"})| — o espectro</p>
          <svg viewBox={`0 0 ${SW} ${SH}`} width="100%" style={{ display: "block" }}>
            <line x1={sp.left} y1={sp.top} x2={sp.left} y2={sBase} stroke="var(--line)" />
            <line x1={sp.left} y1={sBase} x2={sp.left + spw} y2={sBase} stroke="var(--line)" />
            {[0, 0.5, 1].map((v, i) => (
              <g key={`y${i}`}>
                <line x1={sp.left - 3} y1={yOfM(v)} x2={sp.left} y2={yOfM(v)} stroke={axis} />
                <text x={sp.left - 5} y={yOfM(v) + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
                  {v}
                </text>
              </g>
            ))}
            <path d={curve} fill="none" stroke="var(--ink-soft)" strokeWidth="1.5" />
            <line x1={xOfW(omega)} y1={sp.top} x2={xOfW(omega)} y2={sBase} stroke="var(--signal)" strokeOpacity="0.5" />
            <circle cx={xOfW(omega)} cy={yOfM(magAt(omega))} r={4} fill="var(--signal)" />
            {[0, Math.PI, TAU].map((w, i) => (
              <text key={i} x={xOfW(w)} y={SH - 14} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                {i === 0 ? "0" : i === 1 ? "π" : "2π"}
              </text>
            ))}
            <text x={sp.left + spw} y={SH - 2} fill={axis} fontSize="10" fontFamily="var(--font-body)" textAnchor="end">ω</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
