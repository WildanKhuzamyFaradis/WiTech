import React, { useState, useRef, useEffect } from "react"

import { Search, Sparkles, Filter, ChevronDown } from "lucide-react"

import { usePublicData } from "../../context/PublicDataContext"

import PublicPageShell from "../../components/public/PublicPageShell"

import type { Division, Member } from "../../lib/types"

import { divisionName } from "../../lib/dataContract"

const MemberCard = ({
  member,
  divisions,
}: {
  member: Member
  divisions: Division[]
}) => {
  const division = divisions.find((d) => d.id === member.divisionId)

  const label = divisionName(divisions, member.divisionId)

  const badgeColor =
    member.divisionId === null
      ? "#ffe66d"
      : division?.color || "var(--color-foreground)"

  return (
    <div className="group neo-card rounded-3xl p-8 flex flex-col items-center text-center neo-shadow-sm hover:neo-shadow-md transition-all hover:-translate-y-2 bg-white relative overflow-hidden">
      {/* Decorative background glow based on division */}
      <div
        className="absolute top-0 left-0 w-full h-24 opacity-20 group-hover:opacity-30 transition-opacity"
        style={{
          background: `linear-gradient(to bottom, ${badgeColor}, transparent)`,
        }}
      />

      <div
        className="relative w-32 h-32 rounded-full mb-6 mt-4 p-1 neo-shadow-sm group-hover:scale-105 transition-transform bg-white z-10"
        style={{ border: `3px solid ${badgeColor}` }}
      >
        <img
          src={
            member.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`
          }
          alt={member.name}
          className="w-full h-full object-cover rounded-full border-2 border-transparent"
        />
        {member.divisionId === null && (
          <div className="absolute -bottom-2 -right-2 bg-accent text-foreground size-8 rounded-full border-2 border-border flex items-center justify-center neo-shadow-sm">
            ⭐
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col flex-grow w-full">
        <h3 className="font-black text-lg mb-1 tracking-tight line-clamp-1 break-words">
          {member.name}
        </h3>

        <div className="flex gap-2 flex-wrap justify-center mb-5">
          <span className="text-xs font-bold border-2 border-border bg-muted px-3 py-1 rounded-full uppercase tracking-widest text-muted-foreground">
            {member.role}
          </span>
          {label && (
            <span
              className="text-xs font-bold border-2 border-border px-3 py-1 rounded-full uppercase tracking-widest text-white neo-shadow-sm"
              style={{ backgroundColor: badgeColor }}
            >
              {label}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-muted-foreground flex-grow line-clamp-3">
          Selalu semangat belajar dan eksplorasi hal baru di Witech!
        </p>
      </div>
    </div>
  )
}

export default function Members() {
  const { data, loading, error } = usePublicData()

  const members = data?.members ?? []

  const divisions = data?.divisions ?? []

  const divisionsList = [
    { id: "All", name: "All" },
    { id: "core", name: "Core" },
    ...divisions,
  ]

  const [searchTerm, setSearchTerm] = useState("")

  const [selectedDivision, setSelectedDivision] = useState("All")

  const selectedDivisionLabel =
    divisionsList.find((d) => d.id === selectedDivision)?.name ?? "Filter"

  const [filterOpen, setFilterOpen] = useState(false)

  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesDivision =
      selectedDivision === "All" ||
      (selectedDivision === "core"
        ? member.divisionId === null
        : member.divisionId === selectedDivision)

    return matchesSearch && matchesDivision
  })

  return (
    <PublicPageShell loading={loading} error={error}>
      <div className="min-h-screen bg-background font-sans pt-32 pb-24 overflow-hidden">
        {/* ── HEADER ───────────────────────────────────────────── */}
        <section className="text-center space-y-6 max-w-4xl mx-auto px-6 mb-16 relative">
          <div className="absolute -top-20 left-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -top-20 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-muted text-xs font-bold uppercase tracking-widest mb-6 neo-shadow-sm mx-auto">
              <Sparkles size={16} className="text-accent" strokeWidth={2.5} />
              Anggota Witech
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
              Orang-orang di <br />
              <span className="text-primary">Balik Layar.</span>
            </h1>
            <p className="text-xl font-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Kenalan yuk! Ada yang suka coding, ada yang jago desain, dan ada
              yang aktif di komunikasi serta event. Semua berkumpul di sini
              untuk belajar dan berkembang bersama.
            </p>
          </div>
        </section>

        {/* ── SEARCH & FILTER ──────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 mb-12 relative z-10">
          <div className="flex gap-3 items-center">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5"
                strokeWidth={2.5}
              />
              <input
                type="text"
                placeholder="Cari nama member..."
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-semibold text-foreground transition-all placeholder:font-medium placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter dropdown button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-all whitespace-nowrap ${
                  selectedDivision !== "All"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Filter size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">
                  {selectedDivision === "All"
                    ? "Filter"
                    : selectedDivisionLabel}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    filterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown panel */}
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  {divisionsList.map((div) => (
                    <button
                      key={div.id}
                      onClick={() => {
                        setSelectedDivision(div.id)
                        setFilterOpen(false)
                      }}
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
              <span className="text-xs text-muted-foreground font-medium">
                Filter aktif:
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {selectedDivisionLabel}
                <button
                  onClick={() => setSelectedDivision("All")}
                  className="hover:text-primary/70 transition-colors"
                >
                  ✕
                </button>
              </span>
            </div>
          )}
        </section>

        {/* ── MEMBERS GRID ─────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 relative z-10">
          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMembers.map((member, index) => (
                <div
                  key={member.id || index}
                  className="anim-fade-up"
                  style={{
                    animationDelay: `${(index % 9) * 0.1}s`,
                    animationFillMode: "both",
                  }}
                >
                  <MemberCard member={member} divisions={divisions} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 neo-card bg-white rounded-[3rem] max-w-3xl mx-auto flex flex-col items-center">
              <div className="size-24 bg-muted rounded-full flex items-center justify-center text-4xl mb-6">
                🔍
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">
                Tidak ada hasil yang cocok
              </h3>
              <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto">
                Coba cari dengan nama lain atau pilih divisi yang berbeda.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedDivision("All")
                }}
                className="mt-8 px-6 py-3 bg-foreground text-background font-bold rounded-xl border-2 border-border neo-shadow-sm hover:-translate-y-1 transition-transform"
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>
      </div>
    </PublicPageShell>
  )
}
