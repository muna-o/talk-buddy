export function voiceServiceError(status, providerCode) {
  if (providerCode === "missing_permissions")
    return "The ElevenLabs API key needs text-to-speech permission. Update its permissions in ElevenLabs.";
  if (status === 401 || providerCode === "invalid_api_key")
    return "ElevenLabs rejected the API key. Update ELEVENLABS_API_KEY in Supabase secrets.";
  if (status === 402 || providerCode === "quota_exceeded")
    return "ElevenLabs credits are unavailable. Check your account quota. You can continue with text.";
  if (status === 404 || providerCode === "voice_not_found")
    return "This voice is not available to the connected ElevenLabs account. Add it to your voice library or choose another voice.";
  if (status === 429)
    return "ElevenLabs is busy or its rate limit was reached. Try audio again later; text is still available.";
  if (status === 403)
    return "ElevenLabs denied access. Check the API key permissions and whether this voice is available on your plan.";
  return `ElevenLabs could not generate audio (HTTP ${status}). Text is still available.`;
}
