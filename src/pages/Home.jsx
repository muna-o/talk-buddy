import SketchCardFrame from "../components/SketchCardFrame";
import ArtworkIcon from "../components/ArtworkIcon";
import Whimsy from "../components/Whimsy";
import buddyLogo from "../assets/logo.png";
import buddyHomeImage from "../assets/buddy-home-image.png";
import { ArrowRight } from "lucide-react";
import CourseCard from "../components/CourseCard";
import lessons from "../data/lessons.json";
export default function HomePage({ navigate, selectLesson }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Find your words</h1>
          <p>
            A comfortable space to explore conversations,
            <br className="desktop-break" /> practice self-advocacy, and find
            what works for you.
          </p>
        </div>
        <div className="buddy-illustration" aria-hidden="true">
          <div className="buddy-backdrop" />

          <img src={buddyHomeImage} alt="" className="buddy-home-image" />
          <img src={buddyLogo} className="whimsy hero-buddy-mark" alt="" />
          <Whimsy className="hero-star-one" />
          <Whimsy kind="heart" className="hero-star-two" />
        </div>
      </section>
      <section className="mode-section">
        <div className="section-heading">
          <div>
            <h2>Where would you like to begin?</h2>
          </div>
        </div>
        <div className="mode-grid">
          <button
            className="mode-card course-mode"
            onClick={() => navigate("courses")}
          >
            <SketchCardFrame />
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
            <SketchCardFrame />
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
