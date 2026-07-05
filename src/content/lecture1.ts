import type { Lecture } from "./types.ts";

export const lecture1: Lecture = {
  id: 1,
  lectureLabel: { pt: "Aula 1", en: "Lecture 1" },
  sections: [
    {
      kind: "prose",
      label: { pt: "Introdução", en: "Introduction" },
      title: { pt: "Taxa de amostragem", en: "Sampling rate" },
      text: {
        pt: "A taxa de amostragem Fs é quantas amostras por segundo colhemos de um sinal, e o intervalo entre amostras é T = 1/Fs. Por exemplo, o áudio de CD usa Fs = 44.100 amostras por segundo (44,1 kHz). Amostrar é justamente pegar o valor do sinal contínuo a cada T segundos, transformando-o numa sequência de números x[n].",
        en: "The sampling rate Fs is how many samples per second we take from a signal, and the interval between samples is T = 1/Fs. For example, CD audio uses Fs = 44,100 samples per second (44.1 kHz). Sampling is exactly taking the value of the continuous signal every T seconds, turning it into a sequence of numbers x[n].",
      },
      reviewLink: {
        slug: "sampling",
        label: { pt: "Amostragem", en: "Sampling" },
      },
    },
    {
      kind: "playground",
      title: { pt: "O sinal e suas amostras", en: "The signal and its samples" },
      intro: {
        pt: "Aqui está um sinal contínuo e os pontos que a amostragem colhe dele. Mova a taxa de amostragem e veja quantas amostras representam o mesmo sinal.",
        en: "Here is a continuous signal and the points that sampling takes from it. Move the sampling rate and see how many samples represent the same signal.",
      },
      instrument: { component: "SamplingView" },
    },
    {
      kind: "prose",
      label: { pt: "Motivação", en: "Motivation" },
      title: {
        pt: "Por que mudar a taxa de amostragem?",
        en: "Why change the sampling rate?",
      },
      text: {
        pt: "Em muitas aplicações precisamos mudar a taxa de amostragem de um sinal — às vezes diminuindo (o que se chama decimar), às vezes aumentando (interpolar). Converter um sinal de uma taxa para outra é a conversão de taxa de amostragem (sampling rate conversion), e sistemas que trabalham com várias taxas ao mesmo tempo são os sistemas multitaxa (multirate). Este capítulo é sobre fazer isso no domínio digital, sem voltar ao analógico.",
        en: "In many applications we need to change a signal's sampling rate — sometimes decreasing it (called decimation), sometimes increasing it (interpolation). Converting a signal from one rate to another is sampling rate conversion, and systems that work with several rates at once are multirate systems. This chapter is about doing this in the digital domain, without going back to analog.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Aplicação", en: "Application" },
      title: { pt: "Por que diminuir a taxa", en: "Why lower the rate" },
      text: {
        pt: "Um exemplo clássico: um sinal amostrado a Fs passa por um filtro passa-baixas de corte fc. Depois do filtro, toda a energia está em 0 até fc — o sinal só ocupa uma faixa estreita. Pelo teorema da amostragem, para representar algo que só vai até fc basta a taxa 2·fc; e se fc for bem menor que Fs/2, essa taxa é muito menor que Fs. Ou seja: manter Fs é desperdício — dá para diminuir a taxa (decimar) e processar mais barato. Aplicações reais: tomografia computadorizada e filtros de banda estreita eficientes.",
        en: "A classic example: a signal sampled at Fs passes through a lowpass filter with cutoff fc. After the filter, all the energy is in 0 to fc — the signal only occupies a narrow band. By the sampling theorem, to represent something that only goes up to fc you only need rate 2·fc; and if fc is much smaller than Fs/2, that rate is much lower than Fs. In other words: keeping Fs is wasteful — you can lower the rate (decimate) and process more cheaply. Real applications: computed tomography and efficient narrowband filters.",
      },
      reviewLink: {
        slug: "nyquist",
        label: {
          pt: "Nyquist e o teorema da amostragem",
          en: "Nyquist and the sampling theorem",
        },
      },
    },
    {
      kind: "playground",
      title: {
        pt: "Amostrar e filtrar: o exemplo do livro",
        en: "Sample and filter: the book's example",
      },
      intro: {
        pt: "Um sinal passa por dois estágios: primeiro é amostrado (à taxa fs), depois passa por um filtro passa-baixas. Veja cada estágio no tempo e na frequência — o sinal original, o sinal amostrado (a amostragem replica o espectro a cada fs) e a saída após o filtro (que mantém só a banda base, removendo as réplicas). Mova a frequência do sinal e observe o pico se mover.",
        en: "A signal goes through two stages: first it is sampled (at rate fs), then it passes through a lowpass filter. See each stage in time and in frequency — the original signal, the sampled signal (sampling replicates the spectrum every fs), and the output after the filter (which keeps only the baseband, removing the replicas). Move the signal frequency and watch the peak move.",
      },
      instrument: { component: "SamplingFigure" },
    },
    {
      kind: "example",
      title: {
        pt: "Quanto dá para diminuir a taxa?",
        en: "How much can we lower the rate?",
      },
      statement: {
        pt: "Um sinal é amostrado a Fs = 20 kHz, mas após o filtro só tem energia até fc = 2 kHz. Qual a taxa mínima e por quanto dá para diminuir (decimar) a taxa?",
        en: "A signal is sampled at Fs = 20 kHz, but after filtering it only has energy up to fc = 2 kHz. What is the minimum rate and by how much can we lower (decimate) the rate?",
      },
      steps: [
        {
          text: {
            pt: "Taxa mínima (Nyquist da banda ocupada):",
            en: "Minimum rate (Nyquist of the occupied band):",
          },
          latex: "2 f_c = 2 \\cdot 2 = 4\\ \\text{kHz}",
        },
        {
          text: {
            pt: "Fator pelo qual dá para diminuir a taxa:",
            en: "Factor by which we can lower the rate:",
          },
          latex:
            "\\left\\lfloor \\frac{F_s}{2 f_c} \\right\\rfloor = \\left\\lfloor \\frac{20}{4} \\right\\rfloor = 5",
        },
        {
          text: {
            pt: "Ou seja, dá para processar a 4 kHz em vez de 20 kHz — 5× menos amostras, sem perder informação (com o filtro anti-aliasing certo, próxima aula).",
            en: "So we can process at 4 kHz instead of 20 kHz — 5× fewer samples, without losing information (with the right anti-aliasing filter, next lecture).",
          },
        },
      ],
    },
    {
      kind: "prose",
      label: { pt: "Interpolação", en: "Interpolation" },
      title: { pt: "Por que aumentar a taxa", en: "Why raise the rate" },
      text: {
        pt: "Aumentar a taxa chama-se interpolar: criar amostras 'no meio' das que já temos. A ideia é imaginar o sinal contínuo por trás das amostras e reamostrá-lo mais rápido. Se o sinal era bandlimited e bem amostrado, dá para reconstruí-lo exatamente (pela interpolação sinc do teorema da amostragem) e reamostrar sem erro nenhum. Na prática não voltamos ao analógico — um filtro digital faz o papel dessa reconstrução, preenchendo os valores intermediários. É isso que as fórmulas a seguir descrevem.",
        en: "Raising the rate is called interpolation: creating samples 'in between' the ones we already have. The idea is to imagine the continuous signal behind the samples and resample it faster. If the signal was bandlimited and well sampled, we can reconstruct it exactly (by the sinc interpolation of the sampling theorem) and resample with zero error. In practice we don't go back to analog — a digital filter plays the role of that reconstruction, filling in the intermediate values. That is what the formulas below describe.",
      },
    },
    {
      kind: "formalization",
      title: {
        pt: "Interpolação: reconstruir e reamostrar",
        en: "Interpolation: reconstruct and resample",
      },
      steps: [
        {
          latex: "x(n) = x_a(nT), \\quad T = \\tfrac{1}{F_s}",
          ref: "IP-B eq. (9.1), p. 475",
          caption: {
            pt: "Partimos das amostras x(n) de um sinal contínuo xa(t), colhidas a cada T = 1/Fs.",
            en: "We start from samples x(n) of a continuous signal xa(t), taken every T = 1/Fs.",
          },
        },
        {
          latex:
            "x_a(t) = \\sum_{k} x(kT)\\, \\frac{\\sin[\\pi(t - kT)/T]}{\\pi(t - kT)/T}",
          ref: "IP-B eq. (9.2), p. 475",
          caption: {
            pt: "Se xa era bandlimited e amostrado no mínimo necessário, ele se reconstrói exatamente pela interpolação sinc (teorema da amostragem — Revisão).",
            en: "If xa was bandlimited and sampled at the minimum required rate, it is reconstructed exactly by sinc interpolation (sampling theorem — Review).",
          },
        },
        {
          latex:
            "x_a\\!\\left(m\\tfrac{T}{2}\\right) = \\sum_{k} x(kT)\\, \\frac{\\sin[\\pi(m/2 - k)]}{\\pi(m/2 - k)}",
          ref: "IP-B eq. (9.3), p. 476",
          caption: {
            pt: "Agora reamostramos o mesmo xa reconstruído, mas com o dobro da taxa (passo T/2).",
            en: "Now we resample the same reconstructed xa, but at twice the rate (step T/2).",
          },
        },
        {
          latex: "y(m) \\triangleq x_a\\!\\left(m\\tfrac{T}{2}\\right)",
          ref: "IP-B eq. (9.4), p. 476",
          caption: {
            pt: "O resultado é o sinal interpolado por 2, com erro de interpolação zero. (Na prática evitamos esse desvio pelo analógico e fazemos tudo no digital, com um filtro.)",
            en: "The result is the signal interpolated by 2, with zero interpolation error. (In practice we avoid this analog detour and do everything digitally, with a filter.)",
          },
        },
        {
          latex:
            "\\frac{F_y}{F_x} = \\frac{I}{D}, \\quad I,\\, D \\ \\text{primos entre si}",
          ref: "IP-B eq. (9.5), p. 476",
          caption: {
            pt: "Em geral, a razão entre a taxa de saída e a de entrada é um número racional I/D — interpolar por I e decimar por D. É o mapa das próximas aulas.",
            en: "In general, the ratio between the output and input rates is a rational number I/D — interpolate by I and decimate by D. It is the map of the coming lectures.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: {
        pt: "Conversão vista como filtragem",
        en: "Conversion viewed as filtering",
      },
      intro: {
        pt: "A conversão de taxa é uma operação de filtragem linear: a entrada x(n) na taxa Fx vira a saída y(m) numa taxa diferente Fy. Aumente o fator I e veja o sinal ganhar amostras — os zeros inseridos são preenchidos pelo filtro, resultando no mesmo sinal, mais denso.",
        en: "Rate conversion is a linear filtering operation: the input x(n) at rate Fx becomes the output y(m) at a different rate Fy. Increase the factor I and watch the signal gain samples — the inserted zeros are filled in by the filter, giving the same signal, denser.",
      },
      instrument: { component: "RateConversionView" },
    },
    {
      kind: "example",
      title: {
        pt: "48 kHz → 44,1 kHz: o fator racional",
        en: "48 kHz → 44.1 kHz: the rational factor",
      },
      statement: {
        pt: "O caso clássico do áudio: converter uma gravação de estúdio (48 kHz) para a taxa do CD (44,1 kHz). Que fator racional I/D faz essa conversão?",
        en: "The classic audio case: convert a studio recording (48 kHz) to the CD rate (44.1 kHz). What rational factor I/D does this conversion?",
      },
      steps: [
        {
          text: {
            pt: "A razão entre as taxas de saída e entrada:",
            en: "The ratio between the output and input rates:",
          },
          latex: "\\frac{F_y}{F_x} = \\frac{44100}{48000}",
        },
        {
          text: {
            pt: "Simplificando pelo mdc (300):",
            en: "Simplifying by the gcd (300):",
          },
          latex: "\\frac{44100}{48000} = \\frac{147}{160}",
        },
        {
          text: {
            pt: "Logo I = 147 e D = 160: interpolar por 147 e decimar por 160. Nenhum fator inteiro sozinho resolve — por isso o fator racional (Aula 5).",
            en: "So I = 147 and D = 160: interpolate by 147 and decimate by 160. No single integer factor works — hence the rational factor (Lecture 5).",
          },
        },
      ],
    },
    {
      kind: "synthesis",
      title: { pt: "O que levar desta aula", en: "What to take from this lecture" },
      points: [
        {
          pt: "A taxa de amostragem Fs é quantas amostras/segundo tomamos; mudá-la é diminuir (decimar) ou aumentar (interpolar) a taxa.",
          en: "The sampling rate Fs is how many samples/second we take; changing it is lowering (decimating) or raising (interpolating) the rate.",
        },
        {
          pt: "Se o sinal ocupa só uma banda [0, fc], basta a taxa 2·fc — dá para diminuir a taxa por ⌊Fs/2fc⌋.",
          en: "If the signal occupies only a band [0, fc], rate 2·fc suffices — you can lower the rate by ⌊Fs/2fc⌋.",
        },
        {
          pt: "Interpolar é reconstruir e reamostrar mais rápido; em geral a conversão é um fator racional I/D, sempre com um filtro.",
          en: "Interpolating is reconstruct-and-resample faster; in general conversion is a rational factor I/D, always with a filter.",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Teste seu entendimento", en: "Test your understanding" },
      quizzes: [
        {
          question: {
            pt: "Um sinal a Fs = 16 kHz só tem energia até fc = 2 kHz. Por qual fator dá para diminuir a taxa sem perder informação?",
            en: "A signal at Fs = 16 kHz only has energy up to fc = 2 kHz. By what factor can we lower the rate without losing information?",
          },
          options: [
            { pt: "2", en: "2" },
            { pt: "4", en: "4" },
            { pt: "8", en: "8" },
            { pt: "16", en: "16" },
          ],
          correctIndex: 1,
          solution: [
            {
              text: { pt: "Taxa mínima: 2·fc = 4 kHz.", en: "Minimum rate: 2·fc = 4 kHz." },
              latex: "2 f_c = 4\\ \\text{kHz}",
            },
            {
              text: {
                pt: "Fator = ⌊Fs / 2fc⌋ = ⌊16/4⌋ = 4.",
                en: "Factor = ⌊Fs / 2fc⌋ = ⌊16/4⌋ = 4.",
              },
              latex: "\\left\\lfloor \\tfrac{16}{4} \\right\\rfloor = 4",
            },
          ],
        },
        {
          question: {
            pt: "Para converter 32 kHz → 48 kHz, qual o fator racional I/D (simplificado)?",
            en: "To convert 32 kHz → 48 kHz, what is the rational factor I/D (simplified)?",
          },
          options: [
            { pt: "2/3", en: "2/3" },
            { pt: "4/3", en: "4/3" },
            { pt: "3/2", en: "3/2" },
            { pt: "48/32", en: "48/32" },
          ],
          correctIndex: 2,
          solution: [
            {
              text: { pt: "Razão Fy/Fx = 48/32.", en: "Ratio Fy/Fx = 48/32." },
              latex: "\\frac{F_y}{F_x} = \\frac{48}{32}",
            },
            {
              text: {
                pt: "Simplificando pelo mdc (16): 3/2 → I = 3, D = 2.",
                en: "Simplifying by the gcd (16): 3/2 → I = 3, D = 2.",
              },
              latex: "\\frac{48}{32} = \\frac{3}{2}",
            },
          ],
        },
      ],
    },
  ],
};
