import { courseTitle } from "../data/courseTitles";
import Whimsy from "../components/Whimsy";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
export default function Lesson({ lesson, start, back }) {
  const [phase, setPhase] = useState(0);
  const [choice, setChoice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function practice() {
    setBusy(true);
    setError("");
    try {
      await start({ mode: "course", lesson_id: lesson.id });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow">
      <button className="text-button" onClick={back}>
        ← Back to courses
      </button>
      <div className="steps" aria-label="Lesson phases">
        {["Learn", "Explore", "Practice", "Reflect"].map((s, i) => (
          <span key={s} aria-current={i === phase ? "step" : undefined}>
            {i < phase ? <Check size={15} /> : i + 1} {s}
          </span>
        ))}
      </div>
      <section className="panel lesson-panel">
        <Whimsy className="lesson-star" />
        <h1>{courseTitle(lesson)}</h1>
        {phase === 0 ? (
          <>
            <p className="lead">{lesson.introduction}</p>
            <h2>What you can practice</h2>
            <ul>
              {lesson.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <aside className="scenario-context">
              <strong>Scenario</strong>
              <p>{lesson.scenario}</p>
            </aside>
            <button className="primary" onClick={() => setPhase(1)}>
              Explore the situation <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <aside className="scenario-context">
              <strong>Scenario</strong>
              <p>{lesson.scenario}</p>
            </aside>
            <h2 className="practice-question">{lesson.question}</h2>
            <p>There can be more than one way that works for you.</p>
            <div className="choices">
              {lesson.choices.map((c, i) => (
                <button
                  key={c.text}
                  aria-pressed={choice === i}
                  onClick={() => setChoice(i)}
                >
                  {c.text}
                </button>
              ))}
            </div>
            {choice !== null && (
              <aside role="status">{lesson.choices[choice].feedback}</aside>
            )}
            <p>
              You’ll practice with {lesson.character.name}, an AI{" "}
              {lesson.character.role.toLowerCase()}. You can pause or leave
              whenever you want.
            </p>
            <button
              className="primary"
              onClick={practice}
              disabled={choice === null || busy}
            >
              {busy ? "Connecting…" : "Begin conversation"}{" "}
              <ArrowRight size={18} />
            </button>
          </>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
