import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de decimação D", en: "Decimation factor D" },
  lpf: { pt: "Passa-baixas ideal", en: "Ideal lowpass" },
  cutoff: { pt: "corte", en: "cutoff" },
  note: {
    pt: "Siga o espectro por baixo: |X| entra com banda larga; o passa-baixas corta tudo acima de π/D (|V| fica só com a banda que sobrevive); o ↓D estica essa banda para preencher [0, π] com amplitude 1/D (|Y|). O filtro vem ANTES do ↓D — por isso não sobra nada para dobrar.",
    en: "Follow the spectrum underneath: |X| comes in wide-band; the lowpass cuts everything above π/D (|V| keeps only the surviving band); ↓D stretches that band to fill [0, π] with amplitude 1/D (|Y|). The filter comes BEFORE ↓D — so nothing is left to fold.",
  },
} satisfies Record<string, Localized>;

// Block diagram of the ideal decimator with a small spectrum under each stage:
// |X| (wide) -> lowpass (cutoff π/D) -> |V| (clipped) -> ↓D -> |Y| (stretched).
// The D slider updates the cutoff, the per-stage spectra and the rate labels.
export default function DecimatorStructureView({ language }: { language: Language }) {
  const [D, setD] = useState(3);

  const W = 640;
  const H = 250;
  const midY = 52;
  const axis = "var(--ink-soft)";
  const boxH = 48;

  const xIn = 40;
  const lpf = { x: 150, w: 150 };
  const down = { x: 380, w: 90 };
  const xOut = 600;

  const arrow = (x1: number, x2: number, label?: string) => (
    <g>
      <line x1={x1} y1={midY} x2={x2 - 8} y2={midY} stroke={axis} strokeWidth="1.5" />
      <path d={`M ${x2 - 8} ${midY - 4} L ${x2} ${midY} L ${x2 - 8} ${midY + 4} Z`} fill={axis} />
      {label && (
        <text x={(x1 + x2) / 2} y={midY - 8} fill="var(--ink)" fontSize="13" fontFamily="var(--font-mono)" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );

  // per-stage spectra (one-sided, ω in [0, π])
  const PI = Math.PI;
  const limit = PI / D;
  const bx = 0.82 * PI; // input signal band
  const magX = (w: number) => Math.max(0, 1 - w / bx);
  const magV = (w: number) => (w <= limit ? Math.max(0, 1 - w / bx) : 0);
  const magY = (w: number) => magV(w / D) / D;

  const tw = 150;
  const th = 66;
  const tyBase = H - 34;
  const labelY = 118;
  const thumbX = (cx: number, w: number) => cx - tw / 2 + (w / PI) * tw;
  const thumbY = (v: number) => tyBase - v * th;

  const NPT = 72;
  const thumbPath = (cx: number, mag: (w: number) => number) => {
    const pts = Array.from({ length: NPT }, (_, i) => {
      const w = (i / (NPT - 1)) * PI;
      return `${thumbX(cx, w).toFixed(1)} ${thumbY(mag(w)).toFixed(1)}`;
    }).join(" L ");
    return `M ${thumbX(cx, 0)} ${tyBase} L ${pts} L ${thumbX(cx, PI)} ${tyBase} Z`;
  };

  const thumb = (cx: number, label: string, mag: (w: number) => number, showCut: boolean) => (
    <g>
      <text x={cx} y={labelY} fill="var(--ink)" fontSize="12" fontFamily="var(--font-mono)" textAnchor="middle">
        {label}
      </text>
      <line x1={cx - tw / 2} y1={tyBase} x2={cx + tw / 2} y2={tyBase} stroke="var(--line)" />
      {showCut && (
        <>
          <line x1={thumbX(cx, limit)} y1={tyBase} x2={thumbX(cx, limit)} y2={tyBase - th} stroke="var(--brand-trace)" strokeOpacity="0.6" strokeDasharray="3 2" />
          <text x={thumbX(cx, limit)} y={tyBase - th - 3} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">π/D</text>
        </>
      )}
      <path d={thumbPath(cx, mag)} fill="var(--signal)" fillOpacity="0.22" stroke="var(--signal)" strokeWidth="1.5" />
      <text x={cx + tw / 2} y={tyBase + 13} fill={axis} fontSize="8" fontFamily="var(--font-body)" textAnchor="end">ω</text>
    </g>
  );

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>
            {pick(t.factor, language)}: <span className="control-value">{D}</span>
          </span>
          <input type="range" min={2} max={8} step={1} value={D} onChange={(e) => setD(Number(e.target.value))} />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {/* x(n), Fx */}
        <text x={xIn} y={midY - 10} fill="var(--ink)" fontSize="14" fontFamily="var(--font-mono)" textAnchor="middle">x(n)</text>
        <text x={xIn} y={midY + 20} fill={axis} fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">Fx</text>

        {arrow(xIn + 22, lpf.x)}

        {/* LPF box — the anti-aliasing filter placed in front */}
        <rect x={lpf.x} y={midY - boxH / 2} width={lpf.w} height={boxH} rx="6" fill="var(--panel)" stroke="var(--signal)" strokeWidth="2" />
        <text x={lpf.x + lpf.w / 2} y={midY - 5} fill="var(--signal)" fontSize="13" fontFamily="var(--font-body)" textAnchor="middle">{pick(t.lpf, language)}</text>
        <text x={lpf.x + lpf.w / 2} y={midY + 14} fill="var(--ink)" fontSize="13" fontFamily="var(--font-mono)" textAnchor="middle">{pick(t.cutoff, language)} π/{D}</text>

        {arrow(lpf.x + lpf.w, down.x, "v(n)")}

        {/* downsampler box */}
        <rect x={down.x} y={midY - boxH / 2} width={down.w} height={boxH} rx="6" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.5" />
        <text x={down.x + down.w / 2} y={midY + 6} fill="var(--ink)" fontSize="18" fontFamily="var(--font-mono)" textAnchor="middle">↓{D}</text>

        {arrow(down.x + down.w, xOut)}

        {/* y(m), Fy */}
        <text x={xOut + 4} y={midY - 10} fill="var(--ink)" fontSize="14" fontFamily="var(--font-mono)" textAnchor="middle">y(m)</text>
        <text x={xOut + 4} y={midY + 20} fill="var(--signal)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">Fx/{D}</text>

        {/* per-stage spectra */}
        {thumb(105, "|X|", magX, false)}
        {thumb(335, "|V|", magV, true)}
        {thumb(560, "|Y|", magY, false)}
      </svg>

      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
