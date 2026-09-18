import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
const links = [{label:"Tentang",to:"/about"},{label:"Divisi",to:"/divisions"},{label:"Portofolio",to:"/portfolio"},{label:"Anggota",to:"/members"},{label:"Galeri",to:"/gallery"},{label:"Kegiatan",to:"/events"},{label:"FAQ",to:"/faq"},{label:"Kontak",to:"/contact"}];
export default function Navbar(){
 const [open,setOpen]=useState(false);
 const {pathname}=useLocation();
 const toggle=useRef<HTMLButtonElement>(null);
 useEffect(()=>setOpen(false),[pathname]);
 return <header className="public-header" onKeyDown={e=>{if(e.key==='Escape' && open){setOpen(false);toggle.current?.focus();}}}>
  <nav className="public-container public-nav" aria-label="Navigasi utama">
   <Link to="/" className="brand" aria-label="WiTECH, beranda"><img src="/logo.png" alt=""/><span>WiTECH</span></Link>
   <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="public-navigation" aria-label={open?'Tutup menu':'Buka menu'} onClick={()=>setOpen(!open)}>{open?<X size={24}/>:<Menu size={24}/>}</button>
   <div id="public-navigation" className={`public-nav-links ${open?'is-open':''}`}>{links.map(link=><NavLink key={link.to} to={link.to}>{link.label}</NavLink>)}</div>
  </nav>
 </header>;
}
