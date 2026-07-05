import { useState } from "react";
import Formula from "./Formula.tsx";
import { type Language, type Localized, pick } from "../i18n.ts";

type QuizProps = {
  language: Language;
  question: string;
  options: string[];
  correctIndex: number;
  solution?: { text: string; latex?: string }[];
};

const labels = {
  correct: { pt: "Correto!", en: "Correct!" },
  incorrect: { pt: "Ainda não — tente de novo.", en: "Not quite — try again." },
  show: { pt: "Ver solução passo a passo", en: "Show step-by-step solution" },
  hide: { pt: "Ocultar solução", en: "Hide solution" },
} satisfies Record<string, Localized>;

export default function Quiz({
  language,
  question,
  options,
  correctIndex,
  solution,
}: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const isCorrect = selected === correctIndex;
  const hasSolution = solution !== undefined && solution.length > 0;

  return (
    <div className="quiz">
      <p className="quiz-question">{question}</p>
      <ul className="quiz-options">
        {options.map((option, i) => {
          let cls = "quiz-option";
          if (selected === i) {
            cls += i === correctIndex ? " quiz-option--correct" : " quiz-option--wrong";
          }
          return (
            <li key={i}>
              <button className={cls} onClick={() => setSelected(i)}>
                {option}
              </button>
            </li>
          );
        })}
      </ul>

      {selected !== null && (
        <p
          className={
            isCorrect ? "quiz-feedback quiz-feedback--ok" : "quiz-feedback quiz-feedback--no"
          }
        >
          {isCorrect ? pick(labels.correct, language) : pick(labels.incorrect, language)}
        </p>
      )}

      {selected !== null && hasSolution && (
        <>
          <button
            className="quiz-solution-toggle"
            onClick={() => setShowSolution((s) => !s)}
          >
            {showSolution ? pick(labels.hide, language) : pick(labels.show, language)}
          </button>
          {showSolution && (
            <ol className="steps quiz-solution">
              {solution.map((step, i) => (
                <li className="step" key={i}>
                  <p className="step-caption">{step.text}</p>
                  {step.latex && <Formula latex={step.latex} block />}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
