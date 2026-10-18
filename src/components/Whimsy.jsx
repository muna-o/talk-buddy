import star from "../assets/whimsy-star.png";
import clock from "../assets/whimsy-clock.png";
const drawings = {
  heart: [
    "M50 83 C39 74 11 56 13 35 C14 15 39 12 50 31 C63 10 88 17 87 37 C86 56 62 77 50 83 Z",
    "M48 81 C33 70 10 54 15 33 C20 12 41 18 50 33 C63 14 86 19 85 38 C84 57 63 73 52 84",
  ],
  whirl: [
    "M48 49 C50 41 62 43 61 53 C60 66 39 68 33 55 C24 35 43 22 61 27 C87 34 83 65 61 77 C35 90 11 69 15 44 C20 15 54 7 78 23",
    "M47 50 C50 44 60 44 59 53 C58 64 40 66 35 54 C28 37 44 24 60 29 C82 36 81 63 60 75 C37 87 14 70 17 45",
  ],
};
export default function Whimsy({ kind = "star", className = "" }) {
  if (drawings[kind])
    return (
      <svg
        className={`whimsy whimsy-drawing ${className}`}
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
      >
        {drawings[kind].map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  return (
    <img
      src={kind === "clock" ? clock : star}
      className={`whimsy ${className}`}
      alt=""
      aria-hidden="true"
    />
  );
}
