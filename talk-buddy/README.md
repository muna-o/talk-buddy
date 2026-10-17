# TalkBuddy

Your voice. Your needs. Your way.

A React + Vite educational prototype for self-advocacy and conversation practice. It is neurodiversity-affirming, supports typing and editable communication cards, and never grades masking, eye contact, politeness or speech fluency. It is not clinical care.

## What is implemented

- Warm responsive home, four complete lesson definitions, Learn → Explore → Practice → Reflect, custom Free Mode, shared conversation interface, progress, settings and support resources.
- Nine themes, adjustable text/spacing, self-hosted OpenDyslexic and readable font options, reduced motion, optional audio, local preferences and Supabase preference sync.
- Supabase anonymous authentication; owner-scoped sessions, messages and reflections; atomic turn saving; server-controlled curriculum; 20-turn session limit; per-user API quotas (100/hour, 400/day).
- Gemini structured conversation and reflection functions, ElevenLabs on-demand audio of saved authorized messages, approved voice selection, in-memory audio cache, editable optional browser speech transcription.
- History resume and deletion; no raw voice storage; private keys never enter the frontend.

AI conversations require configured, deployed services. There is no simulated AI fallback. Reading lessons and changing local preferences works without services.

## Run locally

Requires Node 22.12+ (Node 24 recommended).

