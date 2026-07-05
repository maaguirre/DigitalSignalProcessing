import Formula from "./Formula.tsx";

type ExampleStep = {
  text: string;
  latex?: string;
};

type ExampleProps = {
  lecture: string;
  kind: string;
  title: string;
  statement: string;
  steps: ExampleStep[];
};

export default function Example({
  lecture,
  kind,
  title,
  statement,
  steps,
}: ExampleProps) {
  return (
    <section className="section">
      <span className="eyebrow">
        {lecture} · {kind}
      </span>
      <h2 className="section-title">{title}</h2>
      <p className="section-text section-lead">{statement}</p>
      <ol className="steps">
        {steps.map((step, i) => (
          <li className="step" key={i}>
            <p className="step-caption">{step.text}</p>
            {step.latex && <Formula latex={step.latex} block />}
          </li>
        ))}
      </ol>
    </section>
  );
}
