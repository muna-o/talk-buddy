import lessonPlan from "../assets/lesson-plan.png";
import Whimsy from "../components/Whimsy";
import lessons from "../data/lessons.json";
import CourseCard from "../components/CourseCard";
export default function Courses({ onSelect }) {
  return (
    <div className="courses-page">
      <header className="page-heading">
        <Whimsy className="courses-heading-star" />
        <h1>Courses</h1>
        <p>Start wherever feels useful.</p>
      </header>
      <div className="course-list">
        {lessons.map((lesson, index) => (
          <CourseCard
            key={lesson.id}
            lesson={lesson}
            onSelect={onSelect}
            variant="row"
            number={index + 1}
          />
        ))}
      </div>
      <aside className="flow-note">
        <img
          src={lessonPlan}
          className="lesson-format-image"
          alt=""
          aria-hidden="true"
        />
        <div>
          <strong>Lesson format</strong>
          <p>Each lesson follows Learn → Explore → Practice → Reflect.</p>
        </div>
      </aside>
    </div>
  );
}
