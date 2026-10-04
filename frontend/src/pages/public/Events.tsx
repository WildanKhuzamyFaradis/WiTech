import React, { useId, useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { usePublicData } from '../../context/PublicDataContext';
import PublicPageShell from '../../components/public/PublicPageShell';
import type { Event } from '../../lib/types';
import { formatEventDate, formatEventTime, isEventCompleted } from '../../lib/dataContract';
const EventCard = ({ event, index }: { event: Event, index: number }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const descriptionId = useId();
  const completed = isEventCompleted(event);
  const registrationLink = event.registrationLink?.trim();
  return (
  <div 
    className="group neo-card rounded-3xl overflow-hidden bg-white neo-shadow-sm hover:neo-shadow-md transition-all hover:-translate-y-1 flex flex-col sm:flex-row lg:flex-col xl:flex-row"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="sm:w-2/5 lg:w-full xl:w-2/5 relative border-b-2 sm:border-b-0 sm:border-r-2 lg:border-r-0 lg:border-b-2 xl:border-b-0 xl:border-r-2 border-border bg-muted shrink-0">
      <img 
        src={event.image} 
        alt={event.title} 
        className="w-full h-full object-cover aspect-video sm:aspect-auto group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border/20 text-xs font-black uppercase tracking-wider neo-shadow-sm">
        {event.type}
      </div>
      {isEventCompleted(event) && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
          <span className="bg-foreground text-background font-black px-4 py-2 rounded-xl border-2 border-border neo-shadow-sm rotate-[-10deg]">
            SUDAH SELESAI
          </span>
        </div>
      )}
    </div>
    
    <div className="p-6 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors">{event.title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 text-muted-foreground font-medium text-sm">
            <Calendar size={16} strokeWidth={2.5} className="text-primary" />
            <span>{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground font-medium text-sm">
            <Clock size={16} strokeWidth={2.5} className="text-secondary" />
            <span>{formatEventTime(event)}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground font-medium text-sm">
            <MapPin size={16} strokeWidth={2.5} className="text-accent" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <p id={descriptionId} className={`text-sm font-medium text-muted-foreground whitespace-pre-wrap break-words mb-6 ${detailsOpen ? '' : 'line-clamp-2'}`}>
          {event.description.trim() || 'Deskripsi event belum tersedia.'}
        </p>
      </div>
      
      <div className="space-y-3">
        <button
          type="button"
          aria-expanded={detailsOpen}
          aria-controls={descriptionId}
          onClick={() => setDetailsOpen(open => !open)}
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-white text-foreground font-black rounded-xl border-2 border-border neo-shadow-sm hover:neo-shadow-md transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {detailsOpen ? 'Tutup detail' : 'Lihat detail'}
        </button>
        {event.registrationOpen && !completed && registrationLink ? (
          <a 
            href={registrationLink}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-white font-black rounded-xl border-2 border-border neo-shadow-sm hover:neo-shadow-md hover:-translate-y-1 transition-all"
          >
            Daftar <ArrowRight size={18} strokeWidth={3} />
          </a>
        ) : (
          <p className="text-center text-sm font-medium text-muted-foreground">
            {completed ? 'Event sudah selesai' : event.registrationOpen ? 'Link pendaftaran belum tersedia' : 'Pendaftaran ditutup'}
          </p>
        )}
      </div>
    </div>
  </div>
  );
};

export default function Events() {
  const { data, loading, error } = usePublicData();
  const events = data?.events ?? [];
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  // Registration can close before an event ends. Group by the event end time in WIB.
  const filteredEvents = events.filter(e => {
    if (filter === "upcoming") return !isEventCompleted(e);
    if (filter === "past") return isEventCompleted(e);
    return true;
  });

  return (
    <PublicPageShell loading={loading} error={error}>
    <div className="min-h-screen bg-background font-sans pt-32 pb-24 overflow-hidden">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-6 mb-16 relative">
        <div className="absolute top-0 right-10 w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-secondary/20 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-muted text-xs font-bold uppercase tracking-widest mb-6 neo-shadow-sm mx-auto">
            <Sparkles size={16} className="text-accent" strokeWidth={2.5} />
            Event Witech
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
            Jadwal & <br />
            <span className="gradient-text">Kegiatan Seru.</span>
          </h1>
          <p className="text-xl font-medium text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Jangan sampai ketinggalan! Cek jadwal workshop, kelas, dan event bareng Witech. Terbuka untuk semua jurusan lho!
          </p>
        </div>
      </section>

      {/* ── FILTER ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-12 flex justify-center relative z-10">
        <div className="inline-flex p-1.5 bg-card border-2 border-border rounded-full neo-shadow-sm">
          <button 
            onClick={() => setFilter("all")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === "all" ? "bg-primary text-white border-2 border-border neo-shadow-sm" : "text-muted-foreground hover:text-foreground border-2 border-transparent"}`}
          >
            Semua
          </button>
          <button 
            onClick={() => setFilter("upcoming")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === "upcoming" ? "bg-accent text-foreground border-2 border-border neo-shadow-sm" : "text-muted-foreground hover:text-foreground border-2 border-transparent"}`}
          >
            Akan Datang
          </button>
          <button 
            onClick={() => setFilter("past")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === "past" ? "bg-muted text-foreground border-2 border-border neo-shadow-sm" : "text-muted-foreground hover:text-foreground border-2 border-transparent"}`}
          >
            Selesai
          </button>
        </div>
      </section>

      {/* ── EVENTS LIST ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* If filter is ALL, split into Upcoming and Past columns */}
            {filter === "all" ? (
              <>
                {/* Column 1: Upcoming */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-black mb-6 text-foreground flex items-center gap-2">
                    <Sparkles className="text-primary" size={24} />
                    Akan Datang
                  </h2>
                  {filteredEvents.filter(e => !isEventCompleted(e)).map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                  {filteredEvents.filter(e => !isEventCompleted(e)).length === 0 && (
                    <div className="text-center py-10 neo-card bg-white rounded-3xl opacity-70">
                      <p className="text-muted-foreground font-medium">Belum ada acara baru.</p>
                    </div>
                  )}
                </div>
                {/* Column 2: Past */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-black mb-6 text-foreground/50 flex items-center gap-2">
                    <Clock className="text-muted-foreground" size={24} />
                    Selesai
                  </h2>
                  {filteredEvents.filter(e => isEventCompleted(e)).map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
              </>
            ) : (
              /* If filter is specific, just show a normal grid */
              filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-20 neo-card bg-white rounded-3xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-black mb-2">Belum Ada Event</h3>
            <p className="text-muted-foreground font-medium">Coba cek lagi nanti ya!</p>
          </div>
        )}
      </section>
    </div>
    </PublicPageShell>
  );
}
