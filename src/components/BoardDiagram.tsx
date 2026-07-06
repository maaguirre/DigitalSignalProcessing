import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

// ── ZedBoard pin map (stylized board view) ──────────────────────────────────
// A board-like diagram laid out like the real ZedBoard: power/USB/audio/video on
// the TOP edge, the Zynq in the centre, and LEDs (LD7→LD0), switches (SW7→SW0),
// the OLED and the button cross along the bottom. Click a part to reveal its
// signal, Zynq pin (when it's an FPGA I/O), I/O bank and voltage. Pins/banks/
// IOSTANDARDs come from the official Avnet ZedBoard master XDC.

type Part = {
  id: string;
  signal: string;
  pin: string;
  bank: string; // "" when the part isn't a constrained FPGA I/O
  io: Localized;
  kind: Localized;
  detail: Localized;
};

// LEDs are drawn left→right as LD7 … LD0 (index = 7 - column).
const LED_PINS = ["T22", "T21", "U22", "U21", "V22", "W22", "U19", "U14"]; // LD0..LD7
const SW_PINS = ["F22", "G22", "H22", "F21", "H19", "H18", "H17", "M15"]; // SW0..SW7

function led(idx: number): Part {
  return {
    id: `LD${idx}`,
    signal: `LD${idx}`,
    pin: LED_PINS[idx],
    bank: "33",
    io: { pt: "LVCMOS33 · 3,3 V", en: "LVCMOS33 · 3.3 V" },
    kind: { pt: "LED de usuário", en: "User LED" },
    detail: {
      pt: "Saída. Nível alto acende (LED em série com 390 Ω). Bank 33 é fixo em 3,3 V.",
      en: "Output. A logic high turns it on (LED in series with 390 Ω). Bank 33 is fixed at 3.3 V.",
    },
  };
}
function sw(idx: number): Part {
  return {
    id: `SW${idx}`,
    signal: `SW${idx}`,
    pin: SW_PINS[idx],
    bank: "35",
    io: { pt: "LVCMOS18 · 1,8 V (VADJ)", en: "LVCMOS18 · 1.8 V (VADJ)" },
    kind: { pt: "Chave deslizante", en: "Slide switch" },
    detail: {
      pt: "Entrada. Bank 35 é alimentado pelo VADJ (jumper J18), 1,8 V por padrão.",
      en: "Input. Bank 35 is powered by VADJ (jumper J18), 1.8 V by default.",
    },
  };
}

const BUTTONS: (Part & { cx: number; cy: number; letter: string })[] = [
  ["BTNU", "T18", 650, 438, "U", "cima", "up"],
  ["BTNL", "N15", 618, 470, "L", "esq.", "left"],
  ["BTNC", "P16", 650, 470, "C", "centro", "center"],
  ["BTNR", "R18", 682, 470, "R", "dir.", "right"],
  ["BTND", "R16", 650, 502, "D", "baixo", "down"],
].map(([sig, pin, cx, cy, letter, dpt, den]) => ({
  id: sig as string,
  signal: sig as string,
  pin: pin as string,
  bank: "34",
  io: { pt: "LVCMOS18 · 1,8 V (VADJ)", en: "LVCMOS18 · 1.8 V (VADJ)" },
  kind: { pt: `Botão (${dpt})`, en: `Button (${den})` },
  detail: {
    pt: "Entrada momentânea com pull-down: solto = 0, pressionado = 1. Bank 34 (VADJ).",
    en: "Momentary input with pull-down: released = 0, pressed = 1. Bank 34 (VADJ).",
  },
  cx: cx as number,
  cy: cy as number,
  letter: letter as string,
}));

const CLOCK: Part = {
  id: "CLK",
  signal: "GCLK",
  pin: "Y9",
  bank: "13",
  io: { pt: "LVCMOS33 · 3,3 V", en: "LVCMOS33 · 3.3 V" },
  kind: { pt: "Clock da PL · 100 MHz", en: "PL clock · 100 MHz" },
  detail: {
    pt: "Oscilador de 100 MHz que alimenta a lógica programável. É a base de tempo do Lab 2.",
    en: "100 MHz oscillator feeding the programmable logic. It's the time base for Lab 2.",
  },
};

const OLED: Part = {
  id: "OLED",
  signal: "OLED (disp1)",
  pin: "Bank 13",
  bank: "",
  io: { pt: "display 128×32", en: "128×32 display" },
  kind: { pt: "Display OLED", en: "OLED display" },
  detail: {
    pt: "Display monocromático 128×32, controlado por SPI. Fica logo acima do LED7.",
    en: "Monochrome 128×32 display, driven over SPI. Sits just above LED7.",
  },
};

