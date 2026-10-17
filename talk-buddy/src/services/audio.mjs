export function playableAudio(data) {
  if (!(data instanceof Blob) || data.size === 0)
    throw new Error("Audio could not be read. Please try listening again.");
  return new Blob([data], { type: "audio/mpeg" });
}
