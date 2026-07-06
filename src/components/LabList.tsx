import { type Language, type Localized, pick } from "../i18n.ts";
import { labCatalog } from "../content/labs.ts";

const t = {
  title: { pt: "Laboratório", en: "Lab" },
  subtitle: {
    pt: "Trilha de FPGA: do fluxo Vivado ao filtro FIR na ZedBoard, ligando cada passo à teoria do curso.",
    en: "FPGA track: from the Vivado flow to a FIR filter on the ZedBoard, tying each step back to the course theory.",
  },
  soon: { pt: "em breve", en: "soon" },
} satisfies Record<string, Localized>;

export default function LabList({ language }: { language: Language }) {
  return (
    <section className="section">
      <span className="eyebrow">EA-269</span>
      <h1 className="section-title">{pick(t.title, language)}</h1>
      <p className="section-text section-lead">{pick(t.subtitle, language)}</p>
      <ul className="home-lectures">
        {labCatalog.map((entry) => {
          const label = `Lab ${entry.id} · ${pick(entry.title, language)}`;
          return (
            <li key={entry.id}>
              {entry.available ? (
                <a href={`#/lab/${entry.id}`}>{label}</a>
              ) : (
                <span className="home-soon">
                  {label} — {pick(t.soon, language)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
