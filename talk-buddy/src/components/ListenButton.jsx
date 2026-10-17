import { useEffect, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { invoke } from "../services/supabase";

export default function ListenButton({
  text,
  voice,
  label = "text",
  disabled = false,
}) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const audio = useRef(null);
  const request = useRef(0);
  const cached = useRef(null);
  const stop = () => {
    request.current += 1;
    audio.current?.pause();
    setState("idle");
  };
  useEffect(() => {
    const interrupt = () => {
      request.current += 1;
      audio.current?.pause();
      setState("idle");
    };
    window.addEventListener("talkbuddy-audio-start", interrupt);
    return () => {
      window.removeEventListener("talkbuddy-audio-start", interrupt);
      request.current += 1;
      audio.current?.pause();
      if (cached.current) URL.revokeObjectURL(cached.current.url);
      cached.current = null;
    };
  }, [text, voice]);
  useEffect(() => {
    request.current += 1;
    audio.current?.pause();
    const reset = setTimeout(() => {
      setState("idle");
      setError("");
    }, 0);
    return () => clearTimeout(reset);
  }, [disabled, text, voice]);

  async function listen() {
    if (state !== "idle") {
      stop();
      return;
    }
    window.dispatchEvent(new Event("talkbuddy-audio-start"));
    const id = ++request.current;
    setError("");
    setState("loading");
    try {
      const key = JSON.stringify([text, voice]);
      if (cached.current?.key !== key) {
        const blob = await invoke("tts", { text, voice_id: voice });
        if (request.current !== id) return;
        if (cached.current) URL.revokeObjectURL(cached.current.url);
        cached.current = { key, url: URL.createObjectURL(blob) };
      }
      if (request.current !== id) return;
      const player = new Audio(cached.current.url);
      audio.current = player;
      player.onended = () => {
        if (request.current === id) setState("idle");
      };
      player.onerror = () => {
        if (request.current === id) {
          setState("idle");
          setError("Audio could not play. Please try again.");
        }
      };
      await player.play();
      if (request.current === id) setState("playing");
    } catch (e) {
      if (request.current === id) {
        setState("idle");
        setError(
          e.name === "NotAllowedError"
            ? "Press Listen again to allow audio."
            : e.message,
        );
      }
    }
  }
  if (!text?.trim()) return null;
  return (
    <div className="text-listen">
      <button
        type="button"
        className="audio-button"
        disabled={disabled}
        onClick={() => void listen()}
        aria-label={`${state === "idle" ? "Listen to" : "Stop audio for"} ${label}`}
      >
        {state === "idle" ? (
          <Volume2 size={15} aria-hidden="true" />
        ) : (
          <Square size={15} aria-hidden="true" />
        )}
        {state === "idle"
          ? "Listen"
          : state === "loading"
            ? "Cancel audio"
            : "Stop audio"}
      </button>
      {state === "loading" && <small role="status">Preparing audio…</small>}
      {error && (
        <small className="error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
