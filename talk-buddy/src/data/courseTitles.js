const titles = {
  help: "Asking for help",
  leaf: "Expressing your needs",
  shield: "Setting boundaries",
  messages: "Misunderstandings",
};
export function courseTitle(lesson) {
  return titles[lesson.icon] || lesson.title || lesson.category || "Practice";
}
