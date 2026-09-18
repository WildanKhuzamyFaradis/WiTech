/**
 * adminData.ts
 * Fetches and persists admin data using Supabase.
 *
 * ARCHITECTURE BOUNDARY:
 * - Admin operations are authenticated through the active Supabase session.
 * - Unlike public queries, admin queries do NOT filter status or active state,
 *   allowing admins to view and manage drafts and inactive members.
 * - Multi-step album operations perform best-effort cleanup on failure.
 */

import { supabase } from "./supabaseClient";
import type { Division, Project, Member, Album, Event, FAQ } from "./types";
import type { StoreData, MutationResult } from "./dataContract";
import { withDerivedCounts } from "./dataContract";

// ─── Raw DB row interfaces (snake_case) ──────────────────────────────────────

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
  date: string; // YYYY-MM-DD
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
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss from Postgres TIME
  end_time: string;   // HH:mm:ss
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

function normalizeTime(t: string): string {
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return t;
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
    image: row.image,
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
    divisionId: row.division_id,
    year: row.year,
    avatar: row.avatar,
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
    coverImage: row.cover_image,
    date: row.date,
    photos,
    photoCount: photos.length,
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
    image: row.image,
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

// ─── Error Formatter ─────────────────────────────────────────────────────────

export function formatAdminError(err: unknown, defaultMsg: string): string {
  console.error("Supabase admin operation failed:", err);
  if (!err || typeof err !== "object") return defaultMsg;

  const errorObj = err as { code?: string; message?: string; details?: string };
  const code = errorObj.code;
  const message = errorObj.message ?? "";

  // 23503: Foreign key restriction
  if (code === "23503") {
    return "Data masih digunakan oleh data lain (misalnya divisi masih digunakan oleh proyek atau anggota) dan tidak dapat dihapus.";
  }

  // 23505: Unique constraint violation
  if (code === "23505") {
    if (message.includes("slug")) {
      return "Slug yang dimasukkan sudah digunakan. Silakan gunakan slug lain.";
    }
    return "Data sudah terdaftar dalam sistem.";
  }

  // 23514: Check constraint violation
  if (code === "23514") {
    if (message.includes("end_time > start_time")) {
      return "Jam selesai harus setelah jam mulai pada hari yang sama.";
    }
    if (message.includes("slug_format")) {
      return "Format slug harus berupa huruf kecil dan tanda hubung (kebab-case).";
    }
    return "Data tidak memenuhi validasi yang ditentukan.";
  }

  // 42501: Insufficient privilege or RLS violation
  if (code === "42501") {
    return "Sesi autentikasi telah kedaluwarsa atau Anda tidak memiliki izin. Silakan login kembali.";
  }

  if (message.includes("JWT") || message.includes("auth")) {
    return "Sesi autentikasi telah kedaluwarsa. Silakan login kembali.";
  }

  return defaultMsg;
}

// ─── Fetch All Admin Data ───────────────────────────────────────────────────

/**
 * Fetches all records from Supabase without public visibility filters.
 * Admins can see both draft projects and inactive members.
 */
export async function fetchAdminData(): Promise<StoreData> {
  const [
    divisionsResult,
    projectsResult,
    membersResult,
    albumsResult,
    albumPhotosResult,
    eventsResult,
    faqsResult,
  ] = await Promise.all([
    supabase
      .from("divisions")
      .select("id, name, short_name, description, icon, color, technologies, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),

    // DO NOT filter status = published. Admin must see both draft and published.
    supabase
      .from("projects")
      .select(
        "id, slug, title, subtitle, description, division_id, tags, year, status, featured, image, members, award, github_url, live_url, sort_order"
      )
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false })
      .order("created_at", { ascending: false }),

    // DO NOT filter active = true. Admin must see both active and inactive.
    supabase
      .from("members")
      .select("id, name, role, division_id, year, avatar, github, linkedin, active, sort_order")
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
  ]);

  if (divisionsResult.error) throw new Error(formatAdminError(divisionsResult.error, "Gagal memuat data divisi."));
  if (projectsResult.error) throw new Error(formatAdminError(projectsResult.error, "Gagal memuat data proyek."));
  if (membersResult.error) throw new Error(formatAdminError(membersResult.error, "Gagal memuat data anggota."));
  if (albumsResult.error) throw new Error(formatAdminError(albumsResult.error, "Gagal memuat data galeri."));
  if (albumPhotosResult.error) throw new Error(formatAdminError(albumPhotosResult.error, "Gagal memuat foto album."));
  if (eventsResult.error) throw new Error(formatAdminError(eventsResult.error, "Gagal memuat data event."));
  if (faqsResult.error) throw new Error(formatAdminError(faqsResult.error, "Gagal memuat data FAQ."));

  const photosByAlbum = new Map<string, string[]>();
  for (const photo of (albumPhotosResult.data as AlbumPhotoRow[])) {
    const existing = photosByAlbum.get(photo.album_id) ?? [];
    existing.push(photo.image_url);
    photosByAlbum.set(photo.album_id, existing);
  }

  const divisions = (divisionsResult.data as DivisionRow[]).map((r) => ({
    ...mapDivision(r),
    memberCount: 0,
  }));

  const projects = (projectsResult.data as ProjectRow[]).map(mapProject);
  const members = (membersResult.data as MemberRow[]).map(mapMember);
  const albums = (albumsResult.data as AlbumRow[]).map((r) => {
    const photos = photosByAlbum.get(r.id) ?? [];
    return mapAlbum(r, photos);
  });
  const events = (eventsResult.data as EventRow[]).map(mapEvent);
  const faqs = (faqsResult.data as FaqRow[]).map(mapFaq);

  return withDerivedCounts({ divisions, projects, members, albums, events, faqs });
}

