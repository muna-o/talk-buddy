# Verification — October 17, 2026

Executed successfully:

- `npm test`: 9 tests pass. Includes the four approved voice labels, explicit server enablement, rejection of unknown voice IDs, and deterministic voice order. Covers rejected empty/oversized/non-text input, structured reply and reflection validation, urgent-risk signals vs ordinary boundary practice, and resource identifiers.
- `npm run lint`: clean, with no warnings.
- `npm run build`: production bundle generated successfully.
- Headless installed Chrome via Playwright: mocked-service browser flow passed for onboarding, all four lesson introductions and guided answers, communication cards, typing/send, pause/resume, hints, speech failure fallback, keeping drafts after API failures, navigation back to an open conversation, reflection, custom Free Mode, ElevenLabs failure fallback, theme persistence across reload, history deletion, and mobile width 390px. No page runtime errors.
- Desktop (1440px) and mobile (390px) screenshots inspected visually.
- Supabase public endpoint live test: initially returned HTTP 422 `anonymous_provider_disabled`. After the owner enabled anonymous sign-in, a second live check succeeded and created one anonymous test user. No auth tokens were printed or saved by that check.
- `npm install` audit reported zero known vulnerabilities at installation time.

Not live-verified: database migration execution, owner isolation/RLS against the hosted database, Gemini replies, ElevenLabs speech generation, Edge Function runtime deployment, or Vercel deployment. All browser API responses were explicitly mocked for those tests. No claim of complete end-to-end service functionality is made.

The private Supabase secret shared in chat was not persisted. It should be revoked in the dashboard. Only the supplied public Supabase URL and publishable key are stored in ignored `.env.local`.
