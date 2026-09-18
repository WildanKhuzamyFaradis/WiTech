import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Filter, ChevronDown } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { Division, Member } from '../../lib/types';
import { divisionName } from '../../lib/dataContract';

const MemberCard = ({ member, divisions }: { member: Member; divisions: Division[] }) => <article className="member-entry">
  <img loading="lazy" src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} alt={member.name}/>
  <h2>{member.name}</h2><p>{member.role}</p><p>{divisionName(divisions, member.divisionId)}</p>
  <div className="member-socials">{member.github && <a href={member.github} target="_blank" rel="noreferrer" aria-label={`GitHub ${member.name}`}>GitHub</a>}{member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`LinkedIn ${member.name}`}>LinkedIn</a>}</div>
</article>;

export default function Members() {
  const { members, divisions } = useStore();
  const divisionsList = [{ id: "All", name: "Semua" }, { id: "core", name: "Core" }, ...divisions];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const selectedDivisionLabel = divisionsList.find(d => d.id === selectedDivision)?.name ?? "Filter";
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = selectedDivision === "All" || (selectedDivision === "core" ? member.divisionId === null : member.divisionId === selectedDivision);
    return matchesSearch && matchesDivision;
  });

  return (
    <div className="min-h-screen bg-background font-sans pt-12 pb-24 overflow-hidden">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-6 mb-16 relative">
        
        
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted text-xs font-medium normal-case tracking-normal mb-6 mx-auto">
            <Sparkles size={16} className="text-accent" strokeWidth={2.5} />
            Anggota WiTECH
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-6">
            Kenali orang-orang <br />
            <span className="text-primary">di balik WiTECH.</span>
          </h1>
          <p className="text-xl font-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Kenali pengurus dan anggota WiTECH. Cari berdasarkan nama atau pilih divisi untuk melihat anggotanya.
          </p>
        </div>
      </section>

      {/* ── SEARCH & FILTER ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mb-12 relative z-10">
        <div className="flex gap-3 items-center">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" strokeWidth={2.5} />
            <input 
              type="text" 
              aria-label="Cari nama anggota" placeholder="Cari nama anggota"
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-semibold text-foreground transition-all placeholder:font-medium placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter dropdown button */}
          <div className="relative" ref={filterRef}>
            <button
              aria-expanded={filterOpen} aria-controls="member-filters" onKeyDown={e => { if(e.key === "Escape") setFilterOpen(false); }} onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-all whitespace-nowrap ${
                selectedDivision !== "All"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Filter size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">{selectedDivision === "All" ? "Filter" : selectedDivisionLabel}</span>
              <ChevronDown size={14} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown panel */}
            {filterOpen && (
              <div id="member-filters" className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50">
                {divisionsList.map((div) => (
                  <button
                    key={div.id}
                    onClick={() => { setSelectedDivision(div.id); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      selectedDivision === div.id
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {div.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filter badge (shows only when filtering) */}
        {selectedDivision !== "All" && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground font-medium">Filter aktif:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {selectedDivisionLabel}
              <button aria-label="Hapus filter divisi" onClick={() => setSelectedDivision("All")} className="hover:text-primary/70 transition-colors">✕</button>
            </span>
          </div>
        )}
      </section>

      {/* ── MEMBERS GRID ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member, index) => (
              <div key={member.id || index} className="" style={{ animationDelay: `${(index % 9) * 0.1}s`, animationFillMode: 'both' }}>
                <MemberCard member={member} divisions={divisions} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 neo-card bg-white rounded-md max-w-3xl mx-auto flex flex-col items-center">
            
            <h3 className="text-3xl font-semibold mb-4 tracking-tight">Anggota tidak ditemukan</h3>
            <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto">
              Periksa ejaan nama atau pilih divisi lain. Hapus filter untuk menampilkan semua anggota.
            </p>
            <button 
              onClick={() => {setSearchTerm(""); setSelectedDivision("All");}}
              className="mt-8 px-6 py-3 bg-foreground text-background font-medium rounded-md border border-border transition-transform"
            >
              Hapus filter
            </button>
          </div>
        )}
      </section>

    </div>
  );
}

