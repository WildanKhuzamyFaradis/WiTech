import React from 'react';
import { Smartphone, Palette, Code, Brain, Shield, Cpu, ArrowRight, Sparkles, Users, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { useStore } from '../../lib/store';

const iconMap: Record<string, React.ElementType> = {
  academy: Smartphone,
  creative: Palette,
  lab: Code,
  research: Brain,
  connect: Shield,
  hardware: Cpu,
};

const emojiMap: Record<string, string> = {
  academy: "🎓",
  lab: "🔬",
  creative: "🎨",
  connect: "🤝",
  research: "📊",
  hardware: "🔧",
};

const Divisions = () => {
  const { divisions } = useStore();
  return (
    <div className="bg-background text-foreground pt-32 pb-24 space-y-24 font-sans overflow-hidden">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-6 relative">
        <div className="absolute top-0 right-10 w-72 h-72 bg-secondary/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-primary/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-accent text-xs font-bold uppercase tracking-widest mb-6 neo-shadow-sm mx-auto">
            <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            Divisi Witech
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
            Pilih Jalanmu. <br />
            <span className="gradient-text">Belajar Bareng!</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
            Nggak ada background IT? Nggak masalah! Witech terbuka buat <strong>SEMUA JURUSAN</strong>. Dari Word, desain grafis, sampai coding, kita belajar bareng dari nol!
          </p>
        </div>
      </section>

      {/* ── DIVISION CARDS ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {divisions.map((division, i) => {
            const Icon = iconMap[division.id] || Code;
            const emoji = emojiMap[division.id] || "⚡";
            
            return (
              <div 
                key={division.id} 
                className="group neo-card rounded-3xl overflow-hidden hover:-translate-y-3 transition-all duration-500 neo-shadow-sm hover:neo-shadow-lg bg-white relative"
              >
                {/* Colored top banner */}
                <div 
                  className="h-3 w-full"
                  style={{ background: `linear-gradient(90deg, ${division.color}, ${division.color}88)` }}
                />
                
                {/* Card content */}
                <div className="p-8">
                  {/* Icon + member count row */}
                  <div className="flex items-start justify-between mb-6">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-border neo-shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                      style={{ backgroundColor: `${division.color}15` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: division.color }} strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border/20">
                      <Users size={14} className="text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">{division.memberCount}</span>
                    </div>
                  </div>
                  
                  {/* Emoji + Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{emoji}</span>
                    <h2 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{division.name}</h2>
                  </div>

                  {/* Description */}
                  <p className="text-base text-muted-foreground font-medium mb-8 leading-relaxed">
                    {division.description}
                  </p>
                  
                  {/* Tech badges */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={14} style={{ color: division.color }} />
                      Yang Dipelajari
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {division.technologies.map((tech: string) => (
                        <span 
                          key={tech} 
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all group-hover:border-border/30"
                          style={{ 
                            backgroundColor: `${division.color}10`, 
                            borderColor: `${division.color}25`,
                            color: division.color 
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="neo-card rounded-[2rem] p-12 md:p-16 border-2 border-border neo-shadow-md relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
          <div className="absolute -top-16 -right-16 size-48 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="text-center mb-16">
              <span className="text-5xl mb-4 block">🚀</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Gimana sih belajarnya?</h2>
              <p className="text-lg text-muted-foreground font-medium">Tiga langkah simpel buat jadi pro!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Mulai dari Nol", desc: "Kita ajarin hal-hal basic sampai advanced. Santai aja, semua orang pasti bisa!", icon: BookOpen, color: "var(--color-primary)", emoji: "🌱" },
                { num: "02", title: "Praktek Langsung", desc: "Banyakin hands-on project biar skill kamu makin terasah dan siap pakai.", icon: Zap, color: "var(--color-secondary)", emoji: "⚡" },
                { num: "03", title: "Bikin Karya", desc: "Bangun portfolio keren buat modal magang atau kerja nanti. Keren kan?", icon: Sparkles, color: "var(--color-accent)", emoji: "🏆" },
              ].map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.num} className="group bg-white rounded-2xl p-8 border-2 border-border neo-shadow-sm hover:neo-shadow-md hover:-translate-y-2 transition-all relative overflow-hidden">
                    {/* Number watermark */}
                    <span className="absolute -top-4 -right-2 text-8xl font-black opacity-5 select-none">{step.num}</span>
                    
                    <div className="relative z-10">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border-2 border-border neo-shadow-sm group-hover:rotate-6 transition-transform"
                        style={{ backgroundColor: `${step.color}15` }}
                      >
                        <span className="text-2xl">{step.emoji}</span>
                      </div>
                      <h3 className="text-xl font-black mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-base font-medium text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-foreground text-background p-12 md:p-16 rounded-[2rem] border-2 border-border text-center neo-shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <span className="text-5xl mb-6 block">✨</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-white">Tertarik Buat Join?</h2>
            <p className="text-xl font-medium max-w-2xl mx-auto mb-10 text-background/80 leading-relaxed">
              Yuk gabung sama teman-teman lintas jurusan lainnya. Kita tunggu kontribusi dan karya keren kamu di Witech!
            </p>
            <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white border-2 border-border rounded-2xl font-black text-xl hover:-translate-y-2 transition-transform neo-shadow-sm hover:neo-shadow-md group">
              Daftar Sekarang <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Divisions;
