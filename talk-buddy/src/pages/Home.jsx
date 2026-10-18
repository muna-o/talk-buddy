import ArtworkIcon from "../components/ArtworkIcon";
import Whimsy from "../components/Whimsy";
import buddyHomeImage from "../assets/buddy-home-image.png";
import {
  ArrowRight,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  VolumeX,
} from "lucide-react";
import CourseCard from "../components/CourseCard";
import lessons from "../data/lessons.json";
export default function HomePage({ navigate, selectLesson }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Practice conversations</h1>
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
        <div className="buddy-illustration" aria-hidden="true">
          <div className="buddy-backdrop" />

          <img src={buddyHomeImage} alt="" className="buddy-home-image" />
          <Whimsy className="hero-star-one" />
          <Whimsy className="hero-star-two" />
        </div>
      </section>
      <section className="mode-section">
        <div className="section-heading">
          <div>
            <h2>Where would you like to begin?</h2>
            <p>Choose your own pace. You can always change direction.</p>
          </div>
        </div>
        <div className="mode-grid">
          <button
            className="mode-card course-mode"
            onClick={() => navigate("courses")}
          >
            <span className="mode-icon">
              <ArtworkIcon name="courses" />
            </span>
            <div>
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
            className="mode-card open-mode"
            onClick={() => navigate("free")}
          >
            <span className="mode-icon">
              <ArtworkIcon name="open" />
            </span>
            <div>
              <h2>Open Mode</h2>
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
        <Whimsy kind="clock" className="pace-doodle" />
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
          <h2>Explore the courses</h2>
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
