import { type Language, type Localized, pick } from "../i18n.ts";
import { reviewCatalog } from "../content/review.ts";

const t = {
  title: { pt: "Revisão", en: "Review" },
  subtitle: {
    pt: "Pré-requisitos no estilo das aulas (baseados no Cap. 5): amostragem, DTFT, DFT/FFT. Conteúdo em construção.",
    en: "Prerequisites in the lecture style (based on Ch. 5): sampling, DTFT, DFT/FFT. Content under construction.",
  },
  soon: { pt: "em breve", en: "soon" },
} satisfies Record<string, Localized>;

export default function ReviewList({ language }: { language: Language }) {
  return (
    <section className="section">
      <span className="eyebrow">EA-269</span>
      <h1 className="section-title">{pick(t.title, language)}</h1>
      <p className="section-text section-lead">{pick(t.subtitle, language)}</p>
      <ul className="home-lectures">
        {reviewCatalog.map((entry) => (
          <li key={entry.slug}>
            <a href={`#/review/${entry.slug}`}>
              {pick(entry.title, language)}
              {!entry.available && (
                <span className="home-soon"> · {pick(t.soon, language)}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
