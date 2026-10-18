import home from "../assets/home.png";
import courses from "../assets/lesson-plan.png";
import open from "../assets/open-mode.png";
import practice from "../assets/my-practice.png";
import settings from "../assets/settings.png";
import support from "../assets/find-support.png";

const artwork = { home, courses, open, practice, settings, support };
export default function ArtworkIcon({ name }) {
  return (
    <img
      src={artwork[name]}
      className="artwork-icon"
      alt=""
      aria-hidden="true"
    />
  );
}
