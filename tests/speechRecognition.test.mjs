import test from "node:test";
import assert from "node:assert/strict";
import {
  startDictation,
  transcriptFromResults,
} from "../src/services/speechRecognition.js";
test("live transcription combines all current final and interim results without repeating earlier words", () => {
  assert.equal(
    transcriptFromResults([
      [{ transcript: "Could you" }],
      [{ transcript: "write that down?" }],
    ]),
    "Could you write that down?",
  );
  assert.equal(
    transcriptFromResults([[{ transcript: "Could you write" }]]),
    "Could you write",
  );
  assert.equal(transcriptFromResults([]), "");
});
test("dictation enables interim results and continuous speech, updating before speech ends", (t) => {
  const previous = globalThis.window;
  t.after(() => {
    globalThis.window = previous;
  });
  class Recognition {
    start() {
      this.started = true;
    }
  }
  globalThis.window = { SpeechRecognition: Recognition };
  const updates = [];
  let ended = false;
  const recognition = startDictation(
    (text) => updates.push(text),
    () => {},
    () => {
      ended = true;
    },
  );
  assert.equal(recognition.interimResults, true);
  assert.equal(recognition.continuous, true);
  assert.equal(recognition.started, true);
  recognition.onresult({ results: [[{ transcript: "I need" }]] });
  assert.equal(ended, false);
  assert.deepEqual(updates, ["I need"]);
  recognition.onresult({
    results: [[{ transcript: "I need a break." }], [{ transcript: "Please." }]],
  });
  assert.equal(updates.at(-1), "I need a break. Please.");
  recognition.onend();
  assert.equal(ended, true);
});
test("unsupported speech offers typing and cards", (t) => {
  const previous = globalThis.window;
  t.after(() => {
    globalThis.window = previous;
  });
  globalThis.window = {};
  let error = "";
  assert.equal(
    startDictation(
      () => {},
      (text) => {
        error = text;
      },
      () => {},
    ),
    null,
  );
  assert.match(error, /type or use a communication card/);
});