```sh
cd ~/Desktop/repos/talk-buddy/talk-buddy
npm install
cp .env.example .env.local # only if .env.local is not already configured
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173). The public project URL and publishable key supplied during setup are already in the ignored `.env.local`. No private secret key was stored.

Frontend variables:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Never put Gemini, ElevenLabs, database passwords, Supabase secret keys, or service-role keys in a `VITE_` variable. Vite bundles those values into publicly readable JavaScript. Do not commit `.env.local`.

## Connect your Supabase project

Project reference supplied: `iekryelbfsnyqfmszzpi`.

1. In Supabase **Authentication → Sign In / Providers**, enable **Anonymous Sign-Ins**. Anonymous sign-in was enabled and then successfully verified against the project during setup.
2. Revoke the private Supabase secret key shared in chat. A replacement is not required in the frontend. Hosted Edge Functions automatically receive Supabase backend credentials.
3. Install the Supabase CLI following https://supabase.com/docs/guides/local-development/cli/getting-started (or use `npx supabase` in the commands below).
4. Authenticate and link the existing project:

```sh
npx supabase login
npx supabase link --project-ref iekryelbfsnyqfmszzpi
npx supabase db push --dry-run
```

Review the pending migrations before applying them to your existing project. They create preferences, lessons, sessions, messages, reflections and API usage tables, owner-only RLS and service-only write/turn functions. No existing tables are dropped. Generic table names may conflict with existing tables; use a dedicated TalkBuddy project.

```sh
npx supabase db push
```

For a manual dashboard workflow, run the two SQL files in `supabase/migrations/` in filename order using the SQL editor. Never paste keys into SQL files. The curriculum migration is generated from `src/data/lessons.json`; update both when editing lessons.

## Private service configuration

Create a Gemini API key in https://aistudio.google.com/api-keys . Create an ElevenLabs API key in https://elevenlabs.io/app/settings/api-keys and select voice IDs from your voice library. Check that TTS access and credits are available. Use fictional practice content: Gemini free-tier content may be used to improve Google's products.

Copy `.env.functions.example` to **`.env.functions.local`** (ignored by Git) and fill it using your editor:

```dotenv
GEMINI_API_KEY=your_private_key
GEMINI_MODEL=gemini-3.5-flash-lite
ELEVENLABS_API_KEY=your_private_key
ELEVENLABS_VOICE_IDS=first_approved_voice_id,second_approved_voice_id
ALLOWED_ORIGIN=http://localhost:5173
```

The selected Flash model is configurable. Google's pricing and structured output documentation were checked on October 17, 2026; quota/access must still be verified in your AI Studio project. The free tier is not unlimited. If this model is unavailable in your project, choose an available Flash model supporting structured JSON output and change `GEMINI_MODEL`.

Upload secrets and deploy from the app directory:

```sh
npx supabase secrets set --env-file .env.functions.local
npx supabase functions deploy chat
npx supabase functions deploy reflection
npx supabase functions deploy tts
```

Alternatively add the same named values under **Edge Functions → Secrets** in Supabase. Never share keys in chat or commit the secret file. The functions use `verify_jwt = false` because they explicitly authenticate the caller with `auth.getUser(token)`, supporting current signing keys; this does not make database access public. The service-role client is used only after authentication and every session is filtered by verified user ID.

## Deploy the frontend

Import `muna-o/talk-buddy` in Vercel, set **Root Directory** to `talk-buddy`, framework Vite, build `npm run build`, output `dist`. Add the two `VITE_SUPABASE_*` public variables in Vercel. Deploy, set the Supabase `ALLOWED_ORIGIN` secret to the exact HTTPS Vercel production origin (no slash), and redeploy functions if needed. Set the Supabase Site URL to that origin. Configure a separate Supabase backend/origin for previews if desired; the default CORS setting permits one exact origin.

Before public deployment, enable Supabase anonymous auth abuse protection/CAPTCHA and adapt the sign-in UI to supply the CAPTCHA token. Current quotas are per authenticated user and do not prevent automated creation of many anonymous accounts. Do not use the prototype for real sensitive clinical or therapy content.

## Verification

```sh
npm test
npm run lint
npm run build
```

`tests/validation.test.mjs` checks input limits, malformed model output, reflection validation and the distinction between ordinary boundary practice and urgent signals. Browser smoke checks must distinguish mock-service tests from live tests. SQL/RLS and Deno functions need verification against an actual configured project; a successful frontend build does not test them.

Manual live acceptance path after deployment:

1. Complete/skip onboarding. Open all four lessons and explore multiple valid answers.
2. Start practice, insert/edit a card, send it, then type a different reply. Verify contextual Gemini responses and saved messages.
3. Enable audio in settings, select an approved voice, play/replay a response. Test a denied microphone permission and editable transcription.
4. Pause, resume, end early, inspect reflection, revisit practice. Refresh and resume from My practice.
5. Create a Free Mode scenario with a custom name/role/personality/difficulty.
6. Change theme/spacing and refresh. Try keyboard navigation and a narrow mobile viewport.
7. In two separately authenticated browsers, verify each user cannot select or delete the other's sessions, messages, reflections or preferences; unauthenticated writes and authenticated direct message writes must fail.
8. Test empty/oversized messages, concurrent sends, exhausted quota, invalid service secrets, unavailable voices and backend failures. Failed messages must keep the editable draft.
9. Delete history and verify cascading messages/reflections are removed.

## Safety and limitations

A conservative server check and model context check can pause urgent-risk interactions and direct users to real-world support. This is not comprehensive crisis detection; ordinary fictional boundary lessons should continue. US crisis details were obtained through the local helpline tool. ASHA ProFind and ASAN links were verified against their official sites.

Not yet implemented: uploaded custom backgrounds, account upgrade/recovery, educator tools and more than one lesson per category. OpenDyslexic is an optional personal preference, not a claim that one font benefits everyone. The original regular/bold WOFF2 files and their SIL Open Font License are bundled in `public/fonts/`. Anonymous data is tied to the browser session; clearing storage may lose access. The prototype has no automatic anonymous-account retention cleanup. Progress lists the latest 50 sessions and counts ended sessions with at least one learner message as practice, not demonstrated mastery.

No public deployment, paid service requests, database migration execution or live Gemini/ElevenLabs success is implied by this source code. Those require configuration and separate verification.

Documentation: https://ai.google.dev/gemini-api/docs/pricing · https://ai.google.dev/gemini-api/docs/structured-output · https://supabase.com/docs/guides/auth/auth-anonymous · https://supabase.com/docs/guides/functions/auth · https://elevenlabs.io/docs/api-reference/text-to-speech/convert

## Selected ElevenLabs voices

Settings offers Max (friendly eLearning), Mark (clear and dependable), Ava (helpful and understanding), and Cecilia O’Connor (warm and conversational). The shared public catalog is in `supabase/functions/_shared/voices.mjs`. The server only permits catalog voices explicitly enabled in `ELEVENLABS_VOICE_IDS`; an empty value disables all voices.

In Supabase **Edge Functions → Secrets**, add the replacement private key as `ELEVENLABS_API_KEY` and set:

```dotenv
ELEVENLABS_VOICE_IDS=Gfpl8Yo74Is0W6cPUWWT,v3p1kjzUvro6S76qmYmH,gJx1vCzNCD1EQHT212Ls,DIS307HFaAvJZzq496qM
```

The private key pasted into chat was not saved into the source or environment files. Rotate it in ElevenLabs and put the replacement directly in Supabase. Redeploy `chat` and `tts` after these source changes. For the current local preview, set `ALLOWED_ORIGIN=http://127.0.0.1:5173`; use your exact frontend HTTPS origin when deployed.

