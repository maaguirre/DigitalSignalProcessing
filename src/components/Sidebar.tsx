import type { ReactNode } from "react";
import { type Language, type Localized, pick } from "../i18n.ts";
import type { Route } from "../router.ts";
import { lectureCatalog } from "../content/lectures.ts";
import { reviewCatalog } from "../content/review.ts";
import { labCatalog } from "../content/labs.ts";

type Mode = "study" | "presentation";

const labels = {
  home: { pt: "Início", en: "Home" },
  review: { pt: "Revisão", en: "Review" },
  lab: { pt: "Laboratório", en: "Lab" },
  lectures: { pt: "Aulas", en: "Lectures" },
  soon: { pt: "em breve", en: "soon" },
  nav: { pt: "Navegação", en: "Navigation" },
  study: { pt: "Estudo", en: "Study" },
  presentation: { pt: "Apresentação", en: "Presentation" },
  usageMode: { pt: "Modo de uso", en: "Usage mode" },
} satisfies Record<string, Localized>;

function itemClass(active: boolean) {
  return active ? "nav-item nav-item--active" : "nav-item";
}

// A nav section that is a link AND shows its sublist when its route is active.
// Open/closed is driven by the route: open when selected, closed otherwise.
// (Ready for Review/Lab to reuse once they gain sub-items.)
function NavSection({
  title,
  href,
  active,
  expanded,
  children,
}: {
  title: string;
  href: string;
  active: boolean;
  expanded: boolean;
  children: ReactNode;
}) {
  return (
    <div className="nav-group-wrap">
      <a href={href} className={`${itemClass(active)} nav-section-head`}>
        {title}
        <span
          className={expanded ? "nav-chevron nav-chevron--open" : "nav-chevron"}
          aria-hidden="true"
        >
          ›
        </span>
      </a>
      {expanded && <div className="nav-sublist">{children}</div>}
    </div>
  );
}

export default function Sidebar({
  route,
  language,
  mode,
  setMode,
}: {
  route: Route;
  language: Language;
  mode: Mode;
  setMode: (mode: Mode) => void;
}) {
  // Labs are hands-on guides with no presentation view.
  const showModeToggle = route.name !== "labs" && route.name !== "lab";

  return (
    <nav className="sidebar" aria-label={pick(labels.nav, language)}>
      {showModeToggle ? (
        <div
          className="toggle sidebar-mode"
          role="group"
          aria-label={pick(labels.usageMode, language)}
        >
          <button
            className={mode === "study" ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setMode("study")}
          >
            {pick(labels.study, language)}
          </button>
          <button
            className={mode === "presentation" ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setMode("presentation")}
          >
            {pick(labels.presentation, language)}
          </button>
        </div>
      ) : (
        <div className="toggle sidebar-mode sidebar-mode--static" aria-hidden="true">
          <span className="toggle-btn active">{pick(labels.study, language)}</span>
        </div>
      )}

      <a href="#/" className={itemClass(route.name === "home")}>
        {pick(labels.home, language)}
      </a>
      <NavSection
        title={pick(labels.review, language)}
        href="#/review"
        active={route.name === "review"}
        expanded={route.name === "review" || route.name === "review-item"}
      >
        {reviewCatalog.map((entry) => {
          const active =
            route.name === "review-item" && route.slug === entry.slug;
          return (
            <a
              key={entry.slug}
              href={`#/review/${entry.slug}`}
              className={itemClass(active)}
            >
              {pick(entry.title, language)}
              {!entry.available && (
                <>
                  {" "}
                  <em className="nav-soon">{pick(labels.soon, language)}</em>
                </>
              )}
            </a>
          );
        })}
      </NavSection>

      <NavSection
        title={pick(labels.lectures, language)}
        href="#/lectures"
        active={route.name === "lectures"}
        expanded={route.name === "lectures" || route.name === "lecture"}
      >
        {lectureCatalog.map((entry) => {
          const active = route.name === "lecture" && route.id === entry.id;
          const label = `${entry.id} · ${pick(entry.title, language)}`;
          return entry.available ? (
            <a
              key={entry.id}
              href={`#/lecture/${entry.id}`}
              className={itemClass(active)}
            >
              {label}
            </a>
          ) : (
            <span key={entry.id} className="nav-item nav-item--disabled">
              {label} <em className="nav-soon">{pick(labels.soon, language)}</em>
            </span>
          );
        })}
      </NavSection>

      <NavSection
        title={pick(labels.lab, language)}
        href="#/lab"
        active={route.name === "labs"}
        expanded={route.name === "labs" || route.name === "lab"}
      >
        {labCatalog.map((entry) => {
          const active = route.name === "lab" && route.id === entry.id;
          const label = `Lab ${entry.id} · ${pick(entry.title, language)}`;
          return entry.available ? (
            <a
              key={entry.id}
              href={`#/lab/${entry.id}`}
              className={itemClass(active)}
            >
              {label}
            </a>
          ) : (
            <span key={entry.id} className="nav-item nav-item--disabled">
              {label} <em className="nav-soon">{pick(labels.soon, language)}</em>
            </span>
          );
        })}
      </NavSection>
    </nav>
  );
}
