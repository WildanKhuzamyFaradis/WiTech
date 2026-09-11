import { useEffect, useRef } from 'react';
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, Code, Smartphone, Brain, Shield, Palette, Cpu, Sparkles } from "lucide-react";
import { divisions, projects } from "../lib/data";

// Scroll-triggered reveal hook using .reveal / .visible CSS classes
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('.reveal');
    if (targets.length === 0) {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
        { threshold: 0.12 }
      );
      el.classList.add('reveal');
      obs.observe(el);
      return () => obs.disconnect();
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, []);
  return ref;
}

const divisionIcons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Code, Smartphone, Brain, Shield, Palette, Cpu,
};

const stats = [
  { value: "120+", label: "Member Seru" },
  { value: "25+",  label: "Proyek & Event" },
  { value: "Semua", label: "Jurusan Welcome" },
  { value: "5",    label: "Divisi Kece" },
];

export default function Home() {
  const featured = projects.filter((p) => p.featured);
  const statsRef = useReveal();
  const divisionsRef = useReveal();
  const projectsRef = useReveal();
  const ctaRef = useReveal();

  return (
    <div className="bg-background text-foreground font-sans">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden mesh-bg border-b-2 border-border">
        {/* Floating Shapes */}
        <div className="absolute top-1/4 right-1/4 size-32 rounded-full bg-primary/20 blur-3xl anim-float" />
        <div className="absolute bottom-1/4 left-1/4 size-48 rounded-full bg-secondary/20 blur-3xl anim-float d-2" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-40 pt-48">
          <h1 className="anim-fade-up d-1 font-black leading-[1.05] mb-8 text-foreground" style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}>
            Teknologi Untuk <br />
            <span className="text-primary">Semua Jurusan.</span>
          </h1>

          <p className="anim-fade-up d-2 text-xl md:text-2xl text-foreground/80 font-medium max-w-2xl leading-relaxed mb-12">
            Dari belajar Word, Excel, desain grafis, coding, sampai benerin HP dan rakit PC semua bisa! Kita adalah komunitas buat siapa aja yang mau seru-seruan bareng teknologi.
          </p>

          <div className="anim-fade-up d-3 flex items-center gap-4 flex-wrap">
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background border-2 border-border rounded-xl text-lg font-bold neo-shadow-sm hover:bg-primary hover:text-white transition-all hover:-translate-y-1">
              Gabung Sekarang <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
            <Link to="/portfolio" className="inline-flex items-center gap-2 px-8 py-4 glass-card rounded-xl text-lg font-bold hover:bg-muted transition-all hover:-translate-y-1">
              Lihat Karya <ArrowUpRight size={20} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="bg-muted border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-border" ref={statsRef}>
            {stats.map((stat, i) => (
              <div key={stat.label} className="reveal py-16 px-8 flex flex-col items-center text-center group hover:bg-background transition-colors" style={{ transitionDelay: `${i * 0.1}s` }}>
                <p className="text-5xl md:text-6xl font-black text-foreground mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </p>
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVISIONS (Bento Grid) ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="mb-16 md:flex items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              Dari Excel sampai AI.
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              Gak cuma coding! Ada desain, troubleshooting, data, dan banyak lagi. Pilih yang paling cocok buat kamu.
            </p>
          </div>
          <Link to="/divisions" className="hidden md:inline-flex items-center gap-2 font-bold hover:text-primary transition-colors text-lg">
            Lihat Semua Divisi <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6" ref={divisionsRef}>
          {divisions.map((div, i) => {
            const Icon = divisionIcons[div.icon];
            // Create a bento grid layout
            let colSpan = "lg:col-span-4 md:col-span-3";
            if (i === 0) colSpan = "lg:col-span-8 md:col-span-6";
            else if (i === 1) colSpan = "lg:col-span-4 md:col-span-6";
            
            return (
              <Link
                key={div.id}
                to="/divisions"
                className={`reveal group neo-card rounded-2xl p-8 hover:-translate-y-1 transition-all neo-shadow-sm flex flex-col justify-between ${colSpan}`}
                style={{ transitionDelay: `${i * 0.1}s`, backgroundColor: i === 0 ? "var(--color-muted)" : "var(--color-card)" }}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="size-14 rounded-xl flex items-center justify-center neo-shadow-sm border-2 border-border bg-card group-hover:scale-110 transition-transform">
                      {Icon && (
                        <span style={{ color: div.color, display: 'flex' }}>
                          <Icon size={24} strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold bg-background px-3 py-1.5 rounded-full border border-border/50">
                      {div.memberCount} anak
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3">{div.name}</h3>
                  <p className="text-base text-muted-foreground font-medium mb-8 line-clamp-3 max-w-prose">
                    {div.description}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {div.technologies.slice(0, i === 0 ? 4 : 2).map((t) => (
                    <span key={t} className="text-xs font-bold border-2 border-border px-3 py-1.5 rounded-lg bg-background text-foreground/80">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FEATURED PROJECTS ─────────────────────────────── */}
      <section className="bg-foreground text-background border-y-2 border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 py-32 relative z-10">
          <div className="mb-16 md:flex items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">
                Bukan cuma teori.
              </h2>
              <p className="text-xl font-medium text-background/70">
                Dari workshop Excel sampai bikin aplikasi, dari desain poster sampai rakit PC semuanya dikerjain bareng.
              </p>
            </div>
            <Link to="/portfolio" className="hidden md:inline-flex items-center gap-2 font-bold hover:text-primary transition-colors text-lg text-white">
              Lihat Semua Proyek <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" ref={projectsRef}>
            {featured.map((project, i) => (
              <Link
                key={project.id}
                to="/portfolio"
                className="reveal group flex flex-col bg-card text-card-foreground border-2 border-border rounded-2xl overflow-hidden hover:-translate-y-2 transition-all neo-shadow-sm hover:neo-shadow-md"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="relative h-64 border-b-2 border-border overflow-hidden bg-muted">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {project.award && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-accent/90 backdrop-blur-sm rounded-lg font-bold text-xs text-foreground z-10">
                      🏆 {project.award.split("—")[0].trim()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{project.division}</span>
                    <span className="text-sm font-bold text-muted-foreground">{project.year}</span>
                  </div>
                  <h3 className="font-black text-2xl mb-3 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-base text-muted-foreground font-medium line-clamp-2 mb-6 flex-1">
                    {project.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs font-bold px-3 py-1 rounded-full bg-muted border border-border/10 text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="reveal relative rounded-3xl border-2 border-border p-12 md:p-24 text-center neo-shadow-lg overflow-hidden bg-white" ref={ctaRef}>
            {/* Gradient Glows */}
            <div className="absolute -top-32 -right-32 size-64 bg-primary/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-32 -left-32 size-64 bg-secondary/20 blur-3xl rounded-full" />
            
            <div className="relative z-10">
              <h2 className="font-black mb-8" style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}>
                Mulai Petualangan <br /> <span className="text-primary">Teknologimu!</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                Apapun jurusanmu teknik, sastra, ekonomi, sampai seni kalau kamu mau belajar teknologi, kamu diterima di sini! 🎉
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white border-2 border-border rounded-xl font-bold text-lg neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all">
                  Daftar Sekarang <ArrowRight size={20} strokeWidth={2.5} />
                </Link>
                <Link to="/about" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 glass-card rounded-xl font-bold text-lg hover:bg-muted transition-all">
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
