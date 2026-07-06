import { useState } from "react";
import type { Localized } from "../i18n.ts";
import { type Language, pick } from "../i18n.ts";

// A verification checklist.
export default function LabChecklist({
  items,
  language,
}: {
  items: Localized[];
  language: Language;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  function toggle(i: number) {
    setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)));
  }

  return (
    <ul className="lab-checklist">
      {items.map((item, i) => (
        <li key={i} className={checked[i] ? "lab-check lab-check--done" : "lab-check"}>
          <label>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
            />
            <span>{pick(item, language)}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
