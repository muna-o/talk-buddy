import test from "node:test";
import assert from "node:assert/strict";
import { functionErrorMessage } from "../src/services/functionErrors.mjs";
import { corsHeaders } from "../supabase/functions/_shared/cors.mjs";
test("a missing Edge Function explains that backend deployment is required", async () => {
  const message = await functionErrorMessage(
    "chat",
    { context: { status: 404 } },
    "http://127.0.0.1:5173",
  );
  assert.match(message, /chat server function needs to be deployed/);
});
test("a blocked preflight or network failure includes the frontend origin", async () => {
  const message = await functionErrorMessage(
    "chat",
    { name: "FunctionsFetchError" },
    "http://127.0.0.1:5173",
  );
  assert.match(message, /http:\/\/127\.0\.0\.1:5173/);
});
test("server validation messages remain visible", async () => {
  assert.equal(
    await functionErrorMessage(
      "chat",
      {
        context: {
          status: 400,
          json: async () => ({ error: "Gemini is not configured." }),
        },
      },
      "test",
    ),
    "Gemini is not configured.",
  );
});
test("both local development addresses pass preflight by default", () => {
  for (const origin of ["http://localhost:5173", "http://127.0.0.1:5173"])
    assert.equal(corsHeaders(origin)["Access-Control-Allow-Origin"], origin);
});
test("configured production origins are exact and exclude local or unrelated origins", () => {
  const config = "https://talkbuddy.example,https://preview.example";
  assert.equal(
    corsHeaders("https://talkbuddy.example", config)[
      "Access-Control-Allow-Origin"
    ],
    "https://talkbuddy.example",
  );
  for (const origin of [
    "http://localhost:5173",
    "https://talkbuddy.example.attacker.test",
    null,
  ])
    assert.equal(
      corsHeaders(origin, config)["Access-Control-Allow-Origin"],
      undefined,
    );
});
