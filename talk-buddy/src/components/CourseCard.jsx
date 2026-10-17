import {
  ArrowUpRight,
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
export default function CourseCard({ lesson, onSelect }) {
  const Icon = icons[lesson.icon];
  return (
    <button
      className={`course-card ${lesson.color}`}
      onClick={() => onSelect(lesson)}
    >
      <span className="course-icon">
        <Icon size={25} />
      </span>
      <small>{lesson.category}</small>
      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>
      <span className="card-footer">
        One guided lesson <ArrowUpRight size={20} />
      </span>
    </button>
  );
}
