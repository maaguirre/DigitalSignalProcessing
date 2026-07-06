import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
  lpf: { pt: "Passa-baixas ideal", en: "Ideal lowpass" },
  cutoff: { pt: "corte", en: "cutoff" },
  gain: { pt: "ganho", en: "gain" },
  inDesc: { pt: "entrada", en: "input" },
  imgDesc: { pt: "I imagens", en: "I images" },
  outDesc: { pt: "reconstruído", en: "rebuilt" },
  note: {
    pt: "Siga o espectro por baixo: |X| entra; o ↑I comprime por I e cria I cópias — as imagens (|V|); o passa-baixas (corte π/I, ganho I) mantém só a imagem em banda base e reconstrói o sinal na taxa maior (|Y|). O filtro vem DEPOIS do ↑I.",
    en: "Follow the spectrum underneath: |X| comes in; ↑I compresses by I and creates I copies — the images (|V|); the lowpass (cutoff π/I, gain I) keeps only the baseband image and rebuilds the signal at the higher rate (|Y|). The filter comes AFTER ↑I.",
  },
} satisfies Record<string, Localized>;

// Block diagram of the ideal interpolator with a small spectrum under each stage:
// |X| -> ↑I -> |V| (I images) -> lowpass (cutoff π/I, gain I) -> |Y| (baseband).
// The I slider updates the cutoff, the per-stage spectra and the rate labels.
export default function InterpolatorStructureView({ language }: { language: Language }) {
  const [I, setI] = useState(3);

  const W = 640;
  const H = 250;
  const midY = 52;
  const axis = "var(--ink-soft)";
  const boxH = 48;

  const xIn = 40;
  const up = { x: 150, w: 90 };
  const lpf = { x: 330, w: 170 };
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

  const PI = Math.PI;
  const TAU = 2 * PI;
  const wrapPi = (a: number) => (((a + PI) % TAU) + TAU) % TAU - PI;
  const limit = PI / I;
  const bx = 0.82 * PI; // input signal band
  const magX = (w: number) => Math.max(0, 1 - w / bx);
  const magV = (w: number) => Math.max(0, 1 - Math.abs(wrapPi(I * w)) / bx); // images
  const magY = (w: number) => (w <= limit ? magV(w) : 0);

  const tw = 150;
  const th = 66;
  const tyBase = H - 34;
  const labelY = 118;
  const thumbX = (cx: number, w: number) => cx - tw / 2 + (w / PI) * tw;
  const thumbY = (v: number) => tyBase - v * th;

  const NPT = 120;
  const thumbPath = (cx: number, mag: (w: number) => number) => {
    const pts = Array.from({ length: NPT }, (_, i) => {
      const w = (i / (NPT - 1)) * PI;
      return `${thumbX(cx, w).toFixed(1)} ${thumbY(mag(w)).toFixed(1)}`;
    }).join(" L ");
    return `M ${thumbX(cx, 0)} ${tyBase} L ${pts} L ${thumbX(cx, PI)} ${tyBase} Z`;
  };

  const thumb = (cx: number, label: string, desc: string, mag: (w: number) => number, showCut: boolean) => (
    <g>
      <text x={cx} y={labelY} fill="var(--ink)" fontSize="12" fontFamily="var(--font-mono)" textAnchor="middle">
        {label}
      </text>
      <text x={cx} y={labelY + 13} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="middle">
        {desc}
      </text>
      <line x1={cx - tw / 2} y1={tyBase} x2={cx + tw / 2} y2={tyBase} stroke="var(--line)" />
      {showCut && (
        <>
          <line x1={thumbX(cx, limit)} y1={tyBase} x2={thumbX(cx, limit)} y2={tyBase - th} stroke="var(--brand-trace)" strokeOpacity="0.6" strokeDasharray="3 2" />
          <text x={thumbX(cx, limit)} y={tyBase - th - 3} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">π/I</text>
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
            {pick(t.factor, language)}: <span className="control-value">{I}</span>
          </span>
          <input type="range" min={2} max={6} step={1} value={I} onChange={(e) => setI(Number(e.target.value))} />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {/* x(n), Fx */}
        <text x={xIn} y={midY - 10} fill="var(--ink)" fontSize="14" fontFamily="var(--font-mono)" textAnchor="middle">x(n)</text>
        <text x={xIn} y={midY + 20} fill={axis} fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">Fx</text>

        {arrow(xIn + 22, up.x)}

        {/* upsampler box */}
        <rect x={up.x} y={midY - boxH / 2} width={up.w} height={boxH} rx="6" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.5" />
        <text x={up.x + up.w / 2} y={midY + 6} fill="var(--ink)" fontSize="18" fontFamily="var(--font-mono)" textAnchor="middle">↑{I}</text>

        {arrow(up.x + up.w, lpf.x, "v(m)")}

        {/* LPF box — the interpolation filter after ↑I */}
        <rect x={lpf.x} y={midY - boxH / 2} width={lpf.w} height={boxH} rx="6" fill="var(--panel)" stroke="var(--signal)" strokeWidth="2" />
        <text x={lpf.x + lpf.w / 2} y={midY - 5} fill="var(--signal)" fontSize="13" fontFamily="var(--font-body)" textAnchor="middle">{pick(t.lpf, language)}</text>
        <text x={lpf.x + lpf.w / 2} y={midY + 14} fill="var(--ink)" fontSize="12" fontFamily="var(--font-mono)" textAnchor="middle">{pick(t.cutoff, language)} π/{I} · {pick(t.gain, language)} {I}</text>

        {arrow(lpf.x + lpf.w, xOut)}

        {/* y(m), Fy */}
        <text x={xOut + 4} y={midY - 10} fill="var(--ink)" fontSize="14" fontFamily="var(--font-mono)" textAnchor="middle">y(m)</text>
        <text x={xOut + 4} y={midY + 20} fill="var(--signal)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">{I}·Fx</text>

        {/* per-stage spectra */}
        {thumb(105, "|X|", pick(t.inDesc, language), magX, false)}
        {thumb(335, "|V|", pick(t.imgDesc, language), magV, true)}
        {thumb(560, "|Y|", pick(t.outDesc, language), magY, true)}
      </svg>

      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
