import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
export default function FreeMode({ start }) {
  const [form, setForm] = useState({
    scenario: "",
    name: "Alex",
    role: "Friend",
    personality: "Kind and supportive",
    difficulty: "gentle",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await start({ mode: "free", ...form });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow">
      <div className="eyebrow">
        <Sparkles size={18} /> YOUR SCENARIO, YOUR PACE
      </div>
      <h1>What would you like to practice?</h1>
      <p className="lead">Make space for a conversation that matters to you.</p>
      <form className="panel form-stack" onSubmit={submit}>
        <label>
          Describe the situation
          <textarea
            required
            name="scenario"
            maxLength={1500}
            rows={3}
            value={form.scenario}
            onChange={change}
            placeholder="I want to tell my manager that the office is too loud."
          />
        </label>
        <div className="two-columns">
          <label>
            Partner’s name
            <input
              required
              name="name"
              maxLength={60}
              value={form.name}
              onChange={change}
            />
          </label>
          <label>
            Partner’s role
            <input
              required
              name="role"
              maxLength={80}
              list="roles"
              value={form.role}
              onChange={change}
            />
            <datalist id="roles">
              {[
                "Friend",
                "Classmate",
                "Teacher",
                "Coworker",
                "Manager",
                "Family member",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </datalist>
          </label>
        </div>
        <label>
          Personality
          <input
            required
            name="personality"
            maxLength={300}
            list="personalities"
            value={form.personality}
            onChange={change}
          />
          <datalist id="personalities">
            {[
              "Kind and supportive",
              "Direct and straightforward",
              "Playful and energetic",
              "Calm and professional",
              "Quiet and reserved",
            ].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </datalist>
          <small>
            Choose a style or describe your own. This is a fictional partner.
          </small>
        </label>
        <fieldset>
          <legend>Conversation difficulty</legend>
          <div className="segmented">
            {["gentle", "realistic", "challenging"].map((d) => (
              <label key={d}>
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  checked={form.difficulty === d}
                  onChange={change}
                />
                {d}
              </label>
            ))}
          </div>
          <small>
            Every level stays respectful. Challenging adds complexity, never
            threats.
          </small>
        </fieldset>
        <p className="privacy-note">
          Messages go to Supabase and Google Gemini. Avoid real names,
          passwords, and sensitive personal details. Gemini’s free tier may use
          content to improve Google’s products.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? "Connecting…" : "Start practicing"} <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
