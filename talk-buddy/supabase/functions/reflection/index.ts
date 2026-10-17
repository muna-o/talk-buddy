import {
  check,
  context,
  cors,
  gemini,
  json,
  principles,
  sessionFor,
} from "../_shared/core.ts";
import { validateReflection, validUUID } from "../_shared/validation.mjs";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { db, user, body } = await context(req);
    if (!validUUID(body.session_id)) throw new Error("Invalid conversation.");
    const session = await sessionFor(db, user, body.session_id);
    if (session.status === "active")
      throw new Error("End practice before requesting a reflection.");
    if (session.status === "safety")
      return json({
        reflection: {
          practiced: "You paused the practice.",
          communicated:
            "Your immediate needs matter more than finishing a lesson.",
          alternatives: [],
          takeaway:
            "Seek real-world support if you need it. You can use Find support.",
        },
      });
    const existing = check(
      await db
        .from("reflections")
        .select("content")
        .eq("session_id", session.id)
        .maybeSingle(),
    );
    if (existing) return json({ reflection: existing.content });
    const history = check(
      await db
        .from("messages")
        .select("role,content")
        .eq("session_id", session.id)
        .order("ordering"),
    );
    const reflection = history.filter((m) => m.role === "user").length
      ? validateReflection(
          await gemini(
            `${principles}\nYou are now an educational reflection guide, not the roleplay character. Use only evidence from the transcript. Do not falsely congratulate or claim skills were demonstrated without evidence. If the target was not practiced, acknowledge neutrally. Give optional alternatives and one takeaway. Configuration: ${JSON.stringify(session.configuration)}`,
            [{ role: "user", content: JSON.stringify(history) }],
            {
              type: "object",
              properties: {
                practiced: { type: "string" },
                communicated: { type: "string" },
                alternatives: {
                  type: "array",
                  items: { type: "string" },
                  maxItems: 4,
                },
                takeaway: { type: "string" },
              },
              required: [
                "practiced",
                "communicated",
                "alternatives",
                "takeaway",
              ],
              additionalProperties: false,
            },
          ),
        )
      : {
          practiced:
            "You explored the scenario and ended before sending a message.",
          communicated:
            "No response was sent, so there is no communication to reflect on yet.",
          alternatives: session.configuration.cards || [],
          takeaway: "You can try again whenever you are ready.",
        };
    check(
      await db
        .from("reflections")
        .upsert(
          { session_id: session.id, content: reflection },
          { onConflict: "session_id", ignoreDuplicates: true },
        ),
    );
    return json({ reflection });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Reflection unavailable." },
      400,
    );
  }
});
