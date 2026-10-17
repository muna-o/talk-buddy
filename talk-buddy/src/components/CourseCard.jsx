import { courseTitle } from "../data/courseTitles";
import { ArrowRight } from "lucide-react";
import CourseIllustration from "./CourseIllustration";
export default function CourseCard({
  lesson,
  onSelect,
  variant = "tile",
  number,
}) {
  return (
    <button
      className={`course-card ${lesson.color} ${variant === "row" ? "course-row" : ""}`}
      onClick={() => onSelect(lesson)}
    >
      <span className="course-icon">
        <CourseIllustration lesson={lesson} />
      </span>
      <span className="course-copy">
        {number && <span className="course-count">COURSE {number}</span>}
        <h3>{courseTitle(lesson)}</h3>
        <p>{lesson.description}</p>
        <span className="course-lesson-label">1 guided lesson</span>
      </span>
      <span className="course-open" aria-hidden="true">
        <ArrowRight size={23} />
      </span>
    </button>
  );
}
