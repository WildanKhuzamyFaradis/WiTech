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


const Divisions = () => {
  const { divisions } = useStore();
  return (
    <div className="public-page bg-background text-foreground pt-12 pb-24 space-y-24 font-sans overflow-hidden">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-6 relative">
        
        
        
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-accent text-xs font-medium normal-case tracking-normal mb-6 mx-auto">
            <span className="w-2 h-2 rounded-full bg-foreground" />
            Divisi WiTECH
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-6">
            Temukan minatmu. <br />
            <span className="gradient-text">Belajar bersama.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
            WiTECH terbuka untuk <strong>semua jurusan</strong>. Kenali bidang yang dikerjakan setiap divisi, dari pembelajaran dan pengembangan proyek hingga desain, kemitraan, dan riset.
          </p>
        </div>
      </section>

      {/* ── DIVISION CARDS ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="division-grid">
          {divisions.map((division, i) => {
            const Icon = iconMap[division.id] || Code;
            
            return (
              <div 
                key={division.id} 
                className="division-entry group neo-card rounded-md overflow-hidden transition-all duration-200 bg-white relative"
              >
                {/* Colored top banner */}
                
                
                {/* Card content */}
                <div className="p-8">
                  {/* Icon + member count row */}
                  <div className="flex items-start justify-between mb-6">
                    <div 
                      className="w-16 h-16 rounded-md flex items-center justify-center border border-border group-hover:scale-110 transition-all duration-200"
                      style={{ backgroundColor: `${division.color}15` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: division.color }} strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border/20">
                      <Users size={14} className="text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{division.memberCount}</span>
                    </div>
                  </div>
                  
                  {/* Emoji + Title */}
                  <div className="flex items-center gap-3 mb-4">
                    
                    <h2 className="text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">{division.name}</h2>
                  </div>

                  {/* Description */}
                  <p className="text-base text-muted-foreground font-medium mb-8 leading-relaxed">
                    {division.description}
                  </p>
                  
                  {/* Tech badges */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-xs normal-case tracking-normal flex items-center gap-2">
                      <Sparkles size={14} style={{ color: division.color }} />
                      Bidang kegiatan
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {division.technologies.map((tech: string) => (
                        <span 
                          key={tech} 
                          className="px-3 py-1.5 rounded-md text-xs font-medium border transition-all group-hover:border-border/30"
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
        <div className="neo-card rounded-md p-12 md:p-16 border border-border relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
          
          
          
          <div className="relative z-10">
            <div className="text-center mb-16">
              
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Bagaimana proses belajarnya?</h2>
              <p className="text-lg text-muted-foreground font-medium">Belajar bertahap, mencoba langsung, lalu membuat karya.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Mulai dari dasar", desc: "Pelajari materi dasar sebelum melanjutkan ke topik yang lebih mendalam.", icon: BookOpen, color: "var(--color-primary)", emoji: "🌱" },
                { num: "02", title: "Praktik langsung", desc: "Terapkan materi melalui latihan dan proyek bersama.", icon: Zap, color: "var(--color-secondary)", emoji: "⚡" },
                { num: "03", title: "Buat karya", desc: "Kumpulkan hasil proyek sebagai portofolio untuk melamar magang atau kerja. Keren kan?", icon: Sparkles, color: "var(--color-accent)", emoji: "🏆" },
              ].map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.num} className="group bg-white rounded-md p-8 border border-border transition-all relative overflow-hidden">
                    {/* Number watermark */}
                    <span className="absolute -top-4 -right-2 text-8xl font-semibold opacity-5 select-none">{step.num}</span>
                    
                    <div className="relative z-10">
                      
                      <h3 className="text-xl font-semibold mb-3 tracking-tight">{step.title}</h3>
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
        <div className="bg-foreground text-background p-12 md:p-16 rounded-md border border-border text-center relative overflow-hidden">
          
          
          
          
          <div className="relative z-10">
            
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-white">Ingin bergabung?</h2>
            <p className="text-xl font-medium max-w-2xl mx-auto mb-10 text-background/80 leading-relaxed">
              Belajar dan berkarya bersama mahasiswa lintas jurusan. Hubungi pengurus untuk informasi pendaftaran.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white border border-border rounded-md font-semibold text-xl transition-transform group">
              Tanyakan pendaftaran <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Divisions;