// Top-edge connectors (not constrained FPGA I/O — bank is "").
const POWER: Part = {
  id: "PWR",
  signal: "DC IN 12 V",
  pin: "12 V",
  bank: "",
  io: { pt: "12 V / 5 A", en: "12 V / 5 A" },
  kind: { pt: "Entrada de energia", en: "Power input" },
  detail: {
    pt: "Conecte aqui a fonte de 12 V / 5 A que acompanha a placa para ligá-la.",
    en: "Plug the 12 V / 5 A supply that comes with the board here to power it.",
  },
};
const ONOFF: Part = {
  id: "ONOFF",
  signal: "ON/OFF",
  pin: "SW8",
  bank: "",
  io: { pt: "chave de força", en: "power switch" },
  kind: { pt: "Liga/desliga", en: "Power switch" },
  detail: {
    pt: "Fica logo abaixo do plugue de energia. Liga e desliga a placa depois de conectar a fonte.",
    en: "Sits just below the power jack. Turns the board on and off after the supply is connected.",
  },
};
const PROG: Part = {
  id: "PROG",
  signal: "PROG · USB-JTAG",
  pin: "USB",
  bank: "",
  io: { pt: "micro-USB", en: "micro-USB" },
  kind: { pt: "USB de programação", en: "Programming USB" },
  detail: {
    pt: "Cabo micro-USB por onde o Vivado grava o bitstream (Hardware Manager). Você vai usar bastante.",
    en: "The micro-USB cable Vivado uses to program the bitstream (Hardware Manager). You'll use it a lot.",
  },
};
const UART: Part = {
  id: "UART",
  signal: "USB-UART",
  pin: "USB",
  bank: "",
  io: { pt: "micro-USB", en: "micro-USB" },
  kind: { pt: "Console serial", en: "Serial console" },
  detail: {
    pt: "Fica na lateral esquerda, abaixo do power e do liga/desliga. Cabo micro-USB do terminal serial (picocom/terminator).",
    en: "On the left edge, below the power jack and on/off switch. The micro-USB cable for the serial terminal (picocom/terminator).",
  },
};

const audio = (id: string, signal: string, kpt: string, ken: string): Part => ({
  id,
  signal,
  pin: "ADAU1761",
  bank: "13",
  io: { pt: "codec I²S", en: "codec I²S" },
  kind: { pt: kpt, en: ken },
  detail: {
    pt: "Codec de áudio ADAU1761. Chega ao Zynq via I²S no Bank 13 (SDATA_I=AA7, BCLK=AA6, LRCLK=Y6, MCLK=AB2).",
    en: "ADAU1761 audio codec. Reaches the Zynq over I²S on Bank 13 (SDATA_I=AA7, BCLK=AA6, LRCLK=Y6, MCLK=AB2).",
  },
});
const AUDIO: (Part & { cx: number; color: string })[] = [
  { ...audio("LINEIN", "LINE IN", "Entrada de linha", "Line input"), cx: 185, color: "#7fbfff" },
  { ...audio("MIC", "MIC", "Entrada de microfone", "Microphone input"), cx: 247, color: "#e06ea0" },
  { ...audio("LINEOUT", "LINE OUT", "Saída de linha", "Line output"), cx: 309, color: "#a6e05a" },
  { ...audio("HPH", "HPH OUT", "Saída de fone", "Headphone output"), cx: 371, color: "#20242a" },
];

const simpleConn = (id: string, signal: string, kpt: string, ken: string, dpt: string, den: string): Part => ({
  id,
  signal,
  pin: "—",
  bank: "",
  io: { pt: "conector", en: "connector" },
  kind: { pt: kpt, en: ken },
  detail: { pt: dpt, en: den },
});
const ETH = simpleConn("ETH", "Ethernet", "Rede 10/100/1G", "10/100/1G network",
  "Conector RJ-45 (cabo de rede).", "RJ-45 connector (network cable).");
const HDMI = simpleConn("HDMI", "HDMI Out", "Saída de vídeo", "Video output",
  "Saída de vídeo digital HDMI.", "HDMI digital video output.");
const VGA = simpleConn("VGA", "VGA", "Saída de vídeo (12-bit)", "Video output (12-bit)",
  "Saída de vídeo analógica VGA.", "Analog VGA video output.");

