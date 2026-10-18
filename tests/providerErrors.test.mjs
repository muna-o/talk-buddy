import test from "node:test";
import assert from "node:assert/strict";
import { voiceServiceError } from "../supabase/functions/_shared/providerErrors.mjs";
test("voice errors distinguish key permissions, invalid keys and quota", () => {
  assert.match(
    voiceServiceError(401, "missing_permissions"),
    /text-to-speech permission/,
  );
  assert.match(
    voiceServiceError(401, "invalid_api_key"),
    /rejected the API key/,
  );
  assert.match(
    voiceServiceError(401, "quota_exceeded"),
    /key or workspace is insufficient/,
  );
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
test("a free-plan Voice Library restriction is not mislabeled as depleted credits", () => {
  const message = voiceServiceError(
    402,
    "payment_required",
    "Free users cannot use library voices via the API. Please upgrade your subscription to use this voice.",
  );
  assert.match(message, /Voice Library voice through the API on the Free plan/);
  assert.match(message, /not an exhausted credit balance/);
});
test("unknown 402 and free-tier abuse restrictions do not claim an empty balance", () => {
  assert.match(
    voiceServiceError(402),
    /does not necessarily mean your credits are used up/,
  );
  assert.match(
    voiceServiceError(401, "detected_unusual_activity"),
    /unusual activity/,
  );
  assert.doesNotMatch(
    voiceServiceError(401, "detected_unusual_activity"),
    /rejected authentication/,
  );
});
