import { configuredVoices } from "../_shared/voices.mjs";
import { check, context, responses, sessionFor } from "../_shared/core.ts";
import { validUUID } from "../_shared/validation.mjs";
Deno.serve(async (req) => {
  const { cors, json } = responses(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { db, user, body } = await context(req);
    if (!validUUID(body.message_id))
      throw new Error("Choose a saved character message.");
    const message = check(
      await db
        .from("messages")
        .select("*")
        .eq("id", body.message_id)
        .eq("role", "assistant")
        .single(),
    );
    if (!message) throw new Error("Message not found.");
    await sessionFor(db, user, message.session_id);
    const allowed = configuredVoices(Deno.env.get("ELEVENLABS_VOICE_IDS")).map(
      (voice) => voice.id,
    );
    const voice = body.voice_id || allowed[0];
    if (!allowed.includes(voice))
      throw new Error(
        "No approved voice is available. Configure ElevenLabs voice IDs.",
      );
    const key = Deno.env.get("ELEVENLABS_API_KEY");
    if (!key) throw new Error("ElevenLabs audio is not configured yet.");
    if (message.content.length > 2000)
      throw new Error("This message is too long for audio.");
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        signal: AbortSignal.timeout(30000),
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message.content,
          model_id: "eleven_multilingual_v2",
        }),
      },
    );
    if (!response.ok)
      throw new Error(
        response.status === 429
          ? "Voice quota reached. You can continue with text."
          : "Audio unavailable. Check ElevenLabs credentials and credits. Text is still available.",
      );
    return new Response(await response.arrayBuffer(), {
      headers: {
        ...cors,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Audio unavailable." },
      400,
    );
  }
});
