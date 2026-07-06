import type { Lab } from "./labTypes.ts";

export const lab3: Lab = {
  id: 3,
  labLabel: { pt: "Lab 3", en: "Lab 3" },
  title: { pt: "Rumo ao DSP: um filtro FIR", en: "Toward DSP: a FIR filter" },
  goal: {
    pt: "Construir um filtro FIR em Verilog e verificá-lo por simulação, encaixando a teoria do curso no hardware: a convolução, a resposta ao impulso e o filtro passa-baixas que aparece na decimação e na interpolação.",
    en: "Build a FIR filter in Verilog and verify it in simulation, fitting the course theory into hardware: convolution, the impulse response, and the lowpass filter that shows up in decimation and interpolation.",
  },
  duration: { pt: "60–90 min", en: "60–90 min" },
  prereqs: [
    {
      pt: "Ter feito o Lab 2 (clock, registradores, atribuição não-bloqueante).",
      en: "Having done Lab 2 (clock, registers, non-blocking assignment).",
    },
    {
      pt: "Ter visto, na teoria, a convolução v(n) = Σ h(k)·x(n−k) e a ideia de filtro passa-baixas (Aulas 3–6).",
      en: "Having seen, in theory, the convolution v(n) = Σ h(k)·x(n−k) and the idea of a lowpass filter (Lectures 3–6).",
    },
  ],
  sections: [
    {
      kind: "prose",
      label: { pt: "Objetivo", en: "Goal" },
      title: { pt: "A teoria vira hardware", en: "The theory becomes hardware" },
      text: {
        pt: "Até aqui acendemos LEDs e contamos. Agora damos o salto que dá nome ao curso: filtrar um sinal. Vamos construir um filtro FIR em Verilog e verificá-lo por simulação no Vivado, lendo a forma de onda. Você vai ver, na prática, que a convolução v(n) = Σ h(k)·x(n−k) da teoria vira uma linha de atrasos (cada z⁻¹ é um registrador) mais uma soma ponderada — exatamente o bloco que a Aula 3 coloca antes do ↓D (anti-aliasing) e a Aula 4 coloca depois do ↑I (anti-imaging).",
        en: "So far we've lit LEDs and counted. Now we take the leap that gives the course its name: filtering a signal. We'll build a FIR filter in Verilog and verify it in Vivado simulation by reading the waveform. You'll see, hands-on, that the theory's convolution v(n) = Σ h(k)·x(n−k) becomes a delay line (each z⁻¹ is a register) plus a weighted sum — exactly the block Lecture 3 places before the ↓D (anti-aliasing) and Lecture 4 places after the ↑I (anti-imaging).",
      },
    },
    {
      kind: "prose",
      label: { pt: "Conceito", en: "Concept" },
      title: { pt: "O FIR é uma convolução", en: "A FIR is a convolution" },
      text: {
        pt: "Um filtro FIR calcula a saída como a convolução da entrada com sua resposta ao impulso h(k): v(n) = Σₖ h(k)·x(n−k), com k de 0 a M−1 (IP-B eq. 9.21). Os h(k) são os M coeficientes do filtro (em inglês, 'taps') — é a lista de pesos que define o filtro. O FIR mais simples possível é a média móvel: todos os coeficientes iguais a 1/M, ou seja h(k) = 1/M. Com M = 4, y(n) = [x(n) + x(n−1) + x(n−2) + x(n−3)] / 4. É um passa-baixas rústico, mas o suficiente para ver a máquina funcionando. E o melhor: o hardware é o MESMO para qualquer FIR — muda só a lista de coeficientes.",
        en: "A FIR filter computes the output as the convolution of the input with its impulse response h(k): v(n) = Σₖ h(k)·x(n−k), for k from 0 to M−1 (IP-B eq. 9.21). The h(k) are the filter's M coefficients (a.k.a. 'taps') — the list of weights that defines the filter. The simplest possible FIR is the moving average: every coefficient equal to 1/M, i.e. h(k) = 1/M. With M = 4, y(n) = [x(n) + x(n−1) + x(n−2) + x(n−3)] / 4. It's a crude lowpass, but enough to see the machine work. And best of all: the hardware is the SAME for any FIR — only the coefficient list changes.",
      },
    },
    {
      kind: "playground",
      title: { pt: "A média móvel suaviza", en: "The moving average smooths" },
      intro: {
        pt: "A entrada é uma senoide de baixa frequência somada a uma de alta frequência. Mova M e veja a média de M amostras apagar a componente rápida (alta frequência) e preservar a lenta (baixa frequência). Isso é um passa-baixas — e é por isso que ele serve de anti-aliasing.",
        en: "The input is a low-frequency sinusoid plus a high-frequency one. Slide M and watch the M-sample average kill the fast component (high frequency) and keep the slow one (low frequency). That's a lowpass — and it's why it works as an anti-aliasing filter.",
      },
      instrument: { component: "MovingAverageExplorer" },
    },
    {
      kind: "prose",
      label: { pt: "A ponte com a teoria", en: "The bridge to theory" },
      title: { pt: "É o filtro da decimação e da interpolação", en: "It's the decimation and interpolation filter" },
      text: {
        pt: "Esse mesmo bloco é o filtro que aparece nas Aulas 3–5. Na decimação, ele vai ANTES do ↓D como anti-aliasing (corte π/D, ganho 1): 'filtrar antes de decimar' evita que as altas frequências dobrem sobre o sinal. Na interpolação, ele vai DEPOIS do ↑I como anti-imaging (corte π/I, ganho I): remove as cópias (imagens) que o upsampler cria. A média móvel é só o passa-baixas mais simples que existe; o curso projeta um h(k) melhor pelo método da janela (Aula 6). Mas o circuito — linha de atrasos + soma ponderada — não muda: para trocar de filtro, você só troca os coeficientes.",
        en: "This very block is the filter that appears in Lectures 3–5. In decimation, it goes BEFORE the ↓D as anti-aliasing (cutoff π/D, gain 1): 'filter before decimating' keeps high frequencies from folding onto the signal. In interpolation, it goes AFTER the ↑I as anti-imaging (cutoff π/I, gain I): it removes the copies (images) the upsampler creates. The moving average is just the simplest lowpass there is; the course designs a better h(k) with the window method (Lecture 6). But the circuit — delay line + weighted sum — doesn't change: to swap filters, you only swap the coefficients.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Uma propriedade boa", en: "A nice property" },
      title: { pt: "Fase linear: só atraso, sem distorção", en: "Linear phase: only delay, no distortion" },
      text: {
        pt: "Repare que os coeficientes da média móvel são todos iguais — logo, simétricos. Um FIR com coeficientes simétricos tem fase linear (Aula 6): ele atrasa TODAS as frequências pelo mesmo tempo, sem deformar a forma do sinal. Por isso, na simulação, a saída y(n) aparece como uma versão suavizada e ligeiramente atrasada da entrada — o atraso é constante, (M−1)/2 amostras. Essa é uma das grandes vantagens do FIR sobre outros filtros, e o motivo de ele ser preferido em decimação/interpolação.",
        en: "Notice the moving-average coefficients are all equal — hence symmetric. A FIR with symmetric coefficients has linear phase (Lecture 6): it delays ALL frequencies by the same amount, without deforming the signal's shape. That's why, in simulation, the output y(n) appears as a smoothed, slightly delayed copy of the input — the delay is constant, (M−1)/2 samples. This is one of the FIR's big advantages over other filters, and the reason it's preferred in decimation/interpolation.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Ponto fixo", en: "Fixed point" },
      title: { pt: "Números inteiros, vírgula implícita", en: "Whole numbers, an implied point" },
      text: {
        pt: "O FPGA não tem 'float' de graça: trabalhamos com inteiros com sinal (aritmética de ponto fixo). As amostras são inteiros de 16 bits com sinal (−32768 a 32767). Como todos os coeficientes valem 1/4, a soma dividida por 4 vira um deslocamento aritmético à direita de 2 bits ('>>> 2'), que preserva o sinal. Isso é rápido e barato em hardware — e é assim que DSP roda em FPGA de verdade.",
        en: "The FPGA doesn't give you 'float' for free: we work with signed integers (fixed-point arithmetic). Samples are 16-bit signed integers (−32768 to 32767). Since all coefficients equal 1/4, the sum divided by 4 becomes an arithmetic right shift by 2 bits ('>>> 2'), which preserves the sign. This is fast and cheap in hardware — and it's how DSP really runs on an FPGA.",
      },
    },
    {
      kind: "code",
      title: { pt: "O filtro FIR de 4 coeficientes", en: "The 4-coefficient FIR filter" },
      intro: {
        pt: "Uma linha de 3 registradores (a linha de atrasos) mais a amostra atual, e a soma dividida por 4. A cada clock entra uma amostra nova e sai a média das 4 últimas.",
        en: "A line of 3 registers (the delay line) plus the current sample, and the sum divided by 4. Each clock a new sample enters and the average of the last 4 comes out.",
      },
      block: {
        language: "verilog",
        filename: "fir4.v",
        code: {
          pt: `// FIR de 4 coeficientes iguais (media movel): h(k) = 1/4.
// v(n) = (x(n) + x(n-1) + x(n-2) + x(n-3)) / 4
module fir4 (
    input  wire               clk,
    input  wire               rst,
    input  wire signed [15:0] x,   // amostra de entrada x(n)
    output reg  signed [15:0] y    // amostra de saida (filtrada)
);
    // Linha de atrasos: d0 = x(n-1), d1 = x(n-2), d2 = x(n-3)
    reg signed [15:0] d0, d1, d2;

    // Soma em 18 bits para nao estourar ao somar 4 amostras de 16 bits.
    // Para um FIR qualquer: soma = h0*x + h1*d0 + h2*d1 + h3*d2.
    wire signed [17:0] soma = x + d0 + d1 + d2;

    always @(posedge clk) begin
        if (rst) begin
            d0 <= 0; d1 <= 0; d2 <= 0; y <= 0;
        end else begin
            d0 <= x;   // desloca a linha de atrasos (cada z^-1)
            d1 <= d0;
            d2 <= d1;
            y  <= soma >>> 2;   // divide por 4 (coeficientes 1/4)
        end
    end
endmodule`,
          en: `// 4 equal-coefficient FIR (moving average): h(k) = 1/4.
// v(n) = (x(n) + x(n-1) + x(n-2) + x(n-3)) / 4
module fir4 (
    input  wire               clk,
    input  wire               rst,
    input  wire signed [15:0] x,   // input sample x(n)
    output reg  signed [15:0] y    // output sample (filtered)
);
    // Delay line: d0 = x(n-1), d1 = x(n-2), d2 = x(n-3)
    reg signed [15:0] d0, d1, d2;

    // Sum in 18 bits so adding four 16-bit samples can't overflow.
    // For a general FIR: sum = h0*x + h1*d0 + h2*d1 + h3*d2.
    wire signed [17:0] sum = x + d0 + d1 + d2;

    always @(posedge clk) begin
        if (rst) begin
            d0 <= 0; d1 <= 0; d2 <= 0; y <= 0;
        end else begin
            d0 <= x;   // shift the delay line (each z^-1)
            d1 <= d0;
            d2 <= d1;
            y  <= sum >>> 2;   // divide by 4 (coefficients 1/4)
        end
    end
endmodule`,
        },
        caption: {
          pt: "d0, d1, d2 são os três z⁻¹. Trocar a soma simples por h0*x + h1*d0 + … faz deste um FIR qualquer.",
          en: "d0, d1, d2 are the three z⁻¹. Replacing the plain sum with h0*x + h1*d0 + … turns this into any FIR.",
        },
      },
    },
    {
      kind: "prose",
      label: { pt: "A ponte com a teoria", en: "The bridge to theory" },
      title: { pt: "A linha de atrasos é a cadeia de z⁻¹", en: "The delay line is the chain of z⁻¹" },
      text: {
        pt: "Olhe para d0, d1, d2: a cada clock, o valor 'anda' um passo pela fila (d0←x, d1←d0, d2←d1). Isso é exatamente o diagrama de blocos do FIR da teoria, com cada bloco z⁻¹ virando um registrador. A amostra atual x e os três atrasos d0, d1, d2 são as quatro entradas da soma — os quatro termos x(n−k) da convolução. É o hardware da equação, linha por linha.",
        en: "Look at d0, d1, d2: each clock, the value 'walks' one step down the line (d0←x, d1←d0, d2←d1). This is exactly the theory's FIR block diagram, with each z⁻¹ block becoming a register. The current sample x and the three delays d0, d1, d2 are the four inputs to the sum — the four x(n−k) terms of the convolution. It's the hardware of the equation, line by line.",
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
          pt: "O impulso revela a resposta ao impulso h(k); o degrau mostra a rampa de subida da média.",
          en: "The impulse reveals the impulse response h(k); the step shows the moving average ramping up.",
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
        pt: "Na resposta ao impulso (x = 100 por uma amostra), a saída y produz quatro amostras iguais a 25 (= 100/4) e depois volta a 0 — são os quatro coeficientes 1/4 do filtro, saindo um a um. É literalmente h(k) aparecendo na tela. No degrau (x = 200), y sobe em rampa: 50, 100, 150, 200 — a média demora 4 amostras para 'encher' e alcançar a entrada. Isso é o passa-baixas suavizando a mudança brusca.",
        en: "In the impulse response (x = 100 for one sample), the output y produces four samples equal to 25 (= 100/4) and then returns to 0 — the filter's four 1/4 coefficients, coming out one by one. It's literally h(k) appearing on screen. On the step (x = 200), y ramps up: 50, 100, 150, 200 — the average takes 4 samples to 'fill up' and reach the input. That's the lowpass smoothing the abrupt change.",
      },
    },
    {
      kind: "checklist",
      title: { pt: "Você concluiu a trilha de fundamentos", en: "You finished the fundamentals track" },
      items: [
        {
          pt: "Simulei o FIR e vi a resposta ao impulso h(k): quatro amostras iguais a 25.",
          en: "I simulated the FIR and saw the impulse response h(k): four samples equal to 25.",
        },
        {
          pt: "Vi a saída subir em rampa (50→100→150→200) no degrau — o efeito passa-baixas.",
          en: "I saw the output ramp up (50→100→150→200) on the step — the low-pass effect.",
        },
        {
          pt: "Identifiquei a linha de atrasos (d0, d1, d2) como os z⁻¹ da convolução.",
          en: "I identified the delay line (d0, d1, d2) as the convolution's z⁻¹ terms.",
        },
        {
          pt: "Entendo que este é o filtro anti-aliasing (antes do ↓D) / anti-imaging (depois do ↑I) das aulas.",
          en: "I understand this is the anti-aliasing filter (before ↓D) / anti-imaging (after ↑I) from the lectures.",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Cheque seu entendimento", en: "Check your understanding" },
      quizzes: [
        {
          question: {
            pt: "Por que a resposta ao impulso deste filtro tem exatamente 4 amostras não-nulas?",
            en: "Why does this filter's impulse response have exactly 4 non-zero samples?",
          },
          options: [
            { pt: "Por acaso", en: "By coincidence" },
            {
              pt: "Porque é um FIR de 4 coeficientes: o impulso passa por 4 posições da linha de atrasos",
              en: "Because it's a 4-coefficient FIR: the impulse passes through 4 positions of the delay line",
            },
            { pt: "Porque o clock é de 100 MHz", en: "Because the clock is 100 MHz" },
            { pt: "Porque a entrada era 100", en: "Because the input was 100" },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "Um FIR de M coeficientes tem resposta ao impulso de M amostras (é 'finita' — o F de FIR). Aqui são 4 coeficientes, então 4 amostras: o impulso visita x, d0, d1, d2 e some. Cada uma vale 100/4 = 25.",
                en: "An M-coefficient FIR has an impulse response of M samples (it's 'finite' — the F in FIR). Here there are 4 coefficients, so 4 samples: the impulse visits x, d0, d1, d2 and is gone. Each equals 100/4 = 25.",
              },
            },
          ],
        },
        {
          question: {
            pt: "Na decimação (Aula 3), onde entra um filtro passa-baixas como este?",
            en: "In decimation (Lecture 3), where does a lowpass filter like this go?",
          },
          options: [
            { pt: "Depois do ↓D, para consertar o aliasing", en: "After the ↓D, to fix aliasing" },
            { pt: "Não é usado na decimação", en: "It isn't used in decimation" },
            {
              pt: "Antes do ↓D, como anti-aliasing: filtrar antes de decimar",
              en: "Before the ↓D, as anti-aliasing: filter before decimating",
            },
            { pt: "Em paralelo com o ↓D", en: "In parallel with the ↓D" },
          ],
          correctIndex: 2,
          solution: [
            {
              text: {
                pt: "O filtro anti-aliasing vem ANTES do ↓D (corte π/D). Ele remove as altas frequências que, depois da decimação, dobrariam sobre o sinal (aliasing). Depois de decimar já seria tarde. Este FIR é justamente esse bloco.",
                en: "The anti-aliasing filter goes BEFORE the ↓D (cutoff π/D). It removes the high frequencies that, after decimation, would fold onto the signal (aliasing). After decimating it would be too late. This FIR is exactly that block.",
              },
            },
          ],
        },
        {
          question: {
            pt: "Para transformar este circuito em um FIR passa-baixas melhor, o que você muda?",
            en: "To turn this circuit into a better lowpass FIR, what do you change?",
          },
          options: [
            {
              pt: "Os coeficientes h(k) da soma ponderada — a estrutura (linha de atrasos) fica igual",
              en: "The h(k) coefficients of the weighted sum — the structure (delay line) stays the same",
            },
            { pt: "O clock", en: "The clock" },
            { pt: "A largura das amostras para 8 bits", en: "The sample width to 8 bits" },
            { pt: "Nada — a média móvel é o melhor FIR", en: "Nothing — the moving average is the best FIR" },
          ],
          correctIndex: 0,
          solution: [
            {
              text: {
                pt: "O hardware do FIR é sempre linha de atrasos + soma ponderada. O que define o filtro são os coeficientes h(k). O curso projeta bons h(k) pelo método da janela (Aula 6); aqui usamos os mais simples (todos 1/M). Trocar os pesos, mesma máquina.",
                en: "A FIR's hardware is always delay line + weighted sum. What defines the filter is the h(k) coefficients. The course designs good h(k) with the window method (Lecture 6); here we use the simplest (all 1/M). Swap the weights, same machine.",
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
