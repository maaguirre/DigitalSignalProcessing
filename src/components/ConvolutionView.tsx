import { useEffect, useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  play: { pt: "▶ Animar", en: "▶ Play" },
  pause: { pt: "⏸ Pausar", en: "⏸ Pause" },
  pos: { pt: "Posição de saída k", en: "Output position k" },
  topLabel: { pt: "v(ℓ) azul · h(k−ℓ) laranja — sobreposição destacada", en: "v(ℓ) blue · h(k−ℓ) orange — overlap highlighted" },
  sumLabel: { pt: "w(k): os produtos empilhados formam a soma", en: "w(k): the products stacked form the sum" },
  note: {
    pt: "Uma demonstração da convolução (eq. 9.38). O filtro h é invertido — por isso h(k−ℓ) — e posicionado em k. As amostras de v e de h que caem no mesmo ℓ (região destacada) são multiplicadas; cada produto vira um bloco. Empilhados, os blocos formam a barra w(k). Ao mudar k, o filtro desliza e cada w(k) é montado bloco a bloco.",
    en: "A demonstration of convolution (eq. 9.38). The filter h is flipped — hence h(k−ℓ) — and placed at k. The samples of v and h that land on the same ℓ (highlighted region) are multiplied; each product becomes a block. Stacked, the blocks form the w(k) bar. As k changes, the filter slides and each w(k) is assembled block by block.",
  },
} satisfies Record<string, Localized>;

const v = [1, 3, 2, 1];
const h = [1, 2, 1];
const V = v.length;
const H = h.length;
const wLen = V + H - 1;
const w = Array.from({ length: wLen }, (_, k) => {
  let s = 0;
  for (let l = 0; l < V; l++) {
    const hi = k - l;
    if (hi >= 0 && hi < H) s += v[l] * h[hi];
  }
  return s;
});
const wPeak = Math.max(...w);

// Animated demonstration of convolution w = h * v: flip h, slide to k, multiply
// the overlap, and stack the products into the w(k) bar.
export default function ConvolutionView({ language }: { language: Language }) {
  const [k, setK] = useState(2);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setK((p) => (p + 1) % wLen), 1100);
    return () => clearInterval(id);
  }, [playing]);

  const overlap: { l: number; hi: number; prod: number }[] = [];
  for (let l = 0; l < V; l++) {
    const hi = k - l;
    if (hi >= 0 && hi < H) overlap.push({ l, hi, prod: v[l] * h[hi] });
  }
  const termStr = overlap.map((o) => `${h[o.hi]}·${v[o.l]}`).join(" + ") || "0";

  const W = 600;
  const Ht = 320;
  const Lmin = -(H - 1);
  const Lmax = V - 1 + (H - 1);
  const pad = { left: 44, right: 16 };
  const plotW = W - pad.left - pad.right;
  const xOf = (l: number) => pad.left + ((l - Lmin) / (Lmax - Lmin)) * plotW;
  const axisY = 84; // shared axis: v up, h down
  const sTop = 16;
  const wBase = 302;
  const sW = 128 / wPeak; // scale so the tallest w bar is ~128 px
  const axis = "var(--ink-soft)";
  const segColor = ["var(--ok)", "var(--signal)", "var(--brand-trace)"];

  const loStart = Math.max(0, k - (H - 1));
  const loEnd = Math.min(V - 1, k);

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <button className="toggle-btn present-btn" onClick={() => setPlaying((p) => !p)}>
          {playing ? pick(t.pause, language) : pick(t.play, language)}
        </button>
        <label className="control">
          <span>
            {pick(t.pos, language)}: <span className="control-value">{k}</span>
          </span>
          <input type="range" min={0} max={wLen - 1} step={1} value={k} onChange={(e) => { setK(Number(e.target.value)); setPlaying(false); }} />
        </label>
      </div>

      <p className="plot-label">{pick(t.topLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${Ht}`} width="100%" style={{ display: "block" }}>
        {/* overlap window */}
        {overlap.length > 0 && (
          <rect x={xOf(loStart) - 11} y={30} width={xOf(loEnd) - xOf(loStart) + 22} height={axisY + sTop * 2 - 22} fill="var(--signal)" fillOpacity="0.08" rx="4" />
        )}

        <line x1={pad.left} y1={axisY} x2={pad.left + plotW} y2={axisY} stroke="var(--line)" />

        {/* v(ℓ) up (blue) */}
        {v.map((val, l) => (
          <g key={`v${l}`}>
            <line x1={xOf(l)} y1={axisY} x2={xOf(l)} y2={axisY - val * sTop} stroke="var(--signal)" strokeWidth="1.8" />
            <circle cx={xOf(l)} cy={axisY - val * sTop} r={3} fill="var(--signal)" />
          </g>
        ))}

        {/* h(k−ℓ) down (orange) */}
        {Array.from({ length: Lmax - Lmin + 1 }, (_, i) => Lmin + i).map((l) => {
          const hi = k - l;
          if (hi < 0 || hi >= H) return null;
          return (
            <g key={`h${l}`}>
              <line x1={xOf(l)} y1={axisY} x2={xOf(l)} y2={axisY + h[hi] * sTop} stroke="var(--brand-trace)" strokeWidth="1.8" />
              <circle cx={xOf(l)} cy={axisY + h[hi] * sTop} r={3} fill="var(--brand-trace)" />
            </g>
          );
        })}

        {/* ℓ index labels, below the h stems (own row, no overlap) */}
        {Array.from({ length: Lmax - Lmin + 1 }, (_, i) => Lmin + i)
          .filter((l) => l >= 0 && l < V)
          .map((l) => (
            <text key={`li${l}`} x={xOf(l)} y={axisY + sTop * 2 + 10} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
              {l}
            </text>
          ))}

        {/* w(k) result: past solid, current = stacked products */}
        <line x1={pad.left} y1={wBase} x2={pad.left + plotW} y2={wBase} stroke="var(--line)" />
        {w.map((val, i) => {
          if (i === k) return null; // current drawn as stack below
          const done = i < k;
          return (
            <g key={`w${i}`}>
              <line x1={xOf(i)} y1={wBase} x2={xOf(i)} y2={wBase - val * sW} stroke="var(--ink-soft)" strokeOpacity={done ? 0.85 : 0.22} strokeWidth="2" />
              <circle cx={xOf(i)} cy={wBase - val * sW} r={2.5} fill="var(--ink-soft)" fillOpacity={done ? 0.85 : 0.22} />
            </g>
          );
        })}
        {/* current w(k) as a stack of product blocks */}
        {(() => {
          let cum = 0;
          return overlap.map((o, idx) => {
            const y0 = wBase - cum * sW;
            cum += o.prod;
            const y1 = wBase - cum * sW;
            return (
              <g key={`seg${idx}`}>
                <rect x={xOf(k) - 9} y={y1} width={18} height={y0 - y1} fill={segColor[idx % segColor.length]} fillOpacity="0.5" stroke="var(--paper)" strokeWidth="1" />
                {o.prod * sW > 12 && (
                  <text x={xOf(k)} y={(y0 + y1) / 2 + 3} fill="var(--ink)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">{o.prod}</text>
                )}
              </g>
            );
          });
        })()}
        <text x={xOf(k)} y={wBase - w[k] * sW - 5} fill="var(--ok)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="600">{w[k]}</text>
        <text x={pad.left - 6} y={wBase + 4} fill={axis} fontSize="10" fontFamily="var(--font-body)" textAnchor="end">w(k)</text>
      </svg>

      <p className="readout">
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>
          w({k}) = {termStr} = {w[k]}
        </span>
      </p>
      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
