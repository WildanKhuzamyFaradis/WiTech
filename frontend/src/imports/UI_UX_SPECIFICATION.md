# UI_UX_SPECIFICATION.md — Spesifikasi UI/UX (WITECH)

> Dokumen ini merangkum keputusan desain yang sudah dijabarkan di `WITECH_ROADMAP.md` (§9, §19–§24) ke dalam satu referensi UI/UX yang mudah diakses tim desain & frontend. Untuk diagram Mermaid lengkap (sitemap, user flow per role), lihat roadmap.
>
> **Dokumen terkait:** `PRD.md` · `WITECH_ROADMAP.md` · `DEVELOPMENT_GUIDELINE.md` · `ADMIN_GUIDE.md`

---

## 1) Sitemap

### 1.1 Website Publik

```
Home (/)
├── About (/about)
├── Portfolio (/projects)
│   └── Detail Project (/projects/{slug})
├── Gallery (/albums)
│   └── Detail Album (/albums/{slug}) → Photo Lightbox
├── Events (/events)
│   └── Detail Event (/events/{slug})
├── Members (/members)
├── Contact (/contact)
└── (Opsional) Terms (/terms), Privacy (/privacy)
```

### 1.2 Dashboard Admin

```
/auth/login
└── /admin (Dashboard)
    ├── /admin/projects → new → {id}/edit → Publish action
    ├── /admin/albums → new → {id}/edit → Upload Photos
    ├── /admin/events → new → {id}/edit
    ├── /admin/members → new → {id}/edit → Import CSV
    ├── /admin/settings → /admin/settings/roles (super_admin only)
    └── /admin/logs
```

Diagram flowchart lengkap: `WITECH_ROADMAP.md` §19.

## 2) Information Architecture (IA)

Prinsip yang dipakai:

- **Task-oriented navigation** — menu mengikuti tugas utama pengunjung (lihat portofolio, lihat anggota, kontak), bukan struktur internal organisasi.
- **Progressive disclosure** — halaman *list* menampilkan ringkasan, halaman *detail* menampilkan informasi lengkap.
- **Consistency** — pola navigasi dan layout konsisten di seluruh modul agar beban kognitif pengguna rendah.

Struktur navigasi:

| Area | Struktur |
|---|---|
| **Public Navbar** | About · Portfolio · Gallery · Events · Members · Contact |
| **Admin Sidebar** | Dashboard · Projects · Albums · Events · Members · Settings · Logs |

Penempatan Portfolio & Gallery dekat Home karena bernilai tinggi bagi kredibilitas; Settings & Role Management dipisah dari alur konten harian karena bersifat sensitif. Detail alasan: `WITECH_ROADMAP.md` §21.

## 3) User Flow

Alur per peran (Visitor, Viewer, Editor, Admin, Super Admin) didokumentasikan sebagai diagram Mermaid di `WITECH_ROADMAP.md` §20. Ringkasan pola umum:

- **Visitor:** `Home → Navbar → List → Detail → (Contact) Submit → Feedback message`
- **Editor:** `Login → Dashboard → List modul → Create → Isi form → Save Draft → Upload gambar`
- **Admin/Super Admin:** `Login → Dashboard → Review Draft → Edit → Publish → Cache revalidate → Log tercatat`

## 4) Wireframe (Ringkas)

Wireframe teks untuk seluruh halaman utama (Home, About, Portfolio List/Detail, Members, Contact, Login, Admin Dashboard, CRUD Project, CRUD Member) tersedia lengkap di `WITECH_ROADMAP.md` §24. Pola umum yang konsisten:

**Halaman publik (list):** Judul + Search → Filter → Grid Card → Pagination
**Halaman publik (detail):** Breadcrumb → Judul + Hero image → Konten → Info tambahan
**Halaman admin (list):** Judul + tombol "Create New" → Search/Filter → Table → Pagination
**Halaman admin (edit):** Judul + tombol aksi (Publish) → Form fields → Upload area → Save/Delete

## 5) Design System

### 5.1 Design Tokens (CSS Variables)

Sumber kebenaran warna & tema mengikuti konvensi shadcn/ui:

```
--background        --foreground
--muted              --muted-foreground
--primary            --primary-foreground
--destructive        --destructive-foreground
--border             --ring
```

Dark mode diimplementasikan lewat `next-themes` (class strategy), memastikan token di atas tetap konsisten di kedua mode.

### 5.2 Typography

