import { type Language, type Localized, pick } from "../i18n.ts";
import { lectureCatalog } from "../content/lectures.ts";

const t = {
  title: { pt: "Aulas", en: "Lectures" },
  subtitle: {
    pt: "Capítulo 9 — Conversão de Taxa de Amostragem, em 8 aulas. A Aula 2 já está pronta.",
    en: "Chapter 9 — Sampling Rate Conversion, in 8 lectures. Lecture 2 is ready.",
  },
} satisfies Record<string, Localized>;

export default function LectureList({ language }: { language: Language }) {
  return (
    <section className="section">
      <span className="eyebrow">EA-269</span>
      <h1 className="section-title">{pick(t.title, language)}</h1>
      <p className="section-text section-lead">{pick(t.subtitle, language)}</p>
      <ul className="home-lectures">
        {lectureCatalog.map((entry) => {
          const label = `${entry.id} · ${pick(entry.title, language)}`;
          return (
            <li key={entry.id}>
              {entry.available ? (
                <a href={`#/lecture/${entry.id}`}>{label}</a>
              ) : (
                <span className="home-soon">{label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
