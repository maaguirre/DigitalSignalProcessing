import type { Lab } from "./labTypes.ts";

export const lab3: Lab = {
  id: 3,
  labLabel: { pt: "Lab 3", en: "Lab 3" },
  title: { pt: "Rumo ao DSP: um filtro FIR", en: "Toward DSP: a FIR filter" },
  goal: {
    pt: "Escrever um filtro FIR de média móvel em Verilog e verificá-lo por simulação (testbench + forma de onda), ligando o hardware à teoria de filtragem e amostragem do curso.",
    en: "Write a moving-average FIR filter in Verilog and verify it in simulation (testbench + waveform), tying the hardware to the course's filtering and sampling theory.",
  },
  duration: { pt: "60–90 min", en: "60–90 min" },
  prereqs: [
    {
      pt: "Ter feito o Lab 2 (clock, registradores, atribuição não-bloqueante).",
      en: "Having done Lab 2 (clock, registers, non-blocking assignment).",
    },
    {
      pt: "Ter visto, na teoria, a ideia de filtro FIR e de atraso z⁻¹.",
      en: "Having seen, in theory, the idea of a FIR filter and the z⁻¹ delay.",
    },
  ],
  sections: [
    {
      kind: "prose",
      label: { pt: "Objetivo", en: "Goal" },
      title: { pt: "A teoria vira hardware", en: "The theory becomes hardware" },
      text: {
        pt: "Até aqui acendemos LEDs e contamos. Agora damos o salto que dá nome ao curso: processar um sinal. Vamos construir o filtro FIR mais simples e intuitivo — a média móvel — em Verilog, e verificá-lo por simulação no Vivado, lendo a forma de onda. Você vai ver, na prática, que a linha de atrasos do hardware é literalmente a cadeia de z⁻¹ da teoria, e que tirar a média das últimas amostras suaviza o sinal: é um filtro passa-baixas.",
        en: "So far we've lit LEDs and counted. Now we take the leap that gives the course its name: processing a signal. We'll build the simplest, most intuitive FIR filter — the moving average — in Verilog, and verify it in Vivado simulation by reading the waveform. You'll see, hands-on, that the hardware's delay line is literally the theory's chain of z⁻¹, and that averaging the last few samples smooths the signal: it's a low-pass filter.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Conceito", en: "Concept" },
      title: { pt: "A média móvel é um FIR", en: "The moving average is a FIR" },
      text: {
        pt: "Um filtro FIR calcula a saída como uma soma ponderada das últimas amostras da entrada: y[n] = b₀·x[n] + b₁·x[n−1] + … + b_{M}·x[n−M]. A média móvel de 4 pontos é o caso em que todos os pesos são iguais a 1/4: y[n] = (x[n] + x[n−1] + x[n−2] + x[n−3]) / 4. Cada x[n−k] é a entrada atrasada de k amostras — o famoso z⁻ᵏ. Em hardware, 'atrasar uma amostra' é exatamente um registrador: guarda o valor de agora para entregá-lo no próximo clock.",
        en: "A FIR filter computes the output as a weighted sum of the input's last samples: y[n] = b₀·x[n] + b₁·x[n−1] + … + b_{M}·x[n−M]. The 4-point moving average is the case where all weights equal 1/4: y[n] = (x[n] + x[n−1] + x[n−2] + x[n−3]) / 4. Each x[n−k] is the input delayed by k samples — the famous z⁻ᵏ. In hardware, 'delay by one sample' is exactly a register: it holds today's value to hand it over on the next clock.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Ponto fixo", en: "Fixed point" },
      title: { pt: "Números inteiros, vírgula implícita", en: "Whole numbers, an implied point" },
      text: {
        pt: "O FPGA não tem 'float' de graça: trabalhamos com inteiros com sinal (aritmética de ponto fixo). As amostras são inteiros de 16 bits com sinal (−32768 a 32767). A divisão por 4 vira um deslocamento aritmético à direita de 2 bits ('>>> 2'), que preserva o sinal. Isso é rápido e barato em hardware — e é assim que DSP roda em FPGA de verdade.",
        en: "The FPGA doesn't give you 'float' for free: we work with signed integers (fixed-point arithmetic). Samples are 16-bit signed integers (−32768 to 32767). Dividing by 4 becomes an arithmetic right shift by 2 bits ('>>> 2'), which preserves the sign. This is fast and cheap in hardware — and it's how DSP really runs on an FPGA.",
      },
    },
    {
      kind: "code",
      title: { pt: "O filtro FIR de 4 taps", en: "The 4-tap FIR filter" },
      intro: {
        pt: "Uma linha de 4 registradores (a linha de atrasos) e uma soma dividida por 4. A cada clock entra uma amostra nova e sai a média das 4 últimas.",
        en: "A line of 4 registers (the delay line) and a sum divided by 4. Each clock a new sample enters and the average of the last 4 comes out.",
      },
      block: {
        language: "verilog",
        filename: "fir4.v",
        code: {
          pt: `// Media movel de 4 pontos: y[n] = (x[n]+x[n-1]+x[n-2]+x[n-3]) / 4
module fir4 (
    input  wire               clk,
    input  wire               rst,
    input  wire signed [15:0] x,   // amostra de entrada
    output reg  signed [15:0] y    // amostra de saida (filtrada)
);
    // Linha de atrasos: d0 = x[n-1], d1 = x[n-2], d2 = x[n-3]
    reg signed [15:0] d0, d1, d2;

    // Soma em 18 bits para nao estourar ao somar 4 amostras de 16 bits.
    wire signed [17:0] soma = x + d0 + d1 + d2;

    always @(posedge clk) begin
        if (rst) begin
            d0 <= 0; d1 <= 0; d2 <= 0; y <= 0;
        end else begin
            d0 <= x;   // desloca a linha de atrasos (cada z^-1)
            d1 <= d0;
            d2 <= d1;
            y  <= soma >>> 2;   // divide por 4 (shift aritmetico)
        end
    end
endmodule`,
          en: `// 4-point moving average: y[n] = (x[n]+x[n-1]+x[n-2]+x[n-3]) / 4
module fir4 (
    input  wire               clk,
    input  wire               rst,
    input  wire signed [15:0] x,   // input sample
    output reg  signed [15:0] y    // output sample (filtered)
);
    // Delay line: d0 = x[n-1], d1 = x[n-2], d2 = x[n-3]
    reg signed [15:0] d0, d1, d2;

    // Sum in 18 bits so adding four 16-bit samples can't overflow.
    wire signed [17:0] sum = x + d0 + d1 + d2;

    always @(posedge clk) begin
        if (rst) begin
            d0 <= 0; d1 <= 0; d2 <= 0; y <= 0;
        end else begin
            d0 <= x;   // shift the delay line (each z^-1)
            d1 <= d0;
            d2 <= d1;
            y  <= sum >>> 2;   // divide by 4 (arithmetic shift)
        end
    end
endmodule`,
        },
        caption: {
          pt: "d0, d1, d2 são os três z⁻¹. A soma usa 18 bits para caber 4×16 bits sem overflow.",
          en: "d0, d1, d2 are the three z⁻¹. The sum uses 18 bits to fit 4×16 bits without overflow.",
        },
      },
    },
    {
      kind: "prose",
      label: { pt: "A ponte com a teoria", en: "The bridge to theory" },
      title: { pt: "A linha de atrasos é a cadeia de z⁻¹", en: "The delay line is the chain of z⁻¹" },
      text: {
        pt: "Olhe para d0, d1, d2: a cada clock, o valor 'anda' um passo pela fila (d0←x, d1←d0, d2←d1). Isso é exatamente o diagrama de blocos do FIR que você viu na teoria, com cada bloco z⁻¹ virando um registrador. Como os pesos são todos iguais e positivos, o filtro atenua as variações rápidas (alta frequência) e deixa passar as lentas (baixa frequência): é um passa-baixas. Trocando os pesos (os coeficientes b_k), o mesmo hardware vira qualquer FIR — inclusive os filtros de decimação e interpolação do curso.",
        en: "Look at d0, d1, d2: each clock, the value 'walks' one step down the line (d0←x, d1←d0, d2←d1). This is exactly the FIR block diagram you saw in theory, with each z⁻¹ block becoming a register. Because the weights are all equal and positive, the filter attenuates fast variations (high frequency) and lets slow ones through (low frequency): it's a low-pass. Swap the weights (the b_k coefficients) and the same hardware becomes any FIR — including the course's decimation and interpolation filters.",
      },
    },
    {
      kind: "code",
      title: { pt: "O testbench", en: "The testbench" },
      intro: {
        pt: "Um testbench não vai para a placa: ele existe só para a simulação. Ele gera o clock, aplica um impulso e depois um degrau na entrada, e deixa você observar a resposta.",
        en: "A testbench never goes to the board: it exists only for simulation. It generates the clock, applies an impulse and then a step to the input, and lets you observe the response.",
      },
      block: {
        language: "verilog",
        filename: "fir4_tb.v",
        code: {
          pt: `\`timescale 1ns/1ps
module fir4_tb;
    reg  clk = 0, rst = 1;
    reg  signed [15:0] x = 0;
    wire signed [15:0] y;

    fir4 dut (.clk(clk), .rst(rst), .x(x), .y(y));

    always #5 clk = ~clk;   // clock de 100 MHz (periodo 10 ns)

    initial begin
        #20 rst = 0;                 // libera o reset

        // 1) Impulso: uma amostra = 100, depois volta a 0.
        @(posedge clk) x = 16'sd100;
        @(posedge clk) x = 0;

        // Espera a resposta ao impulso terminar de sair.
        repeat (6) @(posedge clk);

        // 2) Degrau: entrada salta para 200 e fica.
        x = 16'sd200;
        repeat (8) @(posedge clk);

        $finish;
    end
endmodule`,
          en: `\`timescale 1ns/1ps
module fir4_tb;
    reg  clk = 0, rst = 1;
    reg  signed [15:0] x = 0;
    wire signed [15:0] y;

    fir4 dut (.clk(clk), .rst(rst), .x(x), .y(y));

    always #5 clk = ~clk;   // 100 MHz clock (10 ns period)

    initial begin
        #20 rst = 0;                 // release reset

        // 1) Impulse: one sample = 100, then back to 0.
        @(posedge clk) x = 16'sd100;
        @(posedge clk) x = 0;

        // Let the impulse response finish coming out.
        repeat (6) @(posedge clk);

        // 2) Step: input jumps to 200 and stays.
        x = 16'sd200;
        repeat (8) @(posedge clk);

        $finish;
    end
endmodule`,
        },
        caption: {
          pt: "O impulso mostra os coeficientes do filtro; o degrau mostra a rampa de subida da média.",
          en: "The impulse reveals the filter's coefficients; the step shows the moving average ramping up.",
        },
      },
    },
    {
      kind: "steps",
      title: { pt: "Simular no Vivado e ler a forma de onda", en: "Simulate in Vivado and read the waveform" },
      intro: {
        pt: "Aqui não geramos bitstream: usamos o simulador. É rápido e não precisa da placa.",
        en: "Here we don't generate a bitstream: we use the simulator. It's fast and needs no board.",
      },
      steps: [
        {
          text: {
            pt: "Crie um projeto lab3_fir e adicione fir4.v como design source (Add or create design sources).",
            en: "Create a lab3_fir project and add fir4.v as a design source (Add or create design sources).",
          },
        },
        {
          title: { pt: "Adicionar o testbench como fonte de simulação", en: "Add the testbench as a simulation source" },
          text: {
            pt: "Add Sources → 'Add or create simulation sources' → crie fir4_tb.v e cole o testbench. Confirme que fir4_tb é o topo da simulação (aparece em negrito na aba Sources → Simulation Sources).",
            en: "Add Sources → 'Add or create simulation sources' → create fir4_tb.v and paste the testbench. Confirm fir4_tb is the simulation top (shown in bold under Sources → Simulation Sources).",
          },
        },
        {
          title: { pt: "Rodar a simulação", en: "Run the simulation" },
          text: {
            pt: "No Flow Navigator → 'Run Simulation' → 'Run Behavioral Simulation'. A janela de forma de onda abre. Se ela terminar cedo, clique em 'Run All' (ou use a lupa 'Zoom Fit') para enquadrar todo o tempo.",
            en: "In the Flow Navigator → 'Run Simulation' → 'Run Behavioral Simulation'. The waveform window opens. If it stops early, click 'Run All' (or use 'Zoom Fit') to frame the whole time.",
          },
        },
        {
          title: { pt: "Ler os sinais", en: "Read the signals" },
          text: {
            pt: "Veja x e y na forma de onda. Clique com o botão direito em y → 'Radix' → 'Signed Decimal' para ler os valores como números com sinal. Compare a entrada x com a saída y.",
            en: "Look at x and y in the waveform. Right-click y → 'Radix' → 'Signed Decimal' to read the values as signed numbers. Compare the input x with the output y.",
          },
          note: {
            variant: "tip",
            text: {
              pt: "Não vê d0, d1, d2? Expanda a instância 'dut' na aba Scope e arraste esses sinais para a onda para ver a linha de atrasos andando.",
              en: "Don't see d0, d1, d2? Expand the 'dut' instance in the Scope tab and drag those signals into the wave to watch the delay line move.",
            },
          },
        },
      ],
    },
    {
      kind: "callout",
      variant: "note",
      title: { pt: "O que você deve enxergar", en: "What you should see" },
      text: {
        pt: "Na resposta ao impulso (x = 100 por uma amostra), a saída y produz quatro amostras iguais a 25 (= 100/4) e depois volta a 0 — são os quatro coeficientes 1/4 do filtro, aparecendo um a um. No degrau (x = 200), y sobe em rampa: 50, 100, 150, 200 — a média demora 4 amostras para 'encher' e alcançar a entrada. Isso é o passa-baixas suavizando a mudança brusca.",
        en: "In the impulse response (x = 100 for one sample), the output y produces four samples equal to 25 (= 100/4) and then returns to 0 — the filter's four 1/4 coefficients, appearing one by one. On the step (x = 200), y ramps up: 50, 100, 150, 200 — the average takes 4 samples to 'fill up' and reach the input. That's the low-pass smoothing the abrupt change.",
      },
    },
    {
      kind: "checklist",
      title: { pt: "Você concluiu a trilha de fundamentos", en: "You finished the fundamentals track" },
      items: [
        {
          pt: "Simulei o FIR e vi a resposta ao impulso com quatro amostras iguais a 25.",
          en: "I simulated the FIR and saw the impulse response with four samples equal to 25.",
        },
        {
          pt: "Vi a saída subir em rampa (50→100→150→200) no degrau — o efeito passa-baixas.",
          en: "I saw the output ramp up (50→100→150→200) on the step — the low-pass effect.",
        },
        {
          pt: "Identifiquei d0, d1, d2 como os atrasos z⁻¹ da teoria.",
          en: "I identified d0, d1, d2 as the theory's z⁻¹ delays.",
        },
        {
          pt: "Entendo por que a divisão por 4 vira um '>>> 2' (ponto fixo com sinal).",
          en: "I understand why dividing by 4 becomes a '>>> 2' (signed fixed-point).",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Cheque seu entendimento", en: "Check your understanding" },
      quizzes: [
        {
          question: {
            pt: "Por que a resposta ao impulso do filtro tem exatamente 4 amostras não-nulas?",
            en: "Why does the filter's impulse response have exactly 4 non-zero samples?",
          },
          options: [
            {
              pt: "Porque é um FIR de 4 taps: o impulso passa por 4 posições da linha de atrasos",
              en: "Because it's a 4-tap FIR: the impulse passes through 4 positions of the delay line",
            },
            { pt: "Por acaso", en: "By coincidence" },
            { pt: "Porque o clock é de 100 MHz", en: "Because the clock is 100 MHz" },
            { pt: "Porque a entrada era 100", en: "Because the input was 100" },
          ],
          correctIndex: 0,
          solution: [
            {
              text: {
                pt: "Um FIR de M+1 taps tem resposta ao impulso de M+1 amostras (é 'finita' — o F de FIR). Aqui são 4 taps, então 4 amostras: o impulso visita x, d0, d1, d2 e some. Cada uma vale 100/4 = 25.",
                en: "An (M+1)-tap FIR has an impulse response of M+1 samples (it's 'finite' — the F in FIR). Here there are 4 taps, so 4 samples: the impulse visits x, d0, d1, d2 and is gone. Each equals 100/4 = 25.",
              },
            },
          ],
        },
        {
          question: {
            pt: "Tirar a média das últimas amostras corresponde a que tipo de filtro?",
            en: "Averaging the last few samples corresponds to what kind of filter?",
          },
          options: [
            { pt: "Passa-altas", en: "High-pass" },
            { pt: "Passa-baixas", en: "Low-pass" },
            { pt: "Passa-faixa", en: "Band-pass" },
            { pt: "Nenhum filtro", en: "No filter at all" },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "A média suaviza: variações rápidas (alta frequência) se cancelam ao serem promediadas, enquanto tendências lentas (baixa frequência) passam quase intactas. Por isso a média móvel é um passa-baixas.",
                en: "Averaging smooths: fast variations (high frequency) cancel out when averaged, while slow trends (low frequency) pass almost intact. That's why the moving average is a low-pass.",
              },
            },
          ],
        },
      ],
    },
    {
      kind: "prose",
      label: { pt: "O que vem a seguir", en: "What comes next" },
      title: { pt: "Do simulador ao som", en: "From the simulator to sound" },
      text: {
        pt: "Você fechou a trilha de fundamentos: entradas e saídas, clock e memória, e um filtro FIR verificado por simulação — com a teoria e o hardware finalmente encaixados. O próximo passo natural, numa fase futura, é fazer esse FIR rodar em tempo real sobre o áudio do codec ADAU1761 da ZedBoard: amostras reais entrando a 48 kHz, o filtro suavizando, e o resultado saindo pelo fone. Aí a decimação, a interpolação e a conversão de taxa que você estudou deixam de ser gráficos e viram som.",
        en: "You've closed the fundamentals track: inputs and outputs, clock and memory, and a FIR filter verified in simulation — with theory and hardware finally clicking together. The natural next step, in a future phase, is to run this FIR in real time over the audio from the ZedBoard's ADAU1761 codec: real samples arriving at 48 kHz, the filter smoothing, and the result coming out of the headphones. That's when the decimation, interpolation and rate conversion you studied stop being plots and become sound.",
      },
    },
  ],
};
