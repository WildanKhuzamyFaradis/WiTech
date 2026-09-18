---
name: Witech UKM Technology Website
description: Portal inklusif untuk semua jurusan belajar teknologi
colors:
  primary: "#ff6b6b"
  secondary: "#4ecdc4"
  accent: "#ffe66d"
  foreground: "#1a1a2e"
  background: "#fef9ef"
  muted: "#f1f5f9"
  card: "#ffffff"
  purple: "#a855f7"
typography:
  display:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontWeight: 900
  headline:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Fredoka, system-ui, sans-serif"
    fontWeight: 500
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontWeight: 700
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
spacing:
  container: "1440px"
components:
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
  button:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
---

# Design System: Witech UKM Technology Website

## Overview

**Creative North Star: "Simple & Brand-Aligned Neo-Brutalist"**

Witech membawa kesan sederhana namun tidak kaku (bukan "AI slop"), sangat selaras dengan logo Witech yang mengandalkan warna merah, biru tua, dan latar putih/gading. Desain ini menghindari kesan rumit atau menakutkan, membuktikan bahwa teknologi itu bisa dipelajari oleh semua jurusan. Penggunaan *border* tebal, tata letak grid yang rapi, dan ruang kosong (white-space) menciptakan rasa stabil dan jelas.

**Key Characteristics:**
- Ramah dan inklusif (terlihat dari sudut membulat dan font Fredoka).
- Identitas warna tegas (merah Coral dan biru tua/Dark Navy).
- Tata letak terstruktur ketat dan rapi.
- Interaktif dan responsif pada *hover*.

## Colors

Palet didominasi oleh warna hangat dan vibran yang selaras dengan logo utama (merah dan biru), diimbangi latar belakang yang bersih.

### Primary
- **Coral Red** (#ff6b6b): Warna utama (merujuk pada merah logo Witech). Digunakan untuk tombol utama, sorotan, dan elemen yang membutuhkan aksi (CTA).

### Secondary
- **Teal Mint** (#4ecdc4): Warna pendukung untuk variasi visual, pembagian divisi, dan aksen penyegar.
- **Sunny Yellow** (#ffe66d): Warna *accent* ceria untuk medali, bintang, atau ikon khusus.

### Neutral
- **Dark Navy / Foreground** (#1a1a2e): Menggantikan hitam pekat. Berfungsi ganda sebagai warna teks utama dan warna *border* tebal ala neo-brutalist. Ini mewakili "biru" dari logo Witech.
- **Warm Ivory / Background** (#fef9ef): Latar belakang utama yang lebih hangat dari putih murni, mengurangi kelelahan mata.
- **Card White** (#ffffff): Latar belakang komponen kartu untuk memberi kontras terhadap *background* utama.
- **Muted Slate** (#f1f5f9): Warna abu-abu kebiruan untuk elemen yang tidak aktif atau latar belakang sekunder.

### Named Rules
**The Brand-Aligned Rule.** Warna utama (Merah dan Biru Tua) dan latar terang adalah inti identitas. Warna lain (Mint, Yellow, Purple) hanya digunakan sebagai aksen dekoratif atau pembeda divisi, bukan sebagai elemen hierarki utama.

## Typography

**Display Font:** Fredoka (dengan system-ui fallback)
**Body Font:** Fredoka
**Label/Mono Font:** JetBrains Mono

**Character:** Bulat, ramah, dan sangat terbaca. Fredoka menghilangkan kesan korporat/kaku dan langsung memposisikan Witech sebagai tempat belajar yang *fun*.

### Hierarchy
- **Display** (Black/900, clamp size): Digunakan eksklusif untuk judul hero di setiap halaman.
- **Headline** (Bold/700, 2xl-4xl): Untuk judul *section* (misal: "Perjalanan Kita", "Nilai-Nilai Kita").
- **Title** (Black/900, lg-xl): Untuk judul kartu, nama member, atau nama proyek.
- **Body** (Medium/500, base-lg): Untuk deskripsi panjang dan teks paragraf.
- **Label** (Bold/700, xs-sm, uppercase tracking-widest): Untuk *badge* divisi, kategori, dan tombol.

## Layout

Tata letak Witech sangat terstruktur dan konsisten. Semua konten utama dibungkus dalam *container* lebar (`max-w-7xl` atau `1440px` untuk navbar) dengan *padding* yang aman (`px-6`). Penggunaan *grid* sangat kental (misal: bento grid di Home, grid 3-kolom di Portfolio dan Divisi).

## Elevation & Depth

Sistem kedalaman Witech menggunakan pendekatan *flat-by-default* ala neo-brutalist yang dihaluskan.

### Shadow Vocabulary
- **Neo-Shadow Default** (`box-shadow: 2px 2px 0px 0px var(--color-border)`): Bayangan statis yang sangat tipis pada tombol atau *badge*.
- **Neo-Shadow Hover** (`box-shadow: 4px 4px 0px 0px var(--color-border)` sampai `12px 12px`): Elemen datar saat diam, namun memunculkan bayangan tebal dan bergeser saat di-*hover* atau di-klik.

### Named Rules
**The Tactile Rule.** Elemen interaktif harus terasa seperti bisa ditekan (*tactile & bouncy*). Gunakan transisi `-translate-y-1` atau `-translate-y-2` dipadukan dengan ekspansi *box-shadow* saat interaksi.

## Shapes

Bentuk didominasi oleh sudut membulat yang lembut (radius `8px` hingga `24px` / `rounded-3xl`). Meskipun menggunakan garis luar (*border* 2px-3px) yang tegas seperti gaya *brutalist*, ujungnya yang membulat (bukan kotak tajam) mempertahankan kesan ramah.

## Components

### Buttons
- **Shape:** `rounded-xl` (12px) atau `rounded-2xl` dengan `border-2 border-border`.
- **Primary:** `bg-primary` dengan teks putih, teks `font-bold` atau `font-black`.
- **Hover / Focus:** Bergeser ke atas (`-translate-y-1`), *box-shadow* bertambah tebal, memberikan kesan *bouncy*.

### Cards
- **Corner Style:** Sangat membulat (`rounded-3xl` atau `24px`).
- **Background:** Putih (`#ffffff`) atau *muted* (`#f1f5f9`), dipisahkan dari *background* utama dengan `border-2` atau `border-3` berwarna Dark Navy.
- **Shadow Strategy:** Muncul saat *hover* (mengikuti *The Tactile Rule*).
- **Internal Padding:** Luas (`p-8` atau lebih).

### Badges / Tags
- **Style:** Kapsul (`rounded-full`), teks huruf kapital (`uppercase`), spasi renggang (`tracking-widest`), ukuran sangat kecil (`text-xs`).
- **Fungsi:** Sering menempel di atas judul *section* atau di dalam kartu proyek.

## Do's and Don'ts

### Do:
- **Do** gunakan `border-2 border-border` secara eksplisit pada setiap kartu atau wadah elemen untuk mempertegas tata letak grid.
- **Do** terapkan efek *hover* yang membal (`-translate-y-1` atau `scale-105`) pada setiap elemen yang bisa diklik.

### Don't:
- **Don't** gunakan bayangan blur/lembut (`shadow-lg` bawaan Tailwind). Selalu gunakan bayangan *solid* (`neo-shadow`).
- **Don't** hilangkan garis batas (border) pada komponen form atau input; mereka harus terlihat tegas.
- **Don't** membuat teks atau paragraf terlalu padat. Manfaatkan *line-height* yang lega (`leading-relaxed`).
