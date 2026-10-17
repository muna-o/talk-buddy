import { useState } from "react";
import { ArrowRight } from "lucide-react";
export default function FreeMode({ start }) {
  const [form, setForm] = useState({
    scenario: "",
    name: "Alex",
    role: "Friend",
    personality: "Kind and supportive",
    difficulty: "gentle",
  });
  const [customRole, setCustomRole] = useState("");
  const [customPersonality, setCustomPersonality] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await start({
        mode: "free",
        ...form,
        role: form.role === "Other" ? customRole.trim() : form.role,
        personality:
          form.personality === "Custom"
            ? customPersonality.trim()
            : form.personality,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow free-page">
      <header className="page-heading">
        <h1>Free practice</h1>
        <p>Choose a situation and make it your own.</p>
      </header>
      <form className="panel form-stack" onSubmit={submit}>
        <label>
          What would you like to practice?
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
            <select name="role" value={form.role} onChange={change}>
              {[
                "Friend",
                "Classmate",
                "Teacher",
                "Coworker",
                "Manager",
                "Family member",
                "Other",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
        {form.role === "Other" && (
          <label>
            Custom role
            <input
              required
              maxLength={80}
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="For example, a librarian"
            />
          </label>
        )}
        <label>
          Personality
          <select name="personality" value={form.personality} onChange={change}>
            {[
              "Kind and supportive",
              "Direct and straightforward",
              "Playful and energetic",
              "Calm and professional",
              "Quiet and reserved",
              "Custom",
            ].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        {form.personality === "Custom" && (
          <label>
            Describe their personality
            <textarea
              required
              rows={2}
              maxLength={300}
              value={customPersonality}
              onChange={(e) => setCustomPersonality(e.target.value)}
              placeholder="For example, cheerful with a silly sense of humor"
            />
          </label>
        )}
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
          {busy ? "Connecting…" : "Start practicing"}
          <ArrowRight size={19} />
        </button>
      </form>
    </div>
  );
}