// ─── Divisions CRUD ──────────────────────────────────────────────────────────

export async function createDivision(
  data: Omit<Division, "id">,
  existingDivisions: Division[]
): Promise<MutationResult> {
  try {
    const nextSort = existingDivisions.length > 0
      ? Math.max(...existingDivisions.map((_, i) => i)) + 1
      : 0;

    const { error } = await supabase.from("divisions").insert({
      name: data.name.trim(),
      short_name: data.shortName.trim(),
      description: data.description.trim(),
      icon: data.icon || "Code",
      color: data.color || "#6366f1",
      technologies: data.technologies ?? [],
      sort_order: nextSort,
    });

    if (error) return { ok: false, error: formatAdminError(error, "Gagal menambah divisi.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menambah divisi.") };
  }
}

export async function updateDivision(
  id: string,
  patch: Partial<Omit<Division, "id">>
): Promise<MutationResult> {
  try {
    const updatePayload: Record<string, unknown> = {};
    if (patch.name !== undefined) updatePayload.name = patch.name.trim();
    if (patch.shortName !== undefined) updatePayload.short_name = patch.shortName.trim();
    if (patch.description !== undefined) updatePayload.description = patch.description.trim();
    if (patch.icon !== undefined) updatePayload.icon = patch.icon;
    if (patch.color !== undefined) updatePayload.color = patch.color;
    if (patch.technologies !== undefined) updatePayload.technologies = patch.technologies;

    const { error } = await supabase.from("divisions").update(updatePayload).eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal memperbarui divisi.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal memperbarui divisi.") };
  }
}

export async function deleteDivision(id: string): Promise<MutationResult> {
  try {
    const { error } = await supabase.from("divisions").delete().eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal menghapus divisi.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menghapus divisi.") };
  }
}

// ─── Projects CRUD ───────────────────────────────────────────────────────────

export async function createProject(
  data: Omit<Project, "id">,
  existingProjects: Project[]
): Promise<MutationResult> {
  try {
    const nextSort = existingProjects.length > 0
      ? Math.max(...existingProjects.map((_, i) => i)) + 1
      : 0;

    const { error } = await supabase.from("projects").insert({
      slug: data.slug.trim().toLowerCase(),
      title: data.title.trim(),
      subtitle: data.subtitle?.trim() || "",
      description: data.description.trim(),
      division_id: data.divisionId,
      tags: data.tags ?? [],
      year: data.year,
      status: data.status,
      featured: data.featured ?? false,
      image: data.image.trim(),
      members: data.members ?? [],
      award: data.award?.trim() || "",
      github_url: data.githubUrl?.trim() || null,
      live_url: data.liveUrl?.trim() || null,
      sort_order: nextSort,
    });

    if (error) return { ok: false, error: formatAdminError(error, "Gagal menambah proyek.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menambah proyek.") };
  }
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<Project, "id">>
): Promise<MutationResult> {
  try {
    const updatePayload: Record<string, unknown> = {};
    if (patch.slug !== undefined) updatePayload.slug = patch.slug.trim().toLowerCase();
    if (patch.title !== undefined) updatePayload.title = patch.title.trim();
    if (patch.subtitle !== undefined) updatePayload.subtitle = patch.subtitle.trim();
    if (patch.description !== undefined) updatePayload.description = patch.description.trim();
    if (patch.divisionId !== undefined) updatePayload.division_id = patch.divisionId;
    if (patch.tags !== undefined) updatePayload.tags = patch.tags;
    if (patch.year !== undefined) updatePayload.year = patch.year;
    if (patch.status !== undefined) updatePayload.status = patch.status;
    if (patch.featured !== undefined) updatePayload.featured = patch.featured;
    if (patch.image !== undefined) updatePayload.image = patch.image.trim();
    if (patch.members !== undefined) updatePayload.members = patch.members;
    if (patch.award !== undefined) updatePayload.award = patch.award.trim();
    if (patch.githubUrl !== undefined) updatePayload.github_url = patch.githubUrl?.trim() || null;
    if (patch.liveUrl !== undefined) updatePayload.live_url = patch.liveUrl?.trim() || null;

    const { error } = await supabase.from("projects").update(updatePayload).eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal memperbarui proyek.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal memperbarui proyek.") };
  }
}

