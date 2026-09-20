/**
 * publicData.ts
 * Fetches all public-facing entities from Supabase.
 *
 * ARCHITECTURE BOUNDARY: This module is ONLY for public read-only queries.
 * Admin mutations still go through the local Store.
 *
 * Explicit application-level filters are applied even though RLS also
 * filters for the anon role, because an authenticated admin browsing a
 * public route would bypass the anon policy and could see drafts/inactive
 * records if we relied on RLS alone.
 */

import { supabase } from "./supabaseClient";
import { resolveMediaUrl } from "./storage";
import type { Division, Project, Member, Album, Event, FAQ } from "./types";
import type { StoreData } from "./dataContract";
import { withDerivedCounts } from "./dataContract";
import { fetchLogoUrl } from "./siteSettings";

// ─── Raw DB row shapes (snake_case) ─────────────────────────────────────────

interface DivisionRow {
  id: string;
  name: string;
  short_name: string;
  description: string;
  icon: string;
  color: string;
  technologies: string[];
  sort_order: number;
}

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  division_id: string;
  tags: string[];
  year: number;
  status: "published" | "draft";
  featured: boolean;
  image: string;
  members: string[];
  award: string;
  github_url: string | null;
  live_url: string | null;
  sort_order: number;
}

interface MemberRow {
  id: string;
  name: string;
  role: string;
  division_id: string | null;
  year: string;
  avatar: string;
  github: string;
  linkedin: string;
  active: boolean;
  sort_order: number;
}

interface AlbumRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image: string;
  date: string; // "YYYY-MM-DD"
  sort_order: number;
}

interface AlbumPhotoRow {
  album_id: string;
  image_url: string;
  sort_order: number;
}

interface EventRow {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:mm:ss" from Postgres TIME
  end_time: string;   // "HH:mm:ss"
  location: string;
  type: "Workshop" | "Bootcamp" | "Seminar" | "Sharing Session";
  description: string;
  image: string;
  registration_open: boolean;
  registration_link: string | null;
}

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

// ─── Mapping helpers ─────────────────────────────────────────────────────────

/** Postgres TIME can return "HH:mm:ss". Normalize to "HH:mm". */
function normalizeTime(t: string): string {
  // Already "HH:mm"?
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return t;
  // "HH:mm:ss" or "HH:mm:ss.fff"
  const parts = t.split(":");
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, "0");
    const mm = parts[1].padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return t;
}

function mapDivision(row: DivisionRow): Omit<Division, "memberCount"> {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    technologies: row.technologies ?? [],
  };
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    divisionId: row.division_id,
    tags: row.tags ?? [],
    year: row.year,
    status: row.status,
    featured: row.featured,
    image: resolveMediaUrl(row.image),
    members: row.members ?? [],
    award: row.award ?? "",
    githubUrl: row.github_url ?? undefined,
    liveUrl: row.live_url ?? undefined,
  };
}

function mapMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    divisionId: row.division_id,   // null is preserved as-is
    year: row.year,
    avatar: resolveMediaUrl(row.avatar),
    github: row.github ?? "",
    linkedin: row.linkedin ?? "",
    active: row.active,
  };
}

function mapAlbum(row: AlbumRow, photos: string[]): Album {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverImage: resolveMediaUrl(row.cover_image),
    date: row.date,
    photos: photos.map(resolveMediaUrl),
    photoCount: photos.length, // derived
  };
}

function mapEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    startTime: normalizeTime(row.start_time),
    endTime: normalizeTime(row.end_time),
    location: row.location,
    type: row.type,
    description: row.description,
    image: resolveMediaUrl(row.image),
    registrationOpen: row.registration_open,
    registrationLink: row.registration_link ?? undefined,
  };
}

function mapFaq(row: FaqRow): FAQ {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
  };
}

// ─── Public data loader ───────────────────────────────────────────────────────

/**
 * Fetches all public data from Supabase concurrently.
 * Throws an error string on any Supabase query failure.
 *
 * Explicit filters (status = 'published', active = true) are applied at the
 * application layer to guard against an authenticated admin accidentally
 * seeing non-public records while browsing a public route.
 */
export interface PublicDataResult {
  data: StoreData;
  logoUrl: string;
}

export async function fetchPublicData(): Promise<PublicDataResult> {
  const [
    divisionsResult,
    projectsResult,
    membersResult,
    albumsResult,
    albumPhotosResult,
    eventsResult,
    faqsResult,
    logoUrl,
  ] = await Promise.all([
    supabase
      .from("divisions")
      .select("id, name, short_name, description, icon, color, technologies, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("projects")
      .select(
        "id, slug, title, subtitle, description, division_id, tags, year, status, featured, image, members, award, github_url, live_url, sort_order"
      )
      .eq("status", "published")  // EXPLICIT application-level filter
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false })
      .order("created_at", { ascending: false }),

    supabase
      .from("members")
      .select("id, name, role, division_id, year, avatar, github, linkedin, active, sort_order")
      .eq("active", true)          // EXPLICIT application-level filter
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),

    supabase
      .from("albums")
      .select("id, slug, title, description, cover_image, date, sort_order")
      .order("sort_order", { ascending: true })
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),

    supabase
      .from("album_photos")
      .select("album_id, image_url, sort_order")
      .order("sort_order", { ascending: true }),

    supabase
      .from("events")
      .select("id, title, date, start_time, end_time, location, type, description, image, registration_open, registration_link")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true }),

    supabase
      .from("faqs")
      .select("id, question, answer, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    fetchLogoUrl(),
  ]);

  // Fail fast on any query error — do NOT silently fall back to fixtures.
  if (divisionsResult.error) throw new Error(`Gagal memuat data divisi: ${divisionsResult.error.message}`);
  if (projectsResult.error) throw new Error(`Gagal memuat data proyek: ${projectsResult.error.message}`);
  if (membersResult.error) throw new Error(`Gagal memuat data anggota: ${membersResult.error.message}`);
  if (albumsResult.error) throw new Error(`Gagal memuat data galeri: ${albumsResult.error.message}`);
  if (albumPhotosResult.error) throw new Error(`Gagal memuat foto album: ${albumPhotosResult.error.message}`);
  if (eventsResult.error) throw new Error(`Gagal memuat data event: ${eventsResult.error.message}`);
  if (faqsResult.error) throw new Error(`Gagal memuat data FAQ: ${faqsResult.error.message}`);

  // Build a lookup map: album_id → sorted image_url[]
  const photosByAlbum = new Map<string, string[]>();
  for (const photo of (albumPhotosResult.data as AlbumPhotoRow[])) {
    const existing = photosByAlbum.get(photo.album_id) ?? [];
    existing.push(photo.image_url);
    photosByAlbum.set(photo.album_id, existing);
  }

  const divisions = (divisionsResult.data as DivisionRow[]).map(r => ({
    ...mapDivision(r),
    memberCount: 0, // will be derived below by withDerivedCounts
  }));

  const projects = (projectsResult.data as ProjectRow[]).map(mapProject);
  const members = (membersResult.data as MemberRow[]).map(mapMember);
  const albums = (albumsResult.data as AlbumRow[]).map(r => {
    const photos = photosByAlbum.get(r.id) ?? [];
    return mapAlbum(r, photos);
  });
  const events = (eventsResult.data as EventRow[]).map(mapEvent);
  const faqs = (faqsResult.data as FaqRow[]).map(mapFaq);

  // memberCount is derived from active members whose divisionId matches.
  // photoCount is derived from photos.length.
  // withDerivedCounts handles both.
  return { data: withDerivedCounts({ divisions, projects, members, albums, events, faqs }), logoUrl };
}
