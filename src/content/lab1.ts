import type { Lab } from "./labTypes.ts";
import imgProjectName from "../resources/01-project-name.png";
import imgSelectBoard from "../resources/02-select-board.png";
import imgAddConstraints from "../resources/04-add-constraints.png";
import imgSynthesisComplete from "../resources/06-synthesis-complete.png";
import imgProgramDevice from "../resources/07-program-device.png";

const fig = (src: string, altPt: string, altEn: string, capPt: string, capEn: string) => ({
  src,
  alt: { pt: altPt, en: altEn },
  caption: { pt: capPt, en: capEn },
});

export const lab1: Lab = {
  id: 1,
  labLabel: { pt: "Lab 1", en: "Lab 1" },
  title: { pt: "Chaves → LEDs", en: "Switches → LEDs" },
  goal: {
    pt: "Criar seu primeiro projeto no Vivado e percorrer o fluxo inteiro — da pasta de trabalho ao bitstream na placa — com o circuito mais simples possível: cada chave acende um LED. No caminho, você escreve suas primeiras linhas de Verilog.",
    en: "Create your first Vivado project and walk the whole flow — from the workspace folder to a bitstream on the board — with the simplest possible circuit: each switch lights an LED. Along the way, you write your first lines of Verilog.",
  },
  duration: { pt: "75–90 min", en: "75–90 min" },
  prereqs: [
    {
      pt: "Ter feito o Lab 0 (FPGA, ZedBoard e Vivado instalado e testado).",
      en: "Having done Lab 0 (FPGA, ZedBoard and Vivado installed and tested).",
    },
    {
      pt: "Ter o arquivo Zedboard-Master.xdc (dos arquivos do lab ou baixado da Digilent).",
      en: "Having the Zedboard-Master.xdc file (from the lab files or downloaded from Digilent).",
    },
  ],
  sections: [
    {
      kind: "prose",
      label: { pt: "Objetivo", en: "Goal" },
      title: { pt: "O 'Olá, mundo' do FPGA", en: "The FPGA 'Hello, world'" },
      text: {
        pt: "Nada de clock, nada de memória: neste lab, cada uma das 8 chaves da ZedBoard controla diretamente um dos 8 LEDs. Chave para cima, LED acende; chave para baixo, LED apaga. É o circuito mais simples que existe — e é de propósito. O que importa aqui é aprender o CAMINHO completo: criar o projeto no Vivado, escrever o Verilog, mapear os pinos no arquivo de restrições e percorrer o fluxo até a placa acender. Depois que esse caminho estiver na ponta dos dedos, os circuitos podem crescer.",
        en: "No clock, no memory: in this lab, each of the ZedBoard's 8 switches directly controls one of the 8 LEDs. Switch up, LED on; switch down, LED off. It's the simplest circuit there is — on purpose. What matters here is learning the whole PATH: create the project in Vivado, write the Verilog, map the pins in the constraints file and walk the flow until the board lights up. Once that path is second nature, the circuits can grow.",
      },
    },
    {
      kind: "playground",
      title: { pt: "Veja o circuito antes de construí-lo", en: "See the circuit before building it" },
      intro: {
        pt: "Este é exatamente o comportamento que vamos gravar na placa. Clique nas chaves e veja cada LED acender junto — a saída segue a entrada, sem atraso. É lógica combinacional.",
        en: "This is exactly the behavior we'll program onto the board. Click the switches and watch each LED light with it — the output follows the input, with no delay. This is combinational logic.",
      },
      instrument: { component: "SwitchLedSim" },
    },

    {
      kind: "prose",
      label: { pt: "Um pouco de Verilog", en: "A little Verilog" },
      title: { pt: "O que é um módulo", en: "What a module is" },
      text: {
        pt: "Verilog é uma linguagem de descrição de hardware (HDL): em vez de uma sequência de comandos, você descreve um circuito. A unidade básica é o 'module' — uma caixa com portas de entrada e de saída. Cada porta é um fio (ou um feixe de fios) que entra ou sai da caixa. 'input' são sinais que chegam ao módulo; 'output' são sinais que ele controla. A palavra 'wire' diz que a porta é justamente um fio. Tudo que está entre 'module' e 'endmodule' descreve o que acontece dentro da caixa.",
        en: "Verilog is a hardware description language (HDL): instead of a sequence of commands, you describe a circuit. The basic unit is the 'module' — a box with input and output ports. Each port is a wire (or a bundle of wires) going into or out of the box. 'input' are signals that arrive at the module; 'output' are signals it drives. The word 'wire' says the port is exactly that — a wire. Everything between 'module' and 'endmodule' describes what happens inside the box.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Um pouco de Verilog", en: "A little Verilog" },
      title: { pt: "Barramentos e o 'assign'", en: "Buses and 'assign'" },
      text: {
        pt: "Como temos 8 chaves e 8 LEDs, agrupamos cada conjunto num barramento (bus): sw[7:0] é um feixe de 8 fios, numerados do bit 7 ao bit 0. Assim, sw[3] é o quarto fio, e sw sozinho é o feixe inteiro. O corpo do nosso circuito é uma única linha: 'assign led = sw'. O 'assign' cria uma ligação contínua — um fio permanente, não uma atribuição que acontece uma vez. Ele conecta cada bit de sw ao bit de mesmo índice de led, o tempo todo. Isso é lógica combinacional: sem clock, a saída acompanha a entrada instantaneamente.",
        en: "Since we have 8 switches and 8 LEDs, we group each set into a bus: sw[7:0] is a bundle of 8 wires, numbered from bit 7 down to bit 0. So sw[3] is the fourth wire, and sw alone is the whole bundle. Our circuit's body is a single line: 'assign led = sw'. The 'assign' creates a continuous connection — a permanent wire, not an assignment that happens once. It ties each bit of sw to the same-index bit of led, all the time. This is combinational logic: with no clock, the output tracks the input instantly.",
      },
    },
    {
      kind: "code",
      title: { pt: "O módulo top", en: "The top module" },
      intro: {
        pt: "Este é o arquivo de projeto (design). O nome do módulo, 'top', será o topo da hierarquia. Guarde os nomes das portas (sw e led): eles precisarão casar com o arquivo de restrições.",
        en: "This is the design file. The module name, 'top', will be the top of the hierarchy. Remember the port names (sw and led): they must match the constraints file.",
      },
      block: {
        language: "verilog",
        filename: "top.v",
        code: {
          pt: `// Chaves -> LEDs: cada chave acende o LED de mesmo indice.
// Circuito combinacional (sem clock): a saida segue a entrada.
module top (
    input  wire [7:0] sw,   // 8 chaves: um barramento de 8 fios (bit 7..0)
    output wire [7:0] led   // 8 LEDs:   outro barramento de 8 fios
);
    // 'assign' e uma ligacao continua: led[i] segue sw[i] o tempo todo.
    assign led = sw;
endmodule`,
          en: `// Switches -> LEDs: each switch lights the LED with the same index.
// Combinational circuit (no clock): the output follows the input.
module top (
    input  wire [7:0] sw,   // 8 switches: a bus of 8 wires (bit 7..0)
    output wire [7:0] led   // 8 LEDs:     another bus of 8 wires
);
    // 'assign' is a continuous connection: led[i] follows sw[i] all the time.
    assign led = sw;
endmodule`,
        },
        caption: {
          pt: "Um único 'assign' conecta os 8 bits das chaves aos 8 bits dos LEDs.",
          en: "A single 'assign' wires the 8 switch bits to the 8 LED bits.",
        },
      },
    },

    {
      kind: "prose",
      label: { pt: "Os pinos", en: "The pins" },
      title: { pt: "O arquivo de restrições e o master da ZedBoard", en: "The constraints file and the ZedBoard master" },
      text: {
        pt: "O Verilog diz O QUE o circuito faz, mas não ONDE ele se conecta na placa. Quem faz isso é o arquivo de restrições (XDC): ele associa cada porta do módulo a um pino físico do Zynq. A Digilent fornece um XDC 'mestre' para a ZedBoard (Zedboard-Master.xdc) com TODOS os pinos já listados, porém comentados (cada linha começa com #). O fluxo é: adicionar esse arquivo ao projeto e descomentar só as linhas que você usa — aqui, as 8 chaves (SW0–SW7) e os 8 LEDs (LD0–LD7). Como nosso módulo usa barramentos, também ajustamos os nomes em get_ports para a forma sw[i] / led[i].",
        en: "The Verilog says WHAT the circuit does, but not WHERE it connects on the board. That's the constraints file's (XDC) job: it maps each module port to a physical Zynq pin. Digilent provides a 'master' XDC for the ZedBoard (Zedboard-Master.xdc) with ALL pins already listed, but commented out (each line starts with #). The flow is: add that file to the project and uncomment only the lines you use — here, the 8 switches (SW0–SW7) and 8 LEDs (LD0–LD7). Since our module uses buses, we also adjust the get_ports names to the sw[i] / led[i] form.",
      },
    },
    {
      kind: "code",
      title: { pt: "As linhas que vamos usar", en: "The lines we'll use" },
      intro: {
        pt: "Estas são as linhas do master já descomentadas e com os nomes ajustados para os barramentos. Repare: aqui não há IOSTANDARD por linha — o master define a tensão por banco no final do arquivo (Bank 33 em 3,3 V para os LEDs; Bank 35 em 1,8 V para as chaves).",
        en: "These are the master's lines, already uncommented and with the names adjusted to the buses. Notice: there's no per-line IOSTANDARD here — the master sets the voltage per bank at the end of the file (Bank 33 at 3.3 V for the LEDs; Bank 35 at 1.8 V for the switches).",
      },
      block: {
        language: "xdc",
        filename: "Zedboard-Master.xdc (trecho)",
        code: {
          pt: `## User DIP Switches - Bank 35  (descomentado, nomes -> sw[7:0])
set_property PACKAGE_PIN F22 [get_ports {sw[0]}];
set_property PACKAGE_PIN G22 [get_ports {sw[1]}];
set_property PACKAGE_PIN H22 [get_ports {sw[2]}];
set_property PACKAGE_PIN F21 [get_ports {sw[3]}];
set_property PACKAGE_PIN H19 [get_ports {sw[4]}];
set_property PACKAGE_PIN H18 [get_ports {sw[5]}];
set_property PACKAGE_PIN H17 [get_ports {sw[6]}];
set_property PACKAGE_PIN M15 [get_ports {sw[7]}];

## User LEDs - Bank 33  (descomentado, nomes -> led[7:0])
set_property PACKAGE_PIN T22 [get_ports {led[0]}];
set_property PACKAGE_PIN T21 [get_ports {led[1]}];
set_property PACKAGE_PIN U22 [get_ports {led[2]}];
set_property PACKAGE_PIN U21 [get_ports {led[3]}];
set_property PACKAGE_PIN V22 [get_ports {led[4]}];
set_property PACKAGE_PIN W22 [get_ports {led[5]}];
set_property PACKAGE_PIN U19 [get_ports {led[6]}];
set_property PACKAGE_PIN U14 [get_ports {led[7]}];

## Tensao por banco (ja definida no fim do master):
##   Bank 33 -> LVCMOS33 (3,3 V, LEDs)
##   Bank 35 -> LVCMOS18 (1,8 V, chaves, via VADJ)`,
          en: `## User DIP Switches - Bank 35  (uncommented, names -> sw[7:0])
set_property PACKAGE_PIN F22 [get_ports {sw[0]}];
set_property PACKAGE_PIN G22 [get_ports {sw[1]}];
set_property PACKAGE_PIN H22 [get_ports {sw[2]}];
set_property PACKAGE_PIN F21 [get_ports {sw[3]}];
set_property PACKAGE_PIN H19 [get_ports {sw[4]}];
set_property PACKAGE_PIN H18 [get_ports {sw[5]}];
set_property PACKAGE_PIN H17 [get_ports {sw[6]}];
set_property PACKAGE_PIN M15 [get_ports {sw[7]}];

## User LEDs - Bank 33  (uncommented, names -> led[7:0])
set_property PACKAGE_PIN T22 [get_ports {led[0]}];
set_property PACKAGE_PIN T21 [get_ports {led[1]}];
set_property PACKAGE_PIN U22 [get_ports {led[2]}];
set_property PACKAGE_PIN U21 [get_ports {led[3]}];
set_property PACKAGE_PIN V22 [get_ports {led[4]}];
set_property PACKAGE_PIN W22 [get_ports {led[5]}];
set_property PACKAGE_PIN U19 [get_ports {led[6]}];
set_property PACKAGE_PIN U14 [get_ports {led[7]}];

## Per-bank voltage (already set at the end of the master):
##   Bank 33 -> LVCMOS33 (3.3 V, LEDs)
##   Bank 35 -> LVCMOS18 (1.8 V, switches, via VADJ)`,
        },
        caption: {
          pt: "Os nomes entre get_ports { } têm de bater exatamente com as portas do módulo (sw, led).",
          en: "The names inside get_ports { } must match the module ports exactly (sw, led).",
        },
      },
    },
    {
      kind: "callout",
      variant: "note",
      title: { pt: "O jumper VADJ (J18)", en: "The VADJ jumper (J18)" },
      text: {
        pt: "As chaves ficam no Bank 35, alimentado pelo VADJ (jumper J18) — de fábrica em 1,8 V. Por isso o master usa LVCMOS18 nesse banco. Se as suas chaves não responderem, confira o J18: em outra tensão (2,5 V ou 3,3 V), ajuste o IOSTANDARD do banco para bater. Os LEDs não têm esse problema: o Bank 33 é fixo em 3,3 V.",
        en: "The switches sit on Bank 35, powered by VADJ (jumper J18) — 1.8 V from the factory. That's why the master uses LVCMOS18 on that bank. If your switches don't respond, check J18: at another voltage (2.5 V or 3.3 V), adjust the bank's IOSTANDARD to match. The LEDs don't have this issue: Bank 33 is fixed at 3.3 V.",
      },
    },

    {
      kind: "prose",
      label: { pt: "Mãos à obra", en: "Hands-on" },
      title: { pt: "Agora, dentro do Vivado", en: "Now, inside Vivado" },
      text: {
        pt: "Com o circuito na cabeça e os pinos em mãos, vamos ao Vivado: preparar a pasta, criar o projeto, adicionar o XDC e o Verilog, gerar o bitstream e gravar a placa. Cada passo abaixo tem um porquê — vá com calma na primeira vez.",
        en: "With the circuit in your head and the pins in hand, let's go to Vivado: prepare the folder, create the project, add the XDC and the Verilog, generate the bitstream and program the board. Each step below has a reason — take it slow the first time.",
      },
    },
    {
      kind: "steps",
      title: { pt: "1 · Preparar a pasta e abrir o Vivado", en: "1 · Prepare the folder and open Vivado" },
      intro: {
        pt: "Um lugar organizado para o projeto. Use o terminal do Linux (o Terminator, instalado no Lab 0, ajuda em labs futuros).",
        en: "A tidy place for the project. Use the Linux terminal (Terminator, installed in Lab 0, helps in later labs).",
      },
      steps: [
        {
          text: {
            pt: "Crie uma pasta de trabalho na sua home e entre nela. Dica: use a tecla TAB para autocompletar caminhos.",
            en: "Create a workspace folder in your home and enter it. Tip: use the TAB key to autocomplete paths.",
          },
          code: {
            language: "text",
            code: { pt: "mkdir ~/Workspace\ncd ~/Workspace/", en: "mkdir ~/Workspace\ncd ~/Workspace/" },
          },
        },
        {
          text: {
            pt: "Abra o Vivado a partir dessa pasta. A tela inicial do Vivado deve aparecer.",
            en: "Launch Vivado from that folder. The Vivado welcome screen should appear.",
          },
          code: { language: "text", code: { pt: "vivado", en: "vivado" } },
        },
        {
          title: { pt: "A tela de boas-vindas", en: "The welcome screen" },
          text: {
            pt: "Nela você vê: 'Create Project' (assistente para criar um projeto do zero), 'Open Project' (abrir um projeto existente, arquivo .xpr) e 'Open Hardware Manager' (gravar a placa sem abrir projeto). Vamos usar a primeira.",
            en: "There you see: 'Create Project' (a wizard to build a project from scratch), 'Open Project' (open an existing project, an .xpr file) and 'Open Hardware Manager' (program the board without a project). We'll use the first.",
          },
        },
      ],
    },
    {
      kind: "steps",
      title: { pt: "2 · Criar o projeto (placa ZedBoard)", en: "2 · Create the project (ZedBoard board)" },
      intro: {
        pt: "Vamos apontar o projeto para a placa. Escolher a placa (board), e não só o chip (part), traz configurações extras dos periféricos.",
        en: "We'll target the project at the board. Choosing the board (not just the part) brings extra peripheral configuration.",
      },
      steps: [
        {
          text: {
            pt: "Clique em 'Create Project' e em 'Next'. A primeira página só resume as etapas do assistente.",
            en: "Click 'Create Project' and 'Next'. The first page just summarizes the wizard's steps.",
          },
        },
        {
          title: { pt: "Nome e local", en: "Name and location" },
          text: {
            pt: "Dê um nome ao projeto (ex.: lab1_sw_led) — o Vivado usa esse nome para montar as pastas. Mantenha o local em ~/Workspace e marque 'Create project subdirectory'. Avance.",
            en: "Name the project (e.g. lab1_sw_led) — Vivado uses this name to build its folders. Keep the location at ~/Workspace and check 'Create project subdirectory'. Continue.",
          },
          note: {
            variant: "warning",
            text: {
              pt: "Evite espaços e acentos no nome e no caminho — use _ , - ou CamelCase. Espaços quebram ferramentas do Vivado silenciosamente.",
              en: "Avoid spaces and accents in the name and path — use _ , - or CamelCase. Spaces silently break Vivado tools.",
            },
          },
        },
        {
          title: { pt: "Tipo de projeto", en: "Project type" },
          text: {
            pt: "Escolha 'RTL Project' e marque 'Do not specify sources at this time' (adicionamos os arquivos depois). Avance.",
            en: "Choose 'RTL Project' and check 'Do not specify sources at this time' (we add the files later). Continue.",
          },
        },
        {
          title: { pt: "Selecionar a placa", en: "Select the board" },
          text: {
            pt: "Vá para a aba 'Boards' e clique em 'Refresh' (canto inferior esquerdo). Procure 'ZedBoard Zynq Evaluation and Development Kit' na lista e clique no botão de instalar (seta para baixo, na coluna Status). Confirme versão 1.4 e Board Revision d. Avance.",
            en: "Go to the 'Boards' tab and click 'Refresh' (bottom left). Find 'ZedBoard Zynq Evaluation and Development Kit' in the list and click the install button (down arrow, under the Status column). Confirm version 1.4 and Board Revision d. Continue.",
          },
          note: {
            variant: "tip",
            text: {
              pt: "Se a ZedBoard não aparecer, os board files da Digilent podem não estar instalados — veja o guia de instalação do Lab 0.",
              en: "If the ZedBoard doesn't appear, Digilent's board files may not be installed — see the Lab 0 install guide.",
            },
          },
        },
        {
          title: { pt: "Concluir", en: "Finish" },
          text: {
            pt: "A última tela resume suas escolhas. Clique em 'Finish' para abrir o projeto.",
            en: "The last screen summarizes your choices. Click 'Finish' to open the project.",
          },
        },
      ],
    },
    {
      kind: "figure",
      figure: fig(
        imgProjectName,
        "Tela do assistente com o nome e o local do projeto.",
        "Wizard screen with the project name and location.",
        "Figura 1 — Nome e local do projeto (sem espaços/acentos).",
        "Figure 1 — Project name and location (no spaces/accents)."
      ),
    },
    {
      kind: "figure",
      figure: fig(
        imgSelectBoard,
        "Aba Boards com a ZedBoard selecionada, versão 1.4 e revisão d.",
        "Boards tab with the ZedBoard selected, version 1.4 and revision d.",
        "Figura 2 — Selecionando a placa ZedBoard (v1.4, rev d).",
        "Figure 2 — Selecting the ZedBoard (v1.4, rev d)."
      ),
    },
    {
      kind: "prose",
      label: { pt: "Orientação", en: "Orientation" },
      title: { pt: "O Flow Navigator", en: "The Flow Navigator" },
      text: {
        pt: "A coluna à esquerda da janela do Vivado é o Flow Navigator — é por ela que você navega entre as ferramentas. Os blocos que vamos usar: 'Project Manager' (configurações e Add Sources — adicionar arquivos); 'Simulation' (verificar o circuito por software, sem a placa); 'RTL Analysis' (ver o circuito que o seu código descreve); 'Synthesis' e 'Implementation' (compilar e ver relatórios de tempo e de recursos usados no chip); e 'Program and Debug' (gerar o bitstream e abrir o Hardware Manager). Vamos passar por eles de cima para baixo.",
        en: "The left column of the Vivado window is the Flow Navigator — it's how you move between tools. The blocks we'll use: 'Project Manager' (settings and Add Sources — add files); 'Simulation' (verify the circuit in software, without the board); 'RTL Analysis' (see the circuit your code describes); 'Synthesis' and 'Implementation' (compile and view timing and chip-resource reports); and 'Program and Debug' (generate the bitstream and open the Hardware Manager). We'll go through them top to bottom.",
      },
    },
    {
      kind: "steps",
      title: { pt: "3 · Adicionar as restrições (XDC)", en: "3 · Add the constraints (XDC)" },
      intro: {
        pt: "Vamos adicionar o Zedboard-Master.xdc ao projeto e descomentar as linhas das chaves e dos LEDs.",
        en: "We'll add the Zedboard-Master.xdc to the project and uncomment the switch and LED lines.",
      },
      steps: [
        {
          text: {
            pt: "No Flow Navigator → Project Manager → 'Add Sources' (atalho Alt+A). Escolha 'Add or create constraints' e avance.",
            en: "In the Flow Navigator → Project Manager → 'Add Sources' (shortcut Alt+A). Choose 'Add or create constraints' and continue.",
          },
        },
        {
          text: {
            pt: "Clique em 'Add Files', localize o arquivo Zedboard-Master.xdc e confirme com 'OK'. (Você pode baixá-lo em: digilent.com/reference/programmable-logic/zedboard/start.)",
            en: "Click 'Add Files', find the Zedboard-Master.xdc file and confirm with 'OK'. (You can download it at: digilent.com/reference/programmable-logic/zedboard/start.)",
          },
        },
        {
          text: {
            pt: "Confira que o XDC entrou na lista e que 'Copy constraints files into project' está marcado. Clique em 'Finish'.",
            en: "Check that the XDC is in the list and that 'Copy constraints files into project' is checked. Click 'Finish'.",
          },
        },
        {
          title: { pt: "Descomentar os pinos", en: "Uncomment the pins" },
          text: {
            pt: "Na aba 'Sources' → 'Constraints', dê duplo-clique no XDC para abri-lo. Encontre as seções 'User DIP Switches' e 'User LEDs', remova o # do início das linhas das 8 chaves e dos 8 LEDs, e ajuste os nomes em get_ports para sw[0]…sw[7] e led[0]…led[7], como no bloco acima. Salve.",
            en: "In the 'Sources' tab → 'Constraints', double-click the XDC to open it. Find the 'User DIP Switches' and 'User LEDs' sections, remove the # from the start of the 8 switch and 8 LED lines, and adjust the get_ports names to sw[0]…sw[7] and led[0]…led[7], as in the block above. Save.",
          },
        },
      ],
    },
    {
      kind: "figure",
      figure: fig(
        imgAddConstraints,
        "Assistente Add Sources adicionando o Zedboard-Master.xdc.",
        "Add Sources wizard adding the Zedboard-Master.xdc.",
        "Figura 3 — Adicionando o Zedboard-Master.xdc ao projeto.",
        "Figure 3 — Adding the Zedboard-Master.xdc to the project."
      ),
    },
    {
      kind: "steps",
      title: { pt: "4 · Criar o Verilog (Define Module)", en: "4 · Create the Verilog (Define Module)" },
      intro: {
        pt: "Agora o design. O Vivado ajuda a montar as portas do módulo por um diálogo antes de você escrever o corpo.",
        en: "Now the design. Vivado helps you set up the module's ports through a dialog before you write the body.",
      },
      steps: [
        {
          text: {
            pt: "No Project Manager → 'Add Sources' → 'Add or create design sources' → 'Create File'. Escolha o tipo 'Verilog', local '<Local to project>', e um nome com extensão .v (ex.: top.v), sem espaços. Confirme e clique em 'Finish'.",
            en: "In the Project Manager → 'Add Sources' → 'Add or create design sources' → 'Create File'. Choose type 'Verilog', location '<Local to project>', and a name ending in .v (e.g. top.v), no spaces. Confirm and click 'Finish'.",
          },
        },
        {
          title: { pt: "Definir as portas", en: "Define the ports" },
          text: {
            pt: "Abre o diálogo 'Define Module'. Cada porta tem 5 campos: Port Name (o nome, que deve casar com o XDC); Direction (input/output/inout); Bus (marque quando a porta for um feixe de vários bits); MSB e LSB (os índices do bit mais e menos significativos do barramento). Adicione uma porta 'sw' (input, Bus marcado, MSB 7, LSB 0) e uma 'led' (output, Bus marcado, MSB 7, LSB 0). Clique em 'OK'.",
            en: "The 'Define Module' dialog opens. Each port has 5 fields: Port Name (the name, which must match the XDC); Direction (input/output/inout); Bus (check it when the port is a bundle of several bits); MSB and LSB (the most- and least-significant bit indices of the bus). Add a 'sw' port (input, Bus checked, MSB 7, LSB 0) and a 'led' port (output, Bus checked, MSB 7, LSB 0). Click 'OK'.",
          },
          note: {
            variant: "tip",
            text: {
              pt: "Os nomes 'sw' e 'led' têm de ser exatamente os mesmos que você usou no get_ports do XDC — senão a implementação falha com 'cannot find port'.",
              en: "The names 'sw' and 'led' must be exactly the ones you used in the XDC's get_ports — otherwise implementation fails with 'cannot find port'.",
            },
          },
        },
        {
          title: { pt: "Escrever o corpo", en: "Write the body" },
          text: {
            pt: "O novo arquivo aparece em 'Design Sources'. Dê duplo-clique para abri-lo: o Vivado já criou o cabeçalho do módulo com as portas. Entre o ');' do fim da lista de portas e o 'endmodule', escreva a linha do circuito: assign led = sw; (deixe o resultado igual ao top.v mostrado acima). Salve.",
            en: "The new file appears under 'Design Sources'. Double-click to open it: Vivado already created the module header with the ports. Between the ');' at the end of the port list and 'endmodule', write the circuit line: assign led = sw; (make the result match the top.v shown above). Save.",
          },
        },
      ],
    },
    {
      kind: "steps",
      title: { pt: "5 · Gerar o bitstream", en: "5 · Generate the bitstream" },
      intro: {
        pt: "Três etapas em cadeia: síntese → implementação → bitstream. Você pode rodar uma a uma para entender cada relatório.",
        en: "Three chained stages: synthesis → implementation → bitstream. You can run them one at a time to read each report.",
      },
      steps: [
        {
          title: { pt: "Síntese", en: "Synthesis" },
          text: {
            pt: "Clique em 'Run Synthesis'; no diálogo 'Launch Runs', mantenha o padrão e 'OK'. A síntese traduz o seu Verilog em portas lógicas e conexões, guiada pelo XDC. O status aparece no canto superior direito. Ao terminar, clique em 'Cancel' no diálogo para rodar a implementação pelo Flow Navigator.",
            en: "Click 'Run Synthesis'; in the 'Launch Runs' dialog, keep the defaults and 'OK'. Synthesis translates your Verilog into logic gates and connections, guided by the XDC. The status shows in the top-right corner. When it finishes, click 'Cancel' in the dialog to run implementation from the Flow Navigator.",
          },
        },
        {
          title: { pt: "Implementação", en: "Implementation" },
          text: {
            pt: "Clique em 'Run Implementation'. Ela tem etapas internas: Opt Design (otimizar), Place Design (posicionar no chip) e Route Design (rotear os fios) — respeitando os pinos do XDC. Ao terminar, feche o diálogo 'Implementation Completed'.",
            en: "Click 'Run Implementation'. It has internal steps: Opt Design (optimize), Place Design (lay out on the chip) and Route Design (route the wires) — honoring the XDC pins. When it finishes, close the 'Implementation Completed' dialog.",
          },
        },
        {
          title: { pt: "Bitstream", en: "Bitstream" },
          text: {
            pt: "Clique em 'Generate Bitstream' para criar o arquivo .bit — a configuração binária que 'vira' o seu circuito na PL. Isso pode levar de alguns a vários minutos. Ao ver 'write_bitstream complete' no canto superior direito, está pronto para gravar.",
            en: "Click 'Generate Bitstream' to create the .bit file — the binary configuration that 'becomes' your circuit in the PL. This can take a few to several minutes. When you see 'write_bitstream complete' in the top-right corner, it's ready to program.",
          },
        },
      ],
    },
    {
      kind: "figure",
      figure: fig(
        imgSynthesisComplete,
        "Diálogo de síntese concluída no Vivado.",
        "Vivado synthesis completed dialog.",
        "Figura 4 — Síntese concluída; o mesmo padrão vale para implementação e bitstream.",
        "Figure 4 — Synthesis complete; the same pattern applies to implementation and bitstream."
      ),
    },
    {
      kind: "steps",
      title: { pt: "6 · Gravar a placa", en: "6 · Program the board" },
      intro: {
        pt: "O bitstream vai para a placa pelo Hardware Manager, via JTAG, pela porta PROG.",
        en: "The bitstream goes to the board through the Hardware Manager, over JTAG, via the PROG port.",
      },
      steps: [
        {
          title: { pt: "Conectar", en: "Connect" },
          text: {
            pt: "Ligue a placa e conecte o micro-USB na porta PROG (ao lado do conector de energia). Cuidado para não confundir com a UART nem com a USB OTG. Confirme a outra ponta no PC.",
            en: "Power the board and plug the micro-USB into the PROG port (next to the power connector). Be careful not to confuse it with the UART or the USB OTG. Confirm the other end is in the PC.",
          },
          note: {
            variant: "tip",
            text: {
              pt: "Em máquina virtual (VirtualBox), selecione o 'Digilent USB Device' no menu Devices > USB.",
              en: "On a virtual machine (VirtualBox), select the 'Digilent USB Device' in the Devices > USB menu.",
            },
          },
        },
        {
          title: { pt: "Abrir o alvo", en: "Open the target" },
          text: {
            pt: "No Flow Navigator → 'Open Hardware Manager' → 'Open Target' → 'Auto Connect'. Na aba 'Hardware', o alvo Digilent deve aparecer como 'Open'. A árvore JTAG mostra o FPGA (PL) e o processador ARM (PS); o FPGA aparece como 'Not programmed'.",
            en: "In the Flow Navigator → 'Open Hardware Manager' → 'Open Target' → 'Auto Connect'. In the 'Hardware' tab, the Digilent target should show as 'Open'. The JTAG tree shows the FPGA (PL) and the ARM processor (PS); the FPGA shows as 'Not programmed'.",
          },
        },
        {
          title: { pt: "Programar", en: "Program" },
          text: {
            pt: "Clique em 'Program device'. O campo 'Bitstream file' deve vir preenchido (se não, aponte para <Projeto>.runs/impl_1/top.bit). Deixe 'Debug probe' em branco e clique em 'Program'.",
            en: "Click 'Program device'. The 'Bitstream file' field should be filled in (if not, point it to <Project>.runs/impl_1/top.bit). Leave 'Debug probe' blank and click 'Program'.",
          },
        },
        {
          title: { pt: "Verificar", en: "Verify" },
          text: {
            pt: "O LED azul 'DONE' (abaixo do logo da ZedBoard) acende quando a PL é configurada. Agora mova as chaves: cada LED deve acender junto com a chave de mesmo número.",
            en: "The blue 'DONE' LED (below the ZedBoard logo) lights up when the PL is configured. Now move the switches: each LED should light with the switch of the same number.",
          },
        },
      ],
    },
    {
      kind: "figure",
      figure: fig(
        imgProgramDevice,
        "Diálogo Program Device com o arquivo de bitstream preenchido.",
        "Program Device dialog with the bitstream file filled in.",
        "Figura 5 — Program Device: enviando o .bit pela USB-JTAG (PROG).",
        "Figure 5 — Program Device: sending the .bit over USB-JTAG (PROG)."
      ),
    },
    {
      kind: "checklist",
      title: { pt: "Funcionou?", en: "Did it work?" },
      items: [
        {
          pt: "Criei o projeto no Vivado apontando para a placa ZedBoard.",
          en: "I created the Vivado project targeting the ZedBoard.",
        },
        {
          pt: "Adicionei o Zedboard-Master.xdc e descomentei as linhas das chaves e dos LEDs.",
          en: "I added the Zedboard-Master.xdc and uncommented the switch and LED lines.",
        },
        {
          pt: "Escrevi o módulo Verilog com as portas sw[7:0] e led[7:0] e o 'assign led = sw'.",
          en: "I wrote the Verilog module with the sw[7:0] and led[7:0] ports and 'assign led = sw'.",
        },
        {
          pt: "Gerei o bitstream, gravei a placa e o LED DONE acendeu.",
          en: "I generated the bitstream, programmed the board and the DONE LED lit up.",
        },
        {
          pt: "Movi as chaves e cada LED acendeu com a chave de mesmo número.",
          en: "I moved the switches and each LED lit with the switch of the same number.",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Cheque seu entendimento", en: "Check your understanding" },
      quizzes: [
        {
          question: {
            pt: "No diálogo 'Define Module', o que significa marcar a caixa 'Bus' de uma porta?",
            en: "In the 'Define Module' dialog, what does checking a port's 'Bus' box mean?",
          },
          options: [
            { pt: "Que a porta é uma entrada", en: "That the port is an input" },
            {
              pt: "Que a porta é um feixe de vários fios (bits), definido por MSB e LSB",
              en: "That the port is a bundle of several wires (bits), set by MSB and LSB",
            },
            { pt: "Que a porta usa clock", en: "That the port uses a clock" },
            { pt: "Que a porta é interna ao módulo", en: "That the port is internal to the module" },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "Uma porta 'Bus' agrupa vários bits num barramento (ex.: sw[7:0], com MSB 7 e LSB 0). Sem 'Bus', a porta é um único fio.",
                en: "A 'Bus' port groups several bits into a bundle (e.g. sw[7:0], with MSB 7 and LSB 0). Without 'Bus', the port is a single wire.",
              },
            },
          ],
        },
        {
          question: {
            pt: "Por que o Zedboard-Master.xdc vem com quase todas as linhas comentadas (#)?",
            en: "Why does the Zedboard-Master.xdc come with almost every line commented out (#)?",
          },
          options: [
            { pt: "Porque está com defeito", en: "Because it's broken" },
            { pt: "Para o arquivo carregar mais rápido", en: "To make the file load faster" },
            {
              pt: "Porque ele lista TODOS os pinos da placa; você descomenta só os que o seu projeto usa",
              en: "Because it lists ALL the board's pins; you uncomment only the ones your project uses",
            },
            { pt: "Porque comentários viram hardware", en: "Because comments become hardware" },
          ],
          correctIndex: 2,
          solution: [
            {
              text: {
                pt: "O master descreve a placa inteira. Cada projeto usa poucos pinos, então você descomenta apenas as linhas necessárias — aqui, as 8 chaves e os 8 LEDs.",
                en: "The master describes the whole board. Each project uses few pins, so you uncomment only the lines you need — here, the 8 switches and 8 LEDs.",
              },
            },
          ],
        },
        {
          question: {
            pt: "Você trocou os pinos de led[0] e led[7] no XDC (T22 ↔ U14), sem mexer no Verilog. O que acontece?",
            en: "You swapped the pins of led[0] and led[7] in the XDC (T22 ↔ U14), leaving the Verilog untouched. What happens?",
          },
          options: [
            {
              pt: "SW0 passa a acender LD7 e SW7 passa a acender LD0",
              en: "SW0 now lights LD7 and SW7 now lights LD0",
            },
            { pt: "Erro de síntese", en: "A synthesis error" },
            { pt: "Nada muda", en: "Nothing changes" },
            { pt: "A placa não liga", en: "The board won't power on" },
          ],
          correctIndex: 0,
          solution: [
            {
              text: {
                pt: "O XDC decide a fiação física. Trocar os pinos redireciona esses sinais para outros LEDs — o Verilog continua idêntico, mas o resultado no mundo real muda. É a prova de que o XDC importa tanto quanto o código.",
                en: "The XDC decides the physical wiring. Swapping the pins routes those signals to other LEDs — the Verilog stays identical, but the real-world result changes. Proof that the XDC matters as much as the code.",
              },
            },
          ],
        },
      ],
    },
    {
      kind: "prose",
      label: { pt: "O que vem a seguir", en: "What comes next" },
      title: { pt: "Você já domina o fluxo", en: "You now own the flow" },
      text: {
        pt: "Esse caminho — criar o projeto → Verilog + XDC → síntese → implementação → bitstream → gravar — é o MESMO para qualquer projeto, do mais simples ao mais complexo. A partir daqui só muda o conteúdo do módulo. No Lab 2 vamos acrescentar o ingrediente que faltou aqui: o tempo. Ao usar o clock de 100 MHz, o circuito ganha memória e pode contar, piscar e reagir — o primeiro passo rumo a processar sinais.",
        en: "This path — create the project → Verilog + XDC → synthesis → implementation → bitstream → program — is the SAME for any project, from the simplest to the most complex. From here on, only the module's content changes. In Lab 2 we add the ingredient missing here: time. By using the 100 MHz clock, the circuit gains memory and can count, blink and react — the first step toward processing signals.",
      },
    },
  ],
};
