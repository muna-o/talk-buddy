import Courses from "./pages/Courses";
import Whimsy from "./components/Whimsy";
import logo from "./assets/logo.png";
import { voiceCatalog } from "../supabase/functions/_shared/voices.mjs";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  HeartHandshake,
  Home,
  Leaf,
  Settings,
  TrendingUp,
} from "lucide-react";
import { applyPreferences, readPreferences } from "./services/preferences";
import { configured, getUser, invoke, supabase } from "./services/supabase";
import SettingsPanel from "./components/SettingsPanel";
import Conversation from "./components/Conversation";
import Lesson from "./pages/Lesson";
import FreeMode from "./pages/FreeMode";
import Reflection from "./pages/Reflection";
import Progress from "./pages/Progress";
import Support from "./pages/Support";
import HomePage from "./pages/Home";
const navigation = [
  ["home", Home, "Home"],
  ["courses", BookOpen, "Course Mode"],
  ["free", Compass, "Free Mode"],
  ["progress", TrendingUp, "My practice"],
];
export default function App() {
  const [preferences, setPreferences] = useState(readPreferences);
  const [page, setPage] = useState("home");
  const [lesson, setLesson] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [ended, setEnded] = useState(null);
  const [voices, setVoices] = useState(voiceCatalog);
  const [notice, setNotice] = useState("");
  const [syncReady, setSyncReady] = useState(!configured);
  const heading = useRef(null);
  const localEdited = useRef(false);
  function update(values) {
    localEdited.current = true;
    setPreferences((p) => ({ ...p, ...values }));
  }
  function navigate(to) {
    setPage(to);
    setNotice("");
  }
  useEffect(() => {
    let active = true;
    if (!configured) return;
    getUser()
      .then(async (user) => {
        const { data, error } = await supabase
          .from("preferences")
          .select("settings")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (active && data?.settings && !localEdited.current)
          setPreferences((p) => ({ ...p, ...data.settings }));
        if (active) setSyncReady(true);
        invoke("chat", { action: "voices" })
          .then((data) => {
            if (active) setVoices(data.voices);
          })
          .catch(() => {
            if (active)
              setNotice(
                "Supabase is reachable. Deploy the database migrations and Edge Functions to enable practice and voices.",
              );
          });
      })
      .catch((e) => {
        if (active) {
          setNotice(e.message);
          setSyncReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    applyPreferences(preferences);
    try {
      localStorage.setItem(
        "talkbuddy-preferences",
        JSON.stringify(preferences),
      );
    } catch {
      /* Some private browser modes disable local storage. */
    }
    if (!configured || !syncReady) return;
    const timer = setTimeout(() => {
      getUser()
        .then((user) =>
          supabase.from("preferences").upsert({
            user_id: user.id,
            settings: preferences,
            updated_at: new Date().toISOString(),
          }),
        )
        .then(({ error }) => {
          if (error)
            setNotice(
              "Preferences are saved in this browser, but cloud sync failed.",
            );
        })
        .catch(() =>
          setNotice(
            "Preferences are saved locally. Cloud sync is unavailable.",
          ),
        );
    }, 600);
    return () => clearTimeout(timer);
  }, [preferences, syncReady]);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);
  async function start(configuration) {
    const data = await invoke("chat", { action: "start", ...configuration });
    setConversation(data);
    setVoices(data.voices);
    navigate("conversation");
  }
  function selectLesson(l) {
    setLesson(l);
    navigate("lesson");
  }
  async function resume(session) {
    if (session.status !== "active") {
      setEnded(session);
      navigate("reflection");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", session.id)
        .order("ordering");
      if (error) throw error;
      setConversation({ session, messages: data });
      navigate("conversation");
    } catch {
      setNotice("Could not load the conversation. Please try again.");
    }
  }
  async function restart(session) {
    try {
      if (session.status === "active")
        await invoke("chat", { action: "end", session_id: session.id });
      const c = session.configuration;
      await start(
        session.mode === "course"
          ? { mode: "course", lesson_id: session.lesson_id }
          : {
              mode: "free",
              scenario: c.scenario,
              ...c.character,
              difficulty: c.difficulty,
            },
      );
    } catch (e) {
      setNotice(e.message);
    }
  }
  const content = () => {
    if (page === "courses") return <Courses onSelect={selectLesson} />;
    if (page === "lesson" && lesson)
      return (
        <Lesson
          key={lesson.id}
          lesson={lesson}
          voice={preferences.voice}
          start={start}
          back={() => navigate("courses")}
        />
      );
    if (page === "free")
      return <FreeMode start={start} voice={preferences.voice} />;
    if (page === "conversation" && conversation)
      return (
        <Conversation
          key={conversation.session.id}
          initial={conversation}
          preferences={preferences}
          onFinish={(s) => {
            setEnded(s);
            setConversation(null);
            navigate("reflection");
          }}
          onRestart={restart}
          onUpdate={(data) => setConversation(data)}
          support={() => navigate("support")}
        />
      );
    if (page === "reflection" && ended)
      return (
        <Reflection
          key={ended.id}
          session={ended}
          again={() => void restart(ended)}
          courses={() => navigate("courses")}
        />
      );
    if (page === "settings")
      return (
        <>
          <h1>Preferences</h1>
          <p className="lead">
            Choose what feels comfortable. Your preferences save automatically.
          </p>
          <SettingsPanel
            preferences={preferences}
            update={update}
            voices={voices}
          />
          <section className="panel">
            <h2>Your privacy</h2>
            <p>
              Practice messages are stored in Supabase and sent to Google
              Gemini. Playing a scenario or reply sends that text to ElevenLabs.
              Browser speech recognition may use your browser provider’s speech
              service. TalkBuddy does not store raw voice recordings.
            </p>
            <p>
              This hackathon prototype is for fictional practice. Google’s free
              API tier may use content to improve its products. Avoid sensitive
              personal information. Anonymous history can be lost if you clear
              this browser’s storage.
            </p>
            <button onClick={() => navigate("progress")}>
              Manage conversation history
            </button>
          </section>
        </>
      );
    if (page === "progress")
      return <Progress open={resume} courseList={() => navigate("courses")} />;
    if (page === "support") return <Support />;
    return <HomePage navigate={navigate} selectLesson={selectLesson} />;
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        className="site-header"
        inert={!preferences.onboarded ? true : undefined}
      >
        <div className="nav-wrap">
          <button
            className="brand"
            onClick={() => navigate("home")}
            aria-label="TalkBuddy home"
          >
            <span className="brand-mark brand-artwork">
              <img src={logo} alt="" />
            </span>
            talk<span>buddy</span>
          </button>
          <nav aria-label="Main navigation">
            {navigation.map(([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                aria-current={page === id ? "page" : undefined}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
          <div className="nav-tools">
            <button
              className="icon-button"
              onClick={() => navigate("settings")}
              aria-label="Settings"
            >
              <Settings size={21} />
            </button>
            <button
              className="support-link"
              onClick={() => navigate("support")}
            >
              Find support <HeartHandshake size={17} />
            </button>
          </div>
        </div>
      </header>
      <div className="page-doodles" aria-hidden="true">
        <Whimsy className="edge-doodle edge-one" />
        <Whimsy kind="clock" className="edge-doodle edge-two" />
        <Whimsy className="edge-doodle edge-three" />
        <Whimsy className="edge-doodle edge-four" />
        <Whimsy kind="clock" className="edge-doodle edge-five" />
        <Whimsy className="edge-doodle edge-six" />
      </div>
      <main
        id="main"
        tabIndex={-1}
        ref={heading}
        inert={!preferences.onboarded ? true : undefined}
      >
        {!configured && (
          <div className="connection-banner">
            <span className="status-dot" />
            <span>
              Preview · Lessons and preferences are ready. Connect Supabase and
              Gemini to enable AI practice.
            </span>
          </div>
        )}
        {notice && (
          <div className="error" role="alert">
            {notice}
          </div>
        )}
        {conversation && page !== "conversation" && (
          <button
            className="resume-banner"
            onClick={() => navigate("conversation")}
          >
            Return to your open practice →
          </button>
        )}
        {content()}
      </main>
      <footer
        className="site-footer"
        inert={!preferences.onboarded ? true : undefined}
      >
        <p>An educational prototype. Not therapy or crisis care.</p>
        <button className="text-button" onClick={() => navigate("support")}>
          Support & resources ↗
        </button>
      </footer>
      {!preferences.onboarded && (
        <div className="onboarding">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            className="welcome-panel"
            onKeyDown={(e) => {
              if (e.key === "Escape") update({ onboarded: true });
              if (e.key === "Tab") {
                const items = [
                  ...e.currentTarget.querySelectorAll(
                    "button,input,select,textarea,a[href]",
                  ),
                ].filter((el) => !el.disabled);
                const first = items[0];
                const last = items.at(-1);
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <div className="eyebrow">
              <Leaf size={18} /> WELCOME TO TALKBUDDY
            </div>
            <h1 id="welcome-title">Let’s make this comfortable for you.</h1>
            <p>
              You can type, use cards, or speak. Everything is optional, and
              there’s no rush.
            </p>
            <SettingsPanel preferences={preferences} update={update} />
            <div className="button-row">
              <button
                autoFocus
                className="primary"
                onClick={() => update({ onboarded: true })}
              >
                Make yourself at home <ArrowRight size={18} />
              </button>
              <button onClick={() => update({ onboarded: true })}>
                Skip for now
              </button>
            </div>
            <small>
              Practice uses external AI services. Please use fictional
              situations and avoid sensitive details.
            </small>
          </section>
        </div>
      )}
    </>
  );
}
