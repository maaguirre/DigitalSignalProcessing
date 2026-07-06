import { useState } from "react";
import type { CodeBlock } from "../content/labTypes.ts";
import { type Language, pick } from "../i18n.ts";

const copyLabel = { pt: "Copiar", en: "Copy" };
const copiedLabel = { pt: "Copiado!", en: "Copied!" };

// A source-code listing (Verilog / XDC / Tcl) with a copy button. `code` is
// localized so its comments read in the selected language.
export default function LabCode({
  block,
  language,
}: {
  block: CodeBlock;
  language: Language;
}) {
  const [copied, setCopied] = useState(false);
  const code = pick(block.code, language);

  function copy() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <figure className="code-block">
      <div className="code-head">
        <span className="code-lang">{block.language}</span>
        {block.filename && <span className="code-file">{block.filename}</span>}
        <button className="code-copy" onClick={copy} type="button">
          {copied ? pick(copiedLabel, language) : pick(copyLabel, language)}
        </button>
      </div>
      <pre className="code-body">
        <code>{code}</code>
      </pre>
      {block.caption && (
        <figcaption className="code-caption">
          {pick(block.caption, language)}
        </figcaption>
      )}
    </figure>
  );
}
