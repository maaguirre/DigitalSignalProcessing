import { useState } from "react";
import { type Language, pick } from "../i18n.ts";

// Bit N of a free-running N-bit counter clocked at 100 MHz is a square wave at
// f = 100 MHz / 2^N. The slider picks N; the readout shows the resulting rate.

const F_CLK = 100_000_000; // 100 MHz PL oscillator (pin Y9)

function human(freq: number): string {
  if (freq >= 1_000_000) return `${(freq / 1_000_000).toFixed(2)} MHz`;
  if (freq >= 1_000) return `${(freq / 1_000).toFixed(2)} kHz`;
  return `${freq.toFixed(2)} Hz`;
}

function period(freq: number): string {
  const t = 1 / freq;
  if (t >= 1) return `${t.toFixed(2)} s`;
  if (t >= 1e-3) return `${(t * 1e3).toFixed(2)} ms`;
  if (t >= 1e-6) return `${(t * 1e6).toFixed(2)} µs`;
  return `${(t * 1e9).toFixed(0)} ns`;
}

export default function ClockDividerCalc({ language }: { language: Language }) {
  const [bits, setBits] = useState(26);
  const freq = F_CLK / 2 ** bits;
  const visible = freq <= 20; // roughly the rate the eye can follow

  const t = {
    bits: { pt: "Bit do contador (N)", en: "Counter bit (N)" },
    blink: { pt: "Frequência de pisca", en: "Blink frequency" },
    per: { pt: "Período", en: "Period" },
    verdict: {
      pt: visible ? "Visível a olho nu 👁" : "Rápido demais para o olho",
      en: visible ? "Visible to the eye 👁" : "Too fast for the eye",
    },
  };

  return (
    <div className="clockcalc">
      <p className="clockcalc-eq">
        f = 100&nbsp;MHz / 2<sup>{bits}</sup> = <strong>{human(freq)}</strong>
      </p>

      <div className="control">
        <label>
          {pick(t.bits, language)}: <span className="control-value">{bits}</span>
        </label>
        <input
          type="range"
          min={1}
          max={28}
          value={bits}
          onChange={(e) => setBits(Number(e.target.value))}
        />
      </div>

      <div className="clockcalc-grid">
        <div className="readout">
          <span className="plot-label">{pick(t.blink, language)}</span>
          <span className="clockcalc-big">{human(freq)}</span>
        </div>
        <div className="readout">
          <span className="plot-label">{pick(t.per, language)}</span>
          <span className="clockcalc-big">{period(freq)}</span>
        </div>
      </div>

      <div className={visible ? "badge badge--ok" : "badge badge--alias"}>
        {pick(t.verdict, language)}
      </div>
      <p className="plot-note">
        {language === "pt"
          ? "O bit N de um contador de 100 MHz é uma onda quadrada em f = 100 MHz / 2ᴺ. Use esse bit para piscar um LED. No Lab 2, N ≈ 26 dá cerca de 1,5 Hz."
          : "Bit N of a 100 MHz counter is a square wave at f = 100 MHz / 2ᴺ. Use that bit to blink an LED. In Lab 2, N ≈ 26 gives about 1.5 Hz."}
      </p>
    </div>
  );
}
