import test from "node:test";
import assert from "node:assert/strict";
import {
  bounded,
  urgentSignal,
  validateReply,
  validateReflection,
  validUUID,
} from "../supabase/functions/_shared/validation.mjs";
const valid = {
  character_reply: "Written instructions are fine.",
  learning_objective_observed: true,
  conversation_should_continue: true,
  safety_concern: false,
  suggested_responses: ["Could you email them?"],
};
test("messages reject blank, non-text and oversized input", () => {
  for (const value of ["", "  ", null, 42, "a".repeat(2001)])
    assert.throws(() => bounded(value, "Message"));
  assert.equal(bounded("  I need help.  ", "Message"), "I need help.");
  assert.equal(bounded("a".repeat(2000), "Message").length, 2000);
});
test("malformed structured replies cannot become chat messages", () => {
  assert.equal(validateReply(valid).character_reply, valid.character_reply);
  for (const patch of [
    { character_reply: "" },
    { safety_concern: "false" },
    { learning_objective_observed: null },
    { suggested_responses: ["a".repeat(241)] },
    { suggested_responses: [1] },
    { suggested_responses: Array(5).fill("Hi") },
  ])
    assert.throws(() => validateReply({ ...valid, ...patch }));
});
test("ordinary boundary practice is not automatically treated as urgent danger", () => {
  for (const text of [
    "I don’t share my password.",
    "My classmate keeps asking. I want to say no.",
    "Can we practice setting a boundary?",
    "I need a break.",
  ])
    assert.equal(urgentSignal(text), false);
  assert.equal(urgentSignal("I am in immediate danger"), true);
  assert.equal(urgentSignal("I am going to kill myself"), true);
});
test("reflection requires grounded fields and bounded alternatives", () => {
  assert.throws(() => validateReflection({ practiced: "Asked for help" }));
  assert.throws(() =>
    validateReflection({
      practiced: "Help",
      communicated: "Needs",
      takeaway: "Valid",
      alternatives: [null],
    }),
  );
  assert.deepEqual(
    validateReflection({
      practiced: "You asked for writing.",
      communicated: "You need written steps.",
      takeaway: "You can ask for support.",
      alternatives: [],
    }).alternatives,
    [],
  );
});
test("resource IDs reject invalid identifiers", () => {
  assert.equal(validUUID("2a15815a-6baf-47be-953b-cadcc9ed7a3d"), true);
  for (const value of [null, "other-user", "id.eq.anything", 12])
    assert.equal(validUUID(value), false);
});
