import test from "node:test";
import assert from "node:assert/strict";
import {
  configuredVoices,
  voiceCatalog,
} from "../supabase/functions/_shared/voices.mjs";
test("the four selected voices have stable IDs, names, and descriptions", () => {
  assert.deepEqual(
    voiceCatalog.map((v) => v.name),
    ["Max", "Mark", "Ava", "Cecilia O’Connor"],
  );
  assert.equal(new Set(voiceCatalog.map((v) => v.id)).size, 4);
  assert.ok(voiceCatalog.every((v) => v.description.length > 0));
});
test("missing server configuration leaves audio disabled", () => {
  for (const raw of [undefined, "", " , "])
    assert.deepEqual(configuredVoices(raw), []);
});
test("server allowlist excludes unknown voices and deduplicates entries", () => {
  assert.deepEqual(
    configuredVoices(`unknown, ${voiceCatalog[1].id},${voiceCatalog[1].id}`),
    [voiceCatalog[1]],
  );
});
test("all approved voices keep predictable default and display order", () => {
  assert.deepEqual(
    configuredVoices(
      voiceCatalog
        .toReversed()
        .map((v) => v.id)
        .join(","),
    ),
    voiceCatalog,
  );
});
