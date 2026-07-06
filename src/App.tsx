import { useState } from "react";
import Sidebar from "./components/Sidebar.tsx";
import Home from "./components/Home.tsx";
import LectureList from "./components/LectureList.tsx";
import ReviewList from "./components/ReviewList.tsx";
import ComingSoon from "./components/ComingSoon.tsx";
import { reviewCatalog } from "./content/review.ts";
import LectureView from "./components/LectureView.tsx";
import PresentationView from "./components/PresentationView.tsx";
import LectureOutline from "./components/LectureOutline.tsx";
import LabList from "./components/LabList.tsx";
import LabView from "./components/LabView.tsx";
import LabOutline from "./components/LabOutline.tsx";
import { lectures } from "./content/lectures.ts";
import { labs } from "./content/labs.ts";
import { useRoute } from "./router.ts";
import { type Language, type Localized, pick } from "./i18n.ts";

type Mode = "study" | "presentation";

const ui = {
  brandName: {
    pt: "Conversão de Taxa de Amostragem",
    en: "Sampling Rate Conversion",
  },
  languageLabel: { pt: "Idioma", en: "Language" },
  reviewTitle: { pt: "Revisão", en: "Review" },
  reviewItemNote: {
    pt: "Este material de revisão está em construção.",
    en: "This review material is under construction.",
  },
  labTitle: { pt: "Laboratório", en: "Lab" },
  labNote: {
    pt: "Trilha de FPGA: do fluxo Vivado ao filtro FIR na ZedBoard. Em construção.",
    en: "FPGA track: from the Vivado flow to the FIR filter on the ZedBoard. Under construction.",
  },
  soonTitle: { pt: "Aula em breve", en: "Lecture coming soon" },
  soonNote: {
    pt: "Esta aula ainda não foi escrita. Comece pela Aula 2.",
    en: "This lecture isn't written yet. Start with Lecture 2.",
  },
  labSoonTitle: { pt: "Lab em breve", en: "Lab coming soon" },
  labSoonNote: {
    pt: "Este laboratório ainda não foi escrito. Comece pelo Lab 0.",
    en: "This lab isn't written yet. Start with Lab 0.",
  },
} satisfies Record<string, Localized>;

export default function App() {
  const [mode, setMode] = useState<Mode>("study");
  const [language, setLanguage] = useState<Language>("pt");
  const route = useRoute();

  const activeLecture =
    route.name === "lecture" ? lectures[route.id] : undefined;
  const activeLab = route.name === "lab" ? labs[route.id] : undefined;

  let content;
  switch (route.name) {
    case "home":
      content = <Home language={language} />;
      break;
    case "lectures":
      content = <LectureList language={language} />;
      break;
    case "lecture":
      content = !activeLecture ? (
        <ComingSoon
          title={pick(ui.soonTitle, language)}
          note={pick(ui.soonNote, language)}
        />
      ) : mode === "presentation" ? (
        <PresentationView lecture={activeLecture} language={language} />
      ) : (
        <LectureView lecture={activeLecture} language={language} />
      );
      break;
    case "review":
      content = <ReviewList language={language} />;
      break;
    case "review-item": {
      const item = reviewCatalog.find((e) => e.slug === route.slug);
      content = (
        <ComingSoon
          title={item ? pick(item.title, language) : pick(ui.reviewTitle, language)}
          note={pick(ui.reviewItemNote, language)}
        />
      );
      break;
    }
    case "labs":
      content = <LabList language={language} />;
      break;
    case "lab":
      content = activeLab ? (
        <LabView lab={activeLab} language={language} />
      ) : (
        <ComingSoon
          title={pick(ui.labSoonTitle, language)}
          note={pick(ui.labSoonNote, language)}
        />
      );
      break;
  }

  return (
    <div className={`app mode-${mode}`}>
      <header className="top">
        <div className="top-inner">
          <div className="brand">
            <a href="#/" className="brand-code">
              EA-269
            </a>
            <span className="brand-name">{pick(ui.brandName, language)}</span>
          </div>

          <div
            className="toggle"
            role="group"
            aria-label={pick(ui.languageLabel, language)}
          >
            <button
              className={language === "pt" ? "toggle-btn active" : "toggle-btn"}
              onClick={() => setLanguage("pt")}
            >
              PT
            </button>
            <button
              className={language === "en" ? "toggle-btn active" : "toggle-btn"}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="shell">
        <Sidebar
          route={route}
          language={language}
          mode={mode}
          setMode={setMode}
        />
        <main className="content">{content}</main>
        {activeLecture && mode === "study" && (
          <LectureOutline lecture={activeLecture} language={language} />
        )}
        {activeLab && <LabOutline lab={activeLab} language={language} />}
      </div>
    </div>
  );
}
