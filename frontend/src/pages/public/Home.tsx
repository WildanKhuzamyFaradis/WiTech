import { Link } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useStore } from "../../lib/store";
import { divisionName, isPublishedProject, formatEventDate } from "../../lib/dataContract";

export default function Home() {
  const { divisions, projects, albums } = useStore();
  const featured = projects.filter(p => isPublishedProject(p) && p.featured);
  const lead = featured[0];
  return <div className="home-page">
    <section className="public-container home-hero">
      <div>
        <p className="eyebrow">WiTECH / Unit kegiatan mahasiswa</p>
        <h1>Teknologi untuk <span>semua jurusan.</span></h1>
        <p className="hero-intro">WiTECH adalah unit kegiatan mahasiswa (UKM) bidang teknologi yang terbuka untuk semua jurusan. Kenali divisi, proyek, dan kegiatan kami, dari belajar Excel hingga mengembangkan aplikasi.</p>
        <div className="action-row"><Link className="public-button" to="/divisions">Kenali divisi <ArrowRight size={18} /></Link><Link className="text-link" to="/portfolio">Lihat proyek <ArrowUpRight size={18} /></Link></div>
      </div>
      {lead && <figure className="hero-work">
        <Link to={`/portfolio/${lead.slug}`} aria-label={`Lihat proyek ${lead.title}`}><img src={lead.image} alt={lead.title} fetchPriority="high" /></Link>
        <figcaption><span>Proyek anggota / {lead.year}</span><Link to={`/portfolio/${lead.slug}`}>{lead.title} <ArrowUpRight size={20} /></Link><p>{lead.subtitle}</p></figcaption>
      </figure>}
    </section>
    <section className="public-container home-divisions">
      <div className="section-intro"><p className="eyebrow">Bidang kegiatan</p><h2>Dari Excel<br />sampai AI.</h2><p>Pelajari desain, pemrograman, pengolahan data, hingga kecerdasan buatan (AI). Pilih bidang sesuai minatmu.</p><Link className="text-link" to="/divisions">Kenali semua divisi <ArrowRight size={18} /></Link></div>
      <div className="division-directory">{divisions.map((division,index)=><Link key={division.id} to="/divisions"><span className="directory-number">{String(index+1).padStart(2,'0')}</span><div><h3>{division.name}</h3><p>{division.description}</p></div><ArrowUpRight size={20} /></Link>)}</div>
    </section>
    <section className="home-work"><div className="public-container">
      <div className="section-heading"><div><p className="eyebrow">Portofolio</p><h2>Bukan cuma teori.</h2></div><Link className="text-link" to="/portfolio">Lihat semua proyek <ArrowRight size={18} /></Link></div>
      <div className="work-grid">{featured.map(project=><article key={project.id}>
        <Link className="work-image" to={`/portfolio/${project.slug}`}><img loading="lazy" src={project.image} alt={project.title} /></Link>
        <p className="work-meta">{divisionName(divisions,project.divisionId)} <span>{project.year}</span></p>
        <h3><Link to={`/portfolio/${project.slug}`}>{project.title} <ArrowUpRight size={20} /></Link></h3><p>{project.subtitle}</p>
      </article>)}</div>
    </div></section>
    <section className="public-container home-community">
      <div><p className="eyebrow">Di balik WiTECH</p><h2>Belajar bersama.<br />Berkarya bersama.</h2><p>Kenali pengurus dan anggota yang menjalankan kegiatan WiTECH, lalu lihat dokumentasi kegiatan kami.</p><div className="action-row"><Link className="text-link" to="/members">Kenali anggota <ArrowRight size={18}/></Link><Link className="text-link" to="/events">Jadwal kegiatan <ArrowRight size={18}/></Link></div></div>
      <div className="album-list">{albums.slice(0,2).map(album=><Link key={album.id} to="/gallery"><img src={album.coverImage} alt={album.title} loading="lazy"/><div><p className="work-meta">{formatEventDate(album.date)}</p><h3>{album.title}</h3><span className="text-link">Lihat dokumentasi <ArrowUpRight size={16}/></span></div></Link>)}</div>
    </section>
    <section className="public-container home-contact"><div><p className="eyebrow">Terbuka untuk semua jurusan</p><h2>Mulai dari rasa ingin tahu.</h2><p>Hubungi pengurus untuk informasi pendaftaran atau kerja sama.</p></div><Link className="public-button" to="/contact">Hubungi kami <ArrowRight size={18}/></Link></section>
  </div>;
}
