/**
 * storage.ts
 * Supabase Storage integration helpers for the WiTech application.
 *
 * ARCHITECTURE BOUNDARIES:
 * - Bucket: 'witech-media' (public bucket).
 * - Database stores RAW relative storage paths (e.g. 'members/<uuid>.jpg').
 * - adminData.ts retains raw database values; publicData.ts resolves them for display.
 * - Admin UI previews resolve paths at render time via resolveMediaUrl().
 * - MIME checking provides operational client-side validation, not cryptographic proof.
 */

import { supabase } from "./supabaseClient"

export const BUCKET_NAME = "witech-media"

/** Allowed MIME types and their canonical extensions */

export const ALLOWED_IMAGE_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",

  "image/png": "png",

  "image/webp": "webp",
}

/** Managed object prefix whitelist */

export const MANAGED_STORAGE_PREFIXES = [
  "branding/",

  "members/",

  "projects/",

  "events/",

  "albums/covers/",

  "albums/photos/",
] as const

export type StorageMediaKind = "logo" | "member" | "project" | "event" | "album-cover" | "album-photo"

export interface ValidationResult {
  valid: boolean

  error?: string
}

/**
 * Validates a media file for allowed MIME types (JPEG, PNG, WebP) and maximum file size.
 * NOTE: File.type is checked as an operational UI layer; it does not verify binary magic bytes.
 */

