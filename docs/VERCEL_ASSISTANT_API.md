# Vercel assistant API configuration

Set the frontend Vercel project root to `frontend`.

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`

Required public variables:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_ASSISTANT_AI_ENABLED=true
WITECH_BACKEND_URL=http://api.witech.eu.cc:2072
```

`WITECH_BACKEND_URL` is server-only and is used by the Vercel functions in `frontend/api/`. The browser always calls same-origin `/api/assistant/chat` and `/api/contact`, so the HTTP upstream is never exposed to browser JavaScript.

Configure the standalone API's `ALLOWED_ORIGINS` with the final Vercel origin, for example `https://witech-example.vercel.app`, or multiple comma-separated production origins such as `https://witech.id,https://www.witech.id`.
