import { useState } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";

// ── Firmware development flow (interactive) ──────────────────────────────────
// The stages a design goes through, and where each lives in Vivado. Click a
// stage to see what it does, why it matters, and the Vivado feature behind it.

type Stage = {
  id: string;
  short: Localized;
  vivado: string;
  what: Localized;
  why: Localized;
  // Optional: the simulation Vivado lets you run right after this stage.
  sim?: { name: string; text: Localized };
};

const STAGES: Stage[] = [
  {
    id: "rtl",
    short: { pt: "1 · Descrição RTL", en: "1 · RTL design" },
    vivado: "Add Sources → Design Sources",
    what: {
      pt: "Você descreve o circuito em Verilog/VHDL (RTL = Register-Transfer Level): o que cada registrador guarda e como os sinais fluem entre eles.",
      en: "You describe the circuit in Verilog/VHDL (RTL = Register-Transfer Level): what each register holds and how signals flow between them.",
    },
    why: {
      pt: "É a fonte de tudo. Um erro aqui se propaga por todas as etapas seguintes — por isso vale simular antes de sintetizar.",
      en: "It's the source of everything. A mistake here propagates through every later stage — which is why you simulate before synthesizing.",
    },
  },
  {
    id: "sim",
    short: { pt: "2 · Simulação", en: "2 · Simulation" },
    vivado: "Run Simulation → Behavioral",
    what: {
      pt: "Um testbench aplica entradas ao seu circuito e o simulador mostra as saídas numa forma de onda, sem precisar da placa. Você confere a LÓGICA antes de gastar tempo com síntese.",
      en: "A testbench applies inputs to your circuit and the simulator shows the outputs as a waveform, without needing the board. You check the LOGIC before spending time on synthesis.",
    },
    why: {
      pt: "É o passo mais barato para achar bugs. Ler a forma de onda é como usar um osciloscópio no circuito ideal: você vê cada sinal a cada ciclo de clock.",
      en: "It's the cheapest step to catch bugs. Reading the waveform is like putting a scope on the ideal circuit: you see every signal at every clock cycle.",
    },
    sim: {
      name: "Behavioral Simulation",
      text: {
        pt: "Simula o RTL puro, sem atrasos de hardware. Só valida a LÓGICA — é rápida e serve para achar erros de raciocínio antes de qualquer síntese.",
        en: "Simulates pure RTL, with no hardware delays. It only validates the LOGIC — it's fast and meant to catch reasoning mistakes before any synthesis.",
      },
    },
  },
  {
    id: "synth",
    short: { pt: "3 · Síntese", en: "3 · Synthesis" },
    vivado: "Run Synthesis",
    what: {
      pt: "O Vivado traduz o seu RTL em portas lógicas e registradores reais (a netlist) disponíveis no FPGA.",
      en: "Vivado translates your RTL into real logic gates and registers (the netlist) available on the FPGA.",
    },
    why: {
      pt: "É onde aparecem avisos de código que 'não vira hardware' (latches acidentais, sinais sem uso). Ler as mensagens da síntese evita surpresas.",
      en: "It's where warnings about code that 'doesn't map to hardware' show up (accidental latches, unused signals). Reading synthesis messages avoids surprises.",
    },
    sim: {
      name: "Post-Synthesis Functional Simulation",
      text: {
        pt: "Simula agora a netlist gerada, não mais o RTL. Serve para confirmar que a síntese não mudou o comportamento do circuito — se a behavioral passou mas esta falha, algo no seu código foi interpretado de forma diferente pelo sintetizador.",
        en: "Now simulates the generated netlist, not the RTL. It confirms synthesis didn't change the circuit's behavior — if the behavioral passed but this fails, something in your code was interpreted differently by the synthesizer.",
      },
    },
  },
  {
    id: "impl",
    short: { pt: "4 · Implementação", en: "4 · Implementation" },
    vivado: "Run Implementation",
    what: {
      pt: "Place & route: o Vivado escolhe ONDE, no chip, colocar cada porta e como ligar os fios — respeitando os pinos do seu XDC.",
      en: "Place & route: Vivado chooses WHERE on the chip to put each gate and how to wire it — honoring the pins in your XDC.",
    },
    why: {
      pt: "É aqui que o tempo é verificado: os sinais conseguem chegar a tempo dentro de um ciclo de clock? Erros de pino e de timing aparecem nesta etapa.",
      en: "This is where timing is checked: can signals arrive in time within one clock cycle? Pin and timing errors surface at this stage.",
    },
    sim: {
      name: "Post-Implementation Timing Simulation",
      text: {
        pt: "A simulação mais fiel: usa os atrasos reais dos fios e das portas depois do place & route. É a que mais se aproxima do que vai acontecer no chip — mais lenta, mas essencial para flagrar problemas de tempo que a behavioral não mostra.",
        en: "The most faithful simulation: it uses the real wire and gate delays after place & route. It's the closest to what will happen on the chip — slower, but essential to catch timing problems the behavioral can't show.",
      },
    },
  },
  {
    id: "bit",
    short: { pt: "5 · Bitstream", en: "5 · Bitstream" },
    vivado: "Generate Bitstream",
    what: {
      pt: "O resultado da implementação é empacotado num arquivo .bit — a configuração binária que 'programa' a lógica do FPGA.",
      en: "The implementation result is packed into a .bit file — the binary configuration that 'programs' the FPGA's logic.",
    },
    why: {
      pt: "É o entregável físico do fluxo. Sem bitstream não há o que carregar na placa.",
      en: "It's the flow's physical deliverable. Without a bitstream there's nothing to load onto the board.",
    },
  },
  {
    id: "prog",
    short: { pt: "6 · Programar", en: "6 · Program" },
    vivado: "Open Hardware Manager → Program",
    what: {
      pt: "Pelo cabo USB-JTAG, o Hardware Manager envia o .bit para a placa. Em segundos o FPGA 'vira' o seu circuito.",
      en: "Over the USB-JTAG cable, the Hardware Manager sends the .bit to the board. In seconds the FPGA 'becomes' your circuit.",
    },
    why: {
      pt: "É o momento da verdade: o circuito que você descreveu agora existe no hardware e responde ao mundo real.",
      en: "It's the moment of truth: the circuit you described now exists in hardware and responds to the real world.",
    },
  },
];

