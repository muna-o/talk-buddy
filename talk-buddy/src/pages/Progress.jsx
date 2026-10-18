import { useEffect, useState } from "react";
import {
  recentSessions,
  deleteHistory,
  configured,
} from "../services/supabase";
export default function Progress({ open, courseList }) {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(configured);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    let active = true;
    if (configured)
      recentSessions()
        .then((s) => {
          if (active) setSessions(s);
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setBusy(false);
        });
    return () => {
      active = false;
    };
  }, []);
  const complete = sessions.filter(
    (s) => s.status === "completed" && s.turn_count > 0,
  );
  async function remove() {
    setBusy(true);
    try {
      await deleteHistory();
      setSessions([]);
      setConfirmDelete(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h1>My practice</h1>
      <p className="lead">
        A record of the conversations you chose to explore.
      </p>
      <div className="stats">
        <div className="panel">
          <strong>
            {new Set(complete.map((s) => s.lesson_id).filter(Boolean)).size}
          </strong>
          <span>Lessons practiced</span>
        </div>
        <div className="panel">
          <strong>{sessions.filter((s) => s.turn_count > 0).length}</strong>
          <span>Conversations explored</span>
        </div>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <section className="panel">
        <h2>Recent practice</h2>
        {busy && <p role="status">Loading…</p>}
        {!busy && !sessions.length && (
          <>
            <p>
              {configured
                ? "Your practice will appear here when you begin."
                : "Connect Supabase to save your practice history."}
            </p>
            <button onClick={courseList}>Explore the lessons</button>
          </>
        )}
        {sessions.map((s) => (
          <div className="history-row" key={s.id}>
            <div>
              <h3>{s.configuration.title}</h3>
              <p>
                {new Date(s.created_at).toLocaleDateString()} · {s.turn_count}{" "}
                turns ·{" "}
                {s.status === "active"
                  ? "In progress"
                  : s.status === "safety"
                    ? "Paused for support"
                    : "Ended"}
              </p>
            </div>
            <button onClick={() => open(s)}>
              {s.status === "active" ? "Resume" : "Reflection"}
            </button>
          </div>
        ))}
      </section>
      {sessions.length > 0 && (
        <div className="danger-zone">
          {confirmDelete ? (
            <>
              <p>
                Delete all saved conversations and reflections? This cannot be
                undone.
              </p>
              <button disabled={busy} onClick={remove}>
                Delete all history
              </button>
              <button onClick={() => setConfirmDelete(false)}>
                Keep history
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)}>
              Delete conversation history
            </button>
          )}
        </div>
      )}
    </>
  );
}
