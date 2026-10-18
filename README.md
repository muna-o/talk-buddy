# TalkBuddy

TalkBuddy helps people with autism practice expressing their needs and advocating for themselves in a a friendly, accessible space. **Disclaimer:** This is a prototype, not therapy or clinical care.

- **Courses:** 4 courses on asking for help, expressing needs, setting boundaries, and working through misunderstandings. Each lesson follows the format Learn → Explore → Practice → Reflect (inspired by the evidence-based practices outlined in a [2020 review](https://ncaep.fpg.unc.edu/wp-content/uploads/EBP-Report-2020.pdf) by the National Clearinghouse for Autism Evidence and Practice)
- **Open practice:** create a situation and choose a practice partner.
- **Accessible communication methods:** type, use editable communication cards, or dictate with live transcription. Listen to scenarios and replies, or enable automatic partner audio.
- **Personal preferences:** adjustable text and spacing, OpenDyslexic, color themes, and simplified decorations.

<img width="1487" height="794" alt="Course Mode Page" src="https://github.com/user-attachments/assets/e5918aaa-7dfa-40a1-b334-70c4dfe16217" />

<br>
<br>
<img width="931" height="801" alt="Conversation Page" src="https://github.com/user-attachments/assets/114daf66-9783-4508-a9c7-ee57e2942fb7" />

## Dependencies

- **Node.js 22.12+** and npm.
- **Frontend:** React, Vite, Lucide icons, and the Supabase JavaScript client.
- **Backend:** Supabase anonymous authentication, Postgres, and Edge Functions.
- **AI services:** Google Gemini for conversations/reflections; ElevenLabs for speech playback.

## Project structure

```text
src/          React pages, components, styles, and app assets
public/       Static files and bundled fonts
supabase/     Edge Functions, database migrations, and configuration
tests/        Unit tests
docs/         Design notes
package.json  Dependencies and development/build commands
```

## Run locally

```sh
git clone https://github.com/muna-o/talk-buddy.git
cd talk-buddy
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

Run these commands from the repository root.

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


## Deploy

For Vercel or another static host, set the project root to the **repository root** (`.`), the build command to **`npm run build`**, and the output directory to **`dist`**. Configure both public `VITE_SUPABASE_*` variables before building.

Set the Supabase `ALLOWED_ORIGIN` secret to the approved HTTPS frontend origin (no trailing slash), and update the Supabase Site URL. Multiple approved origins can be comma-separated. Configure anonymous-auth abuse protection before opening the prototype to the public.

