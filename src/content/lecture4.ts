import type { Lecture } from "./types.ts";

export const lecture4: Lecture = {
  id: 4,
  lectureLabel: { pt: "Aula 4", en: "Lecture 4" },
  sections: [
    {
      kind: "prose",
      label: { pt: "Motivação", en: "Motivation" },
      title: { pt: "Aumentar a taxa é interpolar", en: "Raising the rate is interpolation" },
      text: {
        pt: "Nas Aulas 2 e 3 diminuímos a taxa (decimação). Agora fazemos o oposto: aumentá-la por um fator inteiro I, o que se chama interpolar — precisamos de I−1 novas amostras entre cada par de amostras vizinhas. Aparece de novo a mesma pergunta concreta, agora ao contrário: como, na prática, criamos essas amostras que faltam sem distorcer o sinal?",
        en: "In Lectures 2 and 3 we lowered the rate (decimation). Now we do the opposite: raise it by an integer factor I, which is called interpolation — we need I−1 new samples between each pair of neighbouring samples. The same concrete question shows up again, now reversed: in practice, how do we create these missing samples without distorting the signal?",
      },
    },
    {
      kind: "prose",
      label: { pt: "Intuição", en: "Intuition" },
      title: { pt: "Primeiro os zeros, depois preencher", en: "First the zeros, then fill them in" },
      text: {
        pt: "A interpolação é feita em dois passos. Primeiro criamos um sinal na taxa alta intercalando I−1 zeros entre as amostras de x(n) — essa operação chama-se upsampling (↑I). Só que zeros não são o sinal certo: eles deixam 'buracos'. No segundo passo, um filtro preenche esses buracos, produzindo as amostras interpoladas. Como na decimação, estudamos primeiro o upsampler e o que ele faz com o espectro, e só então o filtro que conserta.",
        en: "Interpolation is done in two steps. First we build a high-rate signal by interlacing I−1 zeros between the samples of x(n) — this operation is called upsampling (↑I). But zeros are not the right signal: they leave 'holes'. In the second step, a filter fills those holes, producing the interpolated samples. As in decimation, we first study the upsampler and what it does to the spectrum, and only then the filter that fixes it.",
      },
    },
    {
      kind: "formalization",
      title: { pt: "O upsampler ↑I", en: "The ↑I upsampler" },
      steps: [
        {
          latex:
            "v(m) = \\begin{cases} x(m/I), & m = 0, \\pm I, \\pm 2I, \\dots \\\\ 0, & \\text{caso contrário} \\end{cases}",
          ref: "IP-B eq. (9.26), p. 486",
          caption: {
            pt: "O upsampler ↑I coloca as amostras de x nas posições múltiplas de I e zeros entre elas. A saída v(m) tem I vezes mais amostras e roda na taxa Fy = I·Fx.",
            en: "The ↑I upsampler places x's samples at positions that are multiples of I and zeros between them. The output v(m) has I times more samples and runs at rate Fy = I·Fx.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "O sinal com zeros", en: "The zero-filled signal" },
      intro: {
        pt: "Veja o upsampler no tempo. Em cima, x(n). Embaixo, v(m): as mesmas amostras (em destaque), agora espalhadas com I−1 zeros entre elas — o sinal fica I vezes mais longo, mas ainda cheio de buracos. Mude I.",
        en: "See the upsampler in time. On top, x(n). Below, v(m): the same samples (highlighted), now spread out with I−1 zeros between them — the signal is I times longer, but still full of holes. Change I.",
      },
      instrument: { component: "UpsampleView" },
    },
    {
      kind: "example",
      title: { pt: "O upsampler é variante no tempo", en: "The upsampler is time-varying" },
      statement: {
        pt: "Seja x(n) = {1, 2, 3, 4} e I = 2. Vamos verificar que o upsampler NÃO é invariante no tempo: um atraso na entrada não vira o mesmo atraso na saída.",
        en: "Let x(n) = {1, 2, 3, 4} and I = 2. Let's verify that the upsampler is NOT time-invariant: a delay at the input does not become the same delay at the output.",
      },
      steps: [
        {
          text: {
            pt: "Upsampling por 2: intercala 1 zero entre as amostras.",
            en: "Upsampling by 2: interlace 1 zero between samples.",
          },
          latex: "v(m) = \\uparrow 2\\,[\\,x\\,] = \\{1,\\ 0,\\ 2,\\ 0,\\ 3,\\ 0,\\ 4,\\ 0\\}",
        },
        {
          text: {
            pt: "Agora atrase a entrada por 1: x(n−1) = {0,1,2,3,4}. Fazendo ↑2 desse sinal atrasado:",
            en: "Now delay the input by 1: x(n−1) = {0,1,2,3,4}. Upsampling this delayed signal by 2:",
          },
          latex: "\\uparrow 2\\,[\\,x(n-1)\\,] = \\{0,\\ 0,\\ 1,\\ 0,\\ 2,\\ 0,\\ 3,\\ 0,\\ 4,\\ 0\\} = v(m-2)",
        },
        {
          text: {
            pt: "Ou seja, atrasar a entrada por 1 atrasou a saída por I = 2, não por 1. Como ↑2[x(n−1)] = v(m−2) ≠ v(m−1), o upsampler é variante no tempo.",
            en: "That is, delaying the input by 1 delayed the output by I = 2, not by 1. Since ↑2[x(n−1)] = v(m−2) ≠ v(m−1), the upsampler is time-varying.",
          },
          latex: "v(m-2) \\ne v(m-1)",
        },
      ],
    },
    {
      kind: "formalization",
      title: { pt: "Imaging: cópias no espectro", en: "Imaging: copies in the spectrum" },
      steps: [
        {
          latex: "V(z) = \\sum_{m=-\\infty}^{\\infty} v(m)\\, z^{-m} = \\sum_{m=-\\infty}^{\\infty} x(m)\\, z^{-mI} = X(z^{I})",
          ref: "IP-B eq. (9.27), p. 487",
          caption: {
            pt: "A transformada z do sinal com zeros. Como v só é não-nula nos múltiplos de I, a soma vira X avaliada em z^I.",
            en: "The z-transform of the zero-filled signal. Since v is nonzero only at multiples of I, the sum becomes X evaluated at z^I.",
          },
        },
        {
          latex: "V(\\omega_y) = X(\\omega_y I)",
          ref: "IP-B eq. (9.28), p. 487",
          caption: {
            pt: "No círculo unitário, o upsampling COMPRIME o espectro por I. Como X é periódico de 2π, comprimir cria I−1 cópias extras — as imagens. É o espelho do aliasing: em vez de somar cópias, ele as replica.",
            en: "On the unit circle, upsampling COMPRESSES the spectrum by I. Since X is 2π-periodic, compressing creates I−1 extra copies — the images. It is the mirror of aliasing: instead of summing copies, it replicates them.",
          },
        },
        {
          latex: "\\omega_y = \\frac{\\omega_x}{I}",
          ref: "IP-B eq. (9.29), p. 487",
          caption: {
            pt: "As frequências normalizadas se relacionam por ω_y = ω_x/I, porque a taxa de saída é I vezes maior (Fy = I·Fx). A banda base original [0, π] encolhe para [0, π/I].",
            en: "The normalized frequencies relate by ω_y = ω_x/I, because the output rate is I times higher (Fy = I·Fx). The original baseband [0, π] shrinks to [0, π/I].",
          },
        },
        {
          latex: "\\text{cópias em } \\ \\omega_y = \\frac{2\\pi k}{I}, \\quad k = 0, 1, \\dots, I-1",
          ref: "IP-B §9.3.1, p. 487–488",
          caption: {
            pt: "São exatamente I cópias, centradas em ω_y = 2πk/I. A cópia k = 0 é a banda base — a 'original' que queremos, na frequência 0; as outras I−1 são as imagens. Nenhuma cai EM CIMA da original: mesmo com I ímpar, todas ficam em posições distintas (com I par, uma cópia fica exatamente em ω_y = π; com I ímpar, nenhuma fica em π). E, ao contrário da decimação, todas têm a MESMA amplitude de X — o upsampling só replica, não divide por I — e as cópias nunca se sobrepõem. Por isso não há 'aliasing' aqui, apenas imagens a remover.",
            en: "There are exactly I copies, centred at ω_y = 2πk/I. Copy k = 0 is the baseband — the 'original' we want, at frequency 0; the other I−1 are the images. None lands ON TOP of the original: even with odd I, all sit at distinct positions (with even I, one copy sits exactly at ω_y = π; with odd I, none sits at π). And unlike decimation, they all have the SAME amplitude as X — upsampling only replicates, it doesn't divide by I — and the copies never overlap. That is why there is no 'aliasing' here, only images to remove.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "Por que aparecem as imagens", en: "Why the images appear" },
      intro: {
        pt: "A razão das imagens fica clara no círculo. Lembre que V(ω_y) = X(I·ω_y): para saber a saída na frequência ω_y, temos que ler X no ângulo I·ω_y — ou seja, no ângulo multiplicado por I. Por isso há dois pontos: o azul é a frequência de saída ω_y (o que percorremos), e o laranja é o ângulo de leitura I·ω_y. Como multiplicar por I torna o ângulo I vezes maior, o ponto laranja anda I vezes mais rápido e dá I voltas enquanto o azul dá uma só. O painel |X| é lido no ponto laranja: como ele varre X inteiro I vezes, a saída |V| repete o espectro I vezes — as I imagens. Aperte 'Animar' e conte. As linhas ±π/I marcam a única imagem (a de base) que o filtro do interpolador vai manter.",
        en: "The reason for the images is clear on the circle. Recall that V(ω_y) = X(I·ω_y): to know the output at frequency ω_y, we must read X at angle I·ω_y — that is, at the angle times I. That is why there are two points: the blue one is the output frequency ω_y (what we sweep), and the orange one is the reading angle I·ω_y. Since multiplying by I makes the angle I times larger, the orange point moves I times faster and laps I times while the blue one goes around once. The |X| panel is read at the orange point: because it sweeps all of X I times, the output |V| repeats the spectrum I times — the I images. Press 'Play' and count. The ±π/I lines mark the single (baseband) image the interpolation filter will keep.",
      },
      instrument: { component: "ImagingCircleView" },
    },
    {
      kind: "formalization",
      title: { pt: "O interpolador ideal", en: "The ideal interpolator" },
      steps: [
        {
          latex:
            "H_I(\\omega_y) = \\begin{cases} C, & |\\omega_y| \\le \\pi/I \\\\ 0, & \\text{caso contrário} \\end{cases}",
          ref: "IP-B eq. (9.30), p. 488",
          caption: {
            pt: "Só a banda [0, π/I] contém o sinal útil; as imagens acima disso devem ser rejeitadas. Fazemos isso com um passa-baixas de corte π/I e ganho C a determinar.",
            en: "Only the band [0, π/I] holds the useful signal; the images above it must be rejected. We do this with a lowpass of cutoff π/I and gain C to be determined.",
          },
        },
        {
          latex:
            "Y(\\omega_y) = \\begin{cases} C\\, X(\\omega_y I), & |\\omega_y| \\le \\pi/I \\\\ 0, & \\text{caso contrário} \\end{cases}",
          ref: "IP-B eq. (9.31), p. 488",
          caption: {
            pt: "A saída do filtro: mantém só a imagem em banda base, multiplicada pelo ganho C. As outras I−1 imagens somem.",
            en: "The filter output: it keeps only the baseband image, times the gain C. The other I−1 images vanish.",
          },
        },
      ],
    },
    {
      kind: "formalization",
      title: { pt: "Por que o ganho é C = I", en: "Why the gain is C = I" },
      steps: [
        {
          latex: "y(0) \\;\\overset{!}{=}\\; x(0)",
          ref: "IP-B eq. (9.32), p. 488",
          caption: {
            pt: "A condição que fixa C: queremos que a saída reproduza a entrada nos instantes originais. Basta impor isso em um ponto — escolhemos m = 0.",
            en: "The condition that fixes C: we want the output to reproduce the input at the original instants. It's enough to impose it at one point — we pick m = 0.",
          },
        },
        {
          latex:
            "y(0) = \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} Y(\\omega_y)\\,d\\omega_y = \\frac{C}{2\\pi}\\int_{-\\pi/I}^{\\pi/I} X(\\omega_y I)\\,d\\omega_y",
          ref: "IP-B eq. (9.32), p. 488",
          caption: {
            pt: "y(0) é a transformada inversa em m = 0 — a 'área' do espectro. Como Y só é não-nula em [−π/I, π/I] (o filtro), a integral se restringe a essa banda, com Y = C·X(ω_y I).",
            en: "y(0) is the inverse transform at m = 0 — the 'area' of the spectrum. Since Y is nonzero only on [−π/I, π/I] (the filter), the integral is restricted to that band, with Y = C·X(ω_y I).",
          },
        },
        {
          latex:
            "\\omega_x = \\omega_y I \\;\\Rightarrow\\; y(0) = \\frac{C}{I}\\cdot\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} X(\\omega_x)\\,d\\omega_x = \\frac{C}{I}\\, x(0)",
          ref: "IP-B eq. (9.33), p. 488",
          caption: {
            pt: "Trocando a variável para ω_x = ω_y I (então dω_x = I·dω_y), os limites voltam a [−π, π] e aparece o fator 1/I. A integral que sobra é exatamente x(0). Logo y(0) = (C/I)·x(0).",
            en: "Changing the variable to ω_x = ω_y I (so dω_x = I·dω_y), the limits go back to [−π, π] and the factor 1/I appears. The remaining integral is exactly x(0). So y(0) = (C/I)·x(0).",
          },
        },
        {
          latex: "\\frac{C}{I}\\,x(0) = x(0) \\;\\Rightarrow\\; C = I",
          ref: "IP-B eq. (9.33), p. 488",
          caption: {
            pt: "Impondo y(0) = x(0), sobra C = I. Faz sentido: o ↑I espalhou a energia por I vezes mais amostras (cada uma com 1/I da altura), então o filtro multiplica por I para repor a amplitude. É o espelho exato do 1/D da decimação.",
            en: "Imposing y(0) = x(0) leaves C = I. It makes sense: ↑I spread the energy over I times more samples (each at 1/I of the height), so the filter multiplies by I to restore the amplitude. It is the exact mirror of decimation's 1/D.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "Ajuste o ganho C", en: "Tune the gain C" },
      intro: {
        pt: "Confirme na prática, no tempo. Em cima, o sinal original x(n); no meio, v(m) depois do ↑I (com os zeros); embaixo, o sinal reconstruído y(m) na saída do filtro. Arraste o ganho C e compare a altura de y(m) com x(n): com C baixo a reconstrução fica fraca, com C alto fica exagerada, e só quando C = I ela bate exatamente com o original (a barra fica verde). Mude I e refaça.",
        en: "Confirm it hands-on, in time. On top, the original signal x(n); in the middle, v(m) after ↑I (with the zeros); at the bottom, the reconstructed signal y(m) at the filter output. Drag the gain C and compare the height of y(m) with x(n): with low C the reconstruction is too weak, with high C it is exaggerated, and only when C = I does it match the original exactly (the badge turns green). Change I and try again.",
      },
      instrument: { component: "InterpolatorGainView" },
    },
    {
      kind: "playground",
      title: { pt: "A estrutura do interpolador ideal", en: "The ideal interpolator's structure" },
      intro: {
        pt: "O interpolador ideal é o upsampler ↑I seguido do passa-baixas. Siga o espectro sob cada estágio: |X| entra; o ↑I comprime e cria as I imagens (|V|); o filtro (corte π/I, ganho I) mantém só a banda base e reconstrói o sinal na taxa maior (|Y|). Mude I e veja o corte e as imagens acompanharem.",
        en: "The ideal interpolator is the upsampler ↑I followed by the lowpass. Follow the spectrum under each stage: |X| comes in; ↑I compresses and creates the I images (|V|); the filter (cutoff π/I, gain I) keeps only the baseband and rebuilds the signal at the higher rate (|Y|). Change I and watch the cutoff and images follow.",
      },
      instrument: { component: "InterpolatorStructureView" },
    },
    {
      kind: "playground",
      title: { pt: "O filtro em ação", en: "The filter in action" },
      intro: {
        pt: "O espelho do playground da Aula 3, agora para imagens. Em cima, |X|. Embaixo, o espectro depois de ↑I: com o filtro desligado aparecem as I imagens (a base em azul, as réplicas em laranja), todas com a MESMA altura de X — o upsampling não muda a amplitude, só replica. Ligue o filtro (corte π/I): as réplicas são cortadas (cinza) e sobra só a banda base — o sinal interpolado. Mude I e a largura de banda.",
        en: "The mirror of Lecture 3's playground, now for images. On top, |X|. Below, the spectrum after ↑I: with the filter off the I images appear (the baseband in blue, the replicas in orange), all at the SAME height as X — upsampling doesn't change the amplitude, it only replicates. Turn the filter on (cutoff π/I): the replicas are cut (grey) and only the baseband remains — the interpolated signal. Change I and the bandwidth.",
      },
      instrument: { component: "InterpolatorView" },
    },
    {
      kind: "example",
      title: { pt: "Interpolando cos(0,2πn) por I = 4", en: "Interpolating cos(0.2πn) by I = 4" },
      statement: {
        pt: "Seja x(n) = cos(0,2πn), interpolado por I = 4 com o interpolador ideal. Onde fica o sinal na saída e o que acontece com as imagens?",
        en: "Let x(n) = cos(0.2πn), interpolated by I = 4 with the ideal interpolator. Where does the signal land at the output and what happens to the images?",
      },
      steps: [
        {
          text: {
            pt: "A frequência de entrada é ω_x = 0,2π. Após ↑4, o espectro se comprime e a componente útil vai para ω_y = ω_x/I (eq. 9.29):",
            en: "The input frequency is ω_x = 0.2π. After ↑4, the spectrum compresses and the useful component moves to ω_y = ω_x/I (eq. 9.29):",
          },
          latex: "\\omega_y = \\frac{0{,}2\\pi}{4} = 0{,}05\\pi",
        },
        {
          text: {
            pt: "O ↑4 também cria I−1 = 3 imagens em frequências mais altas. O filtro interpolador tem corte π/I = π/4 = 0,25π e ganho C = I = 4:",
            en: "The ↑4 also creates I−1 = 3 images at higher frequencies. The interpolation filter has cutoff π/I = π/4 = 0.25π and gain C = I = 4:",
          },
          latex: "H_I: \\ \\text{corte } \\tfrac{\\pi}{4} = 0{,}25\\pi, \\quad \\text{ganho } C = 4",
        },
        {
          text: {
            pt: "Como 0,05π < 0,25π, a banda base passa pelo filtro; as 3 imagens (acima de 0,25π) são cortadas. A saída é uma senoide limpa em ω_y = 0,05π, com a amplitude reposta pelo ganho 4.",
            en: "Since 0.05π < 0.25π, the baseband passes the filter; the 3 images (above 0.25π) are cut. The output is a clean sinusoid at ω_y = 0.05π, with amplitude restored by the gain 4.",
          },
        },
      ],
    },
    {
      kind: "synthesis",
      title: { pt: "O que levar desta aula", en: "What to take from this lecture" },
      points: [
        {
          pt: "O upsampler ↑I intercala I−1 zeros (v(m) = x(m/I), eq. 9.26), é variante no tempo e roda na taxa Fy = I·Fx.",
          en: "The ↑I upsampler interlaces I−1 zeros (v(m) = x(m/I), eq. 9.26), is time-varying and runs at rate Fy = I·Fx.",
        },
        {
          pt: "No espectro, ↑I comprime X por I e cria I−1 imagens — o imaging (V(ω_y) = X(ω_y I), eq. 9.28). É o espelho do aliasing da decimação.",
          en: "In the spectrum, ↑I compresses X by I and creates I−1 images — imaging (V(ω_y) = X(ω_y I), eq. 9.28). It is the mirror of decimation's aliasing.",
        },
        {
          pt: "O interpolador ideal é um passa-baixas de corte π/I e ganho C = I (eqs. 9.30–9.33), que remove as imagens e reconstrói o sinal na taxa maior.",
          en: "The ideal interpolator is a lowpass of cutoff π/I and gain C = I (eqs. 9.30–9.33), which removes the images and rebuilds the signal at the higher rate.",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Teste seu entendimento", en: "Test your understanding" },
      quizzes: [
        {
          question: {
            pt: "O que o upsampler ↑I faz com o espectro do sinal?",
            en: "What does the ↑I upsampler do to the signal's spectrum?",
          },
          options: [
            {
              pt: "Comprime o espectro por I, criando I−1 cópias (imagens).",
              en: "Compresses the spectrum by I, creating I−1 copies (images).",
            },
            {
              pt: "Remove as frequências acima de π/I.",
              en: "Removes the frequencies above π/I.",
            },
            {
              pt: "Soma D cópias deslocadas do espectro.",
              en: "Sums D shifted copies of the spectrum.",
            },
          ],
          correctIndex: 0,
          solution: [
            {
              text: {
                pt: "Como V(ω_y) = X(ω_y I) (eq. 9.28) e X é periódico de 2π, comprimir por I replica o espectro I vezes — as imagens.",
                en: "Since V(ω_y) = X(ω_y I) (eq. 9.28) and X is 2π-periodic, compressing by I replicates the spectrum I times — the images.",
              },
            },
          ],
        },
        {
          question: {
            pt: "Qual é o filtro do interpolador ideal por fator I?",
            en: "What is the filter of the ideal interpolator by factor I?",
          },
          options: [
            {
              pt: "Passa-altas de corte π/I.",
              en: "Highpass of cutoff π/I.",
            },
            {
              pt: "Passa-baixas de corte π/I e ganho I.",
              en: "Lowpass of cutoff π/I and gain I.",
            },
            {
              pt: "Passa-baixas de corte π·I e ganho 1/I.",
              en: "Lowpass of cutoff π·I and gain 1/I.",
            },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "As imagens ficam acima de π/I, então usamos um passa-baixas de corte π/I (eq. 9.30). O ganho é C = I para repor a amplitude (eq. 9.33).",
                en: "The images sit above π/I, so we use a lowpass of cutoff π/I (eq. 9.30). The gain is C = I to restore the amplitude (eq. 9.33).",
              },
            },
          ],
        },
      ],
    },
  ],
};
