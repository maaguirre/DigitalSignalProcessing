type ComingSoonProps = {
  title: string;
  note: string;
};

export default function ComingSoon({ title, note }: ComingSoonProps) {
  return (
    <section className="section">
      <span className="eyebrow">EA-269</span>
      <h2 className="section-title">{title}</h2>
      <p className="section-text">{note}</p>
    </section>
  );
}