These voice descriptions were supplied by the project owner; voice access and live audio still need to be verified with the account's replacement key and available credits.

## Troubleshooting a 404 when beginning practice

`Requested function was not found` from `/functions/v1/chat` means the `chat` Edge Function has not been deployed to the configured project. `PGRST205` from `/rest/v1/lessons` means the database migrations are missing. A public project URL/key and successful anonymous login do not deploy either component.

From the app directory, sign in and review/apply the backend setup:

```sh
npx --yes supabase login
npx --yes supabase link --project-ref iekryelbfsnyqfmszzpi
npx --yes supabase db push --dry-run
npx --yes supabase db push
npx --yes supabase functions deploy chat
npx --yes supabase functions deploy reflection
npx --yes supabase functions deploy tts
```

The CLI may ask for the database password while linking; enter it directly in your terminal. Add Gemini and ElevenLabs secrets as described above. For local development `ALLOWED_ORIGIN` can contain both `http://localhost:5173,http://127.0.0.1:5173`. Production should list only exact approved frontend origins. Requests from unapproved browser origins do not receive an allow-origin header; authentication is still checked server-side.

## Live backend status — October 17, 2026

The project is linked, all three migrations are applied, and `chat`, `reflection`, and `tts` are deployed. The original missing-function/table 404 is resolved. Both local preview origins are enabled. Live tests verified course creation, a Gemini reply with saved messages, a saved reflection, a Free Mode opening, and owner isolation for sessions/messages plus rejection of direct message inserts. The browser’s Begin conversation flow was also verified against the live backend.

The initial Gemini 3.8 Flash request timed out. The deployed model is now `gemini-3.5-flash-lite`, which passed live chat, reflection and Free Mode tests. Its configurable default and environment template match that deployment. Official model reference: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite

With the upgraded ElevenLabs plan, live audio requests succeed for Max, Mark, Ava, and Cecilia O’Connor. A real MP3 was decoded and played (muted for testing) in Chrome. TTS transports binary responses as `application/octet-stream` so the Supabase SDK preserves them as Blobs; the frontend assigns the correct `audio/mpeg` type for playback. Provider errors still distinguish free-plan voice restrictions, insufficient quota, unusual activity, invalid keys, permissions, and rate limits.

The frontend has not been deployed to Vercel. Replace the local allowed origins with the exact approved HTTPS origin when deploying publicly.

## Friendly learning interface

Courses are presented as wide vertical rows using their category names. Home uses the supplied transparent illustration and a sans-serif heading. Free practice keeps scenario/partner setup with styled native selects and explicit custom role/personality fields.

The conversation shows only the communication method selected in Preferences: **Speaking**, **Typing**, or **Communication cards**. Method selectors are not shown in the chat. Cards fill the input panel with larger phrases; selecting one opens a review area with optional editing before Send. Typing and microphone controls are hidden in Cards mode. Speak shows a prominent recording button and streams interim browser transcription into an editable draft. Nothing sends automatically. Visiting Settings or leaving practice stops speech capture. The current draft survives a trip to Settings and back to the open practice. Browser support and microphone permission are still required for speech; typing and cards remain available. The Hint control and practice sidebar have been removed, and restart/pause/end controls are grouped at the bottom of the chat.

## Simplified whimsical iteration

- Home uses the supplied clock and star doodles, the heading “Practice conversations,” and “Explore the courses.” The speech bubble was removed. Decorative drawings respect the simplified-visuals setting.
- Preferences offers OpenDyslexic, four additional themes (Lavender, Rose, Sunflower, Ocean), and one place to choose the communication method.
- Choosing Speaking enables character audio and automatic reading; microphone recording still requires an explicit click. “Read every partner message automatically” also works in typing and cards, includes the opening and new replies, and can be disabled. Browsers may block autoplay; Listen remains the fallback.
- Course titles replace the old decorative lesson titles. Four richer situations and revised choices are in the frontend and curriculum migration `202610170003_richer_lesson_context.sql`, applied to the hosted database. Existing conversation configurations remain historical snapshots.
- Free Practice is a two-step form: situation/difficulty, then partner/personality. Back navigation retains all values.
- Expanded/categorized communication cards are **not implemented**. See [the research-informed proposal](docs/communication-cards-proposal.md).
