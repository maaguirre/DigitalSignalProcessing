import { type Language, pick } from "../i18n.ts";

type StemPlotProps = {
  samples: number[];
  language: Language;
  height?: number;
  label?: string;
  color?: string;
  yMax?: number; // fix the amplitude scale so several plots stay comparable
  keep?: number; // dim samples whose index is not a multiple of `keep`
  reference?: number[]; // faint grey curve behind the stems (the sampled signal)
  dt?: number; // time between samples (for a shared time axis); default 1
  xDomain?: number; // x-axis span in time units; default n-1 (fill the width)
};

// Discrete-time stem plot with numbered axes: a stem + dot per sample over a
// baseline. x axis is the sample index n; y axis is amplitude. `dt`/`xDomain`
// let several plots share one time axis so their samples line up.
export default function StemPlot({
  samples,
  language,
  height = 170,
  label = "Discrete-time signal",
  color = "var(--signal)",
  yMax,
  keep,
  reference,
  dt = 1,
  xDomain,
}: StemPlotProps) {
  const width = 600;
  const pad = { left: 34, right: 14, top: 12, bottom: 26 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const n = samples.length;
  const maxAbs = yMax ?? Math.max(...samples.map((v) => Math.abs(v)), 1e-9);
  const yTop = pad.top;
  const yBot = pad.top + plotH;
  const baseline = pad.top + plotH / 2;

  const den = xDomain ?? n - 1;
  const xOf = (i: number) =>
    pad.left + (den <= 0 ? plotW / 2 : ((i * dt) / den) * plotW);
  const yOf = (v: number) => baseline - (v / maxAbs) * (plotH / 2) * 0.92;
  const dotR = Math.max(1, Math.min(3, plotW / n / 3));

  const axis = "var(--ink-soft)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={label}
      style={{ display: "block" }}
    >
      <line x1={pad.left} y1={yTop} x2={pad.left} y2={yBot} stroke="var(--line)" />
      <line
        x1={pad.left}
        y1={baseline}
        x2={pad.left + plotW}
        y2={baseline}
        stroke="var(--line)"
      />

      {reference && reference.length > 1 && (
        <path
          d={reference
            .map((v, j) => `${j === 0 ? "M" : "L"} ${(pad.left + (j / (reference.length - 1)) * plotW).toFixed(1)} ${yOf(v).toFixed(1)}`)
            .join(" ")}
          fill="none"
          stroke="var(--ink-soft)"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />
      )}

      <text x={pad.left + 2} y={yTop - 2} fill={axis} fontSize="10" fontFamily="var(--font-body)" textAnchor="start">
        x[n]
      </text>
      <text x={pad.left - 5} y={yTop + 8} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
        {maxAbs.toFixed(1)}
      </text>
      <text x={pad.left - 5} y={baseline + 3} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
        0
      </text>
      <text x={pad.left - 5} y={yBot} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
        {(-maxAbs).toFixed(1)}
      </text>

      {samples.map((v, i) => {
        const x = xOf(i);
        const y = yOf(v);
        const dropped = keep !== undefined && i % keep !== 0;
        const c = dropped ? "var(--ink-soft)" : color;
        return (
          <g key={i} opacity={dropped ? 0.4 : 1}>
            <line x1={x} y1={baseline} x2={x} y2={y} stroke={c} />
            <circle cx={x} cy={y} r={dotR} fill={c} />
          </g>
        );
      })}

      <text x={pad.left} y={height - 6} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="start">
        0
      </text>
      <text x={pad.left + plotW / 2} y={height - 6} fill={axis} fontSize="10" fontFamily="var(--font-body)" textAnchor="middle">
        {pick({ pt: "n (amostra)", en: "n (sample)" }, language)}
      </text>
      <text x={xOf(n - 1)} y={height - 6} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
        {n - 1}
      </text>
    </svg>
  );
}
