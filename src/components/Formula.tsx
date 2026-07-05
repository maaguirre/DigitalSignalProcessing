import katex from "katex";

type FormulaProps = {
  latex: string;
  block?: boolean;
};

export default function Formula({ latex, block = false }: FormulaProps) {
  // `latex` is our own static, trusted content — never user input — so rendering
  // KaTeX's HTML output directly is safe here.
  const html = katex.renderToString(latex, {
    displayMode: block,
    throwOnError: false,
  });
  return (
    <span
      className={block ? "formula formula--block" : "formula"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