| Level | Ukuran |
|---|---|
| Display (Hero) | 40–48px |
| H1 | 32–36px |
| H2 | 24–28px |
| H3 | 18–20px |
| Body | 14–16px |
| Caption | 12–13px |

Aturan keterbacaan: line-height body **1.5–1.75**; panjang baris teks artikel **60–80 karakter**.

### 5.3 Color Palette

Palet warna final ditentukan tim desain lewat token di atas (bukan hex hard-coded), agar tema (brand color, dark/light mode) dapat diubah dari satu sumber. Gunakan kontras teks minimal **4.5:1** untuk body text (lihat §9 Accessibility).

### 5.4 Border Radius

| Elemen | Radius |
|---|---|
| Input, badge | 6px (small) |
| Card | 10–12px (medium) |
| Dialog, modal | 16px (large) |

### 5.5 Shadow

| Level | Penggunaan |
|---|---|
| `shadow-sm` | Elemen kecil (dropdown) |
| `shadow-md` | Card elevated |
| `shadow-lg` | Modal / dialog |

### 5.6 Spacing

Skala 4px: `4, 8, 12, 16, 24, 32, 48, 64`. Konsisten antar komponen — hindari nilai spacing acak di luar skala ini.

### 5.7 Icon Guidelines

Satu set ikon konsisten (Lucide/Phosphor):

- 16px — ikon inline dalam teks
- 20px — ikon di dalam tombol
- 24px — ikon header card

### 5.8 Grid System

- Desktop: grid 12 kolom. Form admin umum memakai 8 kolom konten + 4 kolom aside metadata.
- Mobile: 4 kolom atau single column.

### 5.9 Responsive Breakpoints

| Breakpoint | Lebar |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

## 6) Komponen UI

### 6.1 Primitives
Button (mendukung loading state) · Card · Modal · Dialog · Toast · Alert · Badge (status draft/published) · Avatar · Table · Data Table (sort/filter/select) · Pagination · Search Bar · Tabs · Accordion · Sidebar · Navbar · Footer · Hero

### 6.2 Domain Components
Member Card · Portfolio Card · Gallery Card · Event Card · Contact Form

Peta struktur folder komponen (`components/ui`, `components/admin`, `components/public`, dst.) ada di `DEVELOPMENT_GUIDELINE.md` §2.

## 7) Layout System

**Public:** top navigation (opsional sticky) + footer global; konten memakai container max-width untuk keterbacaan.

**Admin:** sidebar kiri (collapsible) + topbar (search/akun) + content area. Pola halaman konsisten: **header (judul + aksi utama) → filter → table/list → pagination.**

## 8) State Handling (Loading, Empty, Error)

| State | Perilaku |
|---|---|
| **Loading** | Skeleton komponen (bukan spinner penuh layar) agar layout tidak "lompat" saat data masuk. |
| **Empty** | Ilustrasi/pesan ringkas + call-to-action relevan (misal "Belum ada proyek — Buat Proyek Baru"). |
| **Error** | Pesan jelas + opsi retry; hindari menampilkan detail teknis (stack trace) ke pengguna akhir. |

Komponen generik untuk ketiga state ini dikelompokkan di `components/common/` — lihat `DEVELOPMENT_GUIDELINE.md`.

## 9) Accessibility Guideline (WCAG 2.2 AA)

- Seluruh elemen interaktif dapat diakses via keyboard, dengan focus ring yang terlihat jelas.
- Form: label terhubung ke input via `for`/`id`; pesan error memakai `aria-live="polite"`.
- Kontras teks minimal **4.5:1** untuk body text.
- Modal/Dialog: menerapkan **focus trap** dan dapat ditutup dengan tombol `Escape`.
- Table: header memakai `<th scope="col">` untuk semantik yang benar bagi pembaca layar.

## 10) Animation Guideline

- Durasi transisi: **150–250ms**.
- Easing: `ease-out` untuk elemen masuk, `ease-in` untuk elemen keluar.
- Selalu hormati preferensi sistem `prefers-reduced-motion` — nonaktifkan/kurangi animasi non-esensial bila preferensi ini aktif.

## 11) Referensi Silang

- Diagram Mermaid detail (sitemap, user flow, sequence diagram) → `WITECH_ROADMAP.md` §19–§24, §36
- Kebutuhan produk & persona → `PRD.md`
- Implementasi komponen & struktur folder → `DEVELOPMENT_GUIDELINE.md`
- Cara admin memakai komponen ini sehari-hari → `ADMIN_GUIDE.md`
