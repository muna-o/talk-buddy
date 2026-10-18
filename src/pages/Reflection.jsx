import { useEffect, useState } from "react";
import { Leaf, ArrowRight } from "lucide-react";
import { invoke } from "../services/supabase";
export default function Reflection({ session, again, courses }) {
  const [reflection, setReflection] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    invoke("reflection", { session_id: session.id })
      .then((r) => {
        if (active) setReflection(r.reflection);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [session.id, attempt]);
  return (
    <div className="narrow">
      <div className="eyebrow">
        <Leaf size={18} /> A MOMENT TO REFLECT
      </div>
      <h1>Take what works for you.</h1>
      <p className="lead">
        Practice is about exploring your options, at your own pace.
      </p>
      <div className="panel">
        {!reflection && !error && (
          <p role="status">Preparing your reflection…</p>
        )}
        {error && (
          <div role="alert">
            <p className="error">{error}</p>
            <button
              onClick={() => {
                setError("");
                setAttempt(attempt + 1);
              }}
            >
              Try reflection again
            </button>
          </div>
        )}
        {reflection && (
          <>
            <h2>What you practiced</h2>
            <p>{reflection.practiced}</p>
            <h2>What you communicated</h2>
            <p>{reflection.communicated}</p>
            {reflection.alternatives.length > 0 && (
              <>
                <h2>Other words you could try</h2>
                {reflection.alternatives.map((a) => (
                  <blockquote key={a}>{a}</blockquote>
                ))}
              </>
            )}
            <aside>
              <strong>Something to remember</strong>
              <p>{reflection.takeaway}</p>
            </aside>
          </>
        )}
        <div className="button-row">
          <button className="primary" onClick={again}>
            Practice again <ArrowRight size={18} />
          </button>
          <button onClick={courses}>Back to courses</button>
        </div>
      </div>
    </div>
  );
}
