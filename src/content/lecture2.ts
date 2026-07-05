import type { Lecture } from "./types.ts";

export const lecture2: Lecture = {
  id: 2,
  lectureLabel: { pt: "Aula 2", en: "Lecture 2" },
  sections: [
    {
      kind: "prose",
      label: { pt: "Motivação", en: "Motivation" },
      title: { pt: "Reduzir a taxa é decimar", en: "Lowering the rate is decimation" },
      text: {
        pt: "Muitas vezes queremos diminuir a taxa de amostragem — e reduzir a taxa chama-se decimar. A operação-base é o downsampler ↓D: ele recebe x(n) na taxa Fx e entrega y(m) numa taxa D vezes menor, Fy = Fx/D. Nesta aula estudamos essa operação a fundo: como ela funciona, por que ela é 'estranha' (variante no deslocamento) e o que ela faz com o espectro do sinal.",
        en: "We often want to lower the sampling rate — and lowering the rate is called decimation. The core operation is the ↓D downsampler: it takes x(n) at rate Fx and delivers y(m) at a rate D times lower, Fy = Fx/D. In this lecture we study this operation in depth: how it works, why it is 'strange' (shift-varying) and what it does to the signal's spectrum.",
      },
    },
    {
      kind: "prose",
      label: { pt: "Intuição", en: "Intuition" },
      title: { pt: "A ideia: jogar amostras fora", en: "The idea: throw samples away" },
      text: {
        pt: "A forma mais direta de reduzir a taxa por um fator D é manter apenas 1 amostra a cada D e descartar as outras D−1. É rápido e não custa quase nada. A pergunta que guia a aula é: o que essa operação simples faz com a informação do sinal? A resposta — como veremos — é surpreendentemente delicada.",
        en: "The most direct way to reduce the rate by a factor D is to keep only 1 sample out of every D and drop the other D−1. It is fast and costs almost nothing. The question that guides the lecture is: what does this simple operation do to the signal's information? The answer — as we will see — is surprisingly delicate.",
      },
    },
    {
      kind: "formalization",
      title: { pt: "O downsampler ↓D", en: "The ↓D downsampler" },
      steps: [
        {
          latex: "y(m) = x(mD), \\qquad F_y = \\frac{F_x}{D}",
          ref: "IP-B eq. (9.6), p. 477",
          caption: {
            pt: "O downsampler pega uma amostra a cada D: a saída y(m) é a amostra de x na posição mD. A taxa cai de Fx para Fy = Fx/D.",
            en: "The downsampler takes one sample of every D: the output y(m) is the sample of x at position mD. The rate drops from Fx to Fy = Fx/D.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "O sinal decimado", en: "The decimated signal" },
      intro: {
        pt: "Veja o downsampler no tempo. Em x(n), as amostras mantidas (nos múltiplos de D) ficam em destaque; as descartadas, apagadas. Abaixo, y(m) é o resultado, com as mantidas comprimidas. Mude D.",
        en: "See the downsampler in time. In x(n), the kept samples (at multiples of D) are highlighted; the dropped ones are dimmed. Below, y(m) is the result, with the kept samples compressed. Change D.",
      },
      instrument: { component: "DownsampleView" },
    },
    {
      kind: "example",
      title: {
        pt: "O downsampler é variante no deslocamento",
        en: "The downsampler is shift-varying",
      },
      statement: {
        pt: "Seja x(n) = {1, 2, 3, 4, 3, 2, 1} e D = 2. Vamos verificar que o downsampler NÃO é invariante no deslocamento.",
        en: "Let x(n) = {1, 2, 3, 4, 3, 2, 1} and D = 2. Let's verify that the downsampler is NOT shift-invariant.",
      },
      steps: [
        {
          text: {
            pt: "Decimando por 2 (posições pares): y(m) = x(2m).",
            en: "Decimating by 2 (even positions): y(m) = x(2m).",
          },
          latex: "y(m) = \\{1,\\ 3,\\ 3,\\ 1\\}",
        },
        {
          text: {
            pt: "Agora atrase a entrada por 1: x(n−1) = {0,1,2,3,4,3,2,1}. Decimando esse sinal atrasado:",
            en: "Now delay the input by 1: x(n−1) = {0,1,2,3,4,3,2,1}. Decimating this delayed signal:",
          },
          latex: "\\downarrow 2\\,[\\,x(n-1)\\,] = \\{0,\\ 2,\\ 4,\\ 2\\}",
        },
        {
          text: {
            pt: "Mas atrasar a SAÍDA y por 1 daria y(m−1) = {0,1,3,3,1}. Como {0,2,4,2} ≠ {0,1,3,3,1}, atrasar-depois-decimar ≠ decimar-depois-atrasar: o downsampler é variante no deslocamento.",
            en: "But delaying the OUTPUT y by 1 would give y(m−1) = {0,1,3,3,1}. Since {0,2,4,2} ≠ {0,1,3,3,1}, delay-then-decimate ≠ decimate-then-delay: the downsampler is shift-varying.",
          },
          latex: "\\{0,2,4,2\\} \\ne \\{0,1,3,3,1\\}",
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "Veja o shift-varying", en: "See the shift-varying behavior" },
      intro: {
        pt: "Compare os dois caminhos: atrasar a entrada e depois ↓2, contra ↓2 e depois atrasar a saída. Mova o atraso k. Para k ímpar eles diferem — prova de que a ordem importa (variante no deslocamento). Para k múltiplo de D, coincidem.",
        en: "Compare the two paths: delay the input then ↓2, versus ↓2 then delay the output. Move the delay k. For odd k they differ — proof that order matters (shift-varying). For k a multiple of D, they coincide.",
      },
      instrument: { component: "ShiftVaryingView" },
    },
    {
      kind: "prose",
      label: { pt: "Domínio da frequência", en: "Frequency domain" },
      title: { pt: "Do tempo para a frequência", en: "From time to frequency" },
      text: {
        pt: "Apesar de ser variante no deslocamento, ainda podemos analisar o downsampler no domínio da frequência. O truque: em vez de comprimir direto, primeiro criamos um sinal de ALTA taxa x̄(n) que mantém as amostras de x nos múltiplos de D e coloca zeros no resto. É esse artifício que abre caminho para a transformada z.",
        en: "Even though it is shift-varying, we can still analyze the downsampler in the frequency domain. The trick: instead of compressing directly, we first build a HIGH-rate signal x̄(n) that keeps x's samples at multiples of D and puts zeros elsewhere. This device is what opens the way to the z-transform.",
      },
      reviewLink: {
        slug: "dtft",
        label: { pt: "DTFT e espectro", en: "DTFT and spectrum" },
      },
    },
    {
      kind: "formalization",
      title: {
        pt: "Alta taxa e o trem de impulsos",
        en: "High rate and the impulse train",
      },
      steps: [
        {
          latex:
            "\\bar{x}(n) = \\begin{cases} x(n), & n = 0, \\pm D, \\pm 2D, \\dots \\\\ 0, & \\text{caso contrário} \\end{cases}",
          ref: "IP-B eq. (9.7), p. 478",
          caption: {
            pt: "x̄(n) é a versão de alta taxa: mantém x nas posições múltiplas de D e zera o resto (D−1 zeros entre as amostras).",
            en: "x̄(n) is the high-rate version: it keeps x at positions that are multiples of D and zeros the rest (D−1 zeros between samples).",
          },
        },
        {
          latex:
            "p(n) = \\begin{cases} 1, & n=0,\\pm D,\\dots \\\\ 0, & \\text{else} \\end{cases} = \\frac{1}{D}\\sum_{\\ell=0}^{D-1} e^{\\,j\\frac{2\\pi}{D}\\ell n}",
          ref: "IP-B eq. (9.8), p. 479",
          caption: {
            pt: "p(n) é um trem de impulsos de período D. Sua série de Fourier discreta — a soma de exponenciais à direita — é a chave da dedução.",
            en: "p(n) is an impulse train of period D. Its discrete Fourier series — the sum of exponentials on the right — is the key to the derivation.",
          },
        },
        {
          latex: "\\bar{x}(n) = x(n)\\, p(n)",
          ref: "IP-B eq. (9.9), p. 479",
          caption: {
            pt: "Multiplicar x pelo trem de impulsos 'liga' apenas as amostras que sobrevivem à decimação.",
            en: "Multiplying x by the impulse train 'switches on' only the samples that survive decimation.",
          },
        },
        {
          latex: "y(m) = \\bar{x}(mD) = x(mD)\\,p(mD) = x(mD)",
          ref: "IP-B eq. (9.10), p. 479",
          caption: {
            pt: "Comprimir x̄ por D (pegar 1 a cada D) recupera exatamente y(m) = x(mD).",
            en: "Compressing x̄ by D (taking one of every D) recovers exactly y(m) = x(mD).",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: {
        pt: "Multiplicação pelo trem de impulsos",
        en: "Multiplication by the impulse train",
      },
      intro: {
        pt: "A operação passo a passo: x(n) (amostras mantidas em destaque), o trem de impulsos p(n), e o produto x̄(n) = x(n)·p(n) — que é x com zeros no lugar das descartadas. O último gráfico, y(m), é o passo final da decimação: as mesmas amostras mantidas, agora 'coladas' sem os zeros — o sinal já na taxa menor Fy = Fx/D. Mude D e acompanhe.",
        en: "The operation step by step: x(n) (kept samples highlighted), the impulse train p(n), and the product x̄(n) = x(n)·p(n) — which is x with zeros where the dropped samples were. The last graph, y(m), is the final decimation step: the same kept samples, now 'packed together' without the zeros — the signal at the lower rate Fy = Fx/D. Change D and follow along.",
      },
      instrument: { component: "ImpulseTrainView" },
    },
    {
      kind: "formalization",
      title: { pt: "A transformada z", en: "The z-transform" },
      steps: [
        {
          latex:
            "Y(z) = \\sum_{m} y(m) z^{-m} = \\sum_{m} x(mD) z^{-m} = \\sum_{m} \\bar{x}(m)\\, z^{-m/D}",
          ref: "IP-B eq. (9.11), p. 480",
          caption: {
            pt: "A transformada z da saída. O último passo vale porque x̄(m) = 0 exceto nos múltiplos de D.",
            en: "The z-transform of the output. The last step holds because x̄(m) = 0 except at multiples of D.",
          },
        },
        {
          latex:
            "Y(z) = \\frac{1}{D} \\sum_{k=0}^{D-1} X\\!\\left(e^{-j 2\\pi k/D}\\, z^{1/D}\\right)",
          ref: "IP-B eq. (9.12), p. 480",
          caption: {
            pt: "Substituindo (9.7) e (9.8): a saída vira a soma de D cópias de X, cada uma girada por uma raiz da unidade. Os dois passos-chave: introduzir x̄(n) (com D−1 zeros) e usar o trem de impulsos (9.8).",
            en: "Substituting (9.7) and (9.8): the output becomes the sum of D copies of X, each rotated by a root of unity. The two key steps: introducing x̄(n) (with D−1 zeros) and using the impulse train (9.8).",
          },
        },
      ],
    },
    {
      kind: "formalization",
      title: {
        pt: "Avaliação no círculo unitário",
        en: "Evaluation on the unit circle",
      },
      steps: [
        {
          latex: "\\omega_y = \\frac{2\\pi F}{F_y} = 2\\pi F T_y",
          ref: "IP-B eq. (9.13), p. 480",
          caption: {
            pt: "Para obter o espectro, avaliamos Y(z) no círculo unitário (z = e^{jω}). A frequência ω_y é medida em relação à taxa de SAÍDA Fy.",
            en: "To get the spectrum, we evaluate Y(z) on the unit circle (z = e^{jω}). The frequency ω_y is measured relative to the OUTPUT rate Fy.",
          },
        },
        {
          latex: "F_y = \\frac{F_x}{D}",
          ref: "IP-B eq. (9.14), p. 480",
          caption: {
            pt: "As taxas de entrada e saída se relacionam por Fy = Fx/D.",
            en: "The input and output rates are related by Fy = Fx/D.",
          },
        },
        {
          latex: "\\omega_x = \\frac{2\\pi F}{F_x} = 2\\pi F T_x",
          ref: "IP-B eq. (9.15), p. 480",
          caption: {
            pt: "Já ω_x é medida em relação à taxa de ENTRADA Fx. As duas frequências normalizadas são diferentes porque as taxas são diferentes.",
            en: "Meanwhile ω_x is measured relative to the INPUT rate Fx. The two normalized frequencies differ because the rates differ.",
          },
        },
        {
          latex: "\\omega_y = D\\, \\omega_x",
          ref: "IP-B eq. (9.16), p. 481",
          caption: {
            pt: "Combinando: ω_y = D·ω_x. A faixa 0 ≤ |ω_x| ≤ π/D é ESTICADA para 0 ≤ |ω_y| ≤ π pela decimação. É por isso que avaliamos no círculo unitário — para ler o espectro nessa nova escala.",
            en: "Combining: ω_y = D·ω_x. The range 0 ≤ |ω_x| ≤ π/D is STRETCHED to 0 ≤ |ω_y| ≤ π by decimation. That is why we evaluate on the unit circle — to read the spectrum in this new scale.",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: {
        pt: "Percorrendo o círculo unitário",
        en: "Walking the unit circle",
      },
      intro: {
        pt: "Avaliar o espectro é percorrer o círculo unitário: cada ângulo ω (o ponto girando à esquerda) corresponde a uma frequência (o marcador no espectro à direita). Aperte 'Animar' e veja o ponto varrer o círculo enquanto lê o espectro.",
        en: "Evaluating the spectrum means walking the unit circle: each angle ω (the point turning on the left) corresponds to a frequency (the marker on the spectrum on the right). Press 'Play' and watch the point sweep the circle while it reads the spectrum.",
      },
      instrument: { component: "UnitCircleView" },
    },
    {
      kind: "prose",
      label: { pt: "Aliasing", en: "Aliasing" },
      title: { pt: "Onde nasce o aliasing", en: "Where aliasing is born" },
      text: {
        pt: "Avaliar (9.12) no círculo unitário revela que o espectro da saída é a SOMA de D cópias do espectro de entrada — cada uma esticada por D e deslocada. Quando essas cópias se sobrepõem, frequências que eram distintas passam a somar no mesmo lugar: é o aliasing. Frequências altas se disfarçam de baixas e o sinal fica corrompido.",
        en: "Evaluating (9.12) on the unit circle reveals that the output spectrum is the SUM of D copies of the input spectrum — each stretched by D and shifted. When those copies overlap, frequencies that were distinct add up at the same place: that is aliasing. High frequencies disguise themselves as low ones and the signal is corrupted.",
      },
    },
    {
      kind: "formalization",
      title: { pt: "A soma de cópias e a condição sem aliasing", en: "The sum of copies and the no-aliasing condition" },
      steps: [
        {
          latex:
            "Y(\\omega_y) = \\frac{1}{D} \\sum_{k=0}^{D-1} X\\!\\left(\\frac{\\omega_y - 2\\pi k}{D}\\right)",
          ref: "IP-B eq. (9.17), p. 481",
          caption: {
            pt: "O espectro da saída: D cópias de X, esticadas por D e deslocadas de 2πk. Quando se sobrepõem, é o aliasing.",
            en: "The output spectrum: D copies of X, stretched by D and shifted by 2πk. When they overlap, that is aliasing.",
          },
        },
        {
          latex: "X(\\omega_x) = 0 \\quad \\text{para}\\ \\frac{\\pi}{D} \\le |\\omega_x| \\le \\pi",
          ref: "IP-B eq. (9.18), p. 481",
          caption: {
            pt: "Para EVITAR aliasing, o sinal precisa ser limitado em banda: sem energia acima de π/D (na frequência digital).",
            en: "To AVOID aliasing, the signal must be band-limited: no energy above π/D (in digital frequency).",
          },
        },
        {
          latex: "Y(\\omega_y) = \\frac{1}{D}\\, X\\!\\left(\\frac{\\omega_y}{D}\\right), \\quad |\\omega_y| \\le \\pi",
          ref: "IP-B eq. (9.19), p. 481",
          caption: {
            pt: "Se a condição vale, as cópias não se sobrepõem e a decimação é limpa. Garantir isso é o papel do decimador ideal — um passa-baixas ANTES do ↓D (Aula 3).",
            en: "If the condition holds, the copies don't overlap and decimation is clean. Ensuring this is the job of the ideal decimator — a lowpass filter BEFORE ↓D (Lecture 3).",
          },
        },
      ],
    },
    {
      kind: "playground",
      title: { pt: "Sem aliasing × com aliasing", en: "No aliasing vs aliasing" },
      intro: {
        pt: "O espectro conta a história. Em cima, |X| do sinal — um triângulo de banda ω_c — com as linhas ±π/D marcadas. Embaixo, o espectro depois de ↓D: as D cópias (a central em teal, as vizinhas em âmbar), cada uma com pico 1/D, e a soma Y em destaque. Diminua ω_c até o sinal caber em ±π/D: as cópias se separam e a decimação é limpa. Aumente ω_c além de π/D: a parte do sinal que ultrapassa o limite fica em vermelho, as cópias se sobrepõem e a soma sobe — aliasing. Mude também D.",
        en: "The spectrum tells the story. On top, the signal's |X| — a triangular band of width ω_c — with the ±π/D lines marked. Below, the spectrum after ↓D: the D copies (the central one teal, the neighbours amber), each peaking at 1/D, and the sum Y highlighted. Lower ω_c until the signal fits within ±π/D: the copies separate and decimation is clean. Raise ω_c past π/D: the part of the signal beyond the limit turns red, the copies overlap and the sum rises — aliasing. Change D too.",
      },
      instrument: { component: "DecimationSpectrumView" },
    },
    {
      kind: "playground",
      title: {
        pt: "A fórmula no círculo unitário",
        en: "The formula on the unit circle",
      },
      intro: {
        pt: "Aqui a fórmula (9.17) vira imagem. No círculo (à esquerda), os D pontos que a soma avalia; ao lado, o espectro X amostrado neles. Embaixo, o resultado: cada cópia de X — esticada por D e deslocada — desenhada separadamente (tracejadas em âmbar) e a soma Y em destaque. Repare como as cópias se 'dobram' e invadem a banda base; quando duas se sobrepõem, aparece energia onde não deveria — é o aliasing. Anime ω_y ou mude D.",
        en: "Here formula (9.17) becomes a picture. On the circle (left), the D points the sum evaluates; beside it, the spectrum X sampled at them. Below, the result: each copy of X — stretched by D and shifted — drawn separately (dashed amber) and the sum Y highlighted. Notice how the copies 'fold' and invade the baseband; when two overlap, energy appears where it shouldn't — that is aliasing. Animate ω_y or change D.",
      },
      instrument: { component: "AliasCircleView" },
    },
    {
      kind: "playground",
      title: { pt: "Aliasing ao vivo", en: "Aliasing live" },
      intro: {
        pt: "Mova a frequência do sinal f e o fator D. A zona verde é a nova banda base [0, fs/2D]. Enquanto f fica nela, tudo bem. Quando f passa do novo Nyquist (zona âmbar), o sinal não some — ele 'dobra' e reaparece dentro da banda base, numa frequência falsa: isso é o aliasing.",
        en: "Move the signal frequency f and the factor D. The green zone is the new baseband [0, fs/2D]. While f stays there, all is fine. When f passes the new Nyquist (amber zone), the signal doesn't vanish — it 'folds' and reappears inside the baseband at a false frequency: that is aliasing.",
      },
      instrument: { component: "AliasingView" },
    },
    {
      kind: "example",
      title: { pt: "Um sinal de 20 kHz que vira 4 kHz", en: "A 20 kHz signal that becomes 4 kHz" },
      statement: {
        pt: "Um áudio a 48 kHz contém uma componente de 20 kHz. Decimamos por D = 2 (para 24 kHz) sem filtrar antes. O que acontece com os 20 kHz?",
        en: "Audio at 48 kHz contains a 20 kHz component. We decimate by D = 2 (to 24 kHz) without filtering first. What happens to the 20 kHz?",
      },
      steps: [
        {
          text: {
            pt: "Nova taxa e novo Nyquist:",
            en: "New rate and new Nyquist:",
          },
          latex: "f_s' = \\frac{48}{2} = 24\\ \\text{kHz}, \\quad \\frac{f_s'}{2} = 12\\ \\text{kHz}",
        },
        {
          text: {
            pt: "20 kHz está acima do novo Nyquist (12 kHz) → haverá aliasing (eq. 9.17, cópia k=1):",
            en: "20 kHz is above the new Nyquist (12 kHz) → aliasing occurs (eq. 9.17, copy k=1):",
          },
          latex: "|f_s' - f| = |24 - 20| = 4\\ \\text{kHz}",
        },
        {
          text: {
            pt: "Os 20 kHz reaparecem como um sinal falso de 4 kHz. A lição: filtrar tudo acima de 12 kHz ANTES de decimar (Aula 3).",
            en: "The 20 kHz reappears as a false 4 kHz signal. The lesson: filter everything above 12 kHz BEFORE decimating (Lecture 3).",
          },
        },
      ],
    },
    {
      kind: "synthesis",
      title: { pt: "O que levar desta aula", en: "What to take from this lecture" },
      points: [
        {
          pt: "O downsampler ↓D mantém 1 amostra a cada D (y(m) = x(mD)) e é variante no deslocamento.",
          en: "The ↓D downsampler keeps 1 of every D samples (y(m) = x(mD)) and is shift-varying.",
        },
        {
          pt: "No domínio da frequência, decimar cria a soma de D cópias do espectro, esticadas por D e deslocadas — a origem do aliasing.",
          en: "In the frequency domain, decimating creates the sum of D copies of the spectrum, stretched by D and shifted — the origin of aliasing.",
        },
        {
          pt: "Para decimar sem aliasing, o sinal precisa ser limitado a |ω| ≤ π/D — o que motiva o filtro do decimador ideal (Aula 3).",
          en: "To decimate without aliasing, the signal must be limited to |ω| ≤ π/D — which motivates the ideal decimator's filter (Lecture 3).",
        },
      ],
    },
    {
      kind: "quiz",
      title: { pt: "Teste seu entendimento", en: "Test your understanding" },
      quizzes: [
        {
          question: {
            pt: "Um sinal a fs = 48 kHz é decimado por D = 3, sem filtro anti-aliasing. Uma senoide de 20 kHz aparecerá em qual frequência?",
            en: "A signal at fs = 48 kHz is decimated by D = 3 with no anti-aliasing filter. A 20 kHz sinusoid will appear at which frequency?",
          },
          options: [
            { pt: "8 kHz", en: "8 kHz" },
            { pt: "4 kHz", en: "4 kHz" },
            { pt: "16 kHz", en: "16 kHz" },
            { pt: "20 kHz (sem mudança)", en: "20 kHz (unchanged)" },
          ],
          correctIndex: 1,
          solution: [
            {
              text: {
                pt: "Nova taxa fs/D = 48/3 = 16 kHz → novo Nyquist = 8 kHz.",
                en: "New rate fs/D = 48/3 = 16 kHz → new Nyquist = 8 kHz.",
              },
              latex: "f_s' = \\tfrac{48}{3} = 16\\ \\text{kHz}",
            },
            {
              text: {
                pt: "20 kHz passa do novo Nyquist e dobra: 20 − 16 = 4 kHz.",
                en: "20 kHz is above the new Nyquist and folds: 20 − 16 = 4 kHz.",
              },
              latex: "20 - 16 = 4\\ \\text{kHz}",
            },
          ],
        },
        {
          question: {
            pt: "Por que o downsampler é chamado de variante no deslocamento?",
            en: "Why is the downsampler called shift-varying?",
          },
          options: [
            {
              pt: "Porque atrasar a entrada e depois decimar dá um resultado diferente de decimar e depois atrasar a saída.",
              en: "Because delaying the input then decimating gives a different result from decimating then delaying the output.",
            },
            {
              pt: "Porque ele muda a amplitude do sinal.",
              en: "Because it changes the signal's amplitude.",
            },
            {
              pt: "Porque ele inverte o sinal no tempo.",
              en: "Because it reverses the signal in time.",
            },
          ],
          correctIndex: 0,
          solution: [
            {
              text: {
                pt: "Como vimos: ↓2 de x(n−1) = {0,2,4,2}, mas y(m−1) = {0,1,3,3,1}. A ordem (atrasar/decimar) importa → variante no deslocamento.",
                en: "As shown: ↓2 of x(n−1) = {0,2,4,2}, but y(m−1) = {0,1,3,3,1}. The order (delay/decimate) matters → shift-varying.",
              },
            },
          ],
        },
      ],
    },
  ],
};
