import { Link } from "react-router";
import { FolderOpen, Users, Image, ArrowRight, Award, TrendingUp, Zap, Building2, Calendar } from "lucide-react";
import { useStore } from "../../lib/store";

export default function AdminDashboard() {
  const { projects, members, divisions, albums, events } = useStore();
  const publishedProjects = projects.filter((p) => p.status === "published");

  const stats = [
    { 
      label: "Total Portofolio", 
      value: projects.length.toString(), 
      delta: `+${publishedProjects.length} dipublikasikan`, 
      icon: FolderOpen, 
      href: "/admin/portfolio", 
      color: "#6366f1" 
    },
    { 
      label: "Total Divisi", 
      value: divisions.length.toString(), 
      delta: `${members.length} anggota`, 
      icon: Building2, 
      href: "/admin/divisions", 
      color: "#ec4899" 
    },
    { 
      label: "Total Event", 
      value: events.length.toString(), 
      delta: `+${events.filter(e => e.isOpen).length} terbuka`, 
      icon: Calendar, 
      href: "/admin/events", 
      color: "#f97316" 
    },
    { 
      label: "Total Galeri", 
      value: albums.length.toString(), 
      delta: `+${albums.reduce((sum, a) => sum + a.photoCount, 0)} foto`, 
      icon: Image, 
      href: "/admin/gallery", 
      color: "#06b6d4" 
    },
  ];

  return (
    <div className="anim-fade-up">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2 tracking-tighter">Dashboard</h1>
        <p className="text-base font-medium text-muted-foreground">
          Selamat datang, Admin! Ini ringkasan kegiatan Witech.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.href}
              className="neo-card bg-white rounded-2xl p-6 hover:-translate-y-1 transition-all group neo-shadow-sm hover:neo-shadow-md"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="size-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={22} style={{ color: stat.color }} strokeWidth={2.5} />
                </div>
                <ArrowRight
                  size={18}
                  className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1"
                  strokeWidth={3}
                />
              </div>
              <p className="text-4xl font-black text-foreground mb-1 tracking-tight">{stat.value}</p>
              <p className="text-sm font-bold text-muted-foreground mb-3">{stat.label}</p>
              <p className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full inline-flex text-muted-foreground">
                <TrendingUp size={12} strokeWidth={3} className="text-secondary" /> {stat.delta}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="xl:col-span-2 neo-card bg-white rounded-3xl overflow-hidden neo-shadow-sm">
          <div className="px-6 py-5 border-b-2 border-border/10 flex items-center justify-between">
            <h2 className="font-black text-lg">Proyek Terbaru</h2>
            <Link
              to="/admin/portfolio"
              className="text-sm font-bold text-primary hover:underline underline-offset-4 transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-border/10">
            {publishedProjects.slice(0, 5).map((project) => (
              <div key={project.id} className="px-6 py-4 flex items-center gap-5 hover:bg-muted/30 transition-colors group">
                <div className="size-14 rounded-xl overflow-hidden border-2 border-border shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-foreground truncate mb-0.5 tracking-tight">{project.title}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{project.division}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-muted-foreground">{project.year}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary/10 text-secondary">
                    published
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Buat Portofolio", to: "/admin/portfolio", desc: "Tambah karya ke portfolio", icon: FolderOpen, color: "#6366f1" },
          { label: "Tambah Member", to: "/admin/members", desc: "Daftarin anggota baru", icon: Users, color: "#ec4899" },
          { label: "Upload Album", to: "/admin/gallery", desc: "Bikin galeri foto baru", icon: Image, color: "#06b6d4" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              to={a.to}
              className="neo-card bg-white rounded-2xl p-6 hover:-translate-y-1 transition-all group neo-shadow-sm hover:neo-shadow-md flex items-start gap-4"
            >
              <div className="size-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${a.color}15` }}>
                <Icon size={22} style={{ color: a.color }} strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-black text-lg text-foreground mb-1 group-hover:text-primary transition-colors tracking-tight">{a.label}</p>
                <p className="text-sm font-medium text-muted-foreground">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
