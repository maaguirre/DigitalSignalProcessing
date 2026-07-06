import type { ReactNode } from "react";

// Turns a plain string with markdown-style links — [label](https://url) — into
// React nodes, rendering the links as clickable anchors (new tab, safe rel).
// Everything else is passed through untouched. Used by lab callouts and steps.
const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

export function renderRich(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(LINK)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));
    nodes.push(
      <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer">
        {m[1]}
      </a>
    );
    last = idx + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length === 1 ? nodes[0] : nodes;
}
