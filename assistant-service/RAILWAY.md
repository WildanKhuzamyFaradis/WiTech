# WiTECH assistant on Railway

Deploy two services from the repository root: `assistant-service/Dockerfile` is the public API (port `3001`), and `copilot-runtime/Dockerfile` is the private Copilot headless runtime (port `4321`). Give only the API a public domain.

## Assistant service variables

Set real values as Railway secrets:

- `NODE_ENV=production`
- `PORT` (Railway-provided; local fallback is `3001`)
- `HOST=0.0.0.0`
- `WITECH_ALLOWED_ORIGIN` (exact public frontend origin)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (anon/publishable key only; never service role)
- `COPILOT_RUNTIME_URL` (private hostname such as `copilot-runtime.railway.internal:4321`)
- `COPILOT_CONNECTION_TOKEN` (shared runtime connection secret)

Production uses the existing server-side Supabase configuration and does not read frontend `.env.local` files.

## Copilot runtime variables

Set one supported credential in the private runtime service: `COPILOT_GITHUB_TOKEN` (preferred), `GH_TOKEN`, or `GITHUB_TOKEN`. Do not put it in an image, Dockerfile, example file, or repository. The CLI release is pinned by `COPILOT_VERSION` (default `1.0.7`) and automatic updates are disabled.

The local Windows login/session is not copied into a Linux container. Production therefore requires an explicitly provisioned GitHub/Copilot credential accepted by the organization and account; this task does not create or discover that credential.

## Deployment order and checks

Deploy the private runtime first, then the API with its private runtime URL and public origin. Use `GET /health` for the API health check and never expose the runtime publicly. The runtime binds to `0.0.0.0:4321` for Railway private networking.

Local validation from the repository root:

```text
pnpm install --frozen-lockfile
pnpm --dir frontend run build
docker build -f assistant-service/Dockerfile .
docker build -f copilot-runtime/Dockerfile .
```

These Docker builds require registry and GitHub release access. No live Copilot prompt or chat call is part of validation.
