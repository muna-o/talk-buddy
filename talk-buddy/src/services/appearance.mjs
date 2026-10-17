export const themeOptions = [
  ["gray", "Soft Gray (default)"],
  ["sage", "Soft Sage"],
  ["peach", "Warm Peach"],
  ["blue", "Calm Blue"],
  ["lavender", "Lavender"],
  ["rose", "Rose"],
  ["sunflower", "Sunflower"],
  ["ocean", "Ocean"],
  ["dark", "Dark"],
  ["contrast", "High Contrast"],
];
export function fontFamily(font) {
  return font === "opendyslexic"
    ? '"OpenDyslexic", Verdana, sans-serif'
    : font === "readable"
      ? "Verdana, sans-serif"
      : '"Trebuchet MS", system-ui, sans-serif';
}
export function communicationPreference(method) {
  return { communication: method };
}
