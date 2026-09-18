import React from 'react';
import { useStore } from '../../lib/store';
import { Link } from 'react-router';
import { Users, Lightbulb, HeartHandshake, Rocket, Target, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

const About: React.FC = () => {
  const { divisions } = useStore();
  return (
    <div className="public-page min-h-screen bg-background text-foreground font-sans pt-12 pb-24 overflow-hidden">
      
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative px-6 mb-20">
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-accent text-xs font-medium normal-case tracking-normal mb-6">
              <span className="w-2 h-2 rounded-full bg-foreground" />
              Tentang WiTECH
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold mb-8 tracking-tight leading-[1.1]">
              Dari mahasiswa. <br />
              <span className="gradient-text">Untuk semua.</span>
            </h1>
            <p className="text-xl font-medium text-muted-foreground leading-relaxed mb-10 max-w-xl">
              WiTECH adalah UKM bidang teknologi untuk mahasiswa lintas jurusan. Kami belajar bersama, mengembangkan keterampilan, dan mengerjakan proyek yang dapat digunakan dalam kegiatan sehari-hari.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background border border-border rounded-md text-lg font-medium hover:bg-primary hover:text-white transition-all">
                Tanyakan pendaftaran <ArrowRight size={20} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
          
          <div className="relative lg:h-[500px] rounded-md border border-border p-8 bg-card flex flex-col justify-center gap-6 group transition-transform duration-200">
            <div className="absolute -right-6 -top-6 size-24 bg-accent rounded-full border border-border flex items-center justify-center">
              <Users size={40} className="text-foreground" strokeWidth={2.5} />
            </div>
            <div className="absolute -left-6 -bottom-6 size-20 bg-secondary rounded-md border border-border flex items-center justify-center rotate-12">
              <Lightbulb size={32} className="text-foreground" strokeWidth={2.5} />
            </div>
            
            <div className="bg-muted p-6 rounded-md border border-border flex items-center gap-4">
              <CheckCircle2 size={32} className="text-primary shrink-0" strokeWidth={2.5} />
              <p className="font-medium text-lg">Terbuka untuk semua jurusan.</p>
            </div>
            <div className="bg-muted p-6 rounded-md border border-border flex items-center gap-4 ml-8">
              <CheckCircle2 size={32} className="text-secondary shrink-0" strokeWidth={2.5} />
              <p className="font-medium text-lg">Mulai dari dasar, belajar bersama.</p>
            </div>
            <div className="bg-muted p-6 rounded-md border border-border flex items-center gap-4">
              <CheckCircle2 size={32} className="text-accent shrink-0" strokeWidth={2.5} />
              <p className="font-medium text-lg">Keterampilan yang bisa diterapkan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-20 relative">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="neo-card rounded-md p-10 lg:p-12 transition-transform bg-white">
            <div className="size-16 rounded-md bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
              <Target size={32} className="text-primary" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-semibold mb-6 tracking-tight">Visi kami</h2>
            <p className="text-lg font-medium text-muted-foreground leading-relaxed">
              Mewujudkan lingkungan kampus yang melek teknologi di semua disiplin ilmu. Setiap mahasiswa berhak belajar memanfaatkan teknologi dengan percaya diri.
            </p>
          </div>
          
          <div className="neo-card rounded-md p-10 lg:p-12 transition-transform bg-white text-foreground">
            <div className="size-16 rounded-md bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20">
              <Rocket size={32} className="text-secondary" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-semibold mb-6 tracking-tight">Misi kami</h2>
            <ul className="text-lg font-medium text-muted-foreground space-y-4">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 rounded-full bg-secondary shrink-0" />
                Menyediakan ruang belajar Word, Excel, PowerPoint, pemrograman, dan kecerdasan buatan (AI).
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 rounded-full bg-secondary shrink-0" />
                Membangun kolaborasi antarjurusan melalui proyek berbasis teknologi.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 rounded-full bg-secondary shrink-0" />
                Menyelenggarakan pembelajaran teknologi yang interaktif dan mudah dipahami.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Anggota aktif', value: '120+', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Divisi', value: String(divisions.length), color: 'text-secondary', bg: 'bg-secondary/10' },
            { label: 'Kegiatan tahunan', value: '10+', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Alumni', value: '50+', color: 'text-foreground', bg: 'bg-muted' },
          ].map((stat, i) => (
            <div key={i} className="neo-card rounded-md p-8 text-center transition-all">
              <div className={`mx-auto size-16 rounded-xl ${stat.bg} flex items-center justify-center mb-6`}>
                <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
              </div>
              <p className="text-sm font-medium normal-case tracking-normal text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUES ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Nilai yang kami pegang</h2>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Prinsip kami dalam belajar dan bekerja bersama.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="neo-card rounded-md p-8 pt-12 relative transition-transform bg-white">
            <div className="absolute -top-8 left-8 size-16 bg-accent border border-border rounded-md flex items-center justify-center">
              <HeartHandshake size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-semibold mb-4 tracking-tight">Terbuka untuk semua</h3>
            <p className="text-base text-muted-foreground font-medium leading-relaxed">
              Kamu tidak perlu memiliki latar belakang teknologi untuk bergabung. Mulai dari mengetik, mendesain poster, hingga memprogram robot, setiap anggota punya ruang untuk belajar.
            </p>
          </div>
          
          <div className="neo-card rounded-md p-8 pt-12 relative transition-transform bg-white">
            <div className="absolute -top-8 left-8 size-16 bg-primary border border-border rounded-md flex items-center justify-center">
              <Lightbulb size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-semibold mb-4 tracking-tight">Belajar secara interaktif</h3>
            <p className="text-base text-muted-foreground font-medium leading-relaxed">
              Kegiatan interaktif memberi ruang untuk mencoba dan bertukar pengalaman, dari membongkar laptop bersama hingga turnamen e-sports.
            </p>
          </div>

          <div className="neo-card rounded-md p-8 pt-12 relative transition-transform bg-white">
            <div className="absolute -top-8 left-8 size-16 bg-secondary border border-border rounded-md flex items-center justify-center">
              <Globe size={32} className="text-foreground" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-semibold mb-4 tracking-tight">Bisa diterapkan</h3>
            <p className="text-base text-muted-foreground font-medium leading-relaxed">
              Keterampilan yang dipelajari dapat digunakan untuk kebutuhan sehari-hari, termasuk mengerjakan skripsi atau menjalankan usaha daring.
            </p>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Perjalanan WiTECH</h2>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Perkembangan WiTECH sejak berdiri pada 2018.</p>
        </div>
        <div className="relative border-l-2 border-border ml-4 space-y-12">
          {[
            { year: '2018', title: 'WiTECH berdiri', desc: 'Dibentuk oleh mahasiswa untuk membantu teman-teman yang kesulitan menggunakan perangkat lunak dasar dalam kegiatan kampus.', color: 'bg-primary' },
            { year: '2020', title: 'Pengembangan divisi', desc: 'Memperluas bidang belajar ke desain grafis, penyuntingan video, dan penggunaan ponsel untuk menjangkau lebih banyak jurusan.', color: 'bg-secondary' },
            { year: '2022', title: 'Tech for All Festival', desc: 'Mengadakan festival teknologi kampus pertama dengan 70% peserta dari jurusan non-IT.', color: 'bg-accent' },
            { year: '2024', title: 'Anggota lintas fakultas', desc: 'Menghimpun anggota dari seluruh fakultas.', color: 'bg-purple-500' },
          ].map((item, index) => (
            <div key={index} className={`relative flex items-center group`}>
              <div className={`absolute -left-6 size-8 rounded-full border-4 border-background ${item.color} neo-shadow-sm`} />
              <div className={`w-full pl-8`}>
                <div className="neo-card p-6 rounded-md bg-white transition-transform">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-xl tracking-tight">{item.title}</h3>
                    <span className="font-medium px-3 py-1 bg-muted rounded-lg text-sm">{item.year}</span>
                  </div>
                  <p className="font-medium text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="text-center bg-primary border border-border rounded-md p-12 md:p-20 relative overflow-hidden">
          
          
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-white">
              Ingin bergabung?
            </h2>
            <p className="text-xl font-medium mb-10 max-w-2xl mx-auto text-white/90">
              Hubungi pengurus untuk mengetahui jadwal dan proses pendaftaran anggota WiTECH.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-10 py-5 bg-background text-foreground text-xl font-semibold border border-border rounded-md hover:bg-accent transition-all">
              Tanyakan pendaftaran <ArrowRight size={24} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;

