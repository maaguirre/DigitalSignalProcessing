type ProseProps = {
  lecture: string;
  kind: string;
  title: string;
  text: string;
  reviewLink?: { slug: string; label: string };
};

export default function Prose({
  lecture,
  kind,
  title,
  text,
  reviewLink,
}: ProseProps) {
  return (
    <section className="section">
      <span className="eyebrow">
        {lecture} · {kind}
      </span>
      <h2 className="section-title">{title}</h2>
      <p className="section-text">{text}</p>
      {reviewLink && (
        <a className="review-link" href={`#/review/${reviewLink.slug}`}>
          → Revisão: {reviewLink.label}
        </a>
      )}
    </section>
  );
}
