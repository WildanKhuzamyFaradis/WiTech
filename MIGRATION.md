# Catatan Restrukturisasi FE/BE (skeleton)

Ringkas apa yang berubah dan kenapa. Detail lengkap ada di chat asalnya;
ini versi yang nempel di repo biar gak hilang konteksnya.

## Temuan awal

Repo ini awalnya murni frontend (Vite + React 19 + TypeScript, SPA, deploy via
platform Figma Make). **Tidak ada kode backend lama** — `frontend/src/lib/api.ts` kosong,
`API_SPEC.md` baru spec/rencana, dan admin panel jalan pakai React Context
in-memory (`frontend/src/lib/store.tsx`), belum connect ke API manapun.

## Yang berubah

1. **`backend/` (baru)** — skeleton REST API sesuai `API_SPEC.md`, terpisah
   total dari FE (package.json sendiri, port sendiri, gak ganggu build FE).
   Semua route sudah ke-routing dan balikin envelope yang benar, tapi
   business logic belum diisi (`501 NOT_IMPLEMENTED` di semua handler).
   Lihat `backend/README.md`.
2. **`scripts/` (baru)** — isi 5 file `update*.cjs` / `update_data.py` yang
   sebelumnya nangkring di root. Path internal script-script itu relatif ke
   `process.cwd()` (bukan `__dirname`), jadi **tidak ada perubahan path**
   selama tetap dijalanin dari root repo, mis. `node scripts/update_data.cjs`.
3. **Frontend (`frontend/`)** — satu-satunya lokasi React/Vite/TypeScript.
   Root adalah pnpm workspace orchestrator; `.figma/make/` tetap di root
   sesuai syarat Figma Make dan menjalankan command dari `frontend/`.
4. **Lockfile** — `package-lock.json` dihapus, `pnpm-lock.yaml` jadi
   satu-satunya source of truth (pnpm).
5. **`.gitignore`** — nambah `*.zip` (backup archive) dan
   `backend/node_modules/`, `backend/dist/`.
6. **Dihapus dari repo**: `backup wtech v1.zip` (39.7MB, gak pernah masuk
   git tapi ikut ke-zip), `dist/` (build output, udah ke-gitignore juga).
7. **Folder skill-dump AI tool** — sebelumnya ada 4 folder isinya identik
   (skill "impeccable"): `.agent/`, `.agents/`, `.claude/`, `.gemini/`
   (~14MB total). **Cuma `.claude/` yang dipertahanin** (asumsi: tool utama
   yang dipakai) — `.agent/`, `.agents/`, `.gemini/` dihapus dari repo ini.
   ⚠️ **Asumsi ini yang paling gampang salah** — kalau ternyata kamu juga
   pakai Gemini CLI / Codex / tool "generic agents" lain secara rutin,
   tinggal re-generate folder itu lagi (biasanya command `install`
   masing-masing tool), atau restore dari backup lama.
   `.codex/hooks.json` (8KB) dan `.figma/` (dipakai pipeline deploy) **tidak
   disentuh** — bukan bagian dari duplikasi ini.

## Yang sengaja TIDAK diubah

- Tidak ada import path di `src/` yang berubah — nol resiko ke behavior FE.
- Tidak nambah framework baru di FE maupun BE (BE pakai Node `http` polos +
  router internal ~70 baris, bukan Express/Fastify/dll — lihat
  `backend/README.md` bagian "Kenapa gak pakai Express/dll?").
- Belum ada `pnpm-workspace.yaml` / monorepo tooling — FE & BE masing-masing
  `pnpm install` sendiri. Alasan: belum ada shared types/logic yang beneran
  butuh workspace linking. Kalau nanti butuh (mis. share interface
  `Division`/`Project`/dll antara FE & BE), itu titik yang tepat buat
  nambahin `pnpm-workspace.yaml` + package `shared/`.
- `frontend/src/imports/UI_UX_SPECIFICATION.md` dan dokumen root lain (`AGENTS.md`,
  `DESIGN.md`, `PRODUCT.md`, dll) dibiarin di tempatnya — di luar scope
  restrukturisasi FE/BE, bisa dirapiin ke `/docs/` terpisah kalau mau nanti.

## Verifikasi yang udah dilakuin

- `backend`: `tsc --noEmit` bersih (0 error), build (`tsc -p tsconfig.json`)
  sukses, server dites jalan (`node dist/server.js`) dan di-`curl` untuk
  tiap kelas response: 200 (health), 501 (route belum implement), 401
  (admin tanpa token), 404 (route gak ada), 405 (method salah di path yang
  ada) — semuanya sesuai desain.
- Frontend: **tidak ada perubahan file**, jadi behavior-nya dijamin sama
  persis kayak sebelum restrukturisasi.