export function validateMediaFile(
  file: File,
  maxSizeMB: number,
): ValidationResult {
  if (!file) {
    return { valid: false, error: "File tidak ditemukan." }
  }

  const ext = ALLOWED_IMAGE_MIME_TYPES[file.type.toLowerCase()]

  if (!ext) {
    return {
      valid: false,

      error: "Format file tidak didukung. Gunakan format JPG, PNG, atau WebP.",
    }
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxSizeBytes) {
    return {
      valid: false,

      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB} MB.`,
    }
  }

  return { valid: true }
}

/**
 * Resolves any media string (external URL, local root-relative path, or managed Storage path)
 * into a full displayable URL.
 * Never throws during normal rendering.
 */

export function resolveMediaUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl || typeof pathOrUrl !== "string") {
    return ""
  }

  const trimmed = pathOrUrl.trim()

  if (trimmed === "") {
    return ""
  }

  // 1. External remote URLs (http:// or https://)

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  // 2. Root-relative paths (e.g. /foto-angota/... or /logo.png)

  if (trimmed.startsWith("/")) {
    return trimmed
  }

  // 3. Blob / Data URLs from local browser previews

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed
  }

  // 4. Managed Storage relative path

  if (isManagedStoragePath(trimmed)) {
    try {
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(trimmed)

      return data?.publicUrl || trimmed
    } catch (err) {
      console.error(
        "Failed to resolve public URL for storage path:",
        trimmed,
        err,
      )

      return trimmed
    }
  }

  // Fallback for any unknown string

  return trimmed
}

/**
 * Strictly checks whether a value is a valid, managed Storage path inside 'witech-media'.
 * Must start with an approved prefix, contain non-empty content after the prefix,
 * and contain no directory traversal ('..') or backslashes ('\').
 * Returns false for external URLs, root-relative paths, data/blob URIs, and unmanaged relative strings.
 */

export function isManagedStoragePath(
  value: string | null | undefined,
): boolean {
  if (!value || typeof value !== "string") {
    return false
  }

  const trimmed = value.trim()

  if (trimmed === "") {
    return false
  }

  // Reject external, root-relative, or embedded URIs immediately

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return false
  }

  // Reject directory traversal and backslashes

  if (trimmed.includes("..") || trimmed.includes("\\")) {
    return false
  }

  // Find matching approved prefix

  const matchedPrefix = MANAGED_STORAGE_PREFIXES.find((prefix) =>
    trimmed.startsWith(prefix),
  )

  if (!matchedPrefix) {
    return false
  }

  // Require non-empty content AFTER the approved prefix

  const contentAfterPrefix = trimmed.slice(matchedPrefix.length).trim()

  return contentAfterPrefix.length > 0
}

/**
 * Generates an RFC 4122 v4 UUID with cross-environment Web Crypto compatibility.
 * 1. Prefers native globalThis.crypto.randomUUID() when available.
 * 2. Falls back to crypto.getRandomValues() using cryptographically secure random bytes.
 * 3. Throws a controlled Error if Web Crypto is unavailable (never uses weak Math.random).
 */

export function generateSafeUuid(): string {
  const cryptoObj = globalThis.crypto

  // 1. Primary path: native randomUUID

  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID()
  }

  // 2. Fallback path: getRandomValues RFC 4122 v4

  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const bytes = new Uint8Array(16)

    cryptoObj.getRandomValues(bytes)

    // Set version bits (4)

    bytes[6] = (bytes[6] & 0x0f) | 0x40

    // Set variant bits (10xx)

    bytes[8] = (bytes[8] & 0x3f) | 0x80

    // Format as 8-4-4-4-12 hex string

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    )

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // 3. Reject environments without Web Crypto API (no Math.random fallback)

  throw new Error(
    "Web Crypto API (crypto.randomUUID or crypto.getRandomValues) is not available in this environment.",
  )
}

/**
 * Generates a safe, collision-resistant storage path using generateSafeUuid().
 * Never trusts or incorporates original user filenames.
 * Derives extensions strictly from allowed MIME types.
 */

export function generateStoragePath(
  kind: StorageMediaKind,

  mimeType: string,

  albumId?: string,
): string {
  const normalizedMime = mimeType.toLowerCase()

  const ext = ALLOWED_IMAGE_MIME_TYPES[normalizedMime]

  if (!ext) {
    throw new Error(
      `MIME type '${mimeType}' is not supported for storage generation.`,
    )
  }

  const uuid = generateSafeUuid()

  switch (kind) {
    case "logo":
      return `branding/${uuid}.${ext}`

    case "member":
      return `members/${uuid}.${ext}`

    case "project":
      return `projects/${uuid}.${ext}`

    case "event":
      return `events/${uuid}.${ext}`

    case "album-cover":
      return `albums/covers/${uuid}.${ext}`

    case "album-photo":
      if (!albumId || typeof albumId !== "string" || albumId.trim() === "") {
        throw new Error(
          "albumId is required when generating album photo storage paths.",
        )
      }

      return `albums/photos/${albumId.trim()}/${uuid}.${ext}`

    default:
      throw new Error(`Unsupported storage media kind: ${kind}`)
  }
}

/**
 * Uploads a file to Supabase Storage under the witech-media bucket.
 * Returns the raw storage object path on success, NOT the full public URL.
 */

export async function uploadMediaFile(
  file: File,

  path: string,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  try {
    if (!isManagedStoragePath(path)) {
      console.error(
        "Storage upload rejected: invalid or unmanaged upload path:",
        path,
      )

      return { ok: false, error: "Path upload media tidak valid." }
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: "3600",

        upsert: false,
      })

    if (error) {
      console.error("Storage upload failed for path:", path, error)

      return { ok: false, error: "Gagal mengunggah gambar. Silakan coba lagi." }
    }

    return { ok: true, path }
  } catch (err) {
    console.error("Unexpected error during storage upload:", err)

    return { ok: false, error: "Gagal mengunggah gambar. Silakan coba lagi." }
  }
}

/**
 * Deletes an exact array of managed storage paths from the witech-media bucket.
 * Filters out any external URLs or local public paths before invoking remove().
 * Empty list is safely a no-op.
 */

export async function deleteMediaFiles(
  paths: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!paths || paths.length === 0) {
      return { ok: true }
    }

    // Strictly filter only paths that belong to managed storage

    const validPaths = paths.filter(isManagedStoragePath)

    if (validPaths.length === 0) {
      return { ok: true }
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(validPaths)

    if (error) {
      console.error("Storage deletion failed for paths:", validPaths, error)

      return { ok: false, error: "Gagal menghapus file dari storage." }
    }

    return { ok: true }
  } catch (err) {
    console.error("Unexpected error during storage deletion:", err)

    return { ok: false, error: "Gagal menghapus file dari storage." }
  }
}
