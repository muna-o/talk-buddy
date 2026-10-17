# TalkBuddy app

This directory contains the React/Vite frontend, Supabase functions, database migrations, and tests.

See the [project README](../README.md) for TalkBuddy's purpose, dependencies, environment variables, backend setup, and deployment instructions.

Run from this directory:

```sh
npm ci
# On first setup, copy .env.example to .env.local and configure Supabase.
npm run dev
```

```sh
npm test
npm run lint
npm run build    # Output: dist/
npm run preview
```
