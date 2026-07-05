import type { Spectrum } from "../dsp";

type SpectrumPlotProps = {
  spectrum: Spectrum;
  height?: number;
  label?: string;
};

export default function SpectrumPlot({
  spectrum,
  height = 220,
  label = "Magnitude spectrum",
}: SpectrumPlotProps) {
  const { frequencies, magnitudes } = spectrum;

  const width = 600;
  const pad = { left: 44, right: 16, top: 16, bottom: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxFreq = frequencies[frequencies.length - 1] || 1;
  const maxMag = Math.max(...magnitudes, 1e-9);

  const xOf = (freq: number) => pad.left + (freq / maxFreq) * plotW;
  const yOf = (mag: number) => pad.top + plotH - (mag / maxMag) * plotH;

  const barW = Math.max(1, (plotW / magnitudes.length) * 0.8);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={label}
      style={{ display: "block" }}
    >
      <line
        x1={pad.left}
        y1={pad.top + plotH}
        x2={pad.left + plotW}
        y2={pad.top + plotH}
        stroke="var(--line)"
      />
      <line
        x1={pad.left}
        y1={pad.top}
        x2={pad.left}
        y2={pad.top + plotH}
        stroke="var(--line)"
      />

      {magnitudes.map((mag, i) => {
        const x = xOf(frequencies[i]);
        const y = yOf(mag);
        return (
          <rect
            key={i}
            x={x - barW / 2}
            y={y}
            width={barW}
            height={pad.top + plotH - y}
            fill="var(--signal)"
          />
        );
      })}

      <text
        x={pad.left}
        y={height - 10}
        fill="var(--ink-soft)"
        fontSize="12"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        0
      </text>
      <text
        x={pad.left + plotW}
        y={height - 10}
        fill="var(--ink-soft)"
        fontSize="12"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        {maxFreq.toFixed(0)} Hz
      </text>
      <text
        x={pad.left + plotW / 2}
        y={height - 10}
        fill="var(--ink-soft)"
        fontSize="12"
        fontFamily="var(--font-body)"
        textAnchor="middle"
      >
        frequency
      </text>
    </svg>
  );
}
