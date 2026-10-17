export function playableAudio(data) {
  if (!(data instanceof Blob) || data.size === 0)
    throw new Error("Audio could not be read. Please try listening again.");
  return new Blob([data], { type: "audio/mpeg" });
}

export function nextAutomaticReply(
  messages,
  preferences,
  paused,
  status,
  spokenIds,
) {
  if (!preferences.autoSpeech || paused || status === "safety") return null;
  const latest = messages.findLast((message) => message.role === "assistant");
  return latest && !spokenIds.has(latest.id) ? latest : null;
}
