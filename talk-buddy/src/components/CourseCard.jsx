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
        <svg
          className="sketch-frame"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M23 5 C9 4 5 12 5 27 L4 72 C3 88 12 94 27 95 L74 94 C90 96 96 86 95 72 L96 27 C95 11 87 4 73 5 Z" />
          <path d="M24 3 C10 5 3 13 4 28 L6 73 C4 90 15 96 29 93 L75 96 C89 94 98 85 94 70 L94 25 C96 12 84 3 72 6 L25 4" />
        </svg>
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
