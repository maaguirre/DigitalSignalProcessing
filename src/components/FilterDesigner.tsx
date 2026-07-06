import { useState } from "react";
import { designLowpassFIR, frequencyResponse, type Window } from "../dsp";
import StemPlot from "./StemPlot.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  factor: { pt: "Fator I (corte = π/I)", en: "Factor I (cutoff = π/I)" },
  length: { pt: "Comprimento M", en: "Length M" },
  window: { pt: "Janela", en: "Window" },
  hLabel: { pt: "h(n) — resposta ao impulso (coeficientes)", en: "h(n) — impulse response (coefficients)" },
  respLabel: { pt: "|H(ω)| em dB — resposta em frequência", en: "|H(ω)| in dB — frequency response" },
  cutoff: { pt: "corte π/I", en: "cutoff π/I" },
  atten: { pt: "atenuação na rejeição", en: "stopband attenuation" },
  note: {
    pt: "O filtro ideal (corte perfeito, tracejado) não existe na prática — um FIR real o aproxima. Truncar/janelar o sinc cria ondulação (ripple) na banda de passagem e uma banda de transição, e deixa lóbulos na rejeição. Aumente M para transição mais estreita; troque a janela para menos ripple (Retangular tem muito; Hamming/Blackman bem menos, ao custo de transição mais larga). O ganho de passagem é I.",
    en: "The ideal filter (perfect cutoff, dashed) doesn't exist in practice — a real FIR approximates it. Truncating/windowing the sinc creates ripple in the passband and a transition band, and leaves lobes in the stopband. Raise M for a narrower transition; change the window for less ripple (Rectangular has a lot; Hamming/Blackman much less, at the cost of a wider transition). The passband gain is I.",
  },
} satisfies Record<string, Localized>;

const windows: Window[] = ["rect", "hann", "hamming", "blackman"];
const windowName = { rect: "Retangular", hann: "Hann", hamming: "Hamming", blackman: "Blackman" };

export default function FilterDesigner({ language }: { language: Language }) {
  const [I, setI] = useState(4);
  const [M, setM] = useState(31);
  const [win, setWin] = useState<Window>("hamming");

  const cutoff = Math.PI / I;
  const gain = I;
  const h = designLowpassFIR(cutoff, M, win, gain);
  const resp = frequencyResponse(h, 320);
  const dB = resp.mag.map((mg) => 20 * Math.log10(Math.max(mg / gain, 1e-9)));

  // stopband peak: max dB beyond a small transition past the cutoff
  const wStop = Math.min(Math.PI, cutoff + 0.12 * Math.PI);
  let stopPeak = -200;
  resp.omega.forEach((w, i) => {
    if (w >= wStop) stopPeak = Math.max(stopPeak, dB[i]);
  });
  const As = Math.round(-stopPeak);

  const W = 600;
  const Hp = 230;
  const pad = { left: 42, right: 14, top: 14, bottom: 28 };
  const pw = W - pad.left - pad.right;
  const ph = Hp - pad.top - pad.bottom;
  const dbTop = 4;
  const dbBot = -80;
  const xOf = (w: number) => pad.left + (w / Math.PI) * pw;
  const yOf = (db: number) => pad.top + ((dbTop - Math.max(Math.min(db, dbTop), dbBot)) / (dbTop - dbBot)) * ph;
  const axis = "var(--ink-soft)";

  const curve = dB.map((db, i) => `${i === 0 ? "M" : "L"} ${xOf(resp.omega[i]).toFixed(1)} ${yOf(db).toFixed(1)}`).join(" ");
  const dbTicks = [0, -20, -40, -60, -80];
  const wTicks = [0, Math.PI / 2, Math.PI];
  const wLabel = (w: number) => (Math.abs(w) < 1e-6 ? "0" : Math.abs(w - Math.PI) < 1e-6 ? "π" : "π/2");

  return (
    <div className="instrument">
      <div className="instrument-controls">
        <label className="control">
          <span>{pick(t.factor, language)}: <span className="control-value">{I}</span></span>
          <input type="range" min={2} max={6} step={1} value={I} onChange={(e) => setI(Number(e.target.value))} />
        </label>
        <label className="control">
          <span>{pick(t.length, language)}: <span className="control-value">{M}</span></span>
          <input type="range" min={9} max={61} step={2} value={M} onChange={(e) => setM(Number(e.target.value))} />
        </label>
        <div className="control" style={{ flex: "1 1 100%" }}>
          <span>{pick(t.window, language)}:</span>
          <div className="toggle" role="group">
            {windows.map((w) => (
              <button key={w} className={win === w ? "toggle-btn active" : "toggle-btn"} onClick={() => setWin(w)}>
                {windowName[w]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="plot-label">{pick(t.respLabel, language)}</p>
      <svg viewBox={`0 0 ${W} ${Hp}`} width="100%" style={{ display: "block" }}>
        {/* dB grid */}
        {dbTicks.map((db, i) => (
          <g key={i}>
            <line x1={pad.left} y1={yOf(db)} x2={pad.left + pw} y2={yOf(db)} stroke="var(--line)" strokeOpacity={db === 0 ? 0.9 : 0.4} />
            <text x={pad.left - 5} y={yOf(db) + 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">{db}</text>
          </g>
        ))}
        {/* ideal brick-wall (dashed) */}
        <path d={`M ${xOf(0)} ${yOf(0)} L ${xOf(cutoff)} ${yOf(0)} L ${xOf(cutoff)} ${yOf(dbBot)}`} fill="none" stroke="var(--ink-soft)" strokeOpacity="0.5" strokeDasharray="4 3" />
        {/* cutoff marker */}
        <line x1={xOf(cutoff)} y1={pad.top} x2={xOf(cutoff)} y2={pad.top + ph} stroke="var(--brand-trace)" strokeOpacity="0.5" strokeDasharray="3 2" />
        <text x={xOf(cutoff)} y={pad.top + 9} fill="var(--brand-trace)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">{pick(t.cutoff, language)}</text>
        {/* response */}
        <path d={curve} fill="none" stroke="var(--signal)" strokeWidth="1.6" />
        {/* axes labels */}
        {wTicks.map((w, i) => (
          <text key={i} x={xOf(w)} y={Hp - 3} fill={axis} fontSize="9" fontFamily="var(--font-mono)" textAnchor={i === wTicks.length - 1 ? "end" : "middle"}>{wLabel(w)}</text>
        ))}
      </svg>

      <p className="readout">
        <span className="control-value" style={{ fontFamily: "var(--font-mono)" }}>
          {pick(t.atten, language)} ≈ {As} dB
        </span>
      </p>

      <p className="plot-label">{pick(t.hLabel, language)}</p>
      <StemPlot language={language} samples={h} height={130} label={pick(t.hLabel, language)} />

      <p className="plot-note">{pick(t.note, language)}</p>
    </div>
  );
}
