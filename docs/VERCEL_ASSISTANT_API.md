# Vercel Assistant API Configuration

Set the frontend Vercel project root to `frontend`. The frontend includes its own
`package-lock.json`; use npm so installs do not depend on the workspace lockfile
located at the repository root.

- Install command: `npm ci --include=dev`
- Build command: `npm run build`
- Output directory: `dist`

## Required Environment Variables

### Public Variables (Frontend)
```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_ASSISTANT_AI_ENABLED=true
VITE_APINEX_API_KEY=your_apinex_api_key
VITE_APINEX_BASE_URL=https://api.apinex.bond/v1
VITE_APINEX_MODEL=free/gemini-3.8-flash
```

### Optional Server-only Variables
```text
APINEX_API_KEY=your_apinex_api_key
APINEX_BASE_URL=https://api.apinex.bond/v1
APINEX_MODEL=free/gemini-3.8-flash
```

> [!NOTE]
> Chatbot sekarang mengirim request langsung dari frontend ke endpoint OpenAI-compatible Apinex (`https://api.apinex.bond/v1`).
> Karena ini dipanggil dari browser, gunakan variabel dengan prefix `VITE_` agar bisa dibaca di sisi frontend.
> Endpoint `/api/assistant/chat` tidak lagi menjadi jalur utama untuk AI chat.
