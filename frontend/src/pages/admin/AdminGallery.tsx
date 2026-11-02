import { useState, useRef } from "react"

import { useNavigate } from "react-router"

import {
  Search,
  Plus,
  Edit,
  Trash,
  X,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Upload,
} from "lucide-react"

import { useAdminData } from "../../context/AdminDataContext"

import { supabase } from "../../lib/supabaseClient"

import type { Album } from "../../lib/types"

import {
  resolveMediaUrl,
  validateMediaFile,
  generateStoragePath,
  uploadMediaFile,
  deleteMediaFiles,
  isManagedStoragePath,
} from "../../lib/storage"

import MediaUploadInput from "../../components/admin/MediaUploadInput"

// A photo entry is either a plain string (URL/path) or a pending file upload

type PhotoEntry = string | { file: File; previewUrl: string }

interface AlbumFormData {
  slug: string

  title: string

  description: string

  coverImage: string | File

  date: string

  photoCount: number

  photos: PhotoEntry[]

  sortOrder: number
}

const emptyForm: AlbumFormData = {
  slug: "",

  title: "",

  description: "",

  coverImage: "",

  date: new Date().toISOString().split("T")[0],

  photoCount: 0,

  photos: [],

  sortOrder: 0,
}

/** Resolve a PhotoEntry to a displayable URL for preview */

function photoPreviewSrc(entry: PhotoEntry): string {
  if (typeof entry === "string") return resolveMediaUrl(entry)

  return entry.previewUrl
}

/** Resolve a PhotoEntry to its string value (for string entries only, used in URL edit input) */

function photoStringValue(entry: PhotoEntry): string {
  return typeof entry === "string" ? entry : ""
}

