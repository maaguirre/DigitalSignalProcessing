import { useState } from "react";
import { type Language, pick } from "../i18n.ts";

// 8 clickable switches and 8 LEDs: each LED mirrors its switch (led = sw).
// Columns run SW7…SW0 (7 on the left) to match the board diagram.

export default function SwitchLedSim({ language }: { language: Language }) {
  const [on, setOn] = useState<boolean[]>(() => Array(8).fill(false));

  const toggle = (i: number) =>
    setOn((prev) => prev.map((v, j) => (j === i ? !v : v)));

  const t = {
    hint: {
      pt: "Clique nas chaves: cada LED acende junto com a sua chave (led = sw).",
      en: "Click the switches: each LED lights with its switch (led = sw).",
    },
    leds: { pt: "LEDs (LD7…LD0)", en: "LEDs (LD7…LD0)" },
    sws: { pt: "Chaves (SW7…SW0)", en: "Switches (SW7…SW0)" },
    word: { pt: "Valor nos LEDs", en: "Value on the LEDs" },
  };

  // Columns left→right are index 7 … 0 (to match the board).
  const cols = [7, 6, 5, 4, 3, 2, 1, 0];
  const bits = cols.map((i) => (on[i] ? "1" : "0")).join("");
  const value = parseInt(bits, 2);

  return (
    <div className="slsim">
      <div className="slsim-row-label">{pick(t.leds, language)}</div>
      <div className="slsim-row">
        {cols.map((i) => (
          <div key={i} className="slsim-cell">
            <div className={on[i] ? "slsim-led slsim-led--on" : "slsim-led"} />
            <span className="slsim-idx">{i}</span>
          </div>
        ))}
      </div>

      <div className="slsim-row-label">{pick(t.sws, language)}</div>
      <div className="slsim-row">
        {cols.map((i) => (
          <div key={i} className="slsim-cell">
            <button
              type="button"
              className={on[i] ? "slsim-sw slsim-sw--on" : "slsim-sw"}
              onClick={() => toggle(i)}
              aria-pressed={on[i]}
              aria-label={`SW${i}`}
            >
              <span className="slsim-knob" />
            </button>
            <span className="slsim-idx">{i}</span>
          </div>
        ))}
      </div>

      <div className="slsim-readout">
        <code>led = sw = 8'b{bits}</code>
        <span className="slsim-value">
          {pick(t.word, language)}: {value} (0x{value.toString(16).toUpperCase().padStart(2, "0")})
        </span>
      </div>
      <p className="plot-note">{pick(t.hint, language)}</p>
    </div>
  );
}