export async function deleteProject(id: string): Promise<MutationResult> {
  try {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal menghapus proyek.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menghapus proyek.") };
  }
}

// ─── Members CRUD ────────────────────────────────────────────────────────────

export async function createMember(
  data: Omit<Member, "id">,
  existingMembers: Member[]
): Promise<MutationResult> {
  try {
    const nextSort = existingMembers.length > 0
      ? Math.max(...existingMembers.map((_, i) => i)) + 1
      : 0;

    // divisionId === null or "core" must write SQL NULL
    const divisionId = !data.divisionId || data.divisionId === "core" ? null : data.divisionId;

    const { error } = await supabase.from("members").insert({
      name: data.name.trim(),
      role: data.role.trim(),
      division_id: divisionId,
      year: String(data.year).trim(),
      avatar: data.avatar?.trim() || "",
      github: data.github?.trim() || "",
      linkedin: data.linkedin?.trim() || "",
      active: data.active ?? true,
      sort_order: nextSort,
    });

    if (error) return { ok: false, error: formatAdminError(error, "Gagal menambah anggota.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menambah anggota.") };
  }
}

export async function updateMember(
  id: string,
  patch: Partial<Omit<Member, "id">>
): Promise<MutationResult> {
  try {
    const updatePayload: Record<string, unknown> = {};
    if (patch.name !== undefined) updatePayload.name = patch.name.trim();
    if (patch.role !== undefined) updatePayload.role = patch.role.trim();
    if (patch.divisionId !== undefined) {
      updatePayload.division_id = !patch.divisionId || patch.divisionId === "core" ? null : patch.divisionId;
    }
    if (patch.year !== undefined) updatePayload.year = String(patch.year).trim();
    if (patch.avatar !== undefined) updatePayload.avatar = patch.avatar.trim();
    if (patch.github !== undefined) updatePayload.github = patch.github.trim();
    if (patch.linkedin !== undefined) updatePayload.linkedin = patch.linkedin.trim();
    if (patch.active !== undefined) updatePayload.active = patch.active;

    const { error } = await supabase.from("members").update(updatePayload).eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal memperbarui anggota.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal memperbarui anggota.") };
  }
}

export async function deleteMember(id: string): Promise<MutationResult> {
  try {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal menghapus anggota.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menghapus anggota.") };
  }
}

// ─── Albums + Album Photos CRUD ──────────────────────────────────────────────

