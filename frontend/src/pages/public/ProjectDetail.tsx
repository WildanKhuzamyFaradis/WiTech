import React from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, GitFork, ExternalLink, Award, Calendar, Users, Briefcase } from 'lucide-react';
import { useStore } from '../../lib/store';
import { divisionName, isPublishedProject } from '../../lib/dataContract';

export default function ProjectDetail() {
  const { projects, divisions } = useStore();
  const { slug } = useParams();
  const project = projects.find(p => p.slug === slug && isPublishedProject(p));

  if (!project) {
    return (
      <div className="public-page min-h-screen flex items-center justify-center bg-background font-sans pt-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight">Proyek tidak ditemukan</h1>
          <p className="text-muted-foreground font-medium">Proyek pada tautan ini tidak tersedia. Lihat portofolio untuk menemukan proyek lainnya.</p>
          <Link to="/portfolio" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-md border border-border transition-transform">
            <ArrowLeft size={18} /> Kembali ke portofolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-24">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative w-full min-h-[70vh] flex flex-col justify-end overflow-hidden mb-12 border-b border-border/10">
        <div className="absolute inset-0 bg-muted">
          <img loading="lazy" src={project.image} alt={project.title} className="w-full h-full object-cover" />
          
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full pb-12 pt-12 mt-auto">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/10">
            <ArrowLeft size={16} strokeWidth={3} className="transition-transform" /> 
            Kembali ke portofolio
          </Link>
          
          <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs font-semibold normal-case tracking-normal px-4 py-1.5 bg-primary text-white rounded-full">
                  {divisionName(divisions, project.divisionId)}
                </span>
                {project.featured && (
                  <span className="text-xs font-semibold normal-case tracking-normal px-4 py-1.5 bg-accent text-foreground rounded-full flex items-center gap-1.5"> Unggulan
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-4 text-foreground">{project.title}</h1>
              <p className="text-xl font-medium text-foreground/80 max-w-2xl">{project.subtitle}</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-card border border-border text-foreground font-medium rounded-md transition-all">
                  <GitFork size={18} strokeWidth={3} /> Kode sumber
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-primary text-white border border-border font-medium rounded-md transition-all">
                  Buka proyek <ExternalLink size={18} strokeWidth={3} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <div className="neo-card bg-white rounded-md p-8">
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">Tentang proyek</h2>
            <p className="text-base font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
          
          {project.award && (
            <div className="neo-card bg-[#ffe66d]/10 border border-[#ffe66d] rounded-md p-8 flex items-start gap-5">
              <div className="size-14 bg-[#ffe66d] border border-border rounded-md flex items-center justify-center shrink-0">
                <Award size={24} strokeWidth={2.5} className="text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 tracking-tight">Pencapaian</h3>
                <p className="font-medium text-muted-foreground">{project.award}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="neo-card bg-white rounded-md p-6">
            <h3 className="text-sm font-semibold normal-case tracking-normal text-muted-foreground mb-6">Informasi</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Calendar size={18} className="text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Tahun</p>
                  <p className="font-medium text-foreground">{project.year}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Briefcase size={18} className="text-secondary shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Divisi</p>
                  <p className="font-medium text-foreground">{divisionName(divisions, project.divisionId)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Users size={18} className="text-accent shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Tim proyek</p>
                  <div className="flex flex-wrap gap-2">
                    {project.members.map((member, i) => (
                      <span key={i} className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md border border-border/10 text-foreground">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="neo-card bg-white rounded-md p-6">
            <h3 className="text-sm font-semibold normal-case tracking-normal text-muted-foreground mb-4">Teknologi</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1.5 border border-border rounded-md bg-background text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
