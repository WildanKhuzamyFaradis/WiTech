import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { useStore } from "../../lib/store";
import { formatEventDate } from "../../lib/dataContract";

export default function Gallery(){
 const {albums}=useStore();
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [index,setIndex]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement|null>(null);
 const album=albums.find(a=>a.id===selectedId);
 const photos=album ? (album.photos.length ? album.photos : album.coverImage ? [album.coverImage] : []) : [];
 const close=()=>{dialog.current?.close();setSelectedId(null);trigger.current?.focus();};
 useEffect(()=>{
  if(!album) return;
  dialog.current?.showModal();
  const original=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return ()=>{document.body.style.overflow=original;};
 },[album]);
 const move=(step:number)=>{if(photos.length)setIndex(i=>(i+step+photos.length)%photos.length);};
 return <div className="public-container gallery-page"><header className="page-heading"><p className="eyebrow">Dokumentasi WiTECH</p><h1>Kegiatan kami<br/><span>dalam foto.</span></h1><p>Lihat dokumentasi kegiatan WiTECH, dari lokakarya dan orientasi anggota hingga kompetisi dan proyek bersama.</p></header>
 <div className="gallery-grid">{albums.map(a=><article key={a.id}><button className="album-entry" onClick={e=>{trigger.current=e.currentTarget;setIndex(0);setSelectedId(a.id);}} aria-label={`Buka album ${a.title}`}>
 <img src={a.coverImage || a.photos[0]} alt={a.title} loading="lazy"/><div className="work-meta"><span>{formatEventDate(a.date)}</span><span>{a.photos.length} foto</span></div><h2>{a.title} <ArrowUpRight size={18} className="inline"/></h2><p>{a.description}</p></button></article>)}</div>
 {!albums.length && <p className="pb-12">Belum ada dokumentasi yang ditampilkan.</p>}
 <dialog className="gallery-dialog" ref={dialog} aria-labelledby="album-heading" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}}>
 <header><h2 id="album-heading">{album?.title}</h2><button onClick={close} aria-label="Tutup album" autoFocus><X size={22}/></button></header>
 {photos.length ? <img src={photos[index % photos.length]} alt={`${album?.title}, foto ${index+1}`}/> : <p>Album ini belum memiliki foto.</p>}
 <footer><button onClick={()=>move(-1)} disabled={photos.length<2} aria-label="Foto sebelumnya"><ChevronLeft size={20}/>Sebelumnya</button><p aria-live="polite">{photos.length ? `${index+1} / ${photos.length}`:'0 foto'}</p><button onClick={()=>move(1)} disabled={photos.length<2} aria-label="Foto berikutnya">Berikutnya<ChevronRight size={20}/></button></footer>
 </dialog></div>;
}
