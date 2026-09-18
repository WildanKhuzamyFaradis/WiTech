import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Sparkles } from 'lucide-react';
import { albums } from '../../lib/data';

export default function Gallery() {
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const openLightbox = (album: any, index: number = 0) => {
    setSelectedAlbum(album);
    setCurrentPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedAlbum(null);
  };

  const prevPhoto = (e?: React.MouseEvent | KeyboardEvent) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (selectedAlbum && selectedAlbum.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length);
    }
  };

  const nextPhoto = (e?: React.MouseEvent | KeyboardEvent) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (selectedAlbum && selectedAlbum.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % selectedAlbum.photos.length);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedAlbum) return;
      if (e.key === 'ArrowRight') nextPhoto(e);
      if (e.key === 'ArrowLeft') prevPhoto(e);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAlbum]);

  return (
    <div className="min-h-screen bg-background font-sans pt-32 pb-24 overflow-hidden">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-6 mb-16 relative">
        <div className="absolute top-0 left-10 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-muted text-xs font-bold uppercase tracking-widest mb-6 neo-shadow-sm mx-auto">
            <Sparkles size={16} className="text-secondary" strokeWidth={2.5} />
            Dokumentasi Witech
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
            Momen Seru <br />
            <span className="gradient-text">Bareng!</span>
          </h1>
          <p className="text-xl font-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Intip keseruan kegiatan Witech! Dari kelas bareng ngebahas cara bikin presentasi kece, belajar Excel, benerin PC, sampai event seru lainnya.
          </p>
        </div>
      </section>

      {/* ── GALLERY GRID ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album: any, idx: number) => (
            <div 
              key={album.id || idx} 
              className="neo-card bg-white rounded-3xl overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300 neo-shadow-sm hover:neo-shadow-md"
              onClick={() => openLightbox(album)}
              style={{ animationDelay: `${(idx % 6) * 0.1}s` }}
            >
              <div className="relative aspect-[4/3] border-b-2 border-border overflow-hidden bg-muted">
                <img 
                  src={album.coverImage || album.image || album.photos?.[0]?.url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"} 
                  alt={album.title || "Gallery"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-border/20 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 neo-shadow-sm z-10 text-foreground">
                  <Camera size={14} strokeWidth={2.5} />
                  <span>{album.photos?.length || 1} Foto</span>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-2xl mb-3 tracking-tight group-hover:text-primary transition-colors line-clamp-1">{album.title || "Keseruan Witech"}</h3>
                  <p className="text-sm font-medium text-muted-foreground line-clamp-2">{album.description || "Bareng-bareng belajar dan nambah pengalaman baru."}</p>
                </div>
                
                {album.photos && album.photos.length > 0 && (
                  <div className="mt-6 flex gap-2 pt-6 border-t-2 border-border/10">
                    {album.photos.slice(0, 3).map((photo: any, i: number) => (
                      <button 
                        key={i} 
                        className="w-12 h-12 border-2 border-border rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform group/thumb relative"
                        onClick={(e) => { e.stopPropagation(); openLightbox(album, i); }}
                      >
                        <img src={photo.url || photo} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                      </button>
                    ))}
                    {album.photos.length > 3 && (
                      <div className="w-12 h-12 border-2 border-border rounded-xl bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                        +{album.photos.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIGHTBOX ─────────────────────────────────────────── */}
      {selectedAlbum && (
        <div 
          className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 bg-card border-2 border-border neo-shadow-sm rounded-full p-3 hover:scale-110 hover:bg-primary hover:text-white transition-all z-10 text-foreground"
            onClick={closeLightbox}
          >
            <X size={24} strokeWidth={3} />
          </button>
          
          <div className="relative w-full max-w-6xl flex items-center justify-between gap-6" onClick={e => e.stopPropagation()}>
            <button 
              className="hidden md:flex bg-card border-2 border-border neo-shadow-sm rounded-full p-4 hover:scale-110 hover:bg-primary hover:text-white transition-all shrink-0 text-foreground"
              onClick={prevPhoto}
            >
              <ChevronLeft size={32} strokeWidth={3} />
            </button>
            
            <div className="w-full max-h-[85vh] flex flex-col items-center">
              <div className="relative neo-card bg-card border-2 border-border rounded-3xl overflow-hidden mb-6 p-2 w-full flex justify-center h-[65vh] md:h-[75vh]">
                <img 
                  src={selectedAlbum.photos?.[currentPhotoIndex]?.url || selectedAlbum.photos?.[currentPhotoIndex] || selectedAlbum.image} 
                  alt="Gallery full view" 
                  className="w-auto h-full object-contain rounded-2xl border-2 border-border"
                />
                
                {/* Mobile Navigation overlays */}
                <div className="md:hidden absolute inset-y-0 left-0 w-1/3" onClick={prevPhoto} />
                <div className="md:hidden absolute inset-y-0 right-0 w-1/3" onClick={nextPhoto} />
              </div>
              
              {selectedAlbum.photos?.[currentPhotoIndex]?.caption && (
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 border border-white/20 rounded-2xl">
                  <p className="font-bold text-white text-lg tracking-tight">
                    {selectedAlbum.photos[currentPhotoIndex].caption}
                  </p>
                </div>
              )}
            </div>

            <button 
              className="hidden md:flex bg-card border-2 border-border neo-shadow-sm rounded-full p-4 hover:scale-110 hover:bg-primary hover:text-white transition-all shrink-0 text-foreground"
              onClick={nextPhoto}
            >
              <ChevronRight size={32} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

