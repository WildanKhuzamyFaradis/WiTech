import React from "react"

import { usePublicData } from "../../context/PublicDataContext"

import PublicPageShell from "../../components/public/PublicPageShell"

import { Link } from "react-router"

import {
  Users,
  Lightbulb,
  HeartHandshake,
  Rocket,
  Target,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

const About: React.FC = () => {
  const { data, loading, error } = usePublicData()

  const divisions = data?.divisions ?? []

  return (
    <PublicPageShell loading={loading} error={error}>
      <div className="min-h-screen bg-background text-foreground font-sans pt-32 pb-24 overflow-hidden">
        {/* ── HERO ───────────────────────────────────────────── */}
        <section className="relative px-6 mb-32">
          <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-accent text-xs font-bold uppercase tracking-widest mb-6 neo-shadow-sm">
                <span className="w-2 h-2 rounded-full bg-foreground" />
                Tentang Kami
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1]">
                Diciptakan oleh mahasiswa. <br />
                <span className="gradient-text">Untuk semua.</span>
              </h1>
              <p className="text-xl font-medium text-muted-foreground leading-relaxed mb-10 max-w-xl">
                WiTech bukan hanya untuk mahasiswa dari bidang IT. Siapa pun
                dari jurusan lain tetap bisa belajar dan berkembang bersama
                teknologi.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background border-2 border-border rounded-xl text-lg font-bold neo-shadow-sm hover:bg-primary hover:text-white transition-all hover:-translate-y-1"
                >
                  Gabung Witech <ArrowRight size={20} strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            <div className="relative lg:h-[500px] rounded-3xl border-2 border-border p-8 neo-shadow-lg bg-card flex flex-col justify-center gap-6 group hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute -right-6 -top-6 size-24 bg-accent rounded-full border-2 border-border flex items-center justify-center neo-shadow-sm anim-wiggle">
                <Users
                  size={40}
                  className="text-foreground"
                  strokeWidth={2.5}
                />
              </div>
              <div className="absolute -left-6 -bottom-6 size-20 bg-secondary rounded-xl border-2 border-border flex items-center justify-center neo-shadow-sm anim-float rotate-12">
                <Lightbulb
                  size={32}
                  className="text-foreground"
                  strokeWidth={2.5}
                />
              </div>

              <div className="bg-muted p-6 rounded-2xl border-2 border-border flex items-center gap-4">
                <CheckCircle2
                  size={32}
                  className="text-primary shrink-0"
                  strokeWidth={2.5}
                />
                <p className="font-bold text-lg">Semua jurusan diterima!</p>
              </div>
              <div className="bg-muted p-6 rounded-2xl border-2 border-border flex items-center gap-4 ml-8">
                <CheckCircle2
                  size={32}
                  className="text-secondary shrink-0"
                  strokeWidth={2.5}
                />
                <p className="font-bold text-lg">
                  Mulai dari nol, belajar bareng.
                </p>
              </div>
              <div className="bg-muted p-6 rounded-2xl border-2 border-border flex items-center gap-4">
                <CheckCircle2
                  size={32}
                  className="text-accent shrink-0"
                  strokeWidth={2.5}
                />
                <p className="font-bold text-lg">Fokus ke skill dunia nyata.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── VISION & MISSION ───────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 mb-32 relative">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="neo-card rounded-3xl p-10 lg:p-12 neo-shadow-md hover:-translate-y-2 transition-transform bg-white">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border-2 border-primary/20">
                <Target size={32} className="text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl font-black mb-6 tracking-tight">
                Visi Kita
              </h2>
              <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                Mewujudkan lingkungan kampus yang lebih melek teknologi di
                berbagai disiplin ilmu. Kami percaya teknologi adalah alat yang
                dapat dipelajari oleh siapa pun, tanpa rasa takut atau
                keterbatasan latar belakang.
              </p>
            </div>

            <div className="neo-card rounded-3xl p-10 lg:p-12 neo-shadow-md hover:-translate-y-2 transition-transform bg-white text-foreground">
              <div className="size-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8 border-2 border-secondary/20">
                <Rocket
                  size={32}
                  className="text-secondary"
                  strokeWidth={2.5}
                />
              </div>
              <h2 className="text-4xl font-black mb-6 tracking-tight">
                Misi Kita
              </h2>
              <ul className="text-lg font-medium text-muted-foreground space-y-4">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 rounded-full bg-secondary shrink-0" />
                  Menyediakan wadah belajar Word, Excel, PowerPoint, sampai
                  coding & AI.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 rounded-full bg-secondary shrink-0" />
                  Membangun kolaborasi antar jurusan melalui proyek berbasis
                  teknologi.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 rounded-full bg-secondary shrink-0" />
                  Memberikan edukasi teknologi yang seru, asik, dan mudah
                  dipahami.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── STATS ───────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Anggota Aktif",
                value: "120+",
                color: "text-primary",
                bg: "bg-primary/10",
              },

              {
                label: "Divisi",
                value: String(divisions.length),
                color: "text-secondary",
                bg: "bg-secondary/10",
              },

              {
                label: "Event Tahunan",
                value: "10+",
                color: "text-purple-500",
                bg: "bg-purple-500/10",
              },

              {
                label: "Alumni Sukses",
                value: "50+",
                color: "text-foreground",
                bg: "bg-muted",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="neo-card rounded-2xl p-8 text-center neo-shadow-sm hover:neo-shadow-md hover:-translate-y-1 transition-all"
              >
                <div
                  className={`mx-auto size-16 rounded-xl ${stat.bg} flex items-center justify-center mb-6`}
                >
                  <h3 className={`text-3xl font-black ${stat.color}`}>
                    {stat.value}
                  </h3>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── VALUES ──────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Nilai-Nilai Kita
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Prinsip yang bikin Witech beda dari komunitas lain.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="neo-card rounded-3xl p-8 pt-12 relative hover:-translate-y-2 transition-transform bg-white">
              <div className="absolute -top-8 left-8 size-16 bg-accent border-2 border-border rounded-2xl flex items-center justify-center neo-shadow-sm">
                <HeartHandshake size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">
                Open & Inklusif
              </h3>
              <p className="text-base text-muted-foreground font-medium leading-relaxed">
                Tidak peduli latar belakang jurusan atau kemampuan awal. Jika
                kamu tertarik belajar teknologi, mulai dari dasar aplikasi
                kantor, desain, hingga pemrograman, kami siap membantumu
                berkembang.
              </p>
            </div>

            <div className="neo-card rounded-3xl p-8 pt-12 relative hover:-translate-y-2 transition-transform bg-white">
              <div className="absolute -top-8 left-8 size-16 bg-primary border-2 border-border rounded-2xl flex items-center justify-center neo-shadow-sm">
                <Lightbulb size={32} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">
                Kreatif & Menyenangkan
              </h3>
              <p className="text-base text-muted-foreground font-medium leading-relaxed">
                Belajar teknologi tidak harus membosankan. Kami menghadirkan
                pengalaman yang interaktif, mulai dari diskusi ringan, sesi
                praktik, hingga kegiatan kolaboratif yang membuat proses belajar
                terasa lebih hidup.
              </p>
            </div>

            <div className="neo-card rounded-3xl p-8 pt-12 relative hover:-translate-y-2 transition-transform bg-white">
              <div className="absolute -top-8 left-8 size-16 bg-secondary border-2 border-border rounded-2xl flex items-center justify-center neo-shadow-sm">
                <Globe
                  size={32}
                  className="text-foreground"
                  strokeWidth={2.5}
                />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">
                Bermanfaat
              </h3>
              <p className="text-base text-muted-foreground font-medium leading-relaxed">
                Keterampilan yang dipelajari di sini dirancang agar bisa
                digunakan dalam kehidupan nyata, mulai dari mendukung tugas
                akademik hingga membuka peluang kerja dan usaha di masa depan.
              </p>
            </div>
          </div>
        </section>

        {/* ── TIMELINE ────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Perjalanan Kami
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Dari komunitas kecil hingga berkembang menjadi wadah belajar
              teknologi yang lebih luas.
            </p>
          </div>
          <div className="relative border-l-2 border-border ml-4 space-y-12">
            {[
              {
                year: "2018",
                title: "WiTech berdiri",
                desc: "Dimulai dari kebutuhan mahasiswa untuk belajar perangkat lunak dasar dan keterampilan teknologi yang relevan dalam kegiatan akademik.",
                color: "bg-primary",
              },

              {
                year: "2020",
                title: "Ekspansi divisi",
                desc: "Memperluas ruang belajar ke bidang desain grafis, pengeditan video, dan dukungan perangkat digital untuk lebih banyak jurusan.",
                color: "bg-secondary",
              },

              {
                year: "2022",
                title: "Festival teknologi",
                desc: "Mengadakan kegiatan teknologi kampus yang menghadirkan banyak peserta dari berbagai latar belakang, termasuk non-IT.",
                color: "bg-accent",
              },

              {
                year: "2024",
                title: "Komunitas yang terus tumbuh",
                desc: "Menjadi wadah yang semakin banyak diminati mahasiswa dari berbagai fakultas untuk belajar dan berkolaborasi.",
                color: "bg-purple-500",
              },
            ].map((item, index) => (
              <div key={index} className={`relative flex items-center group`}>
                <div
                  className={`absolute -left-6 size-8 rounded-full border-4 border-background ${item.color} neo-shadow-sm`}
                />
                <div className={`w-full pl-8`}>
                  <div className="neo-card p-6 rounded-2xl bg-white hover:-translate-y-1 transition-transform neo-shadow-sm group-hover:neo-shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="font-black text-xl tracking-tight">
                        {item.title}
                      </h3>
                      <span className="font-bold px-3 py-1 bg-muted rounded-lg text-sm">
                        {item.year}
                      </span>
                    </div>
                    <p className="font-medium text-muted-foreground text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="text-center bg-primary border-2 border-border rounded-[2rem] p-12 md:p-20 neo-shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white">
                Siap mulai bersama kami?
              </h2>
              <p className="text-xl font-medium mb-10 max-w-2xl mx-auto text-white/90">
                Jangan ragu untuk bergabung. Kami menantikan kehadiranmu di
                WiTech.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-10 py-5 bg-background text-foreground text-xl font-black border-2 border-border rounded-2xl neo-shadow-sm hover:-translate-y-2 hover:neo-shadow-md hover:bg-accent transition-all"
              >
                Gabung Sekarang <ArrowRight size={24} strokeWidth={3} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicPageShell>
  )
}

export default About
