type SynthesisProps = {
  lecture: string;
  kind: string;
  title: string;
  points: string[];
};

export default function Synthesis({
  lecture,
  kind,
  title,
  points,
}: SynthesisProps) {
  return (
    <section className="section">
      <span className="eyebrow">
        {lecture} · {kind}
      </span>
      <h2 className="section-title">{title}</h2>
      <ul className="takeaways">
        {points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    </section>
  );
}
