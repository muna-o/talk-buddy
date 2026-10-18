import help from "../assets/asking-for-help.png";
import needs from "../assets/expressing-needs.png";
import boundaries from "../assets/setting-boundaries.png";
import misunderstandings from "../assets/misunderstandings.png";

const artwork = {
  help,
  leaf: needs,
  shield: boundaries,
  messages: misunderstandings,
};

export default function CourseIllustration({ lesson, className = "" }) {
  const src = artwork[lesson?.icon];
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`course-illustration ${className}`}
    />
  );
}
