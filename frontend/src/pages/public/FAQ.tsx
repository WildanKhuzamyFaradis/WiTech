import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useStore } from "../../lib/store";
export default function FAQ(){
 const {faqs}=useStore();const [open,setOpen]=useState<string|null>(null);
 return <div className="faq-page public-container"><header className="page-heading"><p className="eyebrow">FAQ</p><h1>Pertanyaan yang<br/><span>sering ditanyakan.</span></h1><p>Temukan informasi tentang pendaftaran, pilihan divisi, biaya, dan kegiatan WiTECH.</p></header>
 <div className="faq-layout"><p className="section-note">Tentang keanggotaan<br/>dan kegiatan kami</p><div>{faqs.map((faq,index)=><section className="faq-item" key={faq.id}><h2><button onClick={()=>setOpen(open===faq.id?null:faq.id)} aria-expanded={open===faq.id} aria-controls={`answer-${faq.id}`} id={`question-${faq.id}`}><span className="directory-number">{String(index+1).padStart(2,'0')}</span>{faq.question}<ChevronDown size={20} className={open===faq.id?'is-open':''}/></button></h2><div id={`answer-${faq.id}`} aria-labelledby={`question-${faq.id}`} hidden={open!==faq.id}><p>{faq.answer}</p></div></section>)}</div></div>
 <section className="home-contact"><div><h2>Ada pertanyaan lain?</h2><p>Hubungi pengurus jika informasi yang kamu cari belum tersedia di sini.</p></div><Link className="text-link" to="/contact">Hubungi kami <ArrowRight size={18}/></Link></section></div>;
}
