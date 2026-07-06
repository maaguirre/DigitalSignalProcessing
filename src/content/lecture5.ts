import type { Lecture } from "./types.ts";

export const lecture5: Lecture = {
  id: 5,
  lectureLabel: { pt: "Aula 5", en: "Lecture 5" },
  sections: [
    {
      kind: "prose",
      label: { pt: "Motivação", en: "Motivation" },
      title: { pt: "Mudar a taxa por um fator racional", en: "Changing the rate by a rational factor" },
      text: {
        pt: "Decimar (÷D) e interpolar (×I) mudam a taxa por fatores inteiros. Mas o mundo real precisa de razões que não são inteiras: converter áudio de CD (44,1 kHz) para estúdio (48 kHz), por exemplo, exige multiplicar a taxa por 48/44,1. Como fazer isso, se só sabemos multiplicar e dividir por inteiros? A pergunta desta aula: como mudar a taxa por um fator racional I/D?",
        en: "Decimation (÷D) and interpolation (×I) change the rate by integer factors. But the real world needs non-integer ratios: converting audio from CD (44.1 kHz) to studio (48 kHz), for example, requires multiplying the rate by 48/44.1. How do we do that, if we only know how to multiply and divide by integers? This lecture's question: how do we change the rate by a rational factor I/D?",
      },
    },
    {
      kind: "prose",
      label: { pt: "Intuição", en: "Intuition" },
      title: { pt: "Interpolar primeiro, decimar depois", en: "Interpolate first, decimate after" },
      text: {
        pt: "A ideia é combinar as duas operações: primeiro interpolar por I (↑I), depois decimar por D (↓D). A ordem importa — interpolar PRIMEIRO garante que não jogamos fora informação antes de precisar dela. Entre as duas etapas fica um filtro passa-baixas. E o mais elegante: um único filtro faz os dois papéis (anti-imaging do ↑I e anti-aliasing do ↓D) ao mesmo tempo.",
        en: "The idea is to combine the two operations: first interpolate by I (↑I), then decimate by D (↓D). The order matters — interpolating FIRST ensures we don't throw away information before we need it. Between the two stages sits a lowpass filter. And most elegant: a single filter does both jobs (anti-imaging for ↑I and anti-aliasing for ↓D) at once.",
      },
    },
    {
      kind: "formalization",
      title: { pt: "A cascata I/D e o filtro combinado", en: "The I/D cascade and the combined filter" },
      steps: [
        {
          latex:
            "H(\\omega_v) = \\begin{cases} I, & 0 \\le |\\omega_v| \\le \\min(\\pi/D,\\ \\pi/I) \\\\ 0, & \\text{caso contrário} \\end{cases}",
          ref: "IP-B eq. (9.36), p. 493",
          caption: {
            pt: "O filtro combinado: ele tem que remover as imagens (corte π/I) E evitar o aliasing (corte π/D). Para satisfazer os dois, o corte é o MENOR dos limites, min(π/I, π/D). O ganho é I (o mesmo do interpolador). ω_v = ω_x/I é a frequência na taxa intermediária I·Fx.",
            en: "The combined filter: it must remove the images (cutoff π/I) AND avoid aliasing (cutoff π/D). To satisfy both, the cutoff is the SMALLER of the limits, min(π/I, π/D). The gain is I (the interpolator's). ω_v = ω_x/I is the frequency at the intermediate rate I·Fx.",
          },
        },
        {
          latex: "F_y = \\frac{I}{D}\\, F_x",
          ref: "IP-B §9.4, p. 493",
          caption: {
            pt: "A taxa de saída é (I/D)·Fx. Se D > I a taxa cai (o filtro é dominado pelo corte π/D); se D < I a taxa sobe (dominado por π/I). Um mesmo diagrama cobre decimação, interpolação e tudo entre eles.",
            en: "The output rate is (I/D)·Fx. If D > I the rate drops (the filter is dominated by the π/D cutoff); if D < I the rate rises (dominated by π/I). One diagram covers decimation, interpolation and everything between.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "A estrutura I/D no espectro", en: "The I/D structure in the spectrum" },
      intro: {
        pt: "Siga o espectro pela cadeia ↑I → filtro → ↓D. |X| entra; o ↑I cria as imagens (|V|); o passa-baixas (corte min(π/I, π/D), marcado em laranja) deixa só a banda base (|W|); o ↓D estica de volta para a saída (|Y|). Mude I e D e veja o corte do filtro sempre acompanhar o mais restritivo dos dois.",
        en: "Follow the spectrum along the ↑I → filter → ↓D chain. |X| comes in; ↑I creates the images (|V|); the lowpass (cutoff min(π/I, π/D), marked in orange) keeps only the baseband (|W|); ↓D stretches it back to the output (|Y|). Change I and D and watch the filter cutoff always follow the more restrictive of the two.",
      },
      instrument: { component: "RationalStructureView" },
    },
    {
      kind: "formalization",
      title: { pt: "As três operações no tempo", en: "The three operations in time" },
      steps: [
        {
          latex:
            "v(k) = \\begin{cases} x(k/I), & k = 0, \\pm I, \\pm 2I, \\dots \\\\ 0, & \\text{caso contrário} \\end{cases}",
          ref: "IP-B eq. (9.37), p. 494",
          caption: {
            pt: "Primeiro o upsampler: v(k) é x com I−1 zeros intercalados, na taxa I·Fx.",
            en: "First the upsampler: v(k) is x with I−1 zeros interlaced, at rate I·Fx.",
          },
        },
        {
          latex: "w(k) = \\sum_{\\ell=-\\infty}^{\\infty} h(k-\\ell)\\, v(\\ell) = \\sum_{\\ell=-\\infty}^{\\infty} h(k-\\ell I)\\, x(\\ell)",
          ref: "IP-B eq. (9.38), p. 494",
          caption: {
            pt: "Depois o filtro: w é a convolução de v com h. Como v só é não-nula nos múltiplos de I, a soma passa a ser sobre as amostras de x — o filtro 'preenche' os zeros.",
            en: "Then the filter: w is the convolution of v with h. Since v is nonzero only at multiples of I, the sum runs over x's samples — the filter 'fills in' the zeros.",
          },
        },
        {
          latex: "y(m) = w(mD) = \\sum_{\\ell=-\\infty}^{\\infty} h(mD - \\ell I)\\, x(\\ell)",
          ref: "IP-B eq. (9.39), p. 494",
          caption: {
            pt: "Por fim o downsampler: y(m) = w(mD) pega uma amostra a cada D de w. Juntando tudo, a saída é essa soma única sobre x.",
            en: "Finally the downsampler: y(m) = w(mD) takes one sample of every D of w. Putting it all together, the output is this single sum over x.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "A convolução passo a passo", en: "Convolution step by step" },
      intro: {
        pt: "Uma demonstração da convolução da eq. (9.38). O filtro h aparece invertido — por isso h(k−ℓ) — e posicionado em k; em azul está o sinal v(ℓ). Onde os dois se sobrepõem (região destacada), cada par de amostras é multiplicado, e os produtos são empilhados numa barra: a altura dessa barra é w(k). Anime ou arraste k para ver o filtro deslizar e cada w(k) ser montado bloco a bloco.",
        en: "A demonstration of the convolution in eq. (9.38). The filter h appears flipped — hence h(k−ℓ) — and placed at k; in blue is the signal v(ℓ). Where the two overlap (highlighted region), each pair of samples is multiplied, and the products are stacked into a bar: the height of that bar is w(k). Animate or drag k to watch the filter slide and each w(k) get assembled block by block.",
      },
      instrument: { component: "ConvolutionView" },
    },
    {
      kind: "playground",
      title: { pt: "Os sinais no tempo (I/D)", en: "The signals in time (I/D)" },
      intro: {
        pt: "As quatro etapas em amostras, para I = 3 e D = 2 (a razão 3/2). x(n) entra; v(k) tem os zeros do ↑I; w(k) é o sinal reconstruído pelo filtro na taxa alta; y(m) pega 1 a cada D de w. A linha cinza é o sinal original: w o reconstrói inteiro e y é a reamostragem dele na taxa I/D·Fx. Mude I e D.",
        en: "The four stages in samples, for I = 3 and D = 2 (the ratio 3/2). x(n) comes in; v(k) has the ↑I zeros; w(k) is the signal reconstructed by the filter at the high rate; y(m) takes 1 of every D of w. The grey line is the original signal: w rebuilds it fully and y is its resampling at rate I/D·Fx. Change I and D.",
      },
      instrument: { component: "RationalTimeView" },
    },
    {
      kind: "formalization",
      title: { pt: "A conversão como filtro variante no tempo", en: "The conversion as a time-varying filter" },
      steps: [
        {
          latex: "\\ell = \\left\\lfloor \\frac{mD}{I} \\right\\rfloor - n",
          ref: "IP-B eq. (9.40), p. 494",
          caption: {
            pt: "Uma troca de variável em (9.39): separamos o índice ℓ em uma parte 'inteira' ⌊mD/I⌋ e um deslocamento n. ⌊·⌋ é o piso (maior inteiro contido).",
            en: "A change of variable in (9.39): we split the index ℓ into an 'integer' part ⌊mD/I⌋ and an offset n. ⌊·⌋ is the floor (largest integer contained).",
          },
        },
        {
          latex:
            "y(m) = \\sum_{n=-\\infty}^{\\infty} h\\!\\left(nI + ((mD))_I\\right) x\\!\\left(\\left\\lfloor \\tfrac{mD}{I} \\right\\rfloor - n\\right), \\quad ((mD))_I = mD \\bmod I",
          ref: "IP-B eqs. (9.41)–(9.42), p. 494–495",
          caption: {
            pt: "Reescrevendo, o coeficiente do filtro que a saída m usa depende de (mD) mod I. Ou seja, os coeficientes efetivos mudam ciclicamente com m, com período I.",
            en: "Rewriting, the filter coefficient that output m uses depends on (mD) mod I. That is, the effective coefficients change cyclically with m, with period I.",
          },
        },
        {
          latex: "g(n, m) = h\\!\\left(nI + ((mD))_I\\right)",
          ref: "IP-B eq. (9.43), p. 495",
          caption: {
            pt: "A conversão I/D é, então, uma filtragem VARIANTE no tempo: g(n,m) é um filtro cujos coeficientes dependem de m (mod I). Essa periodicidade é exatamente o que a estrutura polifásica vai explorar para não desperdiçar contas (Aula 8).",
            en: "The I/D conversion is therefore a TIME-VARYING filtering: g(n,m) is a filter whose coefficients depend on m (mod I). This periodicity is exactly what the polyphase structure will exploit to avoid wasting computation (Lecture 8).",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "As fases do filtro variante no tempo", en: "The phases of the time-varying filter" },
      intro: {
        pt: "A eq. (9.43) diz que cada saída m usa só uma fatia do filtro: os coeficientes h(nI + p), com p = (mD) mod I. Aqui h está colorido por fase (índice mod I). Anime m e veja a fase ativa (destacada) CICLAR com período I — o filtro é o mesmo, mas cada saída usa uma fatia diferente, em rodízio. Guardar essas fatias separadas é a estrutura polifásica da Aula 8.",
        en: "Eq. (9.43) says each output m uses only one slice of the filter: the coefficients h(nI + p), with p = (mD) mod I. Here h is coloured by phase (index mod I). Animate m and watch the active phase (highlighted) CYCLE with period I — the filter is the same, but each output uses a different slice, in rotation. Storing those slices separately is Lecture 8's polyphase structure.",
      },
      instrument: { component: "TimeVaryingFilterView" },
    },
    {
      kind: "example",
      title: { pt: "48 kHz → 44,1 kHz (o caso do CD)", en: "48 kHz → 44.1 kHz (the CD case)" },
      statement: {
        pt: "Queremos converter áudio de 48 kHz (estúdio) para 44,1 kHz (CD). Que I e D usar, qual o filtro e qual a taxa de saída?",
        en: "We want to convert audio from 48 kHz (studio) to 44.1 kHz (CD). Which I and D, which filter and what output rate?",
      },
      steps: [
        {
          text: {
            pt: "A razão de taxas é 44100/48000. Simplificando a fração:",
            en: "The rate ratio is 44100/48000. Reducing the fraction:",
          },
          latex: "\\frac{44100}{48000} = \\frac{147}{160} = \\frac{I}{D} \\ \\Rightarrow\\ I = 147,\\ D = 160",
        },
        {
          text: {
            pt: "Então: ↑147 → filtro → ↓160. O corte do filtro é o menor limite; como D = 160 > I = 147, domina o π/D:",
            en: "So: ↑147 → filter → ↓160. The filter cutoff is the smaller limit; since D = 160 > I = 147, the π/D dominates:",
          },
          latex: "\\min\\!\\left(\\tfrac{\\pi}{147}, \\tfrac{\\pi}{160}\\right) = \\tfrac{\\pi}{160}, \\quad \\text{ganho } I = 147",
        },
        {
          text: {
            pt: "A taxa de saída confirma o alvo: Fy = (147/160)·48000 = 44100 Hz. (Na prática, os fatores grandes tornam a estrutura polifásica indispensável — Aula 8.)",
            en: "The output rate confirms the target: Fy = (147/160)·48000 = 44100 Hz. (In practice, the large factors make the polyphase structure indispensable — Lecture 8.)",
          },
          latex: "F_y = \\tfrac{147}{160}\\cdot 48000 = 44100\\ \\text{Hz}",
        },
      ],
    },
    {
      kind: "synthesis",
      title: { pt: "O que levar desta aula", en: "What to take from this lecture" },
      points: [
        {
          pt: "Mudar a taxa por I/D = interpolar por I, filtrar e decimar por D, nessa ordem. A taxa de saída é (I/D)·Fx.",
          en: "Changing the rate by I/D = interpolate by I, filter and decimate by D, in that order. The output rate is (I/D)·Fx.",
        },
        {
          pt: "Um único passa-baixas faz os dois papéis: corte min(π/I, π/D) (o mais restritivo) e ganho I (eq. 9.36).",
          en: "A single lowpass does both jobs: cutoff min(π/I, π/D) (the most restrictive) and gain I (eq. 9.36).",
        },
        {
          pt: "No tempo, a conversão é um filtro variante no tempo g(n,m) = h(nI + (mD) mod I) (eq. 9.43) — coeficientes cíclicos de período I, a semente da estrutura polifásica.",
          en: "In time, the conversion is a time-varying filter g(n,m) = h(nI + (mD) mod I) (eq. 9.43) — cyclic coefficients of period I, the seed of the polyphase structure.",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Teste seu entendimento", en: "Test your understanding" },
      quizzes: [
        {
          question: {
            pt: "Na conversão por I/D, qual é a frequência de corte do filtro combinado?",
            en: "In I/D conversion, what is the cutoff frequency of the combined filter?",
          },
          options: [
            { pt: "max(π/I, π/D)", en: "max(π/I, π/D)" },
            { pt: "π/(I·D)", en: "π/(I·D)" },
            { pt: "min(π/I, π/D)", en: "min(π/I, π/D)" },
            { pt: "π/I + π/D", en: "π/I + π/D" },
          ],
          correctIndex: 2,
          solution: [
            {
              text: {
                pt: "O filtro precisa remover as imagens (corte π/I) E evitar o aliasing (corte π/D). Só o MENOR dos dois satisfaz as duas exigências (eq. 9.36).",
                en: "The filter must remove the images (cutoff π/I) AND avoid aliasing (cutoff π/D). Only the SMALLER of the two meets both requirements (eq. 9.36).",
              },
            },
          ],
        },
        {
          question: {
            pt: "Por que interpolamos (↑I) ANTES de decimar (↓D), e não o contrário?",
            en: "Why do we interpolate (↑I) BEFORE decimating (↓D), and not the other way around?",
          },
          options: [
            {
              pt: "Porque ↑I e ↓D não podem ser trocados de ordem em nenhuma hipótese.",
              en: "Because ↑I and ↓D can never be swapped under any circumstances.",
            },
            {
              pt: "Decimar primeiro poderia jogar fora informação do sinal antes de precisarmos dela; interpolar primeiro preserva o conteúdo.",
              en: "Decimating first could throw away signal information before we need it; interpolating first preserves the content.",
            },
            {
              pt: "Porque decimar primeiro deixaria a taxa de saída errada.",
              en: "Because decimating first would give the wrong output rate.",
            },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "Se decimássemos primeiro, o ↓D poderia remover componentes que a interpolação depois não recupera. Interpolando primeiro, a informação é preservada e o filtro cuida das imagens e do aliasing juntos.",
                en: "If we decimated first, ↓D could remove components that interpolation cannot later recover. Interpolating first, the information is preserved and the filter handles images and aliasing together.",
              },
            },
          ],
        },
      ],
    },
  ],
};
