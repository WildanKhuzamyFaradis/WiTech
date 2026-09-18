import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "../../lib/store";
export default function Footer(){
 const {divisions}=useStore();
 return <footer className="public-footer"><div className="public-container">
  <div className="footer-grid"><div><Link to="/" className="brand"><img src="/logo.png" alt=""/><span>WiTECH</span></Link><p>UKM bidang teknologi untuk mahasiswa semua jurusan. Belajar dan berkarya bersama sejak 2018.</p><Link className="text-link" to="/contact">Hubungi kami <ArrowUpRight size={18}/></Link></div>
  <nav aria-label="Divisi WiTECH"><h2>Divisi WiTECH</h2>{divisions.map(d=><Link key={d.id} to="/divisions">{d.name}</Link>)}</nav>
  <nav aria-label="Tautan footer"><h2>Jelajahi WiTECH</h2>{[['/about','Tentang WiTECH'],['/portfolio','Portofolio'],['/members','Anggota'],['/events','Jadwal kegiatan'],['/gallery','Dokumentasi'],['/faq','Tanya jawab']].map(([to,label])=><Link key={to} to={to}>{label}</Link>)}</nav></div>
  <div className="footer-bottom"><p>© {new Date().getFullYear()} WiTECH. Hak cipta dilindungi.</p><p>Belajar dan berkarya bersama.</p></div>
 </div></footer>;
}
