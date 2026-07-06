import { useState } from "react";
import { type Language, pick } from "../i18n.ts";
import type { LabFigure as LabFigureData } from "../content/labTypes.ts";

const placeholderNote = {
  pt: "Screenshot a ser adicionado",
  en: "Screenshot to be added",
};

// The image is shown only once it actually loads (onLoad); until then — including
// when the file is missing — a labelled placeholder stands in for it.
export default function LabFigure({
  figure,
  language,
}: {
  figure: LabFigureData;
  language: Language;
}) {
  const [loaded, setLoaded] = useState(false);
  const alt = pick(figure.alt, language);
  const style = figure.maxWidth ? { maxWidth: figure.maxWidth } : undefined;

  return (
    <figure className="lab-figure" style={style}>
      {!loaded && (
        <div className="lab-figure-placeholder">
          <span className="lab-figure-ph-icon" aria-hidden="true">🖼</span>
          <span className="lab-figure-ph-alt">{alt}</span>
          <span className="lab-figure-ph-note">
            {pick(placeholderNote, language)} · <code>{figure.src}</code>
          </span>
        </div>
      )}
      {/* Mounted but hidden until it loads (no lazy — a display:none lazy image
          never loads, so onLoad would never fire). A missing file simply never
          flips `loaded`, so the placeholder stays. */}
      <img
        className="lab-figure-img"
        src={figure.src}
        alt={alt}
        style={loaded ? undefined : { display: "none" }}
        onLoad={(e) => {
          // Guard against 0×0 responses (e.g. an SPA fallback served as the img).
          if (e.currentTarget.naturalWidth > 0) setLoaded(true);
        }}
      />
      {figure.caption && (
        <figcaption className="lab-figure-cap">
          {pick(figure.caption, language)}
        </figcaption>
      )}
    </figure>
  );
}
