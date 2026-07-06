import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  up: { pt: "Fator de interpolação I", en: "Interpolation factor I" },
  down: { pt: "Fator de decimação D", en: "Decimation factor D" },
  lpf: { pt: "Passa-baixas", en: "Lowpass" },
  cutoff: { pt: "corte", en: "cutoff" },
  gain: { pt: "ganho", en: "gain" },
  inDesc: { pt: "entrada", en: "input" },
  upDesc: { pt: "após ↑I (imagens)", en: "after ↑I (images)" },
  filtDesc: { pt: "após o filtro", en: "after the filter" },
  outDesc: { pt: "após ↓D (saída)", en: "after ↓D (output)" },
  cand: {
    pt: "Os dois candidatos a corte: π/I (das imagens) e π/D (do aliasing). O filtro usa o MENOR — em laranja.",
    en: "The two cutoff candidates: π/I (images) and π/D (aliasing). The filter uses the SMALLER — in orange.",
  },
  note: {
    pt: "Um único passa-baixas entre ↑I e ↓D faz os dois papéis: remove as imagens do ↑I E protege contra o aliasing do ↓D. Por isso seu corte é o MENOR dos dois limites, min(π/I, π/D), e o ganho é I (eq. 9.36). A taxa de saída é (I/D)·Fx.",
    en: "A single lowpass between ↑I and ↓D does both jobs: it removes the ↑I images AND guards against ↓D aliasing. That is why its cutoff is the SMALLER of the two limits, min(π/I, π/D), and the gain is I (eq. 9.36). The output rate is (I/D)·Fx.",
  },
} satisfies Record<string, Localized>;

