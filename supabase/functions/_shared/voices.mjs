// Public voice metadata shared by React and Edge Functions. Never put API keys here.
export const voiceCatalog = [
  {
    id: "Gfpl8Yo74Is0W6cPUWWT",
    name: "Max",
    description: "Friendly, articulate eLearning voice",
  },
  {
    id: "v3p1kjzUvro6S76qmYmH",
    name: "Mark",
    description: "Solid, clear, and dependable",
  },
  {
    id: "gJx1vCzNCD1EQHT212Ls",
    name: "Ava",
    description: "Eager, helpful, and understanding",
  },
  {
    id: "DIS307HFaAvJZzq496qM",
    name: "Cecilia O’Connor",
    description: "Warm and conversational",
  },
];

// Only app-approved IDs explicitly enabled in server secrets may generate audio.
export function configuredVoices(raw) {
  const enabled = new Set(
    (raw || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
  return voiceCatalog.filter((voice) => enabled.has(voice.id));
}
