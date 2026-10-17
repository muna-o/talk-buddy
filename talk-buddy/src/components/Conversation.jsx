import { useEffect, useRef, useState } from "react";
import {
  Send,
  Mic,
  Square,
  Volume2,
  Lightbulb,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { invoke } from "../services/supabase";
import { startDictation } from "../services/speechRecognition";
const generalCards = [
  "I need help.",
  "I need a break.",
  "I’m not comfortable with that.",
  "No, thank you.",
  "Can we talk about this later?",
];
export default function Conversation({
  initial,
  preferences: p,
  onFinish,
  onRestart,
  onUpdate,
  support,
}) {
  const [session, setSession] = useState(initial.session);
  const [messages, setMessages] = useState(initial.messages);
  const [draft, setDraft] = useState("");
  const [cards, setCards] = useState(p.communication === "cards");
  const [hints, setHints] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const [listening, setListening] = useState(false);
  const [playing, setPlaying] = useState(null);
  const recognition = useRef(null);
  const audio = useRef(null);
  const audioCache = useRef(new Map());
  const composer = useRef(null);
  const bottom = useRef(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const soundAllowed = useRef(false);
  useEffect(() => {
    soundAllowed.current = p.audioEnabled && !paused;
  }, [p.audioEnabled, paused]);
  useEffect(() => {
    mounted.current = true;
    const cache = audioCache.current;
    return () => {
      mounted.current = false;
      recognition.current?.abort();
      audio.current?.pause();
      for (const url of cache.values()) URL.revokeObjectURL(url);
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [messages, busy]);
  useEffect(() => {
    if (!p.audioEnabled || paused) {
      audio.current?.pause();
    }
  }, [p.audioEnabled, paused]);
  const config = session.configuration;
  async function play(message) {
    if (!p.audioEnabled) return;
    audio.current?.pause();
    setPlaying(message.id);
    setError("");
    try {
      const key = `${message.id}-${p.voice}`;
      let url = audioCache.current.get(key);
      if (!url) {
        const blob = await invoke("tts", {
          message_id: message.id,
          voice_id: p.voice,
        });
        url = URL.createObjectURL(blob);
        audioCache.current.set(key, url);
      }
      if (!mounted.current || !soundAllowed.current) return;
      audio.current = new Audio(url);
      audio.current.onended = () => setPlaying(null);
      audio.current.onpause = () => {
        if (mounted.current) setPlaying(null);
      };
      await audio.current.play();
    } catch (e) {
      if (mounted.current) {
        setError(e.message);
        setPlaying(null);
      }
    }
  }
  async function send(e) {
    e.preventDefault();
    if (!draft.trim() || lock.current || paused || session.status !== "active")
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    recognition.current?.stop();
    try {
      const data = await invoke("chat", {
        action: "send",
        session_id: session.id,
        message: draft.trim(),
      });
      if (!mounted.current) return;
      setMessages(data.messages);
      setSession(data.session);
      onUpdate({ session: data.session, messages: data.messages });
      setHints(data.suggested_responses);
      setShowHints(false);
      setDraft("");
      if (p.audioEnabled && p.autoSpeech && !data.safety_concern)
        void play(data.messages.at(-1));
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function end() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    recognition.current?.abort();
    audio.current?.pause();
    try {
      const data = await invoke("chat", {
        action: "end",
        session_id: session.id,
      });
      onFinish(data.session);
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function dictate() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    setError("");
    recognition.current = startDictation(
      (text) => setDraft(text.slice(0, 2000)),
      setError,
      () => setListening(false),
    );
    setListening(Boolean(recognition.current));
  }
  function insert(text) {
    setDraft(text);
    composer.current?.focus();
  }
  return (
    <div className="conversation-layout">
      <section className="chat panel">
        <header className="chat-header">
          <div className="avatar">{config.character.name.slice(0, 1)}</div>
          <div>
            <h1>{config.character.name}</h1>
            <p>{config.character.role} · AI practice partner</p>
          </div>
          <span className="badge">{config.difficulty}</span>
        </header>
        <div className="scenario-strip">{config.scenario}</div>
        <div
          className="chat-messages"
          role="log"
          aria-label="Conversation"
          aria-live="polite"
        >
          {messages.map((m) => (
            <div className={`message ${m.role}`} key={m.id}>
              <small>{m.role === "user" ? "You" : config.character.name}</small>
              <p>{m.content}</p>
              {m.role === "assistant" && p.audioEnabled && (
                <button
                  className="audio-button"
                  onClick={() =>
                    playing === m.id
                      ? (audio.current?.pause(), setPlaying(null))
                      : void play(m)
                  }
                  aria-label={`${playing === m.id ? "Stop" : "Play"} message from ${config.character.name}`}
                >
                  {playing === m.id ? (
                    <Square size={15} />
                  ) : (
                    <Volume2 size={15} />
                  )}
                  {playing === m.id ? "Stop audio" : "Listen"}
                </button>
              )}
            </div>
          ))}
          {busy && <p role="status">Working on your request…</p>}
          <div ref={bottom} />
        </div>
        {session.status === "safety" && (
          <aside role="alert">
            Practice has paused for support.{" "}
            <button onClick={support}>Find support</button>
          </aside>
        )}
        {paused && (
          <aside role="status">
            Take all the time you need. Your conversation is paused.
          </aside>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {session.status === "active" && (
          <div className="composer-area">
            <div className="toolbar">
              <button onClick={() => setCards(!cards)} aria-expanded={cards}>
                <MessageSquare size={17} /> Cards
              </button>
              <button
                onClick={() => setShowHints(!showHints)}
                aria-expanded={showHints}
              >
                <Lightbulb size={17} /> Hint
              </button>
              <button
                onClick={() => {
                  setPaused(!paused);
                  recognition.current?.stop();
                }}
              >
                {paused ? <Play size={17} /> : <Pause size={17} />}
                {paused ? "Resume" : "Pause"}
              </button>
            </div>
            {showHints && (
              <aside>
                <strong>One option to consider</strong>
                <p>
                  You can name what you need, ask for a change, or choose to
                  leave.
                </p>
                {hints?.map((h) => (
                  <button className="phrase" key={h} onClick={() => insert(h)}>
                    {h}
                  </button>
                ))}
              </aside>
            )}
            {cards && (
              <div
                className="communication-cards"
                aria-label="Communication cards"
              >
                {[...new Set([...(config.cards || []), ...generalCards])].map(
                  (c) => (
                    <button key={c} onClick={() => insert(c)} disabled={paused}>
                      {c}
                    </button>
                  ),
                )}
              </div>
            )}
            <form onSubmit={send}>
              <label className="sr-only" htmlFor="message">
                Your message
              </label>
              <textarea
                id="message"
                ref={composer}
                rows={2}
                maxLength={2000}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={paused || busy}
                placeholder="Type what works for you…"
              />
              <div className="compose-actions">
                <button
                  type="button"
                  onClick={dictate}
                  disabled={paused || busy}
                  aria-pressed={listening}
                >
                  <Mic size={18} />
                  {listening ? "Stop listening" : "Speak"}
                </button>
                <small>{draft.length}/2000</small>
                <button
                  className="primary"
                  disabled={busy || paused || !draft.trim()}
                >
                  <Send size={17} /> Send
                </button>
              </div>
            </form>
            <small>
              Speech transcription stays editable. Nothing sends until you press
              Send.
            </small>
          </div>
        )}
        <footer className="chat-footer">
          <span>No rush. You’re in control.</span>
          <button onClick={end} disabled={busy}>
            {session.status === "active"
              ? "End & reflect"
              : "Continue to reflection"}
          </button>
        </footer>
      </section>
      <aside className="practice-sidebar">
        <div className="panel">
          <div className="eyebrow">A SPACE TO PRACTICE</div>
          <h2>{config.title}</h2>
          <p>There’s no perfect response. Try words that feel like yours.</p>
          {config.objectives?.length > 0 && (
            <ul>
              {config.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          )}
          <p>
            <strong>{session.turn_count} of 20</strong> practice turns used. End
            whenever you want.
          </p>
        </div>
        <div className="panel soft">
          <h3>A little reminder</h3>
          <p>
            Your needs matter. Taking a break or saying no is always an option.
          </p>
          <button onClick={() => void onRestart(session)} disabled={busy}>
            <RotateCcw size={16} /> Start a new practice
          </button>
        </div>
      </aside>
    </div>
  );
}
