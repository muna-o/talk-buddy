import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { playableAudio } from "../src/services/audio.mjs";
test("Supabase transports audio as a Blob without corrupting MP3 bytes", async () => {
  const bytes = new Uint8Array([73, 68, 51, 4, 0, 0, 255, 251, 144, 196]);
  const client = createClient(
    "https://example.supabase.co",
    "public-test-key",
    {
      auth: { persistSession: false },
      global: {
        fetch: async () =>
          new Response(bytes, {
            headers: { "Content-Type": "application/octet-stream" },
          }),
      },
    },
  );
  const { data, error } = await client.functions.invoke("tts", {
    body: { message_id: "test" },
  });
  assert.ifError(error);
  assert.ok(data instanceof Blob);
  const audio = playableAudio(data);
  assert.equal(audio.type, "audio/mpeg");
  assert.deepEqual(new Uint8Array(await audio.arrayBuffer()), bytes);
});
test("an empty or text-decoded audio response is rejected before playback", () => {
  for (const value of [null, "corrupted binary", new Blob([])])
    assert.throws(() => playableAudio(value), /could not be read/);
});
