type StemPlotProps = {
  samples: number[];
  height?: number;
  label?: string;
  color?: string;
  yMax?: number; // fix the amplitude scale so several plots stay comparable
  keep?: number; // dim samples whose index is not a multiple of `keep`
};

// Discrete-time stem plot with numbered axes: a stem + dot per sample over a
// baseline. x axis is the sample index n; y axis is amplitude.
export default function StemPlot({
  samples,
  height = 170,
  label = "Discrete-time signal",
  color = "var(--signal)",
  yMax,
  keep,
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

  const xOf = (i: number) =>
    pad.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
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
        n (amostra)
      </text>
      <text x={pad.left + plotW} y={height - 6} fill={axis} fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
        {n - 1}
      </text>
    </svg>
  );
}