export default function AdminGallery() {
  const { albums, addAlbum, updateAlbum, removeAlbum, loading, refetch } =
    useAdminData()

  const navigate = useNavigate()

  const [search, setSearch] = useState("")

  const [editId, setEditId] = useState<string | null>(null)

  const [form, setForm] = useState<AlbumFormData>(emptyForm)

  const [photoUrlInput, setPhotoUrlInput] = useState("")

  const [submitting, setSubmitting] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)

  const [photoFileError, setPhotoFileError] = useState<string | null>(null)

  // Track original cover + photo paths for Storage cleanup after edit

  const [originalCoverPath, setOriginalCoverPath] = useState("")

  const [originalPhotoPaths, setOriginalPhotoPaths] = useState<string[]>([])

  const photoFileInputRef = useRef<HTMLInputElement>(null)

  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()),
  )

  const openAdd = () => {
    navigate("/admin/gallery/new")

    return

    const nextOrder =
      albums.length > 0
        ? Math.max(...albums.map((a) => a.sortOrder ?? 0)) + 1
        : 0

    setForm({ ...emptyForm, sortOrder: nextOrder })

    setEditId(null)

    setPhotoUrlInput("")

    setPhotoFileError(null)

    setOriginalCoverPath("")

    setOriginalPhotoPaths([])

    setFormError(null)
  }

  const openEdit = (a: Album) => {
    navigate(`/admin/gallery/${a.id}/edit`)

    return

    setForm({
      slug: a.slug,

      title: a.title,

      description: a.description,

      coverImage: a.coverImage,

      date: a.date,

      photoCount: a.photoCount,

      photos: [...a.photos], // all strings from DB

      sortOrder: a.sortOrder ?? 0,
    })

    setEditId(a.id)

    setPhotoUrlInput("")

    setPhotoFileError(null)

    setOriginalCoverPath(a.coverImage)

    setOriginalPhotoPaths([...a.photos])

    setFormError(null)
  }

  // ── Photo manager actions ──────────────────────────────────────────────────

  const addPhotoByUrl = () => {
    const p = photoUrlInput.trim()

    if (p) {
      setForm((f) => ({ ...f, photos: [...f.photos, p] }))
    }

    setPhotoUrlInput("")
  }

  const addPhotoByFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    const validation = validateMediaFile(file, 5)

    if (!validation.valid) {
      setPhotoFileError(validation.error ?? "File tidak valid.")

      if (photoFileInputRef.current) photoFileInputRef.current.value = ""

      return
    }

    setPhotoFileError(null)

    const previewUrl = URL.createObjectURL(file)

    setForm((f) => ({ ...f, photos: [...f.photos, { file, previewUrl }] }))

    if (photoFileInputRef.current) photoFileInputRef.current.value = ""
  }

  const removePhoto = (index: number) => {
    const entry = form.photos[index]

    if (typeof entry !== "string") URL.revokeObjectURL(entry.previewUrl)

    setForm((f) => ({
      ...f,
      photos: f.photos.filter((_, idx) => idx !== index),
    }))
  }

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.photos.length) return

    const updated = [...form.photos]

    const [moved] = updated.splice(fromIndex, 1)

    updated.splice(toIndex, 0, moved)

    setForm((f) => ({ ...f, photos: updated }))
  }

  const updatePhotoUrlAt = (index: number, val: string) => {
    const updated = [...form.photos]

    updated[index] = val // Only valid for string entries

    setForm((f) => ({ ...f, photos: updated }))
  }

  // ── Submit handler ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim() || !form.slug.trim()) {
      setFormError("Judul dan Slug harus diisi.")

      return
    }

    if (submitting) return

    try {
      setSubmitting(true)

      setFormError(null)

      const uploadedPaths: string[] = [] // track for rollback

      // ── EDIT flow ──────────────────────────────────────────────────────────

      if (editId) {
        // 1. Upload cover if File

        let resolvedCover: string

        let newCoverPath = ""

        if (form.coverImage instanceof File) {
          const storagePath = generateStoragePath(
            "album-cover",
            form.coverImage.type,
          )

          const uploadResult = await uploadMediaFile(
            form.coverImage,
            storagePath,
          )

          if (!uploadResult.ok) {
            setFormError(uploadResult.error)

            return
          }

          resolvedCover = uploadResult.path

          newCoverPath = uploadResult.path

          uploadedPaths.push(newCoverPath)
        } else {
          resolvedCover = form.coverImage.trim()
        }

        // 2. Upload any File photos

        const resolvedPhotos: string[] = []

        for (const entry of form.photos) {
          if (typeof entry === "string") {
            resolvedPhotos.push(entry.trim())
          } else {
            const storagePath = generateStoragePath(
              "album-photo",
              entry.file.type,
              editId,
            )

            const uploadResult = await uploadMediaFile(entry.file, storagePath)

            if (!uploadResult.ok) {
              // Rollback already-uploaded files

              await deleteMediaFiles(uploadedPaths)

              setFormError(uploadResult.error)

              return
            }

            resolvedPhotos.push(uploadResult.path)

            uploadedPaths.push(uploadResult.path)
          }
        }

        // 3. Commit to DB

        const cleanPhotos = resolvedPhotos.filter(Boolean)

        const patch = {
          title: form.title.trim(),

          slug: form.slug.trim().toLowerCase(),

          description: form.description.trim(),

          coverImage: resolvedCover,

          date: form.date,

          photos: cleanPhotos,

          photoCount: cleanPhotos.length,

          sortOrder: Math.max(0, Math.floor(form.sortOrder)),
        }

        const result = await updateAlbum(editId, patch)

        if (!result.ok) {
          // DB failed — rollback newly uploaded files

          await deleteMediaFiles(uploadedPaths)

          setFormError(result.error)

          return
        }

        // 4. DB success — clean up old managed paths that are no longer in use

        const oldPaths = [originalCoverPath, ...originalPhotoPaths].filter(
          Boolean,
        )

        const finalPaths = new Set([resolvedCover, ...cleanPhotos])

        const toDelete = oldPaths.filter(
          (p) => isManagedStoragePath(p) && !finalPaths.has(p),
        )

        if (toDelete.length > 0) await deleteMediaFiles(toDelete)

        // Revoke object URLs

        form.photos.forEach((entry) => {
          if (typeof entry !== "string") URL.revokeObjectURL(entry.previewUrl)
        })
      } else {
        // ── CREATE flow ──────────────────────────────────────────────────────

        // We need the album ID before uploading photo files.

        // Step A: Determine cover string — if File, use placeholder first, update after.

        const coverIsFile = form.coverImage instanceof File

        const initialCover = coverIsFile
          ? ""
          : (form.coverImage as string).trim()

        // Step B: Separate string photos from File photos — only string photos in initial insert

        const stringPhotos = form.photos

          .filter((p): p is string => typeof p === "string")

          .map((p) => p.trim())

          .filter(Boolean)

        const filePhotos = form.photos.filter(
          (p): p is { file: File; previewUrl: string } =>
            typeof p !== "string",
        )

        // Step C: Insert album row (no file photos yet, placeholder cover if needed)

        // Use addAlbum with string-only photos for the initial insert

        const { data: insertedAlbum, error: albumInsertError } = await supabase

          .from("albums")

          .insert({
            slug: form.slug.trim().toLowerCase(),

            title: form.title.trim(),

            description: form.description.trim() || "",

            cover_image: initialCover || "",

            date: form.date,

            sort_order: Math.max(0, Math.floor(form.sortOrder)),
          })

          .select("id")

          .single()

        if (albumInsertError || !insertedAlbum) {
          setFormError("Gagal membuat album.")

          return
        }

        const albumId: string = (insertedAlbum as { id: string }).id

        // Step D: Upload cover file

        let resolvedCover = initialCover

        if (coverIsFile && form.coverImage instanceof File) {
          const storagePath = generateStoragePath(
            "album-cover",
            form.coverImage.type,
          )

          const uploadResult = await uploadMediaFile(
            form.coverImage,
            storagePath,
          )

          if (!uploadResult.ok) {
            // Rollback album row

            await supabase.from("albums").delete().eq("id", albumId)

            await refetch()

            setFormError(uploadResult.error)

            return
          }

          resolvedCover = uploadResult.path

          uploadedPaths.push(resolvedCover)
        }

        // Step E: Upload file photos

        const uploadedPhotoPaths: string[] = []

        for (const entry of filePhotos) {
          const storagePath = generateStoragePath(
            "album-photo",
            entry.file.type,
            albumId,
          )

          const uploadResult = await uploadMediaFile(entry.file, storagePath)

          if (!uploadResult.ok) {
            // Rollback: delete album + uploaded files

            await supabase.from("albums").delete().eq("id", albumId)

            await deleteMediaFiles([...uploadedPaths, ...uploadedPhotoPaths])

            await refetch()

            setFormError(uploadResult.error)

            return
          }

          uploadedPhotoPaths.push(uploadResult.path)

          uploadedPaths.push(uploadResult.path)
        }

        // Step F: Build final resolved photos list, preserving order

        const finalPhotos: string[] = []

        let filePhotoIdx = 0

        for (const entry of form.photos) {
          if (typeof entry === "string") {
            const trimmed = entry.trim()

            if (trimmed) finalPhotos.push(trimmed)
          } else {
            if (filePhotoIdx < uploadedPhotoPaths.length) {
              finalPhotos.push(uploadedPhotoPaths[filePhotoIdx++])
            }
          }
        }

        // Step G: Insert album_photos rows

        if (finalPhotos.length > 0) {
          const photoRows = finalPhotos.map((url, index) => ({
            album_id: albumId,

            image_url: url,

            sort_order: index + 1,
          }))

          const { error: photosError } = await supabase
            .from("album_photos")
            .insert(photoRows)

          if (photosError) {
            console.error(
              "Failed to insert album photos. Rolling back...",
              photosError,
            )

            await supabase.from("albums").delete().eq("id", albumId)

            await deleteMediaFiles(uploadedPaths)

            await refetch()

            setFormError(
              "Gagal menyimpan foto album. Pembuatan album dibatalkan.",
            )

            return
          }
        }

        // Step H: Update cover_image if it was a file

        if (resolvedCover && resolvedCover !== initialCover) {
          await supabase
            .from("albums")
            .update({ cover_image: resolvedCover })
            .eq("id", albumId)
        }

        // Revoke object URLs

        form.photos.forEach((entry) => {
          if (typeof entry !== "string") URL.revokeObjectURL(entry.previewUrl)
        })

        // Refetch admin context so the newly created album appears immediately without page reload

        await refetch()
      }

      setForm(emptyForm)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Galeri</h1>
          <p className="text-base font-medium text-muted-foreground">
            {albums.length} album
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-xl text-sm font-bold hover:-translate-y-1 transition-transform neo-shadow-sm hover:neo-shadow-md"
        >
          <Plus size={18} strokeWidth={3} /> Tambah Album
        </button>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mb-6">
        <Search
          size={18}
          strokeWidth={2.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Cari album..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-transparent rounded-xl text-base font-bold text-foreground placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
        />
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((album) => (
            <div
              key={album.id}
              className="neo-card bg-white rounded-3xl overflow-hidden neo-shadow-sm hover:neo-shadow-md transition-shadow group"
            >
              {/* Cover Image */}
              <div className="relative w-full h-48 bg-muted overflow-hidden">
                {album.coverImage ? (
                  <img
                    src={resolveMediaUrl(album.coverImage)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.opacity =
                        "0.3"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon
                      size={32}
                      className="text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-black text-foreground mb-1 line-clamp-2">
                  {album.title}
                </h3>
                <p className="text-xs font-bold text-muted-foreground mb-4 line-clamp-2">
                  {album.description || "—"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <ImageIcon size={14} strokeWidth={2} />
                    {album.photoCount} foto
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">
                    {new Date(album.date).toLocaleDateString("id-ID")}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(album)}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-border/10 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    title="Edit"
                  >
                    <Edit size={14} strokeWidth={2.5} />
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Hapus album "${album.title}"?`)) {
                        const result = await removeAlbum(album.id)

                        if (!result.ok) alert(result.error)
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    title="Hapus"
                  >
                    <Trash size={14} strokeWidth={2.5} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="neo-card bg-white rounded-3xl py-20 text-center text-muted-foreground flex flex-col items-center neo-shadow-sm">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ImageIcon size={28} className="text-muted-foreground" />
          </div>
          <p className="text-lg font-bold">Belum ada album.</p>
        </div>
      )}
    </div>
  )
}
