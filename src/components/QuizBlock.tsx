import Quiz from "./Quiz.tsx";
import type { Language } from "../i18n.ts";

type QuizItem = {
  question: string;
  options: string[];
  correctIndex: number;
  solution?: { text: string; latex?: string }[];
};

type QuizBlockProps = {
  lecture: string;
  kind: string;
  title: string;
  quizzes: QuizItem[];
  language: Language;
};

export default function QuizBlock({
  lecture,
  kind,
  title,
  quizzes,
  language,
}: QuizBlockProps) {
  return (
    <section className="section">
      <span className="eyebrow">
        {lecture} · {kind}
      </span>
      <h2 className="section-title">{title}</h2>
      {quizzes.map((quiz, i) => (
        <Quiz
          key={i}
          language={language}
          question={quiz.question}
          options={quiz.options}
          correctIndex={quiz.correctIndex}
          solution={quiz.solution}
        />
      ))}
    </section>
  );
}
