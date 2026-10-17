import star from "../assets/whimsy-star.png";
import clock from "../assets/whimsy-clock.png";
export default function Whimsy({ kind = "star", className = "" }) {
  return (
    <img
      src={kind === "clock" ? clock : star}
      className={`whimsy ${className}`}
      alt=""
      aria-hidden="true"
    />
  );
}
