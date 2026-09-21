import type { Album, Division, Event, FAQ, Member, Project } from "./types";

export interface StoreData {
  divisions: Division[];
  projects: Project[];
  members: Member[];
  albums: Album[];
  events: Event[];
  faqs: FAQ[];
}

export type MutationResult = { ok: true; id?: string } | { ok: false; error: string };

export const isPublishedProject = (project: Project) => project.status === "published";

export function divisionName(divisions: Division[], id: string | null): string {
  return id === null ? "Core" : divisions.find(d => d.id === id)?.name ?? "Divisi tidak ditemukan";
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const isValidTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
  }).format(new Date(value + "T00:00:00+07:00"));
}

export const formatEventTime = (event: Event) => event.startTime + " - " + event.endTime + " WIB";

// An event is completed at its end time in WIB, independently of registration.
export function isEventCompleted(event: Event, now = new Date()): boolean {
  return new Date(event.date + "T" + event.endTime + ":00+07:00").getTime() <= now.getTime();
}

export function todayInJakarta(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return part("year") + "-" + part("month") + "-" + part("day");
}

// Validate the next snapshot before committing it, including cross-resource deletes.
export function validateStoreData(data: StoreData): string | null {
  const ids = new Set(data.divisions.map(d => d.id));
  const slugs = new Set<string>();
  for (const project of data.projects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) return "Slug proyek wajib diisi dalam format kebab-case huruf kecil.";
    if (slugs.has(project.slug)) return "Slug proyek sudah digunakan.";
    slugs.add(project.slug);
    if (!ids.has(project.divisionId)) return "Divisi proyek tidak valid atau masih digunakan. Pindahkan proyek sebelum menghapus divisi.";
    if (project.status !== "draft" && project.status !== "published") return "Status proyek tidak valid.";
  }
  for (const member of data.members) {
    if (member.divisionId !== null && !ids.has(member.divisionId)) return "Divisi member tidak valid atau masih digunakan. Pindahkan member sebelum menghapus divisi.";
  }
  for (const event of data.events) {
    if (!isValidDate(event.date)) return "Tanggal event harus berupa tanggal valid YYYY-MM-DD.";
    if (!isValidTime(event.startTime) || !isValidTime(event.endTime)) return "Jam event harus valid dalam format HH:mm.";
    if (event.endTime <= event.startTime) return "Jam selesai harus setelah jam mulai pada hari yang sama.";
  }
  for (const album of data.albums) {
    if (!isValidDate(album.date)) return "Tanggal album harus berupa tanggal valid YYYY-MM-DD.";
  }
  return null;
}

export function withDerivedCounts(data: StoreData): StoreData {
  return {
    ...data,
    divisions: data.divisions.map(d => ({
      ...d, memberCount: data.members.filter(m => m.active && m.divisionId === d.id).length,
    })),
    albums: data.albums.map(a => ({ ...a, photoCount: a.photos.length })),
  };
}
