import { type Language, type Localized, pick } from "../i18n.ts";

const t = {
  title: {
    pt: "Conversão de Taxa de Amostragem",
    en: "Sampling Rate Conversion",
  },
  lead: {
    pt: "Um curso interativo sobre conversão de taxa de amostragem: como mudar a taxa de um sinal sem destruí-lo — decimação (↓D), interpolação (↑I), conversão por fator racional e as estruturas eficientes que levam isso ao hardware.",
    en: "An interactive course on sampling rate conversion: how to change a signal's rate without wrecking it — decimation (↓D), interpolation (↑I), rational-factor conversion, and the efficient structures that take it to hardware.",
  },
  modes: {
    pt: "Dois modos da mesma fonte: Estudo (leitura no seu ritmo) e Apresentação (para a sala de aula). Troque entre PT e EN quando quiser.",
    en: "Two modes from one source: Study (read at your pace) and Presentation (for the classroom). Switch between PT and EN anytime.",
  },
  refIntro: {
    pt: "Material de referência: ",
    en: "Reference material: ",
  },
  refEdition: { pt: "3. ed.", en: "3rd ed." },
  refNote: {
    pt: " As indicações nas fórmulas (por exemplo, “IP-B eq. (9.17), p. 481”) referem-se a esse livro.",
    en: " The labels in the formulas (for example, “IP-B eq. (9.17), p. 481”) refer to this book.",
  },
  navHint: {
    pt: "Use a barra lateral para navegar entre Aulas, Revisão e Laboratório.",
    en: "Use the sidebar to move between Lectures, Review and the Lab.",
  },
  cta: { pt: "Começar pela Aula 1 →", en: "Start with Lecture 1 →" },
} satisfies Record<string, Localized>;

export default function Home({ language }: { language: Language }) {
  return (
    <section className="section">
      <span className="eyebrow">EA-269</span>
      <h1 className="section-title">{pick(t.title, language)}</h1>
      <p className="section-text section-lead">{pick(t.lead, language)}</p>
      <p className="section-text">{pick(t.modes, language)}</p>
      <p className="section-text">{pick(t.navHint, language)}</p>
      <p className="section-text home-reference">
        {pick(t.refIntro, language)}
        INGLE, V. K.; PROAKIS, J. G. <em>Digital Signal Processing Using MATLAB</em>. {pick(t.refEdition, language)} Boston: Cengage Learning, 2012.
        {pick(t.refNote, language)}
      </p>
      <a className="home-cta" href="#/lecture/1">
        {pick(t.cta, language)}
      </a>
    </section>
  );
}
