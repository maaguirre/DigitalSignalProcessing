import Formula from "./Formula.tsx";

type FormalizationStep = {
  latex: string;
  caption: string;
  ref: string;
};

type FormalizationProps = {
  lecture: string;
  kind: string;
  title: string;
  steps: FormalizationStep[];
};

export default function Formalization({
  lecture,
  kind,
  title,
  steps,
}: FormalizationProps) {
  return (
    <section className="section">
      <span className="eyebrow">
        {lecture} · {kind}
      </span>
      <h2 className="section-title">{title}</h2>
      <ol className="steps">
        {steps.map((step, i) => (
          <li className="step" key={i}>
            <p className="step-caption">{step.caption}</p>
            <Formula latex={step.latex} block />
            <span className="step-ref">{step.ref}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
