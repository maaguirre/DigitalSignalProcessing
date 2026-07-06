import type { Lecture } from "./types.ts";

export const lecture6: Lecture = {
  id: 6,
  lectureLabel: { pt: "Aula 6", en: "Lecture 6" },
  sections: [
    {
      kind: "prose",
      label: { pt: "Motivação", en: "Motivation" },
      title: { pt: "Do filtro ideal ao filtro real", en: "From the ideal filter to a real one" },
      text: {
        pt: "Nas aulas anteriores, o filtro que remove imagens e evita aliasing era sempre ideal: corte perfeitamente vertical, ganho constante. Mas esse filtro é impossível de construir — sua resposta ao impulso é uma sinc infinita e não-causal. Para levar a conversão de taxa ao hardware, precisamos de um filtro FIR real, com um número finito de coeficientes.",
        en: "In the previous lectures, the filter that removes images and avoids aliasing was always ideal: a perfectly vertical cutoff, constant gain. But that filter is impossible to build — its impulse response is an infinite, non-causal sinc. To take rate conversion to hardware, we need a real FIR filter, with a finite number of coefficients.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Intuição", en: "Intuition" },
      title: { pt: "Especificar o filtro", en: "Specifying the filter" },
      text: {
        pt: "Já que o filtro ideal não existe, precisamos projetar um filtro real que chegue perto dele. Nesta aula o foco é ESPECIFICAR esse filtro — dizer quais requisitos ele precisa cumprir (bordas de banda, ondulação permitida, atenuação mínima). Os detalhes de PROJETO — como calcular os coeficientes a partir da especificação — são um tópico próprio, que fica na trilha de Revisão. Vamos tratar de filtros FIR de fase linear e precisamos especificar um deles para cada operação: um para o interpolador (↑I) e um para o decimador (↓D). Aqui, quando você mexe nos parâmetros, o método da janela calcula os coeficientes por baixo dos panos.",
        en: "Since the ideal filter doesn't exist, we need to design a real filter that gets close to it. In this lecture the focus is to SPECIFY that filter — to state which requirements it must meet (band edges, allowed ripple, minimum attenuation). The DESIGN details — how to compute the coefficients from the specification — are a topic of their own, left to the Review track. We'll deal with linear-phase FIR filters and we need to specify one for each operation: one for the interpolator (↑I) and one for the decimator (↓D). Here, when you tweak the parameters, the window method computes the coefficients under the hood.",
      },
      reviewLink: { slug: "fir-design", label: { pt: "Projeto de filtros FIR", en: "FIR filter design" } },
    },
    {
      kind: "formalization",
      title: { pt: "O interpolador FIR", en: "The FIR interpolator" },
      steps: [
        {
          latex: "V(\\omega) = X(\\omega I)",
          ref: "IP-B eq. (9.48), p. 499",
          caption: {
            pt: "Substituímos o filtro ideal do interpolador (Aula 4) por um FIR H(ω). O ↑I comprime o espectro por I e cria as I−1 imagens — o filtro precisa removê-las.",
            en: "We replace the interpolator's ideal filter (Lecture 4) with an FIR H(ω). ↑I compresses the spectrum by I and creates the I−1 images — the filter must remove them.",
          },
        },
        {
          latex:
            "H_I(\\omega) = \\begin{cases} I, & |\\omega| < \\pi/I \\\\ 0, & \\text{caso contrário} \\end{cases}",
          ref: "IP-B eq. (9.49), p. 499",
          caption: {
            pt: "O filtro IDEAL a aproximar: ganho I na passagem, corte em π/I. O FIR imita isso com M coeficientes — mas, por ser finito, terá banda de transição, ondulação na passagem e lóbulos na rejeição.",
            en: "The IDEAL filter to approximate: gain I in the passband, cutoff at π/I. The FIR mimics it with M coefficients — but, being finite, it will have a transition band, passband ripple and stopband lobes.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "O FIR aproxima o ideal", en: "The FIR approximates the ideal" },
      intro: {
        pt: "Projete o passa-baixas de corte π/I. Em cima, a resposta em dB: a tracejada é o filtro ideal; a curva cheia é o seu FIR. Veja a banda de transição, a ondulação e os lóbulos. Aumente M para estreitar a transição; troque a janela para trocar ondulação por transição.",
        en: "Design the cutoff-π/I lowpass. On top, the response in dB: the dashed line is the ideal filter; the solid curve is your FIR. See the transition band, the ripple and the lobes. Raise M to narrow the transition; change the window to trade ripple for transition.",
      },
      instrument: { component: "FilterDesigner" },
    },
    {
      kind: "playground",
      title: { pt: "As imagens vazando (filtro ruim)", en: "The images leaking (bad filter)" },
      intro: {
        pt: "Aqui usamos um filtro CURTO (M pequeno, corte π/5) para interpolar cos(0,5πn) por 5. As barras tracejadas são as imagens criadas pelo ↑5; a curva azul é o filtro. Repare: como o filtro desce devagar, as imagens caem sobre a sua parte alta e PASSAM (barras laranja) — elas vazam para a saída. É esse vazamento que vai distorcer o sinal no tempo, como veremos a seguir.",
        en: "Here we use a SHORT filter (small M, cutoff π/5) to interpolate cos(0.5πn) by 5. The dashed bars are the images created by ↑5; the blue curve is the filter. Notice: since the filter rolls off slowly, the images land on its high part and PASS (orange bars) — they leak into the output. It is this leakage that will distort the signal in time, as we'll see next.",
      },
      instrument: { component: "FIRInterpSpectrumView", config: { initialM: 9 } },
    },
    {
      kind: "playground",
      title: { pt: "A distorção no sinal (filtro ruim)", en: "The distortion in the signal (bad filter)" },
      intro: {
        pt: "O mesmo filtro ruim, agora no tempo. A linha cinza é a cossenoide ideal (pico 1). Como as imagens vazaram, y(m) sai laranja e distorcido — o pico ultrapassa 1 e a forma foge do cinza. Um filtro mal especificado estraga até um sinal simples. (Aumentar M já melhora — mas vamos primeiro aprender a especificar direito.)",
        en: "The same bad filter, now in time. The grey line is the ideal cosine (peak 1). Since the images leaked, y(m) comes out orange and distorted — the peak exceeds 1 and the shape strays from the grey. A poorly specified filter ruins even a simple signal. (Raising M already helps — but let's first learn to specify it right.)",
      },
      instrument: { component: "FIRInterpolationView", config: { initialM: 9 } },
    },
    {
      kind: "formalization",
      title: { pt: "Especificação: parâmetros do sinal e do filtro", en: "Specification: signal and filter parameters" },
      steps: [
        {
          latex: "0 < \\omega_{x,p} < \\omega_{x,s} < \\pi",
          ref: "IP-B §9.5.2, p. 505",
          caption: {
            pt: "Definimos parâmetros do SINAL: ω_{x,p} é a maior frequência de x(n) que queremos preservar; ω_{x,s} é a banda total (não há energia acima dela). Os parâmetros do filtro serão derivados destes.",
            en: "We define SIGNAL parameters: ω_{x,p} is the highest frequency of x(n) we want to preserve; ω_{x,s} is the full bandwidth (no energy above it). The filter parameters will be derived from these.",
          },
        },
        {
          latex: "\\omega_p = \\frac{\\omega_{x,p}}{I}, \\qquad \\omega_s = \\frac{2\\pi - \\omega_{x,s}}{I}",
          ref: "IP-B eq. (9.50), p. 505",
          caption: {
            pt: "As bordas do filtro. Como o ↑I comprime a escala por I, a banda a preservar vira ω_{x,p}/I e a rejeição pode começar em (2π−ω_{x,s})/I. Se o sinal não usa toda a banda (ω_{x,s} < π), isso dá transição mais larga e permite um filtro mais curto.",
            en: "The filter edges. Since ↑I compresses the scale by I, the band to preserve becomes ω_{x,p}/I and the stopband can begin at (2π−ω_{x,s})/I. If the signal doesn't use the full band (ω_{x,s} < π), this gives a wider transition and allows a shorter filter.",
          },
        },
        {
          latex: "H(\\omega) = H_r(\\omega)\\, e^{\\,j\\theta(\\omega)}",
          ref: "IP-B eq. (9.51), p. 506",
          caption: {
            pt: "O FIR de fase linear: H_r(ω) é a amplitude e θ(ω) a fase (linear). A fase linear evita distorção por atraso desigual das frequências.",
            en: "The linear-phase FIR: H_r(ω) is the amplitude and θ(ω) the (linear) phase. Linear phase avoids distortion from unequal delay of the frequencies.",
          },
        },
        {
          latex:
            "\\tfrac{1}{I}H_r(\\omega) \\in [1-\\delta_1,\\, 1+\\delta_1] \\ \\text{em}\\ [0,\\omega_p]; \\quad \\left|\\tfrac{1}{I}H_r(\\omega)\\right| \\le \\delta_2 \\ \\text{em}\\ [\\omega_s,\\pi]",
          ref: "IP-B eq. (9.52), p. 506",
          caption: {
            pt: "As especificações de ondulação (ganho I normalizado por 1/I): na passagem a resposta fica em 1 ± δ1; na rejeição, abaixo de δ2. δ1 é a ondulação de passagem e δ2 a de rejeição.",
            en: "The ripple specifications (gain I normalized by 1/I): in the passband the response stays within 1 ± δ1; in the stopband, below δ2. δ1 is the passband ripple and δ2 the stopband ripple.",
          },
        },
      ],
    },
    {
      kind: "formalization",
      title: { pt: "Ondulação e atenuação em decibéis", en: "Ripple and attenuation in decibels" },
      steps: [
        {
          latex: "R_p = 20\\log_{10}\\!\\frac{1+\\delta_1}{1-\\delta_1}, \\qquad A_s = -20\\log_{10}\\delta_2",
          ref: "IP-B §9.5.2, p. 506",
          caption: {
            pt: "Na prática especificamos Rp (ondulação de passagem) e As (atenuação de rejeição) em dB e convertemos para δ1 e δ2. Rp pequeno = passagem quase plana; As grande = rejeição bem fundo, com δ2 = 10^(−As/20).",
            en: "In practice we specify Rp (passband ripple) and As (stopband attenuation) in dB and convert to δ1 and δ2. Small Rp = nearly flat passband; large As = deep stopband, with δ2 = 10^(−As/20).",
          },
        },
        {
          latex: "\\omega_{x,s} \\to \\pi \\ \\Rightarrow\\ \\omega_s \\to \\pi/I \\quad (\\text{pior caso})",
          ref: "IP-B §9.5.2, p. 507",
          caption: {
            pt: "O compromisso: transição mais estreita e mais atenuação exigem M maior. No pior caso (sinal de banda plena) a rejeição começa em π/I, como no ideal.",
            en: "The trade-off: a narrower transition and more attenuation require a larger M. In the worst case (full-band signal) the stopband starts at π/I, as in the ideal.",
          },
        },
      ],
    },
    {
      kind: "example",
      title: { pt: "Recalculando um filtro bom", en: "Recomputing a good filter" },
      statement: {
        pt: "Vamos especificar corretamente um FIR para o MESMO sinal, cos(0,5πn), interpolado por I = 5 — agora com atenuação alta.",
        en: "Let's correctly specify an FIR for the SAME signal, cos(0.5πn), interpolated by I = 5 — now with high attenuation.",
      },
      steps: [
        {
          text: {
            pt: "O sinal é uma senoide em 0,5π, então preservar e banda total coincidem: ω_{x,p} = ω_{x,s} = 0,5π. Pela eq. (9.50):",
            en: "The signal is a sinusoid at 0.5π, so the band to preserve and the full band coincide: ω_{x,p} = ω_{x,s} = 0.5π. By eq. (9.50):",
          },
          latex: "\\omega_p = \\frac{0{,}5\\pi}{5} = 0{,}1\\pi, \\quad \\omega_s = \\frac{2\\pi - 0{,}5\\pi}{5} = 0{,}3\\pi",
        },
        {
          text: {
            pt: "Especificamos Rp = 0,01 dB (passagem plana) e As = 50 dB (rejeição funda). Isso leva a M em torno de 32 — pouca coisa a mais que o filtro ruim, mas com atenuação muito superior nas imagens.",
            en: "We specify Rp = 0.01 dB (flat passband) and As = 50 dB (deep stopband). This leads to M around 32 — only slightly more than the bad filter, but with much superior attenuation of the images.",
          },
          latex: "R_p = 0{,}01\\ \\text{dB}, \\quad A_s = 50\\ \\text{dB} \\ \\Rightarrow\\ M \\approx 32",
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "O bom filtro conserta a distorção", en: "The good filter fixes the distortion" },
      intro: {
        pt: "Agora com um filtro bem projetado (M grande, alta atenuação). Compare com o playground de antes: as imagens caem no zero do filtro, não vazam mais, e y(m) volta a seguir a linha cinza — a cossenoide reconstruída com pico ≈ 1 (fica azul, sem distorção). Especificar bem o filtro resolve o problema.",
        en: "Now with a well-designed filter (large M, high attenuation). Compare with the earlier playground: the images land on the filter's zero, no longer leak, and y(m) follows the grey line again — the reconstructed cosine with peak ≈ 1 (turns blue, no distortion). Specifying the filter well solves the problem.",
      },
      instrument: { component: "FIRInterpolationView", config: { initialM: 41 } },
    },
    {
      kind: "formalization",
      title: { pt: "O decimador FIR", en: "The FIR decimator" },
      steps: [
        {
          latex: "Y(\\omega_y) = \\frac{1}{D} \\sum_{k=0}^{D-1} H\\!\\left(\\frac{\\omega_y - 2\\pi k}{D}\\right) X\\!\\left(\\frac{\\omega_y - 2\\pi k}{D}\\right)",
          ref: "IP-B eq. (9.53), p. 508",
          caption: {
            pt: "Agora o decimador: substituímos o filtro ideal (Aula 3) por um FIR H(ω) ANTES do ↓D. A saída é a soma das D cópias, cada uma já multiplicada pelo filtro.",
            en: "Now the decimator: we replace the ideal filter (Lecture 3) with an FIR H(ω) BEFORE ↓D. The output is the sum of the D copies, each already multiplied by the filter.",
          },
        },
        {
          latex: "H(\\omega)\\,X(\\omega) = 0 \\quad \\text{para}\\ \\frac{\\pi}{D} \\le |\\omega| \\le \\pi",
          ref: "IP-B eq. (9.54), p. 509",
          caption: {
            pt: "A condição para NÃO haver aliasing: o produto H·X deve zerar acima de π/D. O filtro precisa atenuar tudo que dobraria na decimação. Se falhar lá, sobra energia que dobra para dentro da banda.",
            en: "The condition for NO aliasing: the product H·X must vanish above π/D. The filter must attenuate everything that would fold in the decimation. If it fails there, leftover energy folds into the band.",
          },
        },
        {
          latex: "Y(\\omega_y) = \\frac{1}{D}\\, X(\\omega)\\, H(\\omega)",
          ref: "IP-B eq. (9.55), p. 509",
          caption: {
            pt: "Se a condição vale, só a cópia k=0 sobrevive e a decimação é limpa: a saída é o espectro filtrado, escalado por 1/D. O papel do FIR é o do filtro anti-aliasing ideal, agora realizável.",
            en: "If the condition holds, only the k=0 copy survives and decimation is clean: the output is the filtered spectrum, scaled by 1/D. The FIR's role is that of the ideal anti-aliasing filter, now realizable.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "A componente que vaza e dobra (filtro ruim)", en: "The component that leaks and folds (bad filter)" },
      intro: {
        pt: "Decimar por 2 um sinal com uma componente baixa (0,2π, deve sobreviver) e uma alta (0,6π, acima do corte π/2). Com um filtro CURTO, a alta cai na parte alta do filtro e PASSA (barra laranja em cima); ao decimar, ela DOBRA para 0,8π e contamina a saída — é o aliasing. Observe as cópias 'passando' pelo filtro ruim.",
        en: "Decimate by 2 a signal with a low component (0.2π, should survive) and a high one (0.6π, above the π/2 cutoff). With a SHORT filter, the high lands on the filter's high part and PASSES (orange bar on top); when decimating, it FOLDS to 0.8π and contaminates the output — that's aliasing. Watch the copies 'passing' through the bad filter.",
      },
      instrument: { component: "FIRDecimSpectrumView", config: { initialM: 7 } },
    },
    {
      kind: "playground",
      title: { pt: "O aliasing no sinal (filtro ruim)", en: "The aliasing in the signal (bad filter)" },
      intro: {
        pt: "O mesmo filtro ruim, no tempo. A linha cinza é a componente baixa ideal. Como a alta vazou e dobrou, y(m) sai laranja e se afasta do cinza (erro alto). (Aumentar M já melhora — mas primeiro especificamos direito.)",
        en: "The same bad filter, in time. The grey line is the ideal low component. Since the high leaked and folded, y(m) comes out orange and strays from the grey (high error). (Raising M already helps — but first we specify it right.)",
      },
      instrument: { component: "FIRDecimationView", config: { initialM: 7 } },
    },
    {
      kind: "formalization",
      title: { pt: "Especificação do decimador", en: "The decimator's specification" },
      steps: [
        {
          latex: "\\omega_p \\approx \\frac{\\pi}{D}, \\qquad \\omega_s = \\omega_p + \\Delta\\omega",
          ref: "IP-B §9.5.3, p. 509",
          caption: {
            pt: "As especificações espelham as da interpolação: borda de passagem ω_p perto de π/D (o corte anti-aliasing), borda de rejeição ω_s = ω_p + transição, e as ondulações δ1 e δ2 (de Rp e As em dB). Transição estreita e As alto ⇒ M maior.",
            en: "The specs mirror the interpolation ones: passband edge ω_p near π/D (the anti-aliasing cutoff), stopband edge ω_s = ω_p + transition, and the ripples δ1 and δ2 (from Rp and As in dB). Narrow transition and high As ⇒ larger M.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "O bom filtro conserta o aliasing", en: "The good filter fixes the aliasing" },
      intro: {
        pt: "Agora com o decimador bem especificado (M grande). A componente alta cai no zero do filtro, não vaza, e y(m) volta a ser a componente baixa limpa, seguindo a linha cinza (fica azul, erro ≈ 0). Especificar bem resolve o aliasing, exatamente como resolveu a distorção na interpolação.",
        en: "Now with the well-specified decimator (large M). The high component lands on the filter's zero, doesn't leak, and y(m) becomes the clean low component again, following the grey line (turns blue, error ≈ 0). Specifying it well solves the aliasing, exactly as it solved the distortion in interpolation.",
      },
      instrument: { component: "FIRDecimationView", config: { initialM: 41 } },
    },
    {
      kind: "synthesis",
      title: { pt: "O que levar desta aula", en: "What to take from this lecture" },
      points: [
        {
          pt: "O filtro ideal (corte vertical, resposta infinita) é impossível; um FIR real o aproxima com M coeficientes, ao custo de banda de transição, ondulação e lóbulos de rejeição.",
          en: "The ideal filter (vertical cutoff, infinite response) is impossible; a real FIR approximates it with M coefficients, at the cost of a transition band, ripple and stopband lobes.",
        },
        {
          pt: "Um filtro mal especificado deixa energia vazar: na interpolação as imagens passam e distorcem o sinal (pico > 1); na decimação a energia fora de banda passa e dobra (aliasing). Um bom filtro conserta os dois.",
          en: "A poorly specified filter lets energy leak: in interpolation the images pass and distort the signal (peak > 1); in decimation the out-of-band energy passes and folds (aliasing). A good filter fixes both.",
        },
        {
          pt: "Especificamos por bordas (ω_p, ω_s a partir de ω_{x,p}, ω_{x,s}), ondulação (Rp/δ1) e atenuação (As/δ2). Transição estreita e mais atenuação exigem M maior. O projeto em si (obter os coeficientes) está na trilha de Revisão.",
          en: "We specify by edges (ω_p, ω_s from ω_{x,p}, ω_{x,s}), ripple (Rp/δ1) and attenuation (As/δ2). A narrow transition and more attenuation require a larger M. The design itself (getting the coefficients) is in the Review track.",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Teste seu entendimento", en: "Test your understanding" },
      quizzes: [
        {
          question: {
            pt: "Ao interpolar com um filtro FIR curto demais, o que causa a distorção do sinal?",
            en: "When interpolating with a too-short FIR filter, what causes the signal distortion?",
          },
          options: [
            { pt: "O ganho de passagem vira 1 em vez de I.", en: "The passband gain becomes 1 instead of I." },
            { pt: "A rejeição fraca deixa as imagens do ↑I vazarem e se somarem ao sinal.", en: "The weak attenuation lets the ↑I images leak and add to the signal." },
            { pt: "O corte se desloca de π/I para π/2.", en: "The cutoff moves from π/I to π/2." },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "Filtro curto = transição larga + pouca atenuação. As imagens do ↑I caem sobre a parte alta do filtro e passam, somando-se ao sinal — o pico ultrapassa 1 e a forma se distorce.",
                en: "Short filter = wide transition + low attenuation. The ↑I images land on the filter's high part and pass, adding to the signal — the peak exceeds 1 and the shape distorts.",
              },
            },
          ],
        },
        {
          question: {
            pt: "Por que a borda de rejeição do interpolador pode começar em (2π−ω_{x,s})/I e não só em π/I?",
            en: "Why can the interpolator's stopband start at (2π−ω_{x,s})/I and not only at π/I?",
          },
          options: [
            {
              pt: "Porque, se o sinal não usa toda a banda (ω_{x,s} < π), há uma faixa vazia que o filtro pode usar como transição, permitindo uma ordem menor.",
              en: "Because, if the signal doesn't use the full band (ω_{x,s} < π), there's an empty range the filter can use as transition, allowing a lower order.",
            },
            { pt: "Porque o ganho do filtro é I.", en: "Because the filter's gain is I." },
            { pt: "Porque o filtro é sempre de fase linear.", en: "Because the filter is always linear-phase." },
          ],
          correctIndex: 0,
          solution: [
            {
              text: {
                pt: "A eq. (9.50) usa a banda real do sinal: se ω_{x,s} < π, a rejeição só precisa começar em (2π−ω_{x,s})/I, dando transição mais larga e filtro mais curto. No pior caso (ω_{x,s}=π) volta a π/I.",
                en: "Eq. (9.50) uses the signal's real bandwidth: if ω_{x,s} < π, the stopband only needs to start at (2π−ω_{x,s})/I, giving a wider transition and a shorter filter. In the worst case (ω_{x,s}=π) it goes back to π/I.",
              },
            },
          ],
        },
      ],
    },
  ],
};
