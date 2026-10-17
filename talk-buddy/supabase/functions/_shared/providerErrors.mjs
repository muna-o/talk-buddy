export function voiceServiceError(status, providerCode, providerMessage = "") {
  if (providerCode === "missing_permissions")
    return "The ElevenLabs API key needs text-to-speech permission. Update its permissions in ElevenLabs.";
  if (providerCode === "invalid_api_key")
    return "ElevenLabs rejected the API key. Update ELEVENLABS_API_KEY in Supabase secrets.";
  if (
    providerCode === "detected_unusual_activity" ||
    /unusual activity|free tier usage disabled/i.test(providerMessage)
  )
    return "ElevenLabs has restricted free-tier API requests for unusual activity. Your credit balance may still be available. Contact ElevenLabs support to review the restriction; text practice is still available.";
  if (
    /library voices?/i.test(providerMessage) &&
    /free|paid|upgrade|subscription/i.test(providerMessage)
  )
    return "ElevenLabs does not allow this Voice Library voice through the API on the Free plan. This is a voice-access restriction, not an exhausted credit balance. Choose a voice supported by the Free API plan, or use a plan that includes this voice.";
  if (providerCode === "quota_exceeded")
    return "The ElevenLabs API quota for this key or workspace is insufficient. Check the key’s credit limit as well as your account balance. You can continue with text.";
  if (
    [
      "payment_required",
      "paid_plan_required",
      "feature_not_available",
    ].includes(providerCode) ||
    status === 402
  )
    return "ElevenLabs requires plan access for this voice or feature. This does not necessarily mean your credits are used up. Check whether the voice is available through the API on your current plan.";
  if (status === 401)
    return "ElevenLabs rejected authentication. Check ELEVENLABS_API_KEY in Supabase secrets.";
  if (status === 404 || providerCode === "voice_not_found")
    return "This voice is not available to the connected ElevenLabs account. Add it to your voice library or choose another voice.";
  if (status === 429)
    return "ElevenLabs is busy or its rate limit was reached. Try audio again later; text is still available.";
  if (status === 403)
    return "ElevenLabs denied access. Check the API key permissions and whether this voice is available on your plan.";
  return `ElevenLabs could not generate audio (HTTP ${status}). Text is still available.`;
}
