# TalkBuddy

TalkBuddy helps people practice everyday conversations and self-advocacy in a friendly, accessible space. It is an educational prototype, not therapy or clinical care.

- **Courses:** asking for help, expressing needs, setting boundaries, and working through misunderstandings. Each lesson follows Learn → Explore → Practice → Reflect.
- **Open practice:** create a situation and choose a practice partner.
- **Communicate your way:** type, use editable communication cards, or dictate with live transcription. Listen to scenarios and replies, or enable automatic partner audio.
- **Personal preferences:** adjustable text and spacing, OpenDyslexic, color themes, and simplified decorations.

## Dependencies

- **Node.js 22.12+** and npm.
- **Frontend:** React, Vite, Lucide icons, and the Supabase JavaScript client.
- **Backend:** Supabase anonymous authentication, Postgres, and Edge Functions.
- **AI services:** Google Gemini for conversations/reflections; ElevenLabs for speech playback.
- **Development tools:** Oxlint, Prettier, Node's test runner, and the Supabase CLI (`npx supabase`).

Installable dependencies and versions are defined in [`talk-buddy/package.json`](talk-buddy/package.json) and its lockfile. The app lives in **`talk-buddy/`**, not the repository root.

## Run locally

```sh
git clone https://github.com/muna-o/talk-buddy.git
cd talk-buddy/talk-buddy
npm ci
cp .env.example .env.local
```

Add your Supabase public configuration to `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

```sh
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. Lessons and local preferences work without backend configuration; AI conversations and voice playback require the setup below. Do not overwrite an existing configured `.env.local`.

## Configure the backend

Run these commands from the app directory (`talk-buddy/` inside the repository).

1. Create a dedicated Supabase project and enable **Authentication → Anonymous Sign-Ins**.
2. Sign in, link the project, and review/apply the database migrations:

   ```sh
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push --dry-run
   npx supabase db push
   ```

3. Copy `.env.functions.example` to `.env.functions.local`. Fill in `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, and an available `GEMINI_MODEL`. The template includes the four supported voice IDs under `ELEVENLABS_VOICE_IDS` and local development origins under `ALLOWED_ORIGIN`.
4. Upload the secrets and deploy the functions:

   ```sh
   npx supabase secrets set --env-file .env.functions.local
   npx supabase functions deploy chat
   npx supabase functions deploy reflection
   npx supabase functions deploy tts
   ```

Keep private keys in Supabase secrets or ignored local files. Only the Supabase public URL and publishable key belong in `VITE_` variables. Never commit private credentials.

## Build and check

From the app directory:

```sh
npm test              # Unit tests
npm run lint          # Code checks
npm run build         # Production output in dist/
npm run preview       # Serve the production build locally
```

`npm run format` formats source, functions, and tests. Unit tests and a frontend build do not verify live provider credentials or deployed database policies.

## Deploy

For Vercel or another static host, set the project root to **`talk-buddy`**, the build command to **`npm run build`**, and the output directory to **`dist`**. Configure both public `VITE_SUPABASE_*` variables before building.

Set the Supabase `ALLOWED_ORIGIN` secret to the approved HTTPS frontend origin (no trailing slash), and update the Supabase Site URL. Multiple approved origins can be comma-separated. Configure anonymous-auth abuse protection before opening the prototype to the public.

## Data and limitations

Use fictional practice details. Conversations and reflections are stored in Supabase and processed by Gemini; text selected for listening is sent to ElevenLabs. Browser dictation may use the browser provider's speech service. TalkBuddy does not store raw voice recordings. Anonymous history is tied to browser authentication and may become inaccessible if browser storage is cleared.

Speech recognition and automatic audio depend on browser support and permissions; manual Listen controls remain available. Sessions have a 20-turn limit. API access requires service credentials and available quotas.

The optional OpenDyslexic font and its license are bundled in [`talk-buddy/public/fonts/`](talk-buddy/public/fonts/). The proposed expanded communication-card design is documented in [`talk-buddy/docs/communication-cards-proposal.md`](talk-buddy/docs/communication-cards-proposal.md).
