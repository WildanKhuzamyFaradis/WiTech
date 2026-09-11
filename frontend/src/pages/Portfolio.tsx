import React, { useState } from 'react';
import { ExternalLink, GitFork, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { projects } from '../lib/data';
import { Link } from 'react-router';

const Portfolio = () => {
  const [filter, setFilter] = useState('all');

  // get unique division ids from projects
  const divisions = ['all', ...Array.from(new Set(projects.map((p) => p.divisionId)))];
  
  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.divisionId === filter);

  const getDivisionLabel = (id: string) => {
    switch(id) {
      case 'all': return 'Semua Karya';
      case 'digilit': return 'Digital Literacy';
      case 'creative': return 'Creative & Design';
      case 'webapp': return 'Web & App';
      case 'dataai': return 'Data & AI';
      case 'cybernet': return 'Cybersecurity';
      case 'hardware': return 'Hardware & IoT';
      default: return id;
    }
  };

  return (
    <div className="bg-background text-foreground pt-32 pb-24 space-y-16 font-sans min-h-screen">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-6 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2 neo-shadow-sm">
          <Sparkles size={16} strokeWidth={2.5} />
          Galeri Inovasi
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
          Karya Kita <br />
          <span className="text-primary">Bareng-Bareng!</span>
        </h1>
        <p className="text-xl font-medium text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Nih lihat hasil karya teman-teman Witech dari berbagai jurusan! Ada aplikasi, desain, materi pelatihan Excel, sampai inovasi IoT. Keren abis!
        </p>
      </section>

      {/* ── FILTERS (Pill buttons) ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-3">
          {divisions.map((div) => (
            <button
              key={div}
              onClick={() => setFilter(div)}
              className={`px-6 py-3 rounded-full border-2 font-bold text-sm transition-all duration-300 ${
                filter === div 
                  ? 'border-border bg-primary text-white' 
                  : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {getDivisionLabel(div)}
            </button>
          ))}
        </div>
      </div>

      {/* ── PORTFOLIO GRID (Masonry style approx) ───────────── */}
      <div className="max-w-7xl mx-auto px-6">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, i) => (
              <div 
                key={project.id} 
                className="group flex flex-col bg-card rounded-[2rem] border-2 border-border overflow-hidden hover:-translate-y-2 transition-all duration-500 neo-shadow-sm hover:neo-shadow-md"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Image container made significantly larger (aspect-4/3) and full-bleed */}
                <Link to={`/portfolio/${project.slug}`} className="relative aspect-[4/3] border-b-2 border-border bg-muted block overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/f1f5f9/64748b?text=No+Image' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {project.award && (
                    <div className="absolute top-4 left-4 bg-accent px-3 py-1.5 rounded-xl border-2 border-border text-xs font-bold neo-shadow-sm flex items-center gap-1.5 text-foreground z-10">
                      <Trophy size={14} strokeWidth={2.5} /> Unggulan
                    </div>
                  )}
                  
                  {/* Hover reveal link */}
                  <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <span className="flex items-center justify-center size-10 rounded-full bg-white text-foreground border-2 border-border neo-shadow-sm">
                      <ArrowRight size={18} strokeWidth={2.5} />
                    </span>
                  </div>
                </Link>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {getDivisionLabel(project.divisionId)}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {project.year}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                    <Link to={`/portfolio/${project.slug}`}>{project.title}</Link>
                  </h3>
                  <p className="text-sm font-bold text-muted-foreground mb-4">{project.subtitle}</p>
                  
                  <p className="text-base font-medium text-foreground/80 mb-8 flex-grow line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 bg-muted/50 border border-border/10 rounded-xl text-xs font-bold text-muted-foreground group-hover:border-border/30 transition-colors">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="px-3 py-1.5 bg-muted/50 border border-border/10 rounded-xl text-xs font-bold text-muted-foreground">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t-2 border-border/10">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-background border-2 border-transparent hover:border-border transition-all">
                        <GitFork size={18} strokeWidth={2.5} /> <span className="text-sm font-bold">Source</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl border-2 border-border neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all">
                        <ExternalLink size={18} strokeWidth={2.5} /> <span className="text-sm font-bold">Live</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white border-2 border-border rounded-[3rem] neo-shadow-sm max-w-3xl mx-auto flex flex-col items-center">
            <div className="size-24 bg-muted rounded-full flex items-center justify-center text-4xl mb-6">
              👀
            </div>
            <h3 className="text-3xl font-black mb-4 tracking-tight">Belum ada karya nih!</h3>
            <p className="text-lg font-medium text-muted-foreground max-w-md mx-auto mb-8">
              Pilih kategori divisi yang lain, atau gabung Witech buat bikin karya pertama di sini!
            </p>
            <button 
              onClick={() => setFilter('all')}
              className="px-6 py-3 bg-foreground text-background font-bold rounded-xl border-2 border-border neo-shadow-sm hover:-translate-y-1 transition-transform"
            >
              Lihat Semua Karya
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