const ZYNQ: Part = {
  id: "ZYNQ",
  signal: "XC7Z020-CLG484",
  pin: "—",
  bank: "PS + PL",
  io: { pt: "SoC", en: "SoC" },
  kind: { pt: "Zynq-7000 (o chip)", en: "Zynq-7000 (the chip)" },
  detail: {
    pt: "Dois núcleos ARM Cortex-A9 (PS) + FPGA com ~85 mil células (PL). Nos labs trabalhamos na PL.",
    en: "Two ARM Cortex-A9 cores (PS) + an FPGA with ~85,000 cells (PL). In the labs we work on the PL.",
  },
};

const PCB = "#0d5a30";
const PCB_EDGE = "#0a3f22";
const CONN = "#14181c";

export default function BoardDiagram({ language }: { language: Language }) {
  const [sel, setSel] = useState<Part>(CLOCK);
  const isSel = (id: string) => sel.id === id;

  const hint = {
    pt: "Clique em um elemento da placa para ver seus detalhes.",
    en: "Click a board element to see its details.",
  };
  const bankLabel = { pt: "Banco", en: "Bank" };

  // A labelled connector block (clickable).
  const conn = (x: number, y: number, w: number, h: number, label: string, part: Part) => (
    <g className="board-part" key={part.id} onClick={() => setSel(part)}>
      <rect x={x} y={y} width={w} height={h} rx={3}
        fill={isSel(part.id) ? "#26506a" : CONN}
        stroke={isSel(part.id) ? "#fff" : "#2a3138"} strokeWidth={isSel(part.id) ? 2 : 1} />
      <text x={x + w / 2} y={y + h / 2 + 4} className="board-silk">{label}</text>
    </g>
  );

  // A USB port: metal shell + dark cavity + tongue, with a label below.
  const usbPort = (x: number, y: number, label: string, part: Part) => {
    const w = 46, h = 24;
    return (
      <g className="board-part" key={part.id} onClick={() => setSel(part)}>
        <rect x={x} y={y} width={w} height={h} rx={2}
          fill={isSel(part.id) ? "#26506a" : "#3a444d"}
          stroke={isSel(part.id) ? "#fff" : "#2a3138"} strokeWidth={isSel(part.id) ? 2 : 1} />
        <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill="#0a121b" />
        <rect x={x + 8} y={y + h - 11} width={w - 16} height={5} fill="#8b96a0" />
        <text x={x + w / 2} y={y + h + 14} className="board-silk">{label}</text>
      </g>
    );
  };

  return (
    <div className="board-diagram">
      <svg viewBox="0 0 820 560" className="board-svg" role="img">
        <rect x="10" y="10" width="800" height="540" rx="18" fill={PCB} stroke={PCB_EDGE} strokeWidth="3" />
        {[[26, 26], [794, 26], [26, 534], [794, 534]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={7} fill="none" stroke={PCB_EDGE} strokeWidth="3" />
        ))}
        <text x="30" y="540" className="board-brand">ZedBoard</text>

        {/* Top-left: barrel power jack */}
        <g className="board-part" onClick={() => setSel(POWER)}>
          <rect x="32" y="50" width="20" height="26" rx="3"
            fill={isSel("PWR") ? "#26506a" : "#3a444d"} stroke={isSel("PWR") ? "#fff" : "#2a3138"} strokeWidth="1" />
          <circle cx="42" cy="46" r="11" fill="#0a121b" stroke={isSel("PWR") ? "#fff" : "#8b96a0"} strokeWidth="2.5" />
          <circle cx="42" cy="46" r="3.5" fill="#8b96a0" />
          <text x="42" y="90" className="board-silk">PWR 12V</text>
        </g>

        {/* Slide on/off switch*/}
        <g className="board-part" onClick={() => setSel(ONOFF)}>
          <rect x="24" y="100" width="44" height="16" rx="8"
            fill="#0a3f22" stroke={isSel("ONOFF") ? "#fff" : "#8b96a0"} strokeWidth={isSel("ONOFF") ? 2 : 1} />
          <rect x="27" y="103" width="16" height="10" rx="3" fill={isSel("ONOFF") ? "var(--signal)" : "#aeb7bf"} />
          <text x="46" y="132" className="board-silk">ON/OFF</text>
        </g>

        {/* PROG USB port */}
        {usbPort(100, 40, "PROG", PROG)}

        {/* Audio jacks*/}
        {AUDIO.map((a) => (
          <g className="board-part" key={a.id} onClick={() => setSel(a)}>
            <circle cx={a.cx} cy={50} r={12} fill={a.color}
              stroke={isSel(a.id) ? "#fff" : PCB_EDGE} strokeWidth={isSel(a.id) ? 3 : 2} />
            <text x={a.cx} y={78} className="board-silk">{a.signal}</text>
          </g>
        ))}

        {conn(410, 40, 64, 26, "ETH", ETH)}
        {conn(524, 40, 64, 26, "HDMI", HDMI)}
        {conn(638, 40, 64, 26, "VGA", VGA)}

        {/* Left edge: USB-UART*/}
        {usbPort(22, 150, "UART", UART)}

        {/* Zynq chip*/}
        <g className="board-part" onClick={() => setSel(ZYNQ)}>
          <rect x="330" y="200" width="150" height="150" rx="6"
            fill={CONN} stroke={isSel("ZYNQ") ? "#fff" : "#2a3138"} strokeWidth={isSel("ZYNQ") ? 3 : 2} />
          <rect x="352" y="222" width="106" height="106" rx="4" fill="#1b2228" stroke="#2a3138" />
          <text x="405" y="268" className="board-chip">XILINX</text>
          <text x="405" y="285" className="board-chip">ZYNQ</text>
          <text x="405" y="302" className="board-chip-sub">XC7Z020</text>
        </g>

        {/* 100 MHz oscillator */}
        <g className="board-part" onClick={() => setSel(CLOCK)}>
          <rect x="505" y="252" width="58" height="32" rx="4"
            fill={isSel("CLK") ? "var(--signal)" : "#0a3f22"} stroke="var(--signal)" strokeWidth="2" />
          <text x="534" y="273" className="board-part-cap">100M</text>
        </g>

        {/* OLED */}
        <g className="board-part" onClick={() => setSel(OLED)}>
          <rect x="240" y="372" width="146" height="38" rx="3"
            fill={isSel("OLED") ? "#26506a" : CONN} stroke={isSel("OLED") ? "#fff" : "#2a3138"} strokeWidth="1" />
          <text x="313" y="395" className="board-silk">OLED disp1</text>
        </g>

        {/* LEDs*/}
        <text x="150" y="456" className="board-group-label">LD[7:0]</text>
        {Array.from({ length: 8 }).map((_, col) => {
          const idx = 7 - col;
          const p = led(idx);
          const cx = 250 + col * 34;
          return (
            <g className="board-part" key={p.id} onClick={() => setSel(p)}>
              <circle cx={cx} cy={452} r={10}
                fill={isSel(p.id) ? "var(--ok)" : "#0a3f22"} stroke="var(--ok)" strokeWidth="2" />
              <text x={cx} y={438} className="board-tick">{idx}</text>
            </g>
          );
        })}

        {/* Switches*/}
        <text x="150" y="512" className="board-group-label">SW[7:0]</text>
        {Array.from({ length: 8 }).map((_, col) => {
          const idx = 7 - col;
          const p = sw(idx);
          const x = 240 + col * 34;
          return (
            <g className="board-part" key={p.id} onClick={() => setSel(p)}>
              <rect x={x} y={490} width={20} height={30} rx={3}
                fill={isSel(p.id) ? "var(--brand-trace)" : "#0a3f22"} stroke="var(--brand-trace)" strokeWidth="2" />
              <text x={x + 10} y={538} className="board-tick">{idx}</text>
            </g>
          );
        })}

        {/* Button cross with names */}
        {BUTTONS.map((p) => (
          <g className="board-part" key={p.id} onClick={() => setSel(p)}>
            <circle cx={p.cx} cy={p.cy} r={15}
              fill={isSel(p.id) ? "var(--alias)" : "#0a3f22"} stroke="var(--alias)" strokeWidth="2" />
            <text x={p.cx} y={p.cy + 4} className="board-btn-letter">{p.letter}</text>
          </g>
        ))}
        <text x="650" y="420" className="board-group-label" textAnchor="middle">BTNU</text>
        <text x="650" y="530" className="board-group-label" textAnchor="middle">BTND</text>
        <text x="596" y="474" className="board-group-label" textAnchor="end">BTNL</text>
        <text x="704" y="474" className="board-group-label" textAnchor="start">BTNR</text>
      </svg>

      <div className="board-readout">
        <div className="board-readout-main">
          <span className="board-readout-sig">{sel.signal}</span>
          <span className="board-readout-pin">{sel.pin}</span>
          <span className="board-readout-bank">
            {sel.bank ? `${pick(bankLabel, language)} ${sel.bank} · ` : ""}
            {pick(sel.io, language)}
          </span>
        </div>
        <div className="board-readout-kind">{pick(sel.kind, language)}</div>
        <div className="board-readout-detail">{pick(sel.detail, language)}</div>
        <div className="board-readout-hint">{pick(hint, language)}</div>
      </div>
    </div>
  );
}
