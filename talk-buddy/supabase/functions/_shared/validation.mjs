export function bounded(value, name, max = 2000) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new Error(`${name} must contain 1–${max} characters.`);
  return value.trim();
}
export function validUUID(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}
export function validateReply(value) {
  if (
    !value ||
    typeof value.learning_objective_observed !== "boolean" ||
    typeof value.conversation_should_continue !== "boolean" ||
    typeof value.safety_concern !== "boolean"
  )
    throw new Error("The AI returned an invalid response. Please try again.");
  bounded(value.character_reply, "AI reply", 2000);
  if (
    !Array.isArray(value.suggested_responses) ||
    value.suggested_responses.length > 4 ||
    value.suggested_responses.some(
      (s) => typeof s !== "string" || !s.trim() || s.length > 240,
    )
  )
    throw new Error("The AI returned invalid suggestions. Please try again.");
  return value;
}
export function validateReflection(value) {
  for (const key of ["practiced", "communicated", "takeaway"])
    bounded(value?.[key], key, 1200);
  if (!Array.isArray(value.alternatives) || value.alternatives.length > 4)
    throw new Error("Invalid reflection.");
  value.alternatives.forEach((s) => bounded(s, "Alternative", 300));
  return value;
}
// This is one conservative signal, not a comprehensive crisis classifier. The model also checks context.
export function urgentSignal(text) {
  return /\b(i (?:am going to|will|plan to|want to) (?:kill myself|end my life)|i (?:am|feel) in immediate danger|someone is (?:hurting|attacking) me right now|i (?:just |have )?(?:overdosed|taken an overdose))\b/i.test(
    text,
  );
}
export const safetyReply =
  "Let’s step out of the roleplay. TalkBuddy is not emergency or crisis care. If this describes what is happening now, seek immediate help from local emergency services or someone nearby you trust. You can open Find support for resources. You do not have to keep practicing.";
