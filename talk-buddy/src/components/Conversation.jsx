import { useEffect, useRef, useState } from "react";
import { Square, Volume2, Pause, Play, RotateCcw } from "lucide-react";
import { invoke } from "../services/supabase";
import ConversationComposer from "./ConversationComposer";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(null);
  const audio = useRef(null);
  const audioCache = useRef(new Map());
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

  async function restart() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await onRestart(session);
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
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
          <ConversationComposer
            draft={draft}
            setDraft={setDraft}
            preferences={p}
            config={config}
            paused={paused}
            busy={busy}
            onSend={send}
            onError={setError}
          />
        )}
        <footer className="chat-footer">
          <div className="practice-actions">
            {session.status === "active" && (
              <button onClick={() => setPaused(!paused)}>
                {paused ? <Play size={18} /> : <Pause size={18} />}
                {paused ? "Resume" : "Pause"}
              </button>
            )}
            <button onClick={() => void restart()} disabled={busy}>
              <RotateCcw size={17} />
              Start a new practice
            </button>
          </div>
          <button className="primary" onClick={end} disabled={busy}>
            {session.status === "active"
              ? "End & reflect"
              : "Continue to reflection"}
          </button>
        </footer>
      </section>
    </div>
  );
}
