import type { Lab } from "./labTypes.ts";
import img01 from "../resources/01-product-selection.png";
import img02 from "../resources/02-customization.png";
import img03 from "../resources/03-install-summary.png";
import img04 from "../resources/04-install-complete.png";
import img05 from "../resources/05-vivado-welcome.png";
import img06 from "../resources/06-hardware-connection.png";

const fig = (src: string, altPt: string, altEn: string, capPt: string, capEn: string) => ({
  src,
  alt: { pt: altPt, en: altEn },
  caption: { pt: capPt, en: capEn },
});

// Shell command block (no comments → same text in both languages).
const cmd = (code: string, capPt: string, capEn: string) => ({
  language: "text" as const,
  code: { pt: code, en: code },
  caption: { pt: capPt, en: capEn },
});

export const lab0: Lab = {
  id: 0,
  labLabel: { pt: "Lab 0", en: "Lab 0" },
  title: { pt: "A placa e o ambiente", en: "The board and the toolchain" },
  goal: {
    pt: "Entender o que é um FPGA, conhecer a ZedBoard, ver o fluxo de desenvolvimento de firmware e instalar o Vivado — deixando tudo pronto para o seu primeiro projeto FPGA.",
    en: "Understand what an FPGA is, meet the ZedBoard, see the firmware development flow and install Vivado — leaving everything ready for your first FPGA project.",
  },
  duration: { pt: "60–90 min", en: "60–90 min" },
  prereqs: [
    {
      pt: "Um computador com Ubuntu (o guia de instalação usa Linux) e acesso à internet.",
      en: "A computer with Ubuntu (the install guide uses Linux) and internet access.",
    },
    {
      pt: "Uma placa ZedBoard e o cabo micro-USB (só usaremos de verdade a partir do Lab 1).",
      en: "A ZedBoard and its micro-USB cable (we only truly use it from Lab 1 on).",
    },
  ],
  sections: [
    {
      kind: "prose",
      label: { pt: "Objetivo", en: "Goal" },
      title: { pt: "Preparar o terreno", en: "Setting the stage" },
      text: {
        pt: "Este primeiro laboratório é de orientação e preparação: você ainda não vai construir um circuito. A meta é sair daqui com quatro coisas claras — (1) o que é um FPGA e por que ele é diferente de um processador; (2) o que a ZedBoard oferece; (3) como é o fluxo de desenvolvimento de um firmware; e (4) o Vivado instalado e testado. Com isso pronto, o Lab 1 já começa direto no seu primeiro projeto.",
        en: "This first lab is about orientation and setup: you won't build a circuit yet. The goal is to leave with four things clear — (1) what an FPGA is and why it differs from a processor; (2) what the ZedBoard offers; (3) what the firmware development flow looks like; and (4) Vivado installed and tested. With that in place, Lab 1 starts straight into your first project.",
      },
    },

    {
      kind: "prose",
      label: { pt: "Conceito", en: "Concept" },
      title: { pt: "O que é um FPGA?", en: "What is an FPGA?" },
      text: {
        pt: "Um processador (CPU) tem um hardware fixo e executa um programa: uma lista de instruções processadas em sequência, uma após a outra, por um pequeno número de unidades de cálculo. Se você tem mil contas para fazer, elas entram numa fila e passam pouco a pouco por essas unidades. Um FPGA (Field-Programmable Gate Array) funciona de outro jeito: ele é um mar de blocos lógicos e conexões reconfiguráveis, e ao 'programá-lo' você não escreve um software — você descreve um circuito, e o chip passa a SER esse circuito. Em vez de uma fila passando por poucas unidades, você constrói tantas unidades quantas precisar e faz as contas acontecerem lado a lado, ao mesmo tempo. Daí vêm as duas vantagens que importam para DSP: paralelismo real (muitas operações no mesmo instante) e tempo previsível (a resposta chega sempre no mesmo número de ciclos). O preço é mudar a forma de pensar: fios, registradores e clocks, não linhas executadas em sequência.",
        en: "A processor (CPU) has fixed hardware and runs a program: a list of instructions processed in sequence, one after another, by a small number of compute units. If you have a thousand calculations to do, they line up in a queue and pass through those units bit by bit. An FPGA (Field-Programmable Gate Array) works differently: it's a sea of reconfigurable logic blocks and connections, and when you 'program' it you don't write software — you describe a circuit, and the chip becomes that circuit. Instead of a queue passing through a few units, you build as many units as you need and let the calculations happen side by side, at the same time. That's where the two advantages that matter for DSP come from: real parallelism (many operations at the same instant) and predictable timing (the answer always arrives in the same number of cycles). The price is a shift in mindset: wires, registers and clocks, not lines run in sequence.",
      },
    },
    {
      kind: "playground",
      title: { pt: "CPU × FPGA: sequencial vs paralelo", en: "CPU vs FPGA: sequential vs parallel" },
      intro: {
        pt: "Uma fila de N cálculos independentes precisa ser processada. A CPU tem uma unidade e tira um da fila por ciclo; o FPGA constrói P unidades e tira P ao mesmo tempo. Ajuste N e P, clique em Rodar e veja a fila do FPGA sumir em menos ciclos conforme você aumenta P.",
        en: "A queue of N independent calculations needs processing. The CPU has one unit and takes one off the queue per cycle; the FPGA builds P units and takes P at once. Adjust N and P, click Run and watch the FPGA's queue vanish in fewer cycles as you raise P.",
      },
      instrument: { component: "CpuVsFpga" },
    },
    {
      kind: "prose",
      label: { pt: "O chip", en: "The chip" },
      title: { pt: "Zynq-7000: PL e PS no mesmo chip", en: "Zynq-7000: PL and PS on one chip" },
      text: {
        pt: "A ZedBoard usa um Xilinx Zynq-7000 XC7Z020, um SoC que junta duas coisas num único encapsulamento: a PL (Programmable Logic) — o FPGA propriamente dito, com ~85 mil células lógicas e um clock dedicado de 100 MHz — e o PS (Processing System) — dois núcleos ARM Cortex-A9. Nestes primeiros labs trabalhamos na PL, descrevendo circuitos em Verilog. O PS, onde roda software (até um Linux), poderá entrar em labs mais adiante — a força do Zynq é justamente hardware e software conversando no mesmo chip.",
        en: "The ZedBoard uses a Xilinx Zynq-7000 XC7Z020, an SoC that joins two things in one package: the PL (Programmable Logic) — the FPGA itself, with ~85,000 logic cells and a dedicated 100 MHz clock — and the PS (Processing System) — two ARM Cortex-A9 cores. In these first labs we work on the PL, describing circuits in Verilog. The PS, where software runs (even a Linux), may join in later labs — the Zynq's strength is exactly hardware and software talking on the same chip.",
      },
    },

    {
      kind: "prose",
      label: { pt: "A placa", en: "The board" },
      title: { pt: "Conhecendo a ZedBoard", en: "Meet the ZedBoard" },
      text: {
        pt: "A ZedBoard é uma placa de desenvolvimento em torno do Zynq-7000. Além do chip, ela traz o que você precisa para experimentar sem soldar nada: 8 chaves deslizantes e 5 botões como entradas; 8 LEDs como saída; o oscilador de 100 MHz como base de tempo; 512 MB de DDR3; saídas de vídeo HDMI e VGA; um display OLED 128×32; um codec de áudio ADAU1761 (com entradas/saídas de linha, microfone e fone) — a ponte natural para um filtro de verdade lá no Lab 3; Ethernet; cartão SD; e conectores de expansão Pmod e FMC. A referência oficial da Digilent reúne manual, esquemático, arquivo de restrições e tutoriais — vamos usá-la ao longo da trilha.",
        en: "The ZedBoard is a development board built around the Zynq-7000. Beyond the chip, it brings what you need to experiment without soldering anything: 8 slide switches and 5 buttons as inputs; 8 LEDs as output; the 100 MHz oscillator as the time base; 512 MB of DDR3; HDMI and VGA video outputs; a 128×32 OLED display; an ADAU1761 audio codec (with line, microphone and headphone I/O) — the natural bridge to a real filter back in Lab 3; Ethernet; an SD card; and Pmod and FMC expansion connectors. Digilent's official reference gathers the manual, schematic, constraints file and tutorials — we'll use it throughout the track.",
      },
    },
    {
      kind: "callout",
      variant: "tip",
      title: { pt: "Referências oficiais", en: "Official references" },
      text: {
        pt: "Guarde estes dois links: a [página de referência da ZedBoard na Digilent](https://digilent.com/reference/programmable-logic/zedboard/start) — com manual, esquemático e o arquivo de restrições (XDC) — e o [site de download da AMD/Xilinx](https://www.xilinx.com/support/download.html), de onde vem o Vivado. Sempre que uma informação de pino ou de placa aparecer nos labs, ela vem dessas fontes.",
        en: "Keep these two links: the [ZedBoard reference page at Digilent](https://digilent.com/reference/programmable-logic/zedboard/start) — with the manual, schematic and constraints file (XDC) — and the [AMD/Xilinx download site](https://www.xilinx.com/support/download.html), where Vivado comes from. Whenever a pin or board fact shows up in the labs, it comes from these sources.",
      },
    },
    {
      kind: "playground",
      title: { pt: "Mapa interativo da ZedBoard", en: "Interactive ZedBoard map" },
      intro: {
        pt: "Clique em uma chave, um LED, um botão, o clock ou os jacks de áudio para ver o sinal, o pino do Zynq, o banco de I/O e a tensão. São os pinos exatos do XDC oficial que você vai usar nos próximos labs.",
        en: "Click a switch, an LED, a button, the clock or the audio jacks to see the signal, the Zynq pin, the I/O bank and the voltage. These are the exact pins from the official XDC you'll use in the next labs.",
      },
      instrument: { component: "BoardDiagram" },
    },

    {
      kind: "prose",
      label: { pt: "O caminho", en: "The path" },
      title: { pt: "O fluxo de desenvolvimento de um firmware", en: "The firmware development flow" },
      text: {
        pt: "Levar uma ideia até a placa segue sempre o mesmo caminho, independente da ferramenta: você descreve o circuito (RTL), verifica a lógica por simulação, sintetiza (o código vira portas), implementa (as portas ganham lugar no chip e os fios são roteados), gera o bitstream e, por fim, programa a placa. Cada etapa tem um papel — e pular a simulação, por exemplo, costuma custar caro depois. Mais abaixo, depois de instalar o Vivado, você verá esse mesmo fluxo dentro dele, etapa por etapa.",
        en: "Taking an idea to the board always follows the same path, whatever the tool: you describe the circuit (RTL), verify the logic by simulation, synthesize (code becomes gates), implement (gates get a place on the chip and wires are routed), generate the bitstream and, finally, program the board. Each stage has a role — and skipping simulation, for instance, tends to cost dearly later. Below, after installing Vivado, you'll see this same flow inside it, stage by stage.",
      },
    },

    {
      kind: "prose",
      label: { pt: "Instalação", en: "Installation" },
      title: { pt: "Instalar o Vivado ML 2023.1 (Ubuntu)", en: "Install Vivado ML 2023.1 (Ubuntu)" },
      text: {
        pt: "Vamos instalar a edição gratuita Vivado ML 2023.1 no Ubuntu. O instalador da AMD/Xilinx é grande e faz muita coisa; por isso o guia abaixo é dividido em seis blocos. Reserve um tempo: o download e a instalação dependem da sua internet.",
        en: "We'll install the free Vivado ML 2023.1 edition on Ubuntu. The AMD/Xilinx installer is large and does a lot, so the guide below is split into six blocks. Set aside some time: the download and install depend on your internet.",
      },
    },
    {
      kind: "steps",
      title: { pt: "1 · Preparar o sistema", en: "1 · Prepare the system" },
      intro: {
        pt: "Antes do instalador, o Ubuntu precisa de algumas bibliotecas antigas e de uns utilitários que usaremos com a placa.",
        en: "Before the installer, Ubuntu needs a few legacy libraries and some utilities we'll use with the board.",
      },
      steps: [
        {
          title: { pt: "Dependências obrigatórias", en: "Required dependencies" },
          text: {
            pt: "Atualize a lista de pacotes e instale as bibliotecas que as ferramentas da AMD/Xilinx exigem. Sem elas, o Vivado pode abrir com erros ou nem abrir.",
            en: "Update the package list and install the libraries the AMD/Xilinx tools require. Without them, Vivado may open with errors or not open at all.",
          },
          code: cmd(
            "sudo apt update\nsudo apt install -y libtinfo5 libncurses5 libncursesw5",
            "Bibliotecas de terminal legadas exigidas pelo Vivado.",
            "Legacy terminal libraries required by Vivado."
          ),
        },
        {
          title: { pt: "Softwares de apoio", en: "Support software" },
          text: {
            pt: "Instale o git (para versionar seus projetos) e o picocom/terminator (para conversar com a placa pela porta serial UART em labs futuros).",
            en: "Install git (to version your projects) and picocom/terminator (to talk to the board over the serial UART in later labs).",
          },
          code: cmd(
            "sudo apt install -y git\nsudo apt install -y picocom\nsudo apt install -y terminator",
            "git para versionamento; picocom/terminator para a UART.",
            "git for versioning; picocom/terminator for the UART."
          ),
        },
        {
          title: { pt: "Acesso à porta serial", en: "Serial port access" },
          text: {
            pt: "Adicione seu usuário ao grupo 'dialout'. É esse grupo que dá permissão de usar as portas seriais/USB — necessário para as conexões UART com a placa.",
            en: "Add your user to the 'dialout' group. That group grants permission to use the serial/USB ports — needed for UART connections to the board.",
          },
          code: cmd(
            "sudo adduser $USER dialout",
            "Adiciona seu usuário ao grupo dialout (acesso à serial).",
            "Adds your user to the dialout group (serial access)."
          ),
          note: {
            variant: "warning",
            text: {
              pt: "A mudança de grupo só passa a valer numa nova sessão de login — e fechar/reabrir o terminal NÃO basta. Você precisa encerrar a sessão do Ubuntu inteira: clique no menu do sistema (canto superior direito) → Desligar/Encerrar sessão → 'Encerrar sessão' e entre de novo; ou simplesmente reinicie o computador. Para conferir se funcionou, abra um terminal e rode 'groups' — o nome 'dialout' deve aparecer na lista.",
              en: "The group change only takes effect in a new login session — closing/reopening the terminal is NOT enough. You must end the whole Ubuntu session: click the system menu (top-right) → Power/Log Out → 'Log Out' and log back in; or just reboot the computer. To confirm it worked, open a terminal and run 'groups' — the name 'dialout' should appear in the list.",
            },
          },
        },
      ],
    },
    {
      kind: "steps",
      title: { pt: "2 · Baixar o Vivado", en: "2 · Download Vivado" },
      intro: {
        pt: "O download exige uma conta gratuita da AMD/Xilinx. Vamos pegar o instalador web (leve) da versão 2023.1 para Linux.",
        en: "The download requires a free AMD/Xilinx account. We'll grab the light web installer for version 2023.1 for Linux.",
      },
      steps: [
        {
          text: {
            pt: "Acesse a página oficial de downloads: [xilinx.com/support/download.html](https://www.xilinx.com/support/download.html).",
            en: "Go to the official download page: [xilinx.com/support/download.html](https://www.xilinx.com/support/download.html).",
          },
        },
        {
          text: {
            pt: "No painel Version, clique em 'Vivado Archive' e escolha a versão 2023.1.",
            en: "In the Version panel, click 'Vivado Archive' and choose version 2023.1.",
          },
        },
        {
          text: {
            pt: "Baixe o 'AMD Unified Installer for FPGAs & Adaptive SoCs 2023.1: Linux Self Extracting Web Installer' (arquivo .BIN, ~266 MB).",
            en: "Download the 'AMD Unified Installer for FPGAs & Adaptive SoCs 2023.1: Linux Self Extracting Web Installer' (.BIN file, ~266 MB).",
          },
        },
        {
          text: {
            pt: "Crie uma conta (ou faça login) e clique em Download. Guarde e-mail e senha: o próprio instalador vai pedi-los para baixar o resto dos arquivos.",
            en: "Create an account (or log in) and click Download. Keep your email and password: the installer itself will ask for them to fetch the remaining files.",
          },
          note: {
            variant: "tip",
            text: {
              pt: "É o 'web installer': ele é pequeno porque baixa o resto durante a instalação, já filtrando só o que você escolher.",
              en: "It's the 'web installer': it's small because it downloads the rest during installation, fetching only what you select.",
            },
          },
        },
      ],
    },
    {
      kind: "steps",
      title: { pt: "3 · Rodar o instalador", en: "3 · Run the installer" },
      intro: {
        pt: "Aqui está o passo mais importante para não instalar 100 GB à toa: escolher só o Zynq-7000. Siga com atenção a tela de customização.",
        en: "Here's the most important step to avoid installing 100 GB for nothing: select only the Zynq-7000. Follow the customization screen carefully.",
      },
      steps: [
        {
          title: { pt: "Dar permissão e executar", en: "Make it executable and run" },
          text: {
            pt: "No terminal, na pasta onde baixou o .bin, torne-o executável e rode-o como root.",
            en: "In the terminal, in the folder where you downloaded the .bin, make it executable and run it as root.",
          },
          code: cmd(
            "chmod +x Xilinx_Unified_2023.1_*.bin\nsudo ./Xilinx_Unified_2023.1_*.bin",
            "O sudo é necessário porque a instalação vai para /tools/Xilinx.",
            "sudo is needed because the install goes to /tools/Xilinx."
          ),
        },
        {
          text: {
            pt: "Clique em Continue para ignorar o aviso de versão mais nova e Next na tela de boas-vindas.",
            en: "Click Continue to ignore the newer-version notice and Next on the welcome screen.",
          },
        },
        {
          text: {
            pt: "Preencha suas credenciais da AMD/Xilinx (as mesmas usadas para baixar). Escolha 'Download and Install Now' e clique em Next.",
            en: "Fill in your AMD/Xilinx credentials (the same used to download). Choose 'Download and Install Now' and click Next.",
          },
        },
        {
          title: { pt: "Selecionar o produto: Vitis", en: "Select the product: Vitis" },
          text: {
            pt: "Selecione a opção 'Vitis' e clique em Next. O pacote Vitis já inclui o Vivado — é assim que instalamos os dois de uma vez.",
            en: "Select the 'Vitis' option and click Next. The Vitis package already includes Vivado — that's how we install both at once.",
          },
        },
        {
          title: { pt: "Customizar: só o Zynq-7000", en: "Customize: only the Zynq-7000" },
          text: {
            pt: "Na tela de customização: em 'Design Tools', desmarque Vitis IP Cache, Vitis Model Composer e DocNav. Em 'Devices', desmarque tudo e re-selecione APENAS 'Zynq-7000' (em Devices for Custom Platforms > SoCs). Aceite as licenças e clique em Next.",
            en: "On the customization screen: under 'Design Tools', deselect Vitis IP Cache, Vitis Model Composer and DocNav. Under 'Devices', deselect everything and re-select ONLY 'Zynq-7000' (under Devices for Custom Platforms > SoCs). Accept the licenses and click Next.",
          },
          note: {
            variant: "warning",
            text: {
              pt: "Este passo derruba o tamanho da instalação de dezenas de GB para poucos. Selecionar 'tudo' pode encher o disco e levar horas.",
              en: "This step cuts the install size from tens of GB to a few. Selecting 'everything' can fill the disk and take hours.",
            },
          },
        },
        {
          title: { pt: "Destino e instalação", en: "Destination and install" },
          text: {
            pt: "Mantenha o destino padrão /tools/Xilinx e clique em Next, depois Yes para criar a pasta. Confira o resumo e clique em Install. Ao terminar, clique em OK.",
            en: "Keep the default destination /tools/Xilinx and click Next, then Yes to create the folder. Review the summary and click Install. When it finishes, click OK.",
          },
        },
      ],
    },
    {
      kind: "figure",
      figure: fig(
        img01,
        "Tela de seleção de produto do instalador, com a opção Vitis marcada.",
        "Installer product-selection screen, with the Vitis option checked.",
        "Figura 1 — Seleção do produto: marque Vitis (ele inclui o Vivado).",
        "Figure 1 — Product selection: check Vitis (it includes Vivado)."
      ),
    },
    {
      kind: "figure",
      figure: fig(
        img02,
        "Tela de customização mostrando apenas o Zynq-7000 selecionado em Devices.",
        "Customization screen showing only the Zynq-7000 selected under Devices.",
        "Figura 2 — Customização: em Devices, deixe SÓ o Zynq-7000 marcado.",
        "Figure 2 — Customization: under Devices, leave ONLY the Zynq-7000 checked."
      ),
    },
    {
      kind: "figure",
      figure: fig(
        img03,
        "Janela de resumo da instalação antes de clicar em Install.",
        "Installation summary window before clicking Install.",
        "Figura 3 — Resumo da instalação: confira o destino /tools/Xilinx.",
        "Figure 3 — Installation summary: check the /tools/Xilinx destination."
      ),
    },
    {
      kind: "figure",
      figure: fig(
        img04,
        "Mensagem de instalação concluída com sucesso.",
        "Installation completed successfully message.",
        "Figura 4 — Instalação concluída: clique em OK para finalizar.",
        "Figure 4 — Installation complete: click OK to finish."
      ),
    },
    {
      kind: "steps",
      title: { pt: "4 · Drivers de cabo e variáveis de ambiente", en: "4 · Cable drivers and environment variables" },
      intro: {
        pt: "Faltam duas coisas para o Vivado enxergar a placa e para os comandos ficarem à mão no terminal.",
        en: "Two things remain so Vivado can see the board and the commands are handy in the terminal.",
      },
      steps: [
        {
          title: { pt: "Drivers USB-JTAG", en: "USB-JTAG drivers" },
          text: {
            pt: "Instale os drivers do cabo (o canal USB-JTAG por onde o Vivado grava a placa). Entre na pasta de scripts e execute o instalador.",
            en: "Install the cable drivers (the USB-JTAG channel through which Vivado programs the board). Enter the scripts folder and run the installer.",
          },
          code: cmd(
            "cd /tools/Xilinx/Vivado/2023.1/\ncd data/xicom/cable_drivers/lin64/install_script/install_drivers/\nsudo ./install_drivers",
            "Sem esses drivers, o Hardware Manager não encontra a placa.",
            "Without these drivers, the Hardware Manager won't find the board."
          ),
        },
        {
          title: { pt: "Variáveis de ambiente", en: "Environment variables" },
          text: {
            pt: "Faça o seu terminal 'conhecer' os comandos vivado e vitis, adicionando o source dos scripts de settings ao seu ~/.bashrc e recarregando-o.",
            en: "Make your terminal 'know' the vivado and vitis commands by adding the source of the settings scripts to your ~/.bashrc and reloading it.",
          },
          code: cmd(
            "echo 'source /tools/Xilinx/Vivado/2023.1/settings64.sh' >> ~/.bashrc\necho 'source /tools/Xilinx/Vitis/2023.1/settings64.sh' >> ~/.bashrc\nsource ~/.bashrc",
            "Assim você abre o Vivado só digitando 'vivado' em qualquer terminal.",
            "Now you open Vivado just by typing 'vivado' in any terminal."
          ),
        },
      ],
    },
    {
      kind: "steps",
      title: { pt: "5 · Testar a instalação", en: "5 · Test the installation" },
      intro: {
        pt: "Vamos confirmar que Vivado e Vitis abrem — e, se você já tem a placa, que ela é reconhecida.",
        en: "Let's confirm Vivado and Vitis open — and, if you already have the board, that it's recognized.",
      },
      steps: [
        {
          text: {
            pt: "No terminal, digite vivado. A tela de boas-vindas do Vivado deve abrir (Figura 5).",
            en: "In the terminal, type vivado. The Vivado welcome screen should open (Figure 5).",
          },
          code: cmd("vivado", "Abre a interface gráfica do Vivado.", "Opens the Vivado GUI."),
        },
        {
          title: { pt: "(Opcional) Testar a placa", en: "(Optional) Test the board" },
          text: {
            pt: "Se tiver a placa, conecte o cabo na interface PROG/USB-JTAG e ligue-a. Em Vivado, clique em Open Hardware Manager → Open Target → Auto Connect. A aba Hardware deve preencher com a árvore JTAG do dispositivo (Figura 6).",
            en: "If you have the board, connect the cable to the PROG/USB-JTAG interface and power it on. In Vivado, click Open Hardware Manager → Open Target → Auto Connect. The Hardware tab should fill with the device's JTAG tree (Figure 6).",
          },
        },
        {
          text: {
            pt: "Feche o Vivado e teste o Vitis: digite vitis no terminal. A interface do Vitis deve abrir.",
            en: "Close Vivado and test Vitis: type vitis in the terminal. The Vitis interface should open.",
          },
          code: cmd("vitis", "Confirma que o Vitis também está no PATH.", "Confirms Vitis is on the PATH too."),
        },
      ],
    },
    {
      kind: "figure",
      figure: fig(
        img05,
        "Tela de boas-vindas do Vivado após a instalação.",
        "Vivado welcome screen after installation.",
        "Figura 5 — Vivado abriu: a instalação funcionou.",
        "Figure 5 — Vivado opened: the install worked."
      ),
    },
    {
      kind: "figure",
      figure: fig(
        img06,
        "Aba Hardware do Vivado com a árvore JTAG da ZedBoard conectada.",
        "Vivado Hardware tab with the connected ZedBoard JTAG tree.",
        "Figura 6 — Placa reconhecida: a árvore JTAG aparece no Hardware Manager.",
        "Figure 6 — Board recognized: the JTAG tree appears in the Hardware Manager."
      ),
    },
    {
      kind: "steps",
      title: { pt: "6 · Atalhos na área de trabalho (opcional)", en: "6 · Desktop shortcuts (optional)" },
      intro: {
        pt: "Para não depender do terminal, crie atalhos de aplicativo para Vivado e Vitis.",
        en: "To avoid relying on the terminal, create application shortcuts for Vivado and Vitis.",
      },
      steps: [
        {
          text: {
            pt: "Crie o arquivo ~/.local/share/applications/vivado.desktop com o conteúdo abaixo.",
            en: "Create the file ~/.local/share/applications/vivado.desktop with the content below.",
          },
          code: {
            language: "text",
            filename: "vivado.desktop",
            code: {
              pt: `[Desktop Entry]
Encoding=UTF-8
Type=Application
Name=Vivado 2023.1
Icon=/tools/Xilinx/Vivado/2023.1/doc/images/vivado_logo.png
Exec=/tools/Xilinx/Vivado/2023.1/bin/vivado`,
              en: `[Desktop Entry]
Encoding=UTF-8
Type=Application
Name=Vivado 2023.1
Icon=/tools/Xilinx/Vivado/2023.1/doc/images/vivado_logo.png
Exec=/tools/Xilinx/Vivado/2023.1/bin/vivado`,
            },
          },
        },
        {
          text: {
            pt: "Crie também ~/.local/share/applications/vitis.desktop de forma análoga.",
            en: "Also create ~/.local/share/applications/vitis.desktop in the same way.",
          },
          code: {
            language: "text",
            filename: "vitis.desktop",
            code: {
              pt: `[Desktop Entry]
Encoding=UTF-8
Type=Application
Name=Vitis 2023.1
Icon=/tools/Xilinx/Vitis/2023.1/doc/images/ide_icon.png
Exec=/tools/Xilinx/Vitis/2023.1/bin/vitis`,
              en: `[Desktop Entry]
Encoding=UTF-8
Type=Application
Name=Vitis 2023.1
Icon=/tools/Xilinx/Vitis/2023.1/doc/images/ide_icon.png
Exec=/tools/Xilinx/Vitis/2023.1/bin/vitis`,
            },
          },
        },
        {
          text: {
            pt: "Abra o menu de Aplicativos, clique com o botão direito no ícone do Vivado/Vitis e escolha 'Add to Favorites' para fixá-los na barra lateral do Ubuntu.",
            en: "Open the Applications menu, right-click the Vivado/Vitis icon and choose 'Add to Favorites' to pin them to the Ubuntu side bar.",
          },
        },
      ],
    },

    {
      kind: "prose",
      label: { pt: "Na prática", en: "In practice" },
      title: { pt: "As etapas dentro do Vivado", en: "The stages inside Vivado" },
      text: {
        pt: "Com o Vivado aberto, o fluxo que vimos ganha nome e lugar na tela — tudo pelo 'Flow Navigator', a coluna à esquerda. Um ponto merece atenção especial: a simulação existe em MAIS DE UM momento do fluxo, não só no começo. A behavioral (RTL) valida a lógica antes de sintetizar; a pós-síntese confirma que a síntese não mudou o comportamento; e a pós-implementação com timing usa os atrasos reais do chip, sendo a mais fiel ao que vai acontecer na placa. Cada uma pega o circuito num estágio mais próximo do hardware e o testa ali — quanto mais tarde o erro aparece, mais caro é corrigir, por isso simular cedo (e nos pontos certos) economiza muito tempo. As demais etapas (síntese, implementação, bitstream, programação) encadeiam o resultado uma na outra até chegar ao chip. Explore o fluxo abaixo: clique em cada etapa para ver o que ela faz, a simulação associada, onde fica no Vivado e por que importa.",
        en: "With Vivado open, the flow we saw gets a name and a place on screen — all through the 'Flow Navigator', the left-hand column. One point deserves special attention: simulation happens at MORE THAN ONE moment of the flow, not just at the start. Behavioral (RTL) validates the logic before synthesizing; post-synthesis confirms synthesis didn't change the behavior; and post-implementation timing uses the chip's real delays, being the most faithful to what will happen on the board. Each one takes the circuit at a stage closer to hardware and tests it there — the later an error shows up, the costlier it is to fix, so simulating early (and at the right points) saves a lot of time. The other stages (synthesis, implementation, bitstream, programming) chain each result into the next until it reaches the chip. Explore the flow below: click each stage to see what it does, its associated simulation, where it lives in Vivado and why it matters.",
      },
    },
    {
      kind: "playground",
      title: { pt: "O fluxo no Vivado, etapa por etapa", en: "The Vivado flow, stage by stage" },
      intro: {
        pt: "Clique nas etapas para percorrer o caminho do RTL até a placa, com a função de cada uma e o comando correspondente no Vivado.",
        en: "Click the stages to walk the path from RTL to the board, with each one's role and the matching Vivado command.",
      },
      instrument: { component: "DevFlow" },
    },

    {
      kind: "checklist",
      title: { pt: "Antes de seguir para o Lab 1", en: "Before moving to Lab 1" },
      items: [
        {
          pt: "Sei explicar, em uma frase, a diferença entre um FPGA e um processador.",
          en: "I can explain, in one sentence, the difference between an FPGA and a processor.",
        },
        {
          pt: "Reconheço na ZedBoard as chaves, os LEDs, o clock de 100 MHz e o codec de áudio.",
          en: "I can spot the switches, LEDs, 100 MHz clock and audio codec on the ZedBoard.",
        },
        {
          pt: "Sei nomear as etapas do fluxo (RTL, simulação, síntese, implementação, bitstream, programar).",
          en: "I can name the flow's stages (RTL, simulation, synthesis, implementation, bitstream, program).",
        },
        {
          pt: "Instalei o Vivado ML 2023.1, rodei 'vivado' e a tela de boas-vindas abriu.",
          en: "I installed Vivado ML 2023.1, ran 'vivado' and the welcome screen opened.",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Cheque seu entendimento", en: "Check your understanding" },
      quizzes: [
        {
          question: {
            pt: "Qual é a diferença essencial entre programar uma CPU e configurar um FPGA?",
            en: "What is the essential difference between programming a CPU and configuring an FPGA?",
          },
          options: [
            { pt: "Não há diferença", en: "There's no difference" },
            { pt: "O FPGA é sempre mais lento", en: "The FPGA is always slower" },
            {
              pt: "Na CPU você escreve software que roda num hardware fixo; no FPGA você descreve o próprio hardware",
              en: "On a CPU you write software that runs on fixed hardware; on an FPGA you describe the hardware itself",
            },
            { pt: "A CPU não usa clock", en: "The CPU doesn't use a clock" },
          ],
          correctIndex: 2,
          solution: [
            {
              text: {
                pt: "A CPU executa instruções em sequência sobre um hardware que não muda. No FPGA, você descreve um circuito e o chip 'vira' esse circuito — o que permite paralelismo real e tempo previsível.",
                en: "The CPU runs instructions in sequence on hardware that doesn't change. On an FPGA, you describe a circuit and the chip 'becomes' it — enabling real parallelism and predictable timing.",
              },
            },
          ],
        },
        {
          question: {
            pt: "Na customização do instalador, por que selecionamos apenas o Zynq-7000?",
            en: "In the installer customization, why do we select only the Zynq-7000?",
          },
          options: [
            { pt: "Porque os outros são pagos", en: "Because the others cost money" },
            { pt: "Porque o Vivado exige", en: "Because Vivado requires it" },
            { pt: "Por acaso", en: "By chance" },
            {
              pt: "Porque é a família do chip da ZedBoard — evita baixar dezenas de GB de dispositivos que não usaremos",
              en: "Because it's the ZedBoard chip's family — it avoids downloading tens of GB of devices we won't use",
            },
          ],
          correctIndex: 3,
          solution: [
            {
              text: {
                pt: "A ZedBoard usa um Zynq-7000 (XC7Z020). Instalar suporte só a essa família reduz drasticamente o tamanho e o tempo da instalação, sem perder nada do que precisamos.",
                en: "The ZedBoard uses a Zynq-7000 (XC7Z020). Installing support for only that family drastically cuts the install size and time, without losing anything we need.",
              },
            },
          ],
        },
      ],
    },
    {
      kind: "prose",
      label: { pt: "O que vem a seguir", en: "What comes next" },
      title: { pt: "Pronto para o primeiro projeto", en: "Ready for the first project" },
      text: {
        pt: "Você já sabe o que é um FPGA, conhece a ZedBoard, entende o fluxo de desenvolvimento e tem o Vivado instalado e testado. É tudo que precisávamos para colocar a mão na massa. No Lab 1 criamos, do zero, o seu primeiro projeto no Vivado — e percorremos o fluxo inteiro, do Verilog ao bitstream, fazendo as chaves da placa acenderem os LEDs.",
        en: "You now know what an FPGA is, you've met the ZedBoard, you understand the development flow and you have Vivado installed and tested. That's everything we needed to get hands-on. In Lab 1 we create, from scratch, your first Vivado project — and walk the whole flow, from Verilog to bitstream, making the board's switches light up the LEDs.",
      },
    },
  ],
};
