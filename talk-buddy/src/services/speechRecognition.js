export function startDictation(onText, onError, onEnd) {
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    onError(
      "Speech input is unavailable in this browser. You can type or use a communication card.",
    );
    return null;
  }
  const recognition = new Recognition();
  recognition.lang = navigator.language || "en-US";
  recognition.interimResults = false;
  recognition.onresult = (event) => onText(event.results[0][0].transcript);
  recognition.onerror = () =>
    onError(
      "Speech input could not finish. Check microphone access, or type or use a card.",
    );
  recognition.onend = onEnd;
  try {
    recognition.start();
    return recognition;
  } catch {
    onError("Microphone is unavailable. Typing and cards are ready.");
    return null;
  }
}
