import {
  ArrowRight,
  BookOpen,
  Check,
  HeartHandshake,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  VolumeX,
} from "lucide-react";
import CourseCard from "../components/CourseCard";
import lessons from "../data/lessons.json";
export default function HomePage({ navigate, selectLesson }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-leaf">
              <Leaf size={16} />
            </span>{" "}
            A LITTLE PRACTICE. A LITTLE MORE CONFIDENCE.
          </div>
          <h1>
            Your voice.
            <br />
            Your needs.
            <br />
            <em>Your way.</em>
          </h1>
          <p>
            A comfortable space to explore conversations,
            <br className="desktop-break" /> practice self-advocacy, and find
            what works for you.
          </p>
          <div className="hero-detail">
            <ShieldCheck size={17} /> No judgment. No perfect answers. Just
            practice.
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-circle"></div>
          <div className="art-note note-one">
            <span className="note-avatar">you</span>I need a little more time.
            <span className="note-check">
              <Check size={16} />
            </span>
          </div>
          <div className="art-note note-two">
            <span className="note-avatar partner">
              <Leaf size={21} />
            </span>
            Of course. Take your time.
          </div>
          <div className="plant">
            <span></span>
            <span></span>
            <span></span>
            <i></i>
          </div>
          <span className="art-caption">A space to be yourself.</span>
          <Sparkles className="art-spark" size={30} />
        </div>
      </section>
      <section className="mode-section">
        <div className="section-heading">
          <div>
            <h2>Where would you like to begin?</h2>
            <p>Choose your own pace. You can always change direction.</p>
          </div>
          <span className="handwritten">One conversation at a time.</span>
        </div>
        <div className="mode-grid">
          <button
            className="mode-card course-mode"
            onClick={() => navigate("courses")}
          >
            <span className="mode-icon">
              <BookOpen size={28} />
            </span>
            <div>
              <span className="eyebrow">A LITTLE GUIDANCE</span>
              <h2>Course Mode</h2>
              <p>
                Explore guided lessons and practice useful conversation skills
                at your own pace.
              </p>
              <span className="mode-link">
                Explore the lessons <ArrowRight size={20} />
              </span>
            </div>
            <span className="mode-number">01</span>
          </button>
          <button
            className="mode-card free-mode"
            onClick={() => navigate("free")}
          >
            <span className="mode-icon">
              <MessageCircle size={28} />
            </span>
            <div>
              <span className="eyebrow">MAKE IT YOUR OWN</span>
              <h2>Free Mode</h2>
              <p>
                Have a conversation you’d like to practice? Create your own
                scenario and talk it through.
              </p>
              <span className="mode-link">
                Create a conversation <ArrowRight size={20} />
              </span>
            </div>
            <span className="mode-number">02</span>
          </button>
        </div>
      </section>
      <section className="values-strip">
        <div>
          <MessageCircle size={23} />
          <span>
            <strong>Communicate your way</strong>
            <small>Type, use cards, or speak.</small>
          </span>
        </div>
        <div>
          <VolumeX size={23} />
          <span>
            <strong>Comfort comes first</strong>
            <small>No sound unless you choose it.</small>
          </span>
        </div>
        <div>
          <HeartHandshake size={23} />
          <span>
            <strong>You’re in control</strong>
            <small>Pause or leave at any time.</small>
          </span>
        </div>
      </section>
      <section className="featured">
        <div className="section-heading">
          <h2>Useful skills for everyday moments</h2>
          <button className="text-button" onClick={() => navigate("courses")}>
            View all lessons <ArrowRight size={17} />
          </button>
        </div>
        <div className="course-grid">
          {lessons.map((l) => (
            <CourseCard key={l.id} lesson={l} onSelect={selectLesson} />
          ))}
        </div>
      </section>
    </>
  );
}
