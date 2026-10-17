import test from "node:test";
import assert from "node:assert/strict";
import {
  communicationPreference,
  fontFamily,
  themeOptions,
} from "../src/services/appearance.mjs";
import { nextAutomaticReply } from "../src/services/audio.mjs";
test("choosing speaking enables live speech and automatic audio while other methods preserve separate audio preferences", () => {
  assert.deepEqual(communicationPreference("speech"), {
    communication: "speech",
    audioEnabled: true,
    autoSpeech: true,
  });
  assert.deepEqual(communicationPreference("cards"), {
    communication: "cards",
  });
  assert.deepEqual(communicationPreference("typing"), {
    communication: "typing",
  });
});
test("automatic reading includes the opening and new replies in every communication method, without repeating a handled reply", () => {
  const opening = { id: "opening", role: "assistant", content: "Hello" };
  for (const communication of ["typing", "cards", "speech"])
    assert.equal(
      nextAutomaticReply(
        [opening],
        { audioEnabled: true, autoSpeech: true, communication },
        false,
        "active",
        new Set(),
      ),
      opening,
    );
  assert.equal(
    nextAutomaticReply(
      [opening],
      { audioEnabled: true, autoSpeech: true },
      false,
      "active",
      new Set(["opening"]),
    ),
    null,
  );
  const reply = { id: "reply", role: "assistant", content: "Yes" };
  assert.equal(
    nextAutomaticReply(
      [opening, { id: "user", role: "user" }, reply],
      { audioEnabled: true, autoSpeech: true },
      false,
      "active",
      new Set(["opening"]),
    ),
    reply,
  );
});
test("automatic reading remains silent when disabled, paused, or in a safety pause", () => {
  const messages = [{ id: "a", role: "assistant" }];
  for (const [audioEnabled, autoSpeech, paused, status] of [
    [false, true, false, "active"],
    [true, false, false, "active"],
    [true, true, true, "active"],
    [true, true, false, "safety"],
  ])
    assert.equal(
      nextAutomaticReply(
        messages,
        { audioEnabled, autoSpeech },
        paused,
        status,
        new Set(),
      ),
      null,
    );
});
test("the optional font is named explicitly and all available themes have unique values", () => {
  assert.match(fontFamily("opendyslexic"), /OpenDyslexic/);
  assert.match(fontFamily("unknown"), /Trebuchet/);
  assert.equal(
    new Set(themeOptions.map(([id]) => id)).size,
    themeOptions.length,
  );
  assert.ok(themeOptions.length >= 9);
});