export async function createAlbum(
  data: Omit<Album, "id">,
  existingAlbums: Album[]
): Promise<MutationResult> {
  try {
    const nextSort = existingAlbums.length > 0
      ? Math.max(...existingAlbums.map((_, i) => i)) + 1
      : 0;

    // Step 1: Insert album record and get generated ID
    const { data: insertedAlbum, error: albumError } = await supabase
      .from("albums")
      .insert({
        slug: data.slug.trim().toLowerCase(),
        title: data.title.trim(),
        description: data.description?.trim() || "",
        cover_image: data.coverImage.trim(),
        date: data.date,
        sort_order: nextSort,
      })
      .select("id")
      .single();

    if (albumError || !insertedAlbum) {
      return { ok: false, error: formatAdminError(albumError, "Gagal membuat album.") };
    }

    // Step 2: Insert album_photos if any
    const photos = data.photos?.filter((p) => p.trim().length > 0) ?? [];
    if (photos.length > 0) {
      const photoRows = photos.map((url, index) => ({
        album_id: insertedAlbum.id,
        image_url: url.trim(),
        sort_order: index + 1, // 1-based order
      }));

      const { error: photosError } = await supabase.from("album_photos").insert(photoRows);
      if (photosError) {
        // Best-effort rollback to prevent orphaned album without photos
        console.error("Failed to insert album photos. Attempting rollback...", photosError);
        await supabase.from("albums").delete().eq("id", insertedAlbum.id);
        return { ok: false, error: formatAdminError(photosError, "Gagal menyimpan foto album. Pembuatan album dibatalkan.") };
      }
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal membuat album.") };
  }
}

export async function updateAlbum(
  id: string,
  patch: Partial<Omit<Album, "id">>
): Promise<MutationResult> {
  try {
    // Step 1: Update metadata
    const updatePayload: Record<string, unknown> = {};
    if (patch.slug !== undefined) updatePayload.slug = patch.slug.trim().toLowerCase();
    if (patch.title !== undefined) updatePayload.title = patch.title.trim();
    if (patch.description !== undefined) updatePayload.description = patch.description.trim();
    if (patch.coverImage !== undefined) updatePayload.cover_image = patch.coverImage.trim();
    if (patch.date !== undefined) updatePayload.date = patch.date;

    if (Object.keys(updatePayload).length > 0) {
      const { error: albumError } = await supabase.from("albums").update(updatePayload).eq("id", id);
      if (albumError) return { ok: false, error: formatAdminError(albumError, "Gagal memperbarui data album.") };
    }

    // Step 2: If photos array is modified, synchronize album_photos
    if (patch.photos !== undefined) {
      const photos = patch.photos.filter((p) => p.trim().length > 0);

      // Remove existing photo rows
      const { error: deleteError } = await supabase.from("album_photos").delete().eq("album_id", id);
      if (deleteError) {
        return { ok: false, error: formatAdminError(deleteError, "Gagal menyinkronkan foto album.") };
      }

      // Insert new photo rows
      if (photos.length > 0) {
        const photoRows = photos.map((url, index) => ({
          album_id: id,
          image_url: url.trim(),
          sort_order: index + 1,
        }));

        const { error: insertError } = await supabase.from("album_photos").insert(photoRows);
        if (insertError) {
          return { ok: false, error: formatAdminError(insertError, "Gagal memperbarui daftar foto album.") };
        }
      }
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal memperbarui album.") };
  }
}

export async function deleteAlbum(id: string): Promise<MutationResult> {
  try {
    // ON DELETE CASCADE automatically deletes album_photos in PostgreSQL
    const { error } = await supabase.from("albums").delete().eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal menghapus album.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menghapus album.") };
  }
}

// ─── Events CRUD ─────────────────────────────────────────────────────────────

export async function createEvent(
  data: Omit<Event, "id">
): Promise<MutationResult> {
  try {
    if (data.endTime <= data.startTime) {
      return { ok: false, error: "Jam selesai harus setelah jam mulai pada hari yang sama." };
    }

    const { error } = await supabase.from("events").insert({
      title: data.title.trim(),
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      location: data.location.trim(),
      type: data.type,
      description: data.description.trim(),
      image: data.image.trim(),
      registration_open: data.registrationOpen ?? false,
      registration_link: data.registrationLink?.trim() || null,
    });

    if (error) return { ok: false, error: formatAdminError(error, "Gagal menambah event.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menambah event.") };
  }
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<Event, "id">>
): Promise<MutationResult> {
  try {
    const updatePayload: Record<string, unknown> = {};
    if (patch.title !== undefined) updatePayload.title = patch.title.trim();
    if (patch.date !== undefined) updatePayload.date = patch.date;
    if (patch.startTime !== undefined) updatePayload.start_time = patch.startTime;
    if (patch.endTime !== undefined) updatePayload.end_time = patch.endTime;
    if (patch.location !== undefined) updatePayload.location = patch.location.trim();
    if (patch.type !== undefined) updatePayload.type = patch.type;
    if (patch.description !== undefined) updatePayload.description = patch.description.trim();
    if (patch.image !== undefined) updatePayload.image = patch.image.trim();
    if (patch.registrationOpen !== undefined) updatePayload.registration_open = patch.registrationOpen;
    if (patch.registrationLink !== undefined) {
      updatePayload.registration_link = patch.registrationLink?.trim() || null;
    }

    const { error } = await supabase.from("events").update(updatePayload).eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal memperbarui event.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal memperbarui event.") };
  }
}

export async function deleteEvent(id: string): Promise<MutationResult> {
  try {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return { ok: false, error: formatAdminError(error, "Gagal menghapus event.") };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatAdminError(err, "Gagal menghapus event.") };
  }
}
