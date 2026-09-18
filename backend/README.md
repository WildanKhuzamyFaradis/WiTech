# WiTECH Backend (skeleton)

REST API untuk WiTECH UKM Technology Website, sesuai [`API_SPEC.md`](../API_SPEC.md) di root repo.

**Status: skeleton.** Semua route sudah terdaftar dan mengembalikan response
dengan envelope yang benar (`{ success, data }` / `{ success: false, error }`),
tapi belum ada logic bisnis / koneksi data — tiap handler balikin `501
NOT_IMPLEMENTED`. Cari komentar `TODO` di `src/` buat lihat titik-titik yang
perlu diisi.

Berjalan independen dari frontend — port beda, proses beda, gak ganggu
`pnpm dev`/`pnpm build` punya frontend di root.

## Menjalankan

```bash
cd backend
pnpm install
cp .env.example .env      # sesuaikan kalau perlu
pnpm dev                  # http://localhost:3000 (watch mode, via tsx)
```

Cek endpoint liveness:

```bash
curl http://localhost:3000/api/v1/health
```

## Scripts

| Script | Fungsi |
| --- | --- |
| `pnpm dev` | Jalanin server dev dengan watch/reload (`tsx watch`) |
| `pnpm build` | Compile TypeScript → `dist/` |
| `pnpm start` | Jalanin hasil build (`node dist/server.js`) — dipakai di produksi |
| `pnpm typecheck` | `tsc --noEmit`, cek tipe tanpa build |

## Struktur

```
backend/
├── src/
│   ├── server.ts          # entrypoint — bikin http server, listen PORT
│   ├── app.ts              # request pipeline: CORS → log → body parse → route → error handling
│   ├── config/
│   │   └── env.ts          # baca process.env di satu tempat
│   ├── core/
│   │   ├── router.ts       # mini router (:param matching), bukan framework eksternal
│   │   ├── http.ts         # helper response envelope (sendSuccess/sendError) + body reader
│   │   └── types.ts        # RequestContext, Middleware, RouteHandler
│   ├── middleware/
│   │   ├── cors.ts
│   │   ├── requestLogger.ts
│   │   └── auth.ts         # requireAuth() — baru cek header Bearer ada, BELUM verify JWT beneran
│   └── routes/
│       ├── index.ts        # daftarin semua route module
│       ├── public.routes.ts  # § Endpoint Publik (divisions, members, projects, albums, events, faqs, contact)
│       └── admin.routes.ts   # § Endpoint Admin (auth, me, CRUD tiap resource, messages)
├── .env.example
├── package.json
└── tsconfig.json
```

## Kenapa gak pakai Express/Fastify/dll?

Sengaja — biar gak nambah dependency/framework baru selain yang udah dipakai
project ini (TypeScript, pnpm). Router-nya cuma ~70 baris di
`src/core/router.ts`. Kalau kebutuhan beneran (middleware ekosistem, file
upload multipart, dll — banyak endpoint admin butuh `multipart/form-data`)
bikin ini gak worth-it lagi, ganti ke Express/Fastify/Hono itu keputusan yang
wajar buat diambil pas mulai isi logic beneran, bukan sekarang di tahap
skeleton.

## Auth (belum diimplementasi)

`src/middleware/auth.ts` → `requireAuth()` baru validasi header
`Authorization: Bearer <token>` ada dan berformat benar. Verifikasi JWT
sungguhan (signature, expiry) belum jalan — cari komentar `TODO` di file itu.

## Shared types dengan frontend

Belum ada `/shared` package — tipe (`Division`, `Project`, `Member`, dst.)
saat ini didefinisikan terpisah di FE (`src/lib/data.ts`) dan cukup dijaga
manual biar konsisten sama `API_SPEC.md` § Skema Data. Kalau nanti mau
di-share beneran, itu saat yang tepat buat introduce pnpm workspaces (root
`pnpm-workspace.yaml` + package `shared/`).
