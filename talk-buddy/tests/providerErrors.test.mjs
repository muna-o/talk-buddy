import test from "node:test";
import assert from "node:assert/strict";
import { voiceServiceError } from "../supabase/functions/_shared/providerErrors.mjs";
test("voice errors distinguish key permissions, invalid keys and credits", () => {
  assert.match(
    voiceServiceError(401, "missing_permissions"),
    /text-to-speech permission/,
  );
  assert.match(
    voiceServiceError(401, "invalid_api_key"),
    /rejected the API key/,
  );
  assert.match(voiceServiceError(400, "quota_exceeded"), /credits/);
});
test("voice access and rate limits provide actionable text fallback", () => {
  assert.match(voiceServiceError(404, "voice_not_found"), /voice library/);
  assert.match(voiceServiceError(429), /rate limit/);
  assert.match(voiceServiceError(500, "untrusted-provider-value"), /HTTP 500/);
  assert.doesNotMatch(
    voiceServiceError(500, "untrusted-provider-value"),
    /untrusted-provider-value/,
  );
});