export default function DevFlow({ language }: { language: Language }) {
  const [sel, setSel] = useState<Stage>(STAGES[0]);
  const vivadoLabel = { pt: "No Vivado", en: "In Vivado" };
  const whyLabel = { pt: "Por que importa", en: "Why it matters" };
  const simLabel = { pt: "Simulação", en: "Simulation" };

  return (
    <div className="devflow">
      <div className="devflow-track">
        {STAGES.map((s, i) => (
          <div className="devflow-node-wrap" key={s.id}>
            <button
              className={
                sel.id === s.id ? "devflow-node devflow-node--active" : "devflow-node"
              }
              onClick={() => setSel(s)}
              type="button"
            >
              {pick(s.short, language)}
            </button>
            {i < STAGES.length - 1 && (
              <span className="devflow-arrow" aria-hidden="true">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="devflow-readout">
        <div className="devflow-vivado">
          <span className="devflow-tag">{pick(vivadoLabel, language)}</span>
          <code>{sel.vivado}</code>
        </div>
        <p className="devflow-what">{pick(sel.what, language)}</p>
        <p className="devflow-why">
          <strong>{pick(whyLabel, language)}:</strong> {pick(sel.why, language)}
        </p>
        {sel.sim && (
          <div className="devflow-sim">
            <span className="devflow-tag">{pick(simLabel, language)}</span>
            <code>{sel.sim.name}</code>
            <p className="devflow-sim-text">{pick(sel.sim.text, language)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
