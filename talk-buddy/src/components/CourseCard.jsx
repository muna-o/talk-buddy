import { courseTitle } from "../data/courseTitles";
import {
  ArrowRight,
  HelpCircle,
  Leaf,
  ShieldCheck,
  MessagesSquare,
} from "lucide-react";
const icons = {
  help: HelpCircle,
  leaf: Leaf,
  shield: ShieldCheck,
  messages: MessagesSquare,
};
export default function CourseCard({
  lesson,
  onSelect,
  variant = "tile",
  number,
}) {
  const Icon = icons[lesson.icon];
  return (
    <button
      className={`course-card ${lesson.color} ${variant === "row" ? "course-row" : ""}`}
      onClick={() => onSelect(lesson)}
    >
      <span className="course-icon">
        <Icon size={variant === "row" ? 34 : 28} aria-hidden="true" />
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
