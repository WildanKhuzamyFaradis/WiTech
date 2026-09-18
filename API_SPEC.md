# WiTECH UKM Technology — API Specification

> REST API publik untuk website **UKM Technology (WiTECH)**.
> Dokumentasi ini mencakup endpoint publik untuk kebutuhan frontend, dan endpoint privat untuk admin panel.

---

## Daftar Isi

- [Informasi Umum](#informasi-umum)
- [Autentikasi](#autentikasi)
- [Endpoint Publik](#endpoint-publik)
  - [Divisions](#1-divisions)
  - [Members](#2-members)
  - [Projects](#3-projects)
  - [Albums & Gallery](#4-albums--gallery)
  - [Events](#5-events)
  - [FAQ](#6-faq)
  - [Contact](#7-contact)
- [Endpoint Admin](#endpoint-admin)
- [Error Handling](#error-handling)
- [Skema Data](#skema-data)

---

## Informasi Umum

| Item | Value |
| --- | --- |
| **Base URL (dev)** | `http://localhost:3000/api/v1` |
| **Base URL (prod)** | `https://witech.example.com/api/v1` |
| **Format** | JSON (`application/json`) |
| **Encoding** | UTF-8 |
| **Timezone** | `Asia/Jakarta` (WIB, UTC+7) |
| **Date format** | ISO 8601 (`2026-08-30T10:00:00+07:00`) |
| **Pagination** | Query `?page=N&limit=M` (default `page=1`, `limit=20`, max `limit=100`) |

### Konvensi

- Semua response sukses dibungkus dalam envelope:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "page": 1, "limit": 20, "total": 42 }
  }
  ```
- Slug menggunakan `kebab-case` lowercase, e.g. `wilearn-platform`.
- ID menggunakan UUID v4 atau short alphanumeric (tergantung resource).

---

## Autentikasi

Endpoint admin menggunakan **JWT Bearer Token**.

```
Authorization: Bearer <access_token>
```

| Item | Value |
| --- | --- |
| Header | `Authorization: Bearer <token>` |
| Token TTL | 24 jam |
| Refresh TTL | 7 hari |
| Hash password | bcrypt (cost factor 12) |

---

## Endpoint Publik

### 1. Divisions

#### `GET /divisions`

Mengambil daftar divisi WiTECH.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "academy",
      "name": "WiTECH Academy",
      "shortName": "Academy",
      "description": "Pusatnya upgrade diri! Fokus ningkatin kompetensi member...",
      "icon": "Smartphone",
      "memberCount": 4,
      "color": "#ff5e5b",
      "technologies": ["Mentoring", "Workshop", "Soft Skill", "Hard Skill"]
    }
  ]
}
```

#### `GET /divisions/:id`

Mengambil detail satu divisi.

**Parameter**
| Nama | Tipe | Lokasi | Keterangan |
| --- | --- | --- | --- |
| `id` | string | path | ID divisi (`academy`, `lab`, `creative`, `connect`, `research`) |

**Response 404**
```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Division not found" } }
```

---

### 2. Members

#### `GET /members`

Mengambil daftar anggota.

**Query**
| Nama | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `division` | string | - | Filter ID divisi |
| `active` | boolean | - | `true` / `false` |
| `year` | string | - | Filter angkatan, e.g. `2024` |
| `page` | number | 1 | Halaman |
| `limit` | number | 20 | Jumlah per halaman |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "m-001",
      "name": "Rizky Pratama",
      "role": "Lead Developer",
      "division": "lab",
      "year": "2023",
      "avatar": "https://cdn.witech.example.com/members/m-001.jpg",
      "github": "rizkypratama",
      "linkedin": "rizky-pratama",
      "active": true
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 23 }
}
```

#### `GET /members/:id`

Detail satu anggota.

---

### 3. Projects

#### `GET /projects`

Mengambil daftar project/portfolio.

**Query**
| Nama | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `divisionId` | string | - | Filter ID divisi |
| `status` | string | `published` | `published` atau `draft` |
| `featured` | boolean | - | Hanya project unggulan |
| `year` | number | - | Filter tahun |
| `tag` | string | - | Filter salah satu tag |
| `q` | string | - | Pencarian pada `title` & `description` |
| `page` | number | 1 | Halaman |
| `limit` | number | 20 | Jumlah per halaman |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "slug": "wilearn-platform",
      "title": "WiLearn",
      "subtitle": "Campus E-Learning Platform",
      "description": "A comprehensive e-learning platform...",
      "division": "Web & App Development",
      "divisionId": "webapp",
      "tags": ["React", "Node.js", "PostgreSQL", "WebRTC"],
      "year": 2024,
      "status": "published",
      "featured": true,
      "image": "https://images.unsplash.com/...",
      "members": ["Rizky Pratama", "Ahmad Fauzi"],
      "award": "1st Place — National Tech Competition 2024",
      "githubUrl": null,
      "liveUrl": null
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12 }
}
```

#### `GET /projects/:slug`

Mengambil detail satu project berdasarkan slug.

**Response 200** — sama dengan item di atas.
**Response 404** — `Project not found`.

---

### 4. Albums & Gallery

#### `GET /albums`

Daftar album galeri.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "alb-001",
      "slug": "workshop-2024",
      "title": "Workshop Nasional 2024",
      "description": "Dokumentasi acara workshop tahunan...",
      "coverImage": "https://cdn.witech.example.com/albums/alb-001/cover.jpg",
      "date": "2024-11-12",
      "photoCount": 42
    }
  ]
}
```

#### `GET /albums/:slug`

Detail album + daftar foto.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "alb-001",
    "slug": "workshop-2024",
    "title": "Workshop Nasional 2024",
    "description": "...",
    "coverImage": "...",
    "date": "2024-11-12",
    "photos": [
      "https://cdn.witech.example.com/albums/alb-001/01.jpg",
      "https://cdn.witech.example.com/albums/alb-001/02.jpg"
    ]
  }
}
```

---

### 5. Events

#### `GET /events`

Daftar event yang akan datang dan lampau.

**Query**
| Nama | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `type` | string | - | `Workshop`, `Bootcamp`, `Seminar`, `Sharing Session` |
| `upcoming` | boolean | - | `true` untuk event yang akan datang |
| `page` | number | 1 | - |
| `limit` | number | 20 | - |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "evt-001",
      "title": "Web Development Bootcamp",
      "date": "2026-09-15",
      "time": "09:00",
      "location": "Lab Komputer 3, Gedung Teknik",
      "type": "Bootcamp",
      "description": "Bootcamp intensif membangun web modern dengan React.",
      "image": "https://cdn.witech.example.com/events/evt-001.jpg",
      "isOpen": true,
      "registrationLink": "https://forms.witech.example.com/evt-001"
    }
  ]
}
```

#### `GET /events/:id`

Detail satu event.

---

### 6. FAQ

#### `GET /faqs`

Daftar Frequently Asked Questions.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "faq-001",
      "question": "Bagaimana cara bergabung dengan WiTECH?",
      "answer": "Pantau postingan Instagram @witech saat open recruitment..."
    }
  ]
}
```

---

### 7. Contact

#### `POST /contact`

Mengirim pesan dari form kontak pada halaman publik.

**Request body**
```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "subject": "Kerja sama event",
  "message": "Halo WiTECH, kami ingin mengundang..."
}
```

**Validasi**
| Field | Aturan |
| --- | --- |
| `name` | required, 2–100 karakter |
| `email` | required, format email valid |
| `subject` | required, 3–150 karakter |
| `message` | required, 10–2000 karakter |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "msg-1735612345678",
    "createdAt": "2026-08-30T10:00:00+07:00"
  }
}
```

**Response 422** — Validation error (lihat [Error Handling](#error-handling)).

---

## Endpoint Admin

> Memerlukan `Authorization: Bearer <token>`.
> Base path: `/api/v1/admin`

| Method | Path | Keterangan |
| --- | --- | --- |
| `POST` | `/auth/login` | Login admin (email + password) → mengembalikan `accessToken` & `refreshToken` |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Invalidate token |
| `GET` | `/me` | Profil admin yang sedang login |
| `GET` | `/divisions` | List divisi (termasuk draft/nonaktif) |
| `POST` | `/divisions` | Buat divisi baru |
| `PATCH` | `/divisions/:id` | Update divisi |
| `DELETE` | `/divisions/:id` | Soft-delete divisi |
| `GET` | `/projects` | List semua project (termasuk `draft`) |
| `POST` | `/projects` | Buat project baru (multipart: image) |
| `PATCH` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Hapus project |
| `GET` | `/members` | List semua anggota |
| `POST` | `/members` | Tambah anggota (multipart: avatar) |
| `PATCH` | `/members/:id` | Update anggota |
| `DELETE` | `/members/:id` | Nonaktifkan anggota |
| `GET` | `/albums` | List album |
| `POST` | `/albums` | Buat album (multipart: coverImage + photos[]) |
| `PATCH` | `/albums/:id` | Update album |
| `DELETE` | `/albums/:id` | Hapus album |
| `POST` | `/albums/:id/photos` | Upload foto tambahan ke album |
| `GET` | `/events` | List event |
| `POST` | `/events` | Buat event (multipart: image) |
| `PATCH` | `/events/:id` | Update event |
| `DELETE` | `/events/:id` | Hapus event |
| `GET` | `/faqs` | List FAQ |
| `POST` | `/faqs` | Buat FAQ |
| `PATCH` | `/faqs/:id` | Update FAQ |
| `DELETE` | `/faqs/:id` | Hapus FAQ |
| `GET` | `/messages` | List pesan masuk dari form kontak |
| `PATCH` | `/messages/:id` | Tandai sudah dibaca / balas |

### Contoh: `POST /admin/auth/login`

**Request**
```json
{
  "email": "admin@witech.id",
  "password": "********"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "admin": {
      "id": "adm-001",
      "name": "Admin WiTECH",
      "email": "admin@witech.id",
      "role": "superadmin"
    }
  }
}
```

---

## Error Handling

Semua error mengikuti format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Must be a valid email" }
    ]
  }
}
```

