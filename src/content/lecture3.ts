import type { Lecture } from "./types.ts";

export const lecture3: Lecture = {
  id: 3,
  lectureLabel: { pt: "Aula 3", en: "Lecture 3" },
  sections: [
    {
      kind: "prose",
      label: { pt: "Motivação", en: "Motivation" },
      title: { pt: "Decimar sem estragar o sinal", en: "Decimate without ruining the signal" },
      text: {
        pt: "Na Aula 2 vimos o problema: aplicar o downsampler ↓D direto cria D cópias do espectro que se sobrepõem sempre que o sinal tem energia acima de π/D — e essa sobreposição é o aliasing, que corrompe o sinal de forma irreversível. Nesta aula resolvemos isso. A ideia é simples e é o padrão de todo sistema real de decimação: proteger a banda antes de jogar amostras fora.",
        en: "In Lecture 2 we saw the problem: applying the ↓D downsampler directly creates D copies of the spectrum that overlap whenever the signal has energy above π/D — and that overlap is aliasing, which corrupts the signal irreversibly. In this lecture we fix it. The idea is simple and is the standard in every real decimation system: protect the band before throwing samples away.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Intuição", en: "Intuition" },
      title: { pt: "Filtrar antes de decimar", en: "Filter before decimating" },
      text: {
        pt: "Se o aliasing nasce da energia acima de π/D, a defesa é remover essa energia ANTES do ↓D. Colocamos um filtro passa-baixas na frente do downsampler: ele deixa passar a banda que queremos (até π/D) e corta o resto. Sem energia acima de π/D, não há o que dobrar — as cópias não se sobrepõem. Esse conjunto passa-baixas + downsampler é o decimador ideal.",
        en: "If aliasing is born from energy above π/D, the defense is to remove that energy BEFORE ↓D. We place a lowpass filter in front of the downsampler: it lets through the band we want (up to π/D) and cuts the rest. With no energy above π/D, there is nothing to fold — the copies don't overlap. This lowpass + downsampler combination is the ideal decimator.",
      },
    },
    {
      kind: "playground",
      title: { pt: "A estrutura do decimador ideal", en: "The ideal decimator's structure" },
      intro: {
        pt: "O decimador ideal é o filtro passa-baixas colocado à frente do ↓D. O sinal x(n) (taxa Fx) passa primeiro pelo filtro de corte π/D, virando v(n); só então é decimado, saindo como y(m) na taxa Fx/D. Mude D e veja o corte π/D e a taxa de saída acompanharem.",
        en: "The ideal decimator is the lowpass filter placed in front of ↓D. The signal x(n) (rate Fx) first passes through the cutoff-π/D filter, becoming v(n); only then is it decimated, coming out as y(m) at rate Fx/D. Change D and watch the π/D cutoff and the output rate follow.",
      },
      instrument: { component: "DecimatorStructureView" },
    },
    {
      kind: "formalization",
      title: { pt: "O filtro anti-aliasing", en: "The anti-aliasing filter" },
      steps: [
        {
          latex:
            "H_D(\\omega_x) = \\begin{cases} 1, & |\\omega_x| \\le \\pi/D \\\\ 0, & \\text{caso contrário} \\end{cases}",
          ref: "IP-B eq. (9.20), p. 482",
          caption: {
            pt: "O filtro anti-aliasing ideal: ganho 1 na banda que sobrevive (|ω_x| ≤ π/D) e 0 acima dela. Ele elimina o espectro de X no intervalo π/D < |ω_x| < π — justamente a energia que causaria aliasing.",
            en: "The ideal anti-aliasing filter: gain 1 in the surviving band (|ω_x| ≤ π/D) and 0 above it. It eliminates the spectrum of X in the range π/D < |ω_x| < π — exactly the energy that would cause aliasing.",
          },
        },
        {
          latex: "v(n) = \\sum_{k=0}^{\\infty} h(k)\\, x(n-k)",
          ref: "IP-B eq. (9.21), p. 483",
          caption: {
            pt: "A saída do filtro é a convolução de x com a resposta ao impulso h do passa-baixas: v(n) é o sinal já limitado em banda.",
            en: "The filter output is the convolution of x with the lowpass impulse response h: v(n) is the now band-limited signal.",
          },
        },
        {
          latex: "y(m) = v(mD) = \\sum_{k=0}^{\\infty} h(k)\\, x(mD-k)",
          ref: "IP-B eq. (9.22), p. 483",
          caption: {
            pt: "Aí sim aplicamos o downsampler: y(m) = v(mD). Embora a filtragem seja LIT, a combinação com o ↓D continua sendo um sistema variante no tempo — como na Aula 2.",
            en: "Only then do we apply the downsampler: y(m) = v(mD). Although the filtering is LTI, its combination with ↓D is still a time-variant system — as in Lecture 2.",
          },
        },
      ],
    },
    {
      kind: "formalization",
      title: { pt: "Por que o espectro fica limpo", en: "Why the spectrum comes out clean" },
      steps: [
        {
          latex:
            "Y(z) = \\frac{1}{D} \\sum_{k=0}^{D-1} H\\!\\left(e^{-j2\\pi k/D} z^{1/D}\\right) X\\!\\left(e^{-j2\\pi k/D} z^{1/D}\\right)",
          ref: "IP-B eq. (9.23), p. 483",
          caption: {
            pt: "Repetimos a dedução da transformada z da Aula 2 (eq. 9.12), mas agora sobre v = h∗x: cada uma das D cópias carrega também o filtro H.",
            en: "We repeat the z-transform derivation from Lecture 2 (eq. 9.12), but now over v = h∗x: each of the D copies also carries the filter H.",
          },
        },
        {
          latex:
            "Y(\\omega_y) = \\frac{1}{D} \\sum_{k=0}^{D-1} H_D\\!\\left(\\frac{\\omega_y - 2\\pi k}{D}\\right) X\\!\\left(\\frac{\\omega_y - 2\\pi k}{D}\\right)",
          ref: "IP-B eq. (9.24), p. 483",
          caption: {
            pt: "No círculo unitário: as D cópias de X, cada uma multiplicada pela cópia deslocada do filtro H_D. O filtro é a chave — ele decide quais cópias sobrevivem.",
            en: "On the unit circle: the D copies of X, each multiplied by the shifted copy of the filter H_D. The filter is the key — it decides which copies survive.",
          },
        },
        {
          latex: "H_D\\!\\left(\\frac{\\omega_y - 2\\pi k}{D}\\right) = 0, \\quad k = 1, 2, \\dots, D-1",
          ref: "IP-B, desenvolvimento de (9.24)→(9.25), p. 483",
          caption: {
            pt: "Passo-chave: para |ω_y| ≤ π e k ≠ 0, o argumento (ω_y − 2πk)/D cai fora de [−π/D, π/D], onde H_D é zero. Logo todas as cópias deslocadas são anuladas — sobra só o termo k = 0.",
            en: "Key step: for |ω_y| ≤ π and k ≠ 0, the argument (ω_y − 2πk)/D falls outside [−π/D, π/D], where H_D is zero. So every shifted copy is killed — only the k = 0 term remains.",
          },
        },
        {
          latex:
            "Y(\\omega_y) = \\frac{1}{D}\\, H_D\\!\\left(\\frac{\\omega_y}{D}\\right) X\\!\\left(\\frac{\\omega_y}{D}\\right) = \\frac{1}{D}\\, X\\!\\left(\\frac{\\omega_y}{D}\\right), \\quad |\\omega_y| \\le \\pi",
          ref: "IP-B eq. (9.25), p. 483",
          caption: {
            pt: "Com o filtro bem projetado, o aliasing some e a saída é uma cópia limpa do espectro de entrada, esticada por D e com amplitude 1/D. É exatamente o resultado sem aliasing da Aula 2 (eq. 9.19), agora garantido pelo filtro.",
            en: "With a well-designed filter, aliasing vanishes and the output is a clean copy of the input spectrum, stretched by D and scaled by 1/D. It is exactly the no-aliasing result of Lecture 2 (eq. 9.19), now guaranteed by the filter.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "O filtro em ação", en: "The filter in action" },
      intro: {
        pt: "O mesmo espectro da Aula 2, agora com o filtro. Em cima, a banda do sinal |X| e o filtro H_D (corte π/D). Embaixo, a saída depois do ↓D: as D cópias e sua soma. Aumente ω_c além de π/D e desligue o filtro: as cópias se sobrepõem — aliasing. Ligue o filtro: a energia acima de π/D é cortada (cinza) e a saída vira uma cópia limpa. Mude também D.",
        en: "The same spectrum as Lecture 2, now with the filter. On top, the signal band |X| and the filter H_D (cutoff π/D). Below, the output after ↓D: the D copies and their sum. Raise ω_c past π/D and turn the filter off: the copies overlap — aliasing. Turn the filter on: the energy above π/D is cut (grey) and the output becomes a clean copy. Change D too.",
      },
      instrument: { component: "IdealDecimatorView" },
    },
    {
      kind: "example",
      title: { pt: "Decimando cos(0,125πn)", en: "Decimating cos(0.125πn)" },
      statement: {
        pt: "Seja x(n) = cos(0,125πn). Queremos decimar por D = 2, 4 e 8 usando o decimador ideal. Em quais desses fatores o sinal sobrevive sem aliasing, e onde ele aparece na saída?",
        en: "Let x(n) = cos(0.125πn). We want to decimate by D = 2, 4 and 8 using the ideal decimator. For which of these factors does the signal survive without aliasing, and where does it appear at the output?",
      },
      steps: [
        {
          text: {
            pt: "A frequência do sinal é ω_x = 0,125π = π/8. A condição sem aliasing pede o sinal dentro do corte do filtro: ω_x ≤ π/D.",
            en: "The signal frequency is ω_x = 0.125π = π/8. The no-aliasing condition asks the signal to be within the filter cutoff: ω_x ≤ π/D.",
          },
          latex: "\\omega_x = 0{,}125\\pi = \\frac{\\pi}{8} \\le \\frac{\\pi}{D} \\iff D \\le 8",
        },
        {
          text: {
            pt: "Para D = 2, 4 e 8, temos D ≤ 8, então o filtro deixa o sinal passar (nada é removido) e não há aliasing. Após o ↓D a frequência estica por D (ω_y = D·ω_x):",
            en: "For D = 2, 4 and 8, we have D ≤ 8, so the filter lets the signal through (nothing is removed) and there is no aliasing. After ↓D the frequency stretches by D (ω_y = D·ω_x):",
          },
          latex: "\\omega_y = D\\,\\frac{\\pi}{8}: \\quad D{=}2 \\to \\tfrac{\\pi}{4}, \\quad D{=}4 \\to \\tfrac{\\pi}{2}, \\quad D{=}8 \\to \\pi",
        },
        {
          text: {
            pt: "Todos ficam em |ω_y| ≤ π: decimação limpa. Em D = 8 o sinal cai exatamente no novo Nyquist (π). Se tentássemos D > 8, teríamos π/8 > π/D — aí o filtro removeria o sinal (em vez de deixá-lo dobrar).",
            en: "All stay within |ω_y| ≤ π: clean decimation. At D = 8 the signal lands exactly at the new Nyquist (π). If we tried D > 8, we would have π/8 > π/D — then the filter would remove the signal (instead of letting it fold).",
          },
        },
      ],
    },
    {
      kind: "synthesis",
      title: { pt: "O que levar desta aula", en: "What to take from this lecture" },
      points: [
        {
          pt: "O decimador ideal é um filtro passa-baixas (corte π/D, ganho 1) colocado ANTES do downsampler ↓D (eq. 9.20).",
          en: "The ideal decimator is a lowpass filter (cutoff π/D, gain 1) placed BEFORE the ↓D downsampler (eq. 9.20).",
        },
        {
          pt: "Filtrar antes remove a energia acima de π/D, então das D cópias do espectro (eq. 9.24) só o termo k = 0 sobrevive: as cópias deslocadas são zeradas pelo filtro.",
          en: "Filtering first removes the energy above π/D, so of the D copies of the spectrum (eq. 9.24) only the k = 0 term survives: the shifted copies are zeroed by the filter.",
        },
        {
          pt: "A saída é o espectro de entrada limpo, esticado por D e com amplitude 1/D: Y(ω_y) = (1/D)·X(ω_y/D) (eq. 9.25).",
          en: "The output is the clean input spectrum, stretched by D and scaled by 1/D: Y(ω_y) = (1/D)·X(ω_y/D) (eq. 9.25).",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Teste seu entendimento", en: "Test your understanding" },
      quizzes: [
        {
          question: {
            pt: "Qual é a frequência de corte do filtro anti-aliasing de um decimador por fator D?",
            en: "What is the cutoff frequency of the anti-aliasing filter of a decimator by factor D?",
          },
          options: [
            { pt: "π/2", en: "π/2" },
            { pt: "π·D", en: "π·D" },
            { pt: "π/D", en: "π/D" },
            { pt: "2π/D", en: "2π/D" },
          ],
          correctIndex: 2,
          solution: [
            {
              text: {
                pt: "O filtro precisa manter só a banda que sobrevive à decimação, |ω_x| ≤ π/D (eq. 9.20). Acima disso, as cópias se sobreporiam.",
                en: "The filter must keep only the band that survives decimation, |ω_x| ≤ π/D (eq. 9.20). Above that, the copies would overlap.",
              },
            },
          ],
        },
        {
          question: {
            pt: "No decimador ideal, por que apenas o termo k = 0 sobra na soma da eq. (9.24)?",
            en: "In the ideal decimator, why does only the k = 0 term survive in the sum of eq. (9.24)?",
          },
          options: [
            {
              pt: "Porque o filtro zera as cópias deslocadas: para k ≠ 0 o argumento cai fora de [−π/D, π/D], onde H_D = 0.",
              en: "Because the filter zeroes the shifted copies: for k ≠ 0 the argument falls outside [−π/D, π/D], where H_D = 0.",
            },
            {
              pt: "Porque D é sempre igual a 1.",
              en: "Because D is always equal to 1.",
            },
            {
              pt: "Porque o downsampler é invariante no deslocamento.",
              en: "Because the downsampler is shift-invariant.",
            },
          ],
          correctIndex: 0,
          solution: [
            {
              text: {
                pt: "Para |ω_y| ≤ π e k ≠ 0, (ω_y − 2πk)/D sai da banda de passagem do filtro, então H_D anula essas cópias. Sobra Y(ω_y) = (1/D)X(ω_y/D) (eq. 9.25).",
                en: "For |ω_y| ≤ π and k ≠ 0, (ω_y − 2πk)/D leaves the filter passband, so H_D nulls those copies. What remains is Y(ω_y) = (1/D)X(ω_y/D) (eq. 9.25).",
              },
            },
          ],
        },
      ],
    },
  ],
};
