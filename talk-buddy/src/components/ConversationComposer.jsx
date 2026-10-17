import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  Keyboard,
  MessageSquare,
  Send,
  Pencil,
  Check,
  HandHelping,
  Coffee,
  ShieldCheck,
  FileText,
  MessageCircle,
} from "lucide-react";
import { startDictation } from "../services/speechRecognition";
const generalCards = [
  "I need help.",
  "I need a break.",
  "I’m not comfortable with that.",
  "No, thank you.",
  "Can we talk about this later?",
];
function cardIcon(text) {
  if (/break|later/i.test(text)) return Coffee;
  if (/write|written|instructions/i.test(text)) return FileText;
  if (/no|not comfortable|password|stop|ending/i.test(text)) return ShieldCheck;
  if (/help/i.test(text)) return HandHelping;
  return MessageCircle;
}
export default function ConversationComposer({
  draft,
  setDraft,
  preferences,
  config,
  paused,
  busy,
  onSend,
  onError,
}) {
  const [mode, setMode] = useState(
    preferences.communication === "cards"
      ? "cards"
      : preferences.communication === "speech"
        ? "speech"
        : "typing",
  );
  const [listening, setListening] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");
  const [editingCard, setEditingCard] = useState(false);
  const recognition = useRef(null);
  const active = useRef(false);
  const mounted = useRef(true);
  const base = useRef("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current = false;
      recognition.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (paused || busy) recognition.current?.abort();
  }, [paused, busy]);
  function changeMode(next) {
    active.current = false;
    recognition.current?.abort();
    setListening(false);
    setMode(next);
  }
  function dictate() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    onError("");
    base.current = draft.trim();
    active.current = true;
    const instance = startDictation(
      (text) => {
        if (mounted.current && active.current)
          setDraft(
            [base.current, text.trim()]
              .filter(Boolean)
              .join(" ")
              .slice(0, 2000),
          );
      },
      (message) => {
        if (mounted.current) onError(message);
      },
      () => {
        active.current = false;
        if (mounted.current) setListening(false);
      },
    );
    recognition.current = instance;
    setListening(Boolean(instance));
    if (!instance) active.current = false;
  }
  const disabled = paused || busy;
  const submit = (
    <button
      className="primary send-button"
      disabled={disabled || listening || !draft.trim()}
    >
      <Send size={19} aria-hidden="true" />
      Send
    </button>
  );
  return (
    <div className={`composer-area mode-${mode}`}>
      <div
        className="communication-modes"
        role="tablist"
        aria-label="How would you like to reply?"
      >
        {[
          ["speech", "Speak", Mic],
          ["typing", "Type", Keyboard],
          ["cards", "Cards", MessageSquare],
        ].map(([value, label, Icon]) => (
          <button
            key={value}
            id={`mode-${value}`}
            role="tab"
            aria-selected={mode === value}
            aria-controls="reply-panel"
            tabIndex={mode === value ? 0 : -1}
            onClick={() => changeMode(value)}
            onKeyDown={(e) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
                return;
              e.preventDefault();
              const order = ["speech", "typing", "cards"];
              const next =
                e.key === "Home"
                  ? "speech"
                  : e.key === "End"
                    ? "cards"
                    : order[
                        (order.indexOf(mode) +
                          (e.key === "ArrowRight" ? 1 : 2)) %
                          3
                      ];
              changeMode(next);
              document.getElementById(`mode-${next}`)?.focus();
            }}
          >
            <Icon size={22} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div id="reply-panel" role="tabpanel" aria-labelledby={`mode-${mode}`}>
        {mode === "cards" ? (
          <>
            <div className="card-mode-heading">
              <h2>Choose your words</h2>
              <p>Pick a card. You can change the words before sending.</p>
            </div>
            <div
              className="communication-cards"
              aria-label="Communication cards"
            >
              {[...new Set([...(config.cards || []), ...generalCards])].map(
                (phrase, index) => {
                  const Icon = cardIcon(phrase);
                  return (
                    <button
                      type="button"
                      className={`communication-card card-color-${index % 4}`}
                      key={phrase}
                      disabled={disabled}
                      aria-pressed={selectedCard === phrase && Boolean(draft)}
                      onClick={() => {
                        setSelectedCard(phrase);
                        setDraft(phrase);
                        setEditingCard(false);
                      }}
                    >
                      <span className="phrase-icon">
                        <Icon size={27} aria-hidden="true" />
                      </span>
                      <span>{phrase}</span>
                      {selectedCard === phrase && Boolean(draft) && (
                        <Check
                          className="selected-check"
                          size={19}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                },
              )}
            </div>
            {draft.trim() && (
              <form className="selected-card-preview" onSubmit={onSend}>
                <span className="selected-card-label">YOUR CARD</span>
                {editingCard ? (
                  <label>
                    Edit selected card
                    <textarea
                      autoFocus
                      maxLength={2000}
                      rows={2}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      disabled={disabled}
                    />
                  </label>
                ) : (
                  <p>{draft}</p>
                )}
                <div className="compose-actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setEditingCard(!editingCard)}
                    disabled={disabled}
                  >
                    <Pencil size={17} aria-hidden="true" />
                    {editingCard ? "Done editing" : "Edit words"}
                  </button>
                  {submit}
                </div>
              </form>
            )}
          </>
        ) : (
          <form onSubmit={onSend}>
            {mode === "speech" && (
              <div className="speech-controls">
                <button
                  type="button"
                  className={`speak-button ${listening ? "is-listening" : ""}`}
                  onClick={dictate}
                  disabled={disabled}
                  aria-pressed={listening}
                >
                  {listening ? (
                    <Square size={28} aria-hidden="true" />
                  ) : (
                    <Mic size={32} aria-hidden="true" />
                  )}
                  {listening ? "Stop recording" : "Start speaking"}
                </button>
                <p role="status">
                  {listening
                    ? "Listening… your words appear below."
                    : "Tap to speak. Take your time."}
                </p>
              </div>
            )}
            <label className="draft-label" htmlFor="message">
              {mode === "speech"
                ? "Your words — edit anything before sending"
                : "Your message"}
            </label>
            <textarea
              id="message"
              rows={mode === "speech" ? 3 : 3}
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={disabled}
              placeholder={
                mode === "speech"
                  ? "Your words will appear here as you speak…"
                  : "Type what you’d like to say…"
              }
            />
            <div className="compose-actions">
              <small>
                {listening
                  ? "Stop recording to review and send."
                  : `${draft.length}/2000 · Send when you’re ready.`}
              </small>
              {submit}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