// Block diagram of the rational I/D converter (↑I → shared lowpass → ↓D) with a
// small spectrum under each stage: input → images → filtered → decimated.
export default function RationalStructureView({ language }: { language: Language }) {
  const [I, setI] = useState(3);
  const [D, setD] = useState(2);

  const W = 760;
  const H = 250;
  const midY = 50;
  const axis = "var(--ink-soft)";
  const boxH = 46;

  const xIn = 34;
  const up = { x: 110, w: 74 };
  const lpf = { x: 300, w: 150 };
  const down = { x: 566, w: 74 };
  const xOut = 726;

  const arrow = (x1: number, x2: number, label?: string) => (
    <g>
      <line x1={x1} y1={midY} x2={x2 - 8} y2={midY} stroke={axis} strokeWidth="1.5" />
      <path d={`M ${x2 - 8} ${midY - 4} L ${x2} ${midY} L ${x2 - 8} ${midY + 4} Z`} fill={axis} />
      {label && (
        <text x={(x1 + x2) / 2} y={midY - 8} fill="var(--ink)" fontSize="12" fontFamily="var(--font-mono)" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );

  const PI = Math.PI;
  const TAU = 2 * PI;
  const wrapPi = (a: number) => (((a + PI) % TAU) + TAU) % TAU - PI;
  const bx = 0.82 * PI;
  const limit = Math.min(PI / I, PI / D); // shared filter cutoff
  const magX0 = (th: number) => Math.max(0, 1 - Math.abs(wrapPi(th)) / bx);
  const magX = (w: number) => Math.max(0, 1 - w / bx);
  const magV = (w: number) => magX0(I * w); // images
  const magW = (w: number) => (w <= limit ? magV(w) : 0); // filtered
  const magY = (w: number) => magW(w / D); // decimated (stretched by D)

  const tw = 158;
  const th = 60;
  const tyBase = H - 30;
  const labelY = 118;
  const centres = [xIn + 60, up.x + up.w + 60, lpf.x + lpf.w + 40, xOut - 40];
  const thumbX = (cx: number, w: number) => cx - tw / 2 + (w / PI) * tw;
  const thumbY = (v: number) => tyBase - v * th;

  const NPT = 110;
  const thumbPath = (cx: number, mag: (w: number) => number) => {
    const pts = Array.from({ length: NPT }, (_, i) => {
      const w = (i / (NPT - 1)) * PI;
      return `${thumbX(cx, w).toFixed(1)} ${thumbY(mag(w)).toFixed(1)}`;
    }).join(" L ");
    return `M ${thumbX(cx, 0)} ${tyBase} L ${pts} L ${thumbX(cx, PI)} ${tyBase} Z`;
  };

  const candLine = (cx: number, w: number, isMin: boolean, tag: string) => (
    <g>
      <line
        x1={thumbX(cx, w)}
        y1={tyBase}
        x2={thumbX(cx, w)}
        y2={tyBase - th}
        stroke={isMin ? "var(--brand-trace)" : "var(--ink-soft)"}
        strokeOpacity={isMin ? 0.85 : 0.45}
        strokeWidth={isMin ? 1.6 : 1}
        strokeDasharray={isMin ? undefined : "3 2"}
      />
      <text x={thumbX(cx, w)} y={tyBase - th - 3} fill={isMin ? "var(--brand-trace)" : "var(--ink-soft)"} fontSize="8.5" fontFamily="var(--font-mono)" textAnchor="middle">
        {tag}
      </text>
    </g>
  );

  const thumb = (cx: number, label: string, desc: string, mag: (w: number) => number, mode: "none" | "cut" | "cand") => (
    <g>
      <text x={cx} y={labelY} fill="var(--ink)" fontSize="12" fontFamily="var(--font-mono)" textAnchor="middle">{label}</text>
      <text x={cx} y={labelY + 13} fill={axis} fontSize="9" fontFamily="var(--font-body)" textAnchor="middle">{desc}</text>
      <line x1={cx - tw / 2} y1={tyBase} x2={cx + tw / 2} y2={tyBase} stroke="var(--line)" />
      {mode === "cut" && candLine(cx, limit, true, "corte")}
      {mode === "cand" && (
        <>
          {candLine(cx, PI / I, PI / I <= PI / D, "π/I")}
          {candLine(cx, PI / D, PI / D < PI / I, "π/D")}
        </>
      )}
      <path d={thumbPath(cx, mag)} fill="var(--signal)" fillOpacity="0.22" stroke="var(--signal)" strokeWidth="1.4" />
    </g>
  );

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>{pick(t.up, language)}: <span className="control-value">{I}</span></span>
          <input type="range" min={2} max={4} step={1} value={I} onChange={(e) => setI(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>{pick(t.down, language)}: <span className="control-value">{D}</span></span>
          <input type="range" min={2} max={4} step={1} value={D} onChange={(e) => setD(Number(e.target.value))} />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <text x={xIn} y={midY - 10} fill="var(--ink)" fontSize="13" fontFamily="var(--font-mono)" textAnchor="middle">x(n)</text>
        <text x={xIn} y={midY + 18} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">Fx</text>

        {arrow(xIn + 20, up.x)}
        <rect x={up.x} y={midY - boxH / 2} width={up.w} height={boxH} rx="6" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.5" />
        <text x={up.x + up.w / 2} y={midY + 6} fill="var(--ink)" fontSize="16" fontFamily="var(--font-mono)" textAnchor="middle">↑{I}</text>

        {arrow(up.x + up.w, lpf.x, "v(k)")}
        <rect x={lpf.x} y={midY - boxH / 2} width={lpf.w} height={boxH} rx="6" fill="var(--panel)" stroke="var(--signal)" strokeWidth="2" />
        <text x={lpf.x + lpf.w / 2} y={midY - 4} fill="var(--signal)" fontSize="12" fontFamily="var(--font-body)" textAnchor="middle">{pick(t.lpf, language)}</text>
        <text x={lpf.x + lpf.w / 2} y={midY + 13} fill="var(--ink)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">{pick(t.cutoff, language)} π/{Math.max(I, D)} · {pick(t.gain, language)} {I}</text>

        {arrow(lpf.x + lpf.w, down.x, "w(k)")}
        <rect x={down.x} y={midY - boxH / 2} width={down.w} height={boxH} rx="6" fill="var(--panel)" stroke="var(--line)" strokeWidth="1.5" />
        <text x={down.x + down.w / 2} y={midY + 6} fill="var(--ink)" fontSize="16" fontFamily="var(--font-mono)" textAnchor="middle">↓{D}</text>

        {arrow(down.x + down.w, xOut)}
        <text x={xOut + 2} y={midY - 10} fill="var(--ink)" fontSize="13" fontFamily="var(--font-mono)" textAnchor="middle">y(m)</text>
        <text x={xOut + 2} y={midY + 18} fill="var(--signal)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">{I}/{D}·Fx</text>

        {thumb(centres[0], "|X|", pick(t.inDesc, language), magX, "none")}
        {thumb(centres[1], "|V|", pick(t.upDesc, language), magV, "cand")}
        {thumb(centres[2], "|W|", pick(t.filtDesc, language), magW, "cut")}
        {thumb(centres[3], "|Y|", pick(t.outDesc, language), magY, "none")}
      </svg>

      <p className="readout">
        {pick(t.cand, language)}{" "}
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>
          π/{I} {PI / I <= PI / D ? "≤" : ">"} π/{D} → {pick(t.cutoff, language)} = π/{Math.max(I, D)}
        </span>
      </p>
      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
