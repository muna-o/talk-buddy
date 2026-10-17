import { nextAutomaticReply } from "../services/audio.mjs";
import { courseTitle } from "../data/courseTitles";
import { useCallback, useEffect, useRef, useState } from "react";
import { Square, Volume2, Pause, Play, RotateCcw } from "lucide-react";
import { invoke } from "../services/supabase";
import ConversationComposer from "./ConversationComposer";
import CourseIllustration from "./CourseIllustration";
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
  const [draft, setDraft] = useState(initial.draft || "");
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
  const audioRequest = useRef(0);
  const autoSpoken = useRef(new Set());
  useEffect(() => {
    soundAllowed.current = p.audioEnabled && !paused;
  }, [p.audioEnabled, paused]);
  useEffect(() => {
    mounted.current = true;
    const cache = audioCache.current;
    return () => {
      mounted.current = false;
      audioRequest.current += 1;
      audio.current?.pause();
      for (const url of cache.values()) URL.revokeObjectURL(url);
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [messages, busy]);
  useEffect(() => {
    if (!p.audioEnabled || paused) {
      audioRequest.current += 1;
      audio.current?.pause();
    }
  }, [p.audioEnabled, paused]);
  const config = session.configuration;
  const play = useCallback(
    async (message) => {
      if (!p.audioEnabled) return;
      const request = ++audioRequest.current;
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
          if (!mounted.current) return;
          url = URL.createObjectURL(blob);
          audioCache.current.set(key, url);
        }
        if (!mounted.current) return;
        if (request !== audioRequest.current) return;
        if (!soundAllowed.current) {
          setPlaying(null);
          return;
        }
        audio.current = new Audio(url);
        audio.current.onended = () => setPlaying(null);
        audio.current.onpause = () => {
          if (mounted.current) setPlaying(null);
        };
        await audio.current.play();
      } catch (e) {
        if (mounted.current && request === audioRequest.current) {
          setError(
            e.name === "NotAllowedError"
              ? "Your browser paused automatic audio. Press Listen to start playback."
              : e.message,
          );
          setPlaying(null);
        }
      }
    },
    [p.audioEnabled, p.voice],
  );
  useEffect(() => {
    const latest = nextAutomaticReply(
      messages,
      { audioEnabled: p.audioEnabled, autoSpeech: p.autoSpeech },
      paused,
      session.status,
      autoSpoken.current,
    );
    if (!latest) return;
    const timer = setTimeout(() => {
      autoSpoken.current.add(latest.id);
      void play(latest);
    }, 0);
    return () => clearTimeout(timer);
  }, [messages, p.audioEnabled, p.autoSpeech, paused, session.status, play]);
  function updateDraft(value) {
    setDraft(value);
    onUpdate({ session, messages, draft: value });
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
      onUpdate({ session: data.session, messages: data.messages, draft: "" });
      setDraft("");
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
    audioRequest.current += 1;
    audio.current?.pause();
    setPlaying(null);
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
        <div className="chat-topic">
          {session.mode === "course" && <CourseIllustration lesson={config} />}
          <h1>
            {session.mode === "course" ? courseTitle(config) : "Free practice"}
          </h1>
        </div>
        <header className="chat-header">
          <div className="avatar">{config.character.name.slice(0, 1)}</div>
          <div>
            <h2>{config.character.name}</h2>
            <p>{config.character.role} · AI practice partner</p>
          </div>
          <span className="badge">{config.difficulty}</span>
        </header>
        <section
          className="scenario-strip"
          aria-labelledby="chat-scenario-heading"
        >
          <h2 id="chat-scenario-heading">Scenario</h2>
          <p>{config.scenario}</p>
        </section>
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
                      ? ((audioRequest.current += 1),
                        audio.current?.pause(),
                        setPlaying(null))
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
            setDraft={updateDraft}
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
              <button
                onClick={() => {
                  audioRequest.current += 1;
                  audio.current?.pause();
                  setPlaying(null);
                  setPaused(!paused);
                }}
              >
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
