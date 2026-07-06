import type { Lab } from "./labTypes.ts";

export const lab2: Lab = {
  id: 2,
  labLabel: { pt: "Lab 2", en: "Lab 2" },
  title: {
    pt: "Lógica sequencial: clock e contador",
    en: "Sequential logic: clock and counter",
  },
  goal: {
    pt: "Dar ao circuito uma noção de tempo: usar o clock de 100 MHz para criar um registrador, dividir o clock, piscar um LED e contar em binário nos 8 LEDs.",
    en: "Give the circuit a sense of time: use the 100 MHz clock to build a register, divide the clock, blink an LED and count in binary on the 8 LEDs.",
  },
  duration: { pt: "60–75 min", en: "60–75 min" },
  prereqs: [
    {
      pt: "Ter feito o Lab 1 e saber rodar o fluxo Vivado (síntese → bitstream → gravar).",
      en: "Having done Lab 1 and knowing how to run the Vivado flow (synthesis → bitstream → program).",
    },
  ],
  sections: [
    {
      kind: "prose",
      label: { pt: "Objetivo", en: "Goal" },
      title: { pt: "O ingrediente que faltava: o tempo", en: "The missing ingredient: time" },
      text: {
        pt: "No Lab 1 a saída seguia a entrada instantaneamente — não havia passado nem futuro. Circuitos assim não conseguem contar, lembrar ou piscar, porque não têm memória. Neste lab adicionamos o tempo através do clock: um sinal que bate 100 milhões de vezes por segundo e marca o ritmo do circuito. Com ele, vamos construir um registrador (a célula de memória do hardware), dividir o clock para uma velocidade visível, piscar um LED e fazer os 8 LEDs contarem em binário.",
        en: "In Lab 1 the output followed the input instantly — there was no past or future. Circuits like that can't count, remember or blink, because they have no memory. In this lab we add time through the clock: a signal that ticks 100 million times per second and sets the circuit's rhythm. With it, we'll build a register (hardware's memory cell), divide the clock down to a visible speed, blink an LED and make the 8 LEDs count in binary.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Conceito", en: "Concept" },
      title: { pt: "Registrador e a borda de subida", en: "The register and the rising edge" },
      text: {
        pt: "Um registrador (flip-flop) é um bit que guarda seu valor até receber ordem de mudar. Essa ordem chega na borda de subida do clock — o instante em que o sinal passa de 0 para 1. Em Verilog escrevemos 'always @(posedge clk)': o bloco só age nesse instante. Entre uma borda e outra, o valor fica congelado. É essa capacidade de 'segurar' um valor no tempo que dá memória ao circuito — e memória é o que separa somar de acumular, seguir de contar.",
        en: "A register (flip-flop) is a bit that holds its value until it's told to change. That order arrives on the clock's rising edge — the instant the signal goes from 0 to 1. In Verilog we write 'always @(posedge clk)': the block only acts at that instant. Between edges, the value is frozen. This ability to 'hold' a value over time is what gives the circuit memory — and memory is what separates adding from accumulating, following from counting.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Motivação", en: "Motivation" },
      title: { pt: "100 MHz é rápido demais para o olho", en: "100 MHz is too fast for the eye" },
      text: {
        pt: "Se ligássemos um LED direto ao clock, ele piscaria 100 milhões de vezes por segundo — seu olho veria apenas um LED meio aceso. Precisamos DIVIDIR o clock até uma taxa visível. O truque é um contador: o bit N de um contador alimentado a 100 MHz é uma onda quadrada em f = 100 MHz / 2ᴺ. Escolhendo N grande o suficiente, chegamos a poucos hertz. (Repare: dividir o clock por 2ᴺ é reduzir a taxa do pulso do relógio — a mesma ideia do downsampler ↓D da Aula 2, só que aplicada ao relógio em vez de a um sinal.)",
        en: "If we wired an LED straight to the clock, it would blink 100 million times per second — your eye would see just a dimly-lit LED. We need to DIVIDE the clock down to a visible rate. The trick is a counter: bit N of a counter clocked at 100 MHz is a square wave at f = 100 MHz / 2ᴺ. Pick N large enough and you reach a few hertz. (Notice: dividing the clock by 2ᴺ lowers the rate of the clock tick — the same idea as Lecture 2's ↓D downsampler, applied to the clock rather than to a signal.)",
      },
    },
    {
      kind: "playground",
      title: { pt: "Calculadora do divisor de clock", en: "Clock-divider calculator" },
      intro: {
        pt: "Deslize o bit N do contador e veja a frequência de pisca cair de MHz para Hz. Ache um N que dê algo em torno de 1 Hz — é o valor que usaremos no pisca-LED.",
        en: "Slide the counter bit N and watch the blink frequency drop from MHz to Hz. Find an N that gives around 1 Hz — that's the value we'll use in the blinker.",
      },
      instrument: { component: "ClockDividerCalc" },
    },
    {
      kind: "code",
      title: { pt: "Pisca-LED", en: "Blinking LED" },
      intro: {
        pt: "O primeiro circuito sequencial: um contador de 26 bits, e o bit mais alto pisca o LED0 a ~1,5 Hz.",
        en: "The first sequential circuit: a 26-bit counter, and its top bit blinks LED0 at ~1.5 Hz.",
      },
      block: {
        language: "verilog",
        filename: "top.v",
        code: {
          pt: `module top (
    input  wire       clk,   // clock de 100 MHz (pino Y9)
    output wire [7:0] led
);
    // Contador livre de 26 bits. Comeca em 0 e soma 1 a cada borda.
    reg [25:0] count = 0;
    always @(posedge clk)
        count <= count + 1'b1;   // '<=' : atribuicao nao-bloqueante

    assign led[0]   = count[25]; // bit 25 -> ~1,5 Hz (100e6 / 2^26)
    assign led[7:1] = 7'b0;      // demais LEDs apagados
endmodule`,
          en: `module top (
    input  wire       clk,   // 100 MHz clock (pin Y9)
    output wire [7:0] led
);
    // Free-running 26-bit counter. Starts at 0 and adds 1 every edge.
    reg [25:0] count = 0;
    always @(posedge clk)
        count <= count + 1'b1;   // '<=' : non-blocking assignment

    assign led[0]   = count[25]; // bit 25 -> ~1.5 Hz (100e6 / 2^26)
    assign led[7:1] = 7'b0;      // other LEDs off
endmodule`,
        },
        caption: {
          pt: "O contador nunca para; usamos só o bit 25 dele como 'clock lento' do LED.",
          en: "The counter never stops; we use just its bit 25 as the LED's 'slow clock'.",
        },
      },
    },
    {
      kind: "callout",
      variant: "warning",
      title: { pt: "Use '<=' em blocos com clock", en: "Use '<=' in clocked blocks" },
      text: {
        pt: "Dentro de 'always @(posedge clk)', use sempre a atribuição não-bloqueante '<=' (e não '='). Ela descreve registradores que atualizam todos juntos na borda do clock — que é como o hardware realmente funciona. Misturar '=' aqui é uma das fontes mais comuns de bugs sutis em Verilog.",
        en: "Inside 'always @(posedge clk)', always use the non-blocking assignment '<=' (not '='). It describes registers that all update together on the clock edge — which is how the hardware actually behaves. Mixing '=' here is one of the most common sources of subtle Verilog bugs.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Subindo de nível", en: "Leveling up" },
      title: { pt: "De piscar para contar", en: "From blinking to counting" },
      text: {
        pt: "Piscar usa 1 bit. Contar usa vários. A ideia: gerar um 'tique' lento (por exemplo, a cada 0,5 s) e, a cada tique, somar 1 num contador de 8 bits mostrado nos LEDs. São dois registradores trabalhando juntos: um divisor, que conta ciclos do clock até completar meio segundo, e o contador visível, que anda um passo por tique. Você vai ver os 8 LEDs contarem 0, 1, 2, 3… em binário.",
        en: "Blinking uses 1 bit. Counting uses several. The idea: generate a slow 'tick' (say, every 0.5 s) and, on each tick, add 1 to an 8-bit counter shown on the LEDs. Two registers work together: a divider that counts clock cycles until half a second passes, and the visible counter that steps once per tick. You'll watch the 8 LEDs count 0, 1, 2, 3… in binary.",
      },
    },
    {
      kind: "code",
      title: { pt: "Contador binário nos 8 LEDs", en: "8-bit binary counter on the LEDs" },
      intro: {
        pt: "Um divisor gera um tique a cada 0,5 s; o contador de 8 bits anda um passo por tique.",
        en: "A divider makes a tick every 0.5 s; the 8-bit counter steps once per tick.",
      },
      block: {
        language: "verilog",
        filename: "top.v",
        code: {
          pt: `module top (
    input  wire       clk,   // 100 MHz (pino Y9)
    output reg  [7:0] led = 0
);
    // 0,5 s a 100 MHz = 50.000.000 ciclos. Precisa de 26 bits.
    reg [25:0] div = 0;

    always @(posedge clk) begin
        if (div == 26'd49_999_999) begin
            div <= 0;            // reinicia o divisor
            led <= led + 1'b1;   // um passo do contador visivel
        end else begin
            div <= div + 1'b1;   // ainda contando ate 0,5 s
        end
    end
endmodule`,
          en: `module top (
    input  wire       clk,   // 100 MHz (pin Y9)
    output reg  [7:0] led = 0
);
    // 0.5 s at 100 MHz = 50,000,000 cycles. Needs 26 bits.
    reg [25:0] div = 0;

    always @(posedge clk) begin
        if (div == 26'd49_999_999) begin
            div <= 0;            // restart the divider
            led <= led + 1'b1;   // one step of the visible counter
        end else begin
            div <= div + 1'b1;   // still counting up to 0.5 s
        end
    end
endmodule`,
        },
        caption: {
          pt: "O LED0 é o bit menos significativo: ele troca a cada 0,5 s; o LED7, a cada 64 s.",
          en: "LED0 is the least significant bit: it flips every 0.5 s; LED7, every 64 s.",
        },
      },
    },
    {
      kind: "code",
      title: { pt: "XDC: adicionar o clock", en: "XDC: add the clock" },
      intro: {
        pt: "Reaproveite as 8 linhas dos LEDs do Lab 1 e acrescente o clock. O create_clock informa ao Vivado que o pino Y9 é um relógio de 100 MHz (período de 10 ns).",
        en: "Reuse the 8 LED lines from Lab 1 and add the clock. The create_clock tells Vivado that pin Y9 is a 100 MHz clock (10 ns period).",
      },
      block: {
        language: "xdc",
        filename: "zedboard_lab2.xdc",
        code: {
          pt: `## Clock de 100 MHz (GCLK, Bank 13, fixo em 3,3 V)
set_property -dict { PACKAGE_PIN Y9 IOSTANDARD LVCMOS33 } [get_ports { clk }]
create_clock -name sys_clk -period 10.000 [get_ports { clk }]

## LEDs LD0..LD7 -> led[0..7]  (iguais aos do Lab 1, Bank 33)
set_property -dict { PACKAGE_PIN T22 IOSTANDARD LVCMOS33 } [get_ports { led[0] }]
set_property -dict { PACKAGE_PIN T21 IOSTANDARD LVCMOS33 } [get_ports { led[1] }]
set_property -dict { PACKAGE_PIN U22 IOSTANDARD LVCMOS33 } [get_ports { led[2] }]
set_property -dict { PACKAGE_PIN U21 IOSTANDARD LVCMOS33 } [get_ports { led[3] }]
set_property -dict { PACKAGE_PIN V22 IOSTANDARD LVCMOS33 } [get_ports { led[4] }]
set_property -dict { PACKAGE_PIN W22 IOSTANDARD LVCMOS33 } [get_ports { led[5] }]
set_property -dict { PACKAGE_PIN U19 IOSTANDARD LVCMOS33 } [get_ports { led[6] }]
set_property -dict { PACKAGE_PIN U14 IOSTANDARD LVCMOS33 } [get_ports { led[7] }]`,
          en: `## 100 MHz clock (GCLK, Bank 13, fixed at 3.3 V)
set_property -dict { PACKAGE_PIN Y9 IOSTANDARD LVCMOS33 } [get_ports { clk }]
create_clock -name sys_clk -period 10.000 [get_ports { clk }]

## LEDs LD0..LD7 -> led[0..7]  (same as Lab 1, Bank 33)
set_property -dict { PACKAGE_PIN T22 IOSTANDARD LVCMOS33 } [get_ports { led[0] }]
set_property -dict { PACKAGE_PIN T21 IOSTANDARD LVCMOS33 } [get_ports { led[1] }]
set_property -dict { PACKAGE_PIN U22 IOSTANDARD LVCMOS33 } [get_ports { led[2] }]
set_property -dict { PACKAGE_PIN U21 IOSTANDARD LVCMOS33 } [get_ports { led[3] }]
set_property -dict { PACKAGE_PIN V22 IOSTANDARD LVCMOS33 } [get_ports { led[4] }]
set_property -dict { PACKAGE_PIN W22 IOSTANDARD LVCMOS33 } [get_ports { led[5] }]
set_property -dict { PACKAGE_PIN U19 IOSTANDARD LVCMOS33 } [get_ports { led[6] }]
set_property -dict { PACKAGE_PIN U14 IOSTANDARD LVCMOS33 } [get_ports { led[7] }]`,
        },
        caption: {
          pt: "Sem o create_clock o projeto até funciona, mas o Vivado não consegue verificar o tempo.",
          en: "Without create_clock the project still works, but Vivado can't check timing.",
        },
      },
    },
    {
      kind: "steps",
      title: { pt: "Construir e observar", en: "Build and observe" },
      intro: {
        pt: "O fluxo é o mesmo do Lab 1 — só muda o conteúdo. Faça primeiro o pisca-LED, depois troque pelo contador.",
        en: "The flow is the same as Lab 1 — only the content changes. Do the blinker first, then swap in the counter.",
      },
      steps: [
        {
          text: {
            pt: "Crie um projeto lab2_counter (part xc7z020clg484-1) e adicione o top.v do pisca-LED e o zedboard_lab2.xdc.",
            en: "Create a lab2_counter project (part xc7z020clg484-1) and add the blinker top.v and zedboard_lab2.xdc.",
          },
        },
        {
          text: {
            pt: "Rode Síntese → Implementação → Generate Bitstream → Program Device, como no Lab 1. O LED0 deve piscar cerca de uma vez por segundo.",
            en: "Run Synthesis → Implementation → Generate Bitstream → Program Device, as in Lab 1. LED0 should blink about once per second.",
          },
        },
        {
          title: { pt: "Trocar para o contador", en: "Swap in the counter" },
          text: {
            pt: "Substitua o conteúdo do top.v pelo contador de 8 bits, gere o bitstream de novo e regrave. Agora os 8 LEDs contam em binário, com o LED0 trocando mais rápido.",
            en: "Replace the top.v content with the 8-bit counter, regenerate the bitstream and reprogram. Now the 8 LEDs count in binary, with LED0 flipping fastest.",
          },
          note: {
            variant: "tip",
            text: {
              pt: "Quer contar mais rápido ou mais devagar? Mude o número 49.999.999 no divisor: metade dele dobra a velocidade.",
              en: "Want to count faster or slower? Change the 49,999,999 in the divider: halving it doubles the speed.",
            },
          },
        },
      ],
    },
    {
      kind: "prose",
      label: { pt: "Entrada limpa", en: "Clean input" },
      title: { pt: "E se um botão controlar o contador?", en: "What if a button drives the counter?" },
      text: {
        pt: "Um passo natural é fazer o contador andar a cada clique de um botão, em vez de sozinho. Mas botões mecânicos 'quicam': ao pressionar, o contato abre e fecha várias vezes em poucos milissegundos, e o contador saltaria vários números de uma vez. A solução é o debounce: amostrar o botão devagar (ou esperar ele ficar estável) antes de aceitar a mudança. É, mais uma vez, a ideia de amostrar um sinal numa taxa adequada — só que agora para limpar ruído mecânico.",
        en: "A natural next step is to make the counter advance on each press of a button, instead of on its own. But mechanical buttons 'bounce': on a press, the contact opens and closes several times within a few milliseconds, and the counter would jump several numbers at once. The fix is debounce: sample the button slowly (or wait for it to settle) before accepting the change. It's, once again, the idea of sampling a signal at a suitable rate — this time to clean mechanical noise.",
      },
    },
    {
      kind: "code",
      title: { pt: "Contador com debounce por botão", en: "Button counter with debounce" },
      intro: {
        pt: "Gera um tique lento (~4 ms), amostra o botão nesse ritmo e conta uma unidade a cada NOVO pressionamento (borda).",
        en: "Generates a slow tick (~4 ms), samples the button at that rate and counts one unit on each NEW press (edge).",
      },
      block: {
        language: "verilog",
        filename: "top.v",
        code: {
          pt: `module top (
    input  wire       clk,   // 100 MHz (Y9)
    input  wire       btn,   // botao (ex.: BTNC, pino P16)
    output reg  [7:0] led = 0
);
    reg [18:0] slow = 0;     // divisor: ~4 ms (2^19 / 100 MHz)
    reg        btn_s = 0;    // botao amostrado no ritmo lento
    reg        btn_prev = 0; // amostra anterior (para detectar a borda)

    always @(posedge clk) begin
        slow <= slow + 1'b1;
        if (slow == 0) begin           // uma vez por periodo lento
            btn_s    <= btn;           // amostra o botao ja estavel
            btn_prev <= btn_s;
            if (btn_s && !btn_prev)     // borda de subida limpa
                led <= led + 1'b1;      // conta +1 por clique
        end
    end
endmodule`,
          en: `module top (
    input  wire       clk,   // 100 MHz (Y9)
    input  wire       btn,   // button (e.g. BTNC, pin P16)
    output reg  [7:0] led = 0
);
    reg [18:0] slow = 0;     // divider: ~4 ms (2^19 / 100 MHz)
    reg        btn_s = 0;    // button sampled at the slow rate
    reg        btn_prev = 0; // previous sample (to detect the edge)

    always @(posedge clk) begin
        slow <= slow + 1'b1;
        if (slow == 0) begin           // once per slow period
            btn_s    <= btn;           // sample the now-settled button
            btn_prev <= btn_s;
            if (btn_s && !btn_prev)     // clean rising edge
                led <= led + 1'b1;      // count +1 per press
        end
    end
endmodule`,
        },
        caption: {
          pt: "Amostrar devagar 'joga fora' o repique rápido do contato; só a borda estável conta.",
          en: "Sampling slowly 'throws away' the fast contact bounce; only the settled edge counts.",
        },
      },
    },
    {
      kind: "callout",
      variant: "tip",
      title: { pt: "Adicione o botão no XDC", en: "Add the button in the XDC" },
      text: {
        pt: "Para a versão com botão, acrescente ao XDC a linha do BTNC (Bank 34, VADJ): set_property -dict { PACKAGE_PIN P16 IOSTANDARD LVCMOS18 } [get_ports { btn }]. Lembre-se: botões e chaves estão nos bancos do VADJ (1,8 V por padrão), diferente dos LEDs.",
        en: "For the button version, add the BTNC line to the XDC (Bank 34, VADJ): set_property -dict { PACKAGE_PIN P16 IOSTANDARD LVCMOS18 } [get_ports { btn }]. Remember: buttons and switches are on the VADJ banks (1.8 V by default), unlike the LEDs.",
      },
    },
    {
      kind: "checklist",
      title: { pt: "Antes de seguir para o Lab 3", en: "Before moving to Lab 3" },
      items: [
        {
          pt: "Meu pisca-LED funcionou e sei que a frequência vem de f = 100 MHz / 2ᴺ.",
          en: "My blinker worked and I know the frequency comes from f = 100 MHz / 2ᴺ.",
        },
        {
          pt: "Meus 8 LEDs contaram em binário; sei mudar a velocidade pelo valor do divisor.",
          en: "My 8 LEDs counted in binary; I know how to change the speed via the divider value.",
        },
        {
          pt: "Sei explicar por que se usa '<=' (não-bloqueante) dentro de always @(posedge clk).",
          en: "I can explain why we use '<=' (non-blocking) inside always @(posedge clk).",
        },
        {
          pt: "Entendo o que é o repique (bounce) de um botão e como o debounce o resolve.",
          en: "I understand what button bounce is and how debounce solves it.",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Cheque seu entendimento", en: "Check your understanding" },
      quizzes: [
        {
          question: {
            pt: "Por que não ligamos o LED diretamente no clock de 100 MHz?",
            en: "Why don't we wire the LED straight to the 100 MHz clock?",
          },
          options: [
            { pt: "Queimaria o LED", en: "It would burn the LED out" },
            {
              pt: "Ele piscaria rápido demais para o olho ver — parece só meio aceso",
              en: "It would blink far too fast for the eye — it just looks half-lit",
            },
            { pt: "O clock não chega aos LEDs", en: "The clock can't reach the LEDs" },
            { pt: "Verilog não permite", en: "Verilog doesn't allow it" },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "A 100 MHz o LED trocaria de estado 100 milhões de vezes por segundo. Dividimos o clock (via bit alto de um contador) até uns poucos hertz para o pisca ficar visível.",
                en: "At 100 MHz the LED would toggle 100 million times per second. We divide the clock (via a counter's high bit) down to a few hertz so the blink is visible.",
              },
            },
          ],
        },
        {
          question: {
            pt: "No contador de 8 LEDs, qual LED troca de estado com MENOS frequência?",
            en: "In the 8-LED counter, which LED changes state LEAST often?",
          },
          options: [
            { pt: "O LED0 (bit menos significativo)", en: "LED0 (least significant bit)" },
            { pt: "O LED7 (bit mais significativo)", en: "LED7 (most significant bit)" },
            { pt: "Todos trocam juntos", en: "They all change together" },
            { pt: "Nenhum troca", en: "None of them change" },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "Num contador binário, cada bit mais alto troca na metade da frequência do anterior. O LED7 (bit 7) é o mais lento — troca a cada 2⁷ = 128 tiques, ou 64 s no nosso divisor de 0,5 s.",
                en: "In a binary counter, each higher bit flips at half the frequency of the one below. LED7 (bit 7) is the slowest — it flips every 2⁷ = 128 ticks, or 64 s with our 0.5 s divider.",
              },
            },
          ],
        },
      ],
    },
    {
      kind: "prose",
      label: { pt: "O que vem a seguir", en: "What comes next" },
      title: { pt: "Do contador ao processamento de sinais", en: "From a counter to signal processing" },
      text: {
        pt: "Você já tem os três blocos fundamentais: entradas/saídas (Lab 1), clock e registradores (Lab 2). Um registrador que guarda a amostra anterior de um sinal é exatamente o atraso z⁻¹ da teoria. Encadeando alguns desses atrasos e somando com pesos, você tem a convolução v(n) = Σ h(k)·x(n−k) — ou seja, um filtro FIR, o coração do processamento digital de sinais. É isso que construímos no Lab 3, e vamos verificá-lo por simulação antes de pensar em áudio real.",
        en: "You now have the three fundamental pieces: inputs/outputs (Lab 1), clock and registers (Lab 2). A register that stores the previous sample of a signal is exactly the theory's z⁻¹ delay. Chain a few of those delays and add them up with weights, and you have the convolution v(n) = Σ h(k)·x(n−k) — that is, a FIR filter, the heart of digital signal processing. That's what we build in Lab 3, and we'll verify it in simulation before thinking about real audio.",
      },
    },
  ],
};
