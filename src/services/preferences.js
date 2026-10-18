import { fontFamily } from "./appearance.mjs";
export const defaults = {
  theme: "gray",
  font: "system",
  fontSize: 17,
  lineSpacing: 1.65,
  letterSpacing: 0,
  reducedMotion: true,
  autoSpeech: false,
  clutter: false,
  communication: "typing",
  voice: "",
  onboarded: false,
};
export function readPreferences() {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem("talkbuddy-preferences") || "{}"),
    };
  } catch {
    return defaults;
  }
}
export function applyPreferences(p) {
  const el = document.documentElement;
  el.dataset.theme = p.theme;
  el.dataset.reducedMotion = String(p.reducedMotion);
  el.dataset.clutter = String(p.clutter);
  el.style.setProperty("--font-size", `${p.fontSize}px`);
  el.style.setProperty("--line-height", p.lineSpacing);
  el.style.setProperty("--letter-spacing", `${p.letterSpacing}px`);
  el.style.setProperty("--font-family", fontFamily(p.font));
}
