import { useRef, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import ListenButton from "../components/ListenButton";
import Whimsy from "../components/Whimsy";
export default function FreeMode({ start, voice }) {
  const [step, setStep] = useState(0);
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
  const heading = useRef(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  function goTo(value) {
    setStep(value);
    setError("");
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function submit(e) {
    e.preventDefault();
    if (step === 0) {
      goTo(1);
      return;
    }
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
      <header className="page-heading free-heading">
        <div>
          <span className="step-label">Step {step + 1} of 2</span>
          <h1 tabIndex={-1} ref={heading}>
            Free practice
          </h1>
          <p>
            {step === 0
              ? "Choose a conversation."
              : "Choose your practice partner."}
          </p>
        </div>
        <Whimsy />
      </header>
      <form key={step} className="panel form-stack" onSubmit={submit}>
        {step === 0 ? (
          <>
            <label>
              What would you like to practice?
              <textarea
                autoFocus
                required
                name="scenario"
                maxLength={1500}
                rows={5}
                value={form.scenario}
                onChange={change}
                placeholder="I want to tell my manager that the office is too loud."
              />
            </label>
            <ListenButton
              text={form.scenario}
              voice={voice}
              label="your scenario"
            />
            <p className="field-help">
              A few details help: where are you, who are you talking to, and
              what would you like to ask or say?
            </p>
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
              <small>Every level stays respectful.</small>
            </fieldset>
            <button className="primary wizard-next">
              Choose a partner
              <ArrowRight size={19} />
            </button>
          </>
        ) : (
          <>
            <div className="scenario-summary">
              <strong>Your situation</strong>
              <p>{form.scenario}</p>
              <ListenButton
                text={form.scenario}
                voice={voice}
                label="your scenario"
              />
              <button
                type="button"
                className="text-button"
                onClick={() => goTo(0)}
              >
                Edit situation
              </button>
            </div>
            <div className="two-columns">
              <label>
                Partner’s name
                <input
                  autoFocus
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
                />
              </label>
            )}
            <label>
              Personality
              <select
                name="personality"
                value={form.personality}
                onChange={change}
              >
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
                />
              </label>
            )}
            <p className="privacy-note">
              Use fictional details. Practice messages are sent to Supabase and
              Google Gemini; voice playback sends the text you choose to hear to
              ElevenLabs. Gemini’s free tier may use content to improve its
              products.
            </p>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="wizard-actions">
              <button type="button" onClick={() => goTo(0)} disabled={busy}>
                <ArrowLeft size={18} />
                Back
              </button>
              <button className="primary" disabled={busy}>
                {busy ? "Connecting…" : "Start practicing"}
                <ArrowRight size={19} />
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
