import { voiceServiceError } from "../_shared/providerErrors.mjs";
import { configuredVoices } from "../_shared/voices.mjs";
import { check, context, responses, sessionFor } from "../_shared/core.ts";
import { bounded, validUUID } from "../_shared/validation.mjs";
Deno.serve(async (req) => {
  const { cors, json } = responses(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { db, user, body } = await context(req);
    let text: string;
    if (body.message_id !== undefined) {
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
      text = bounded(message.content, "Message", 2000);
    } else {
      // Scenario previews use the same authenticated, rate-limited voice service.
      text = bounded(body.text, "Scenario", 1500);
    }
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
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        signal: AbortSignal.timeout(30000),
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      },
    );
    if (!response.ok) {
      let code, providerMessage;
      try {
        const detail = (await response.json()).detail;
        code = detail?.status;
        providerMessage =
          typeof detail?.message === "string" ? detail.message : "";
      } catch {
        /* Provider may return a non-JSON error. */
      }
      return json(
        {
          error: voiceServiceError(response.status, code, providerMessage),
          provider_code:
            typeof code === "string" && /^[a-z0-9_]{1,80}$/i.test(code)
              ? code
              : undefined,
          provider_http_status: response.status,
        },
        400,
      );
    }
    return new Response(await response.arrayBuffer(), {
      headers: {
        ...cors,
        "Content-Type": "application/octet-stream",
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
