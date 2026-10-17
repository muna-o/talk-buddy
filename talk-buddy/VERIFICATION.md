# Verification — October 17, 2026

## Executed successfully

- `npm test`: 18 tests pass, covering input/output validation, urgent-risk signals vs ordinary boundary practice, resource IDs, the approved voice catalog, server voice enablement, connection-error messages, exact browser-origin checks and provider error categories.
- `npm run lint`: clean.
- Production frontend build passed after the connection-error and CORS fixes. Subsequent changes concern backend provider error handling, the server model default, tests and documentation.
- Mocked-service Chrome tests covered onboarding, all four guided lesson flows, cards, typing, pause/resume, hints, speech fallback, preserving a draft after failure, navigation back to a conversation, reflections, Free Mode, TTS failure fallback, theme persistence, mobile layout and history deletion. No browser runtime errors. Desktop and 390px mobile screenshots inspected visually.

## Live Supabase verification

- Anonymous authentication succeeded. CLI project access is linked to `iekryelbfsnyqfmszzpi`.
- Both migrations applied successfully to the previously empty public schema.
- `chat`, `reflection`, and `tts` deployed successfully through the Supabase API.
- Preflight accepts `http://127.0.0.1:5173` and `http://localhost:5173`.
- The authenticated voice catalog returns Max, Mark, Ava, and Cecilia O’Connor.
- Course session and opening save correctly.
- A second authenticated user cannot select another user’s session or messages. Direct authenticated message inserts are rejected. These are targeted live RLS checks, not a comprehensive database security audit.
- A real Gemini reply was validated and saved as an atomic message pair. A real reflection was generated and saved. Free Mode generated and saved a real opening.
- An unmocked Chrome test clicked Begin conversation, displayed the saved course opening, ended the session, displayed the no-message reflection, and deleted the test history. No runtime errors.
- Fictional sessions created by the integration and browser checks were deleted afterward. Test authentication tokens were not printed or saved. Anonymous test identities remain in auth; retention cleanup is not implemented.

## Provider results and limitations

- The initial Gemini 3.8 Flash request timed out. The deployed configurable model is now `gemini-3.5-flash-lite`; live conversation, reflection, and Free Mode succeeded with it.
- Live requests for Max, Mark, Ava, and Cecilia O’Connor each returned HTTP 402 `payment_required`: Voice Library voices are blocked through the API on the Free plan. The prior credit label was an application error, not evidence of a depleted balance. Error handling was corrected and deployed; regression tests cover plan restrictions separately from quota and unusual-activity restrictions. Audio generation is not verified as successful.
- Vercel deployment, successful playback of generated audio, custom background uploads, full keyboard/screen-reader auditing, and comprehensive RLS testing remain outstanding.
- No private API key is committed. Public browser Supabase configuration lives in ignored `.env.local`. Private provider secrets remain in Supabase.