| HTTP | Code | Keterangan |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Parameter query/body tidak valid |
| 401 | `UNAUTHORIZED` | Token tidak ada / tidak valid |
| 403 | `FORBIDDEN` | Token valid tapi tidak punya akses |
| 404 | `NOT_FOUND` | Resource tidak ditemukan |
| 409 | `CONFLICT` | Duplikat (mis. slug sudah ada) |
| 422 | `VALIDATION_ERROR` | Validasi field gagal |
| 429 | `RATE_LIMITED` | Terlalu banyak request |
| 500 | `INTERNAL_ERROR` | Kesalahan server |

### Rate Limiting

| Scope | Limit |
| --- | --- |
| Endpoint publik | 60 req / menit / IP |
| Endpoint admin | 300 req / menit / user |
| `POST /contact` | 5 req / jam / IP |

Response 429 menyertakan header:
```
Retry-After: 60
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
```

---

## Skema Data

### `Division`
```ts
interface Division {
  id: string;            // slug-style identifier
  name: string;
  shortName: string;
  description: string;
  icon: string;          // Lucide icon name
  memberCount: number;
  color: string;         // hex color, e.g. "#ff5e5b"
  technologies: string[];
}
```

### `Project`
```ts
interface Project {
  id: string;
  slug: string;          // kebab-case, unique
  title: string;
  subtitle: string;
  description: string;
  division: string;       // nama divisi (display)
  divisionId: string;     // foreign key ke Division
  tags: string[];
  year: number;           // 4 digit
  status: "published" | "draft";
  featured: boolean;
  image: string;          // URL
  members: string[];      // nama member
  award: string;
  githubUrl?: string;
  liveUrl?: string;
}
```

### `Member`
```ts
interface Member {
  id: string;
  name: string;
  role: string;
  division: string;       // foreign key ke Division.id
  year: string;           // angkatan, e.g. "2023"
  avatar: string;         // URL
  github: string;
  linkedin: string;
  active: boolean;
}
```

### `Album`
```ts
interface Album {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;           // ISO date
  photoCount: number;
  photos: string[];       // URL foto
}
```

### `Event`
```ts
interface Event {
  id: string;
  title: string;
  date: string;           // ISO date
  time: string;           // "HH:mm"
  location: string;
  type: "Workshop" | "Bootcamp" | "Seminar" | "Sharing Session";
  description: string;
  image: string;
  isOpen: boolean;
  registrationLink?: string;
}
```

### `FAQ`
```ts
interface FAQ {
  id: string;
  question: string;
  answer: string;
}
```

### `ContactMessage`
```ts
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;      // ISO datetime
}
```

---

## Changelog

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0.0 | 2026-08-30 | Initial spec — publik + admin |

---

> Dibuat untuk WiTECH UKM Technology Website · Format: Markdown