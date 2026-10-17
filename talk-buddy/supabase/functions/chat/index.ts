import { configuredVoices } from "../_shared/voices.mjs";
import {
  check,
  context,
  responses,
  gemini,
  principles,
  sessionFor,
} from "../_shared/core.ts";
import {
  bounded,
  urgentSignal,
  safetyReply,
  validateReply,
  validUUID,
} from "../_shared/validation.mjs";
const schema = {
  type: "object",
  properties: {
    character_reply: { type: "string" },
    learning_objective_observed: { type: "boolean" },
    conversation_should_continue: { type: "boolean" },
    safety_concern: { type: "boolean" },
    suggested_responses: {
      type: "array",
      items: { type: "string" },
      maxItems: 4,
    },
  },
  required: [
    "character_reply",
    "learning_objective_observed",
    "conversation_should_continue",
    "safety_concern",
    "suggested_responses",
  ],
  additionalProperties: false,
};
Deno.serve(async (req) => {
  const { cors, json } = responses(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { db, user, body } = await context(req);
    const voices = configuredVoices(Deno.env.get("ELEVENLABS_VOICE_IDS"));
    if (body.action === "voices") return json({ voices });
    if (body.action === "start") {
      if (!Deno.env.get("GEMINI_API_KEY"))
        throw new Error(
          "Gemini is not configured yet. Add your API key to Supabase secrets.",
        );
      let configuration;
      if (body.mode === "course") {
        const lesson = check(
          await db
            .from("lessons")
            .select("content")
            .eq("id", bounded(body.lesson_id, "Lesson", 100))
            .single(),
        );
        if (!lesson)
          throw new Error(
            "This lesson is unavailable. Run the curriculum migration.",
          );
        configuration = { ...lesson.content, difficulty: "gentle" };
      } else if (body.mode === "free") {
        const difficulty = body.difficulty || "gentle";
        if (!["gentle", "realistic", "challenging"].includes(difficulty))
          throw new Error("Choose a valid difficulty.");
        configuration = {
          title: "Your own conversation",
          scenario: bounded(body.scenario, "Scenario", 1500),
          character: {
            name: bounded(body.name, "Name", 60),
            role: bounded(body.role, "Role", 80),
            personality: bounded(body.personality, "Personality", 300),
          },
          difficulty,
          objectives: [],
        };
      } else throw new Error("Choose Course Mode or Free Mode.");
      // Generate a real first reply in free mode, before creating a session.
      const urgent = urgentSignal(configuration.scenario);
      const opening = urgent
        ? safetyReply
        : configuration.opening ||
          validateReply(
            await gemini(
              `${principles}\nStart a short roleplay in character using this configuration: ${JSON.stringify(configuration)}`,
              [
                {
                  role: "user",
                  content:
                    "Begin the practice conversation with one short opening.",
                },
              ],
              schema,
            ),
          );
      const text =
        typeof opening === "string" ? opening : opening.character_reply;
      const safety =
        urgent || (typeof opening !== "string" && opening.safety_concern);
      const session = check(
        await db
          .from("sessions")
          .insert({
            user_id: user.id,
            mode: body.mode,
            lesson_id: body.mode === "course" ? body.lesson_id : null,
            configuration,
            status: safety ? "safety" : "active",
            completed_at: safety ? new Date().toISOString() : null,
          })
          .select()
          .single(),
      );
      const result = await db
        .from("messages")
        .insert({
          session_id: session.id,
          role: "assistant",
          content: text,
          ordering: 0,
        })
        .select()
        .single();
      if (result.error) {
        await db.from("sessions").delete().eq("id", session.id);
        throw new Error("Could not save the conversation. Please try again.");
      }
      return json({ session, messages: [result.data], voices });
    }
    if (!validUUID(body.session_id)) throw new Error("Invalid conversation.");
    const session = await sessionFor(db, user, body.session_id);
    if (body.action === "end") {
      const ended = check(
        await db
          .from("sessions")
          .update({
            status: session.status === "safety" ? "safety" : "completed",
            completed_at: session.completed_at || new Date().toISOString(),
          })
          .eq("id", session.id)
          .eq("user_id", user.id)
          .select()
          .single(),
      );
      return json({ session: ended });
    }
    if (body.action !== "send") throw new Error("Unknown action.");
    const message = bounded(body.message, "Message", 2000);
    const claimed = check(
      await db.rpc("claim_turn", { session: session.id, caller: user.id }),
    );
    if (!claimed)
      throw new Error(
        "This conversation is finished or another message is still processing. Please wait or start again.",
      );
    try {
      const history = check(
        await db
          .from("messages")
          .select("role,content")
          .eq("session_id", session.id)
          .order("ordering"),
      );
      let reply;
      if (urgentSignal(message))
        reply = {
          character_reply: safetyReply,
          learning_objective_observed: false,
          conversation_should_continue: false,
          safety_concern: true,
          suggested_responses: [],
        };
      else
        reply = validateReply(
          await gemini(
            `${principles}\nConfiguration: ${JSON.stringify(session.configuration)}\nReturn structured JSON. Suggested responses are optional learner phrases. Observed skill is educational metadata, never a score.`,
            [...history, { role: "user", content: message }],
            schema,
          ),
        );
      // A model may request a safety pause, but never decide whether a user is allowed to leave.
      if (reply.safety_concern) reply.character_reply = safetyReply;
      check(
        await db.rpc("commit_turn", {
          session: session.id,
          caller: user.id,
          user_text: message,
          assistant_text: reply.character_reply,
          safety: reply.safety_concern,
        }),
      );
      const messages = check(
        await db
          .from("messages")
          .select("*")
          .eq("session_id", session.id)
          .order("ordering"),
      );
      return json({
        ...reply,
        messages,
        session: await sessionFor(db, user, session.id),
      });
    } finally {
      await db
        .from("sessions")
        .update({ busy_until: null })
        .eq("id", session.id)
        .eq("user_id", user.id);
    }
  } catch (e) {
    return json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Something went wrong. Please try again.",
      },
      400,
    );
  }
});
