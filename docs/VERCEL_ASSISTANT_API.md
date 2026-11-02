# Vercel Assistant API Configuration

Set the frontend Vercel project root to `frontend`.

- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `dist`

## Required Environment Variables

### Public Variables (Frontend)
```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_ASSISTANT_AI_ENABLED=true
```

### Server-only Variables (Vercel Functions in `frontend/api/`)
```text
APINEX_API_KEY=your_apinex_api_key
APINEX_BASE_URL=https://api.apinex.bond/v1
APINEX_MODEL=free/gemini-3.8-flash
```

> [!NOTE]
> Chatbot sekarang menggunakan integrasi OpenAI SDK langsung ke provider Apinex (`https://api.apinex.bond/v1`).
> Kunci API `APINEX_API_KEY` hanya diakses pada serverless function Vercel di `/api/assistant/chat` dan tidak pernah terekspos ke sisi browser pengguna.
> Variabel `WITECH_BACKEND_URL` tetap didukung sebagai opsi fallback jika kunci Apinex belum disediakan.
