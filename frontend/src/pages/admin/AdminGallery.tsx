import { useState, useRef } from "react";
import { Search, Plus, Edit, Trash, X, Image as ImageIcon, ChevronUp, ChevronDown, AlertCircle, Upload } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { supabase } from "../../lib/supabaseClient";
import type { Album } from "../../lib/types";
import {
  resolveMediaUrl,
  validateMediaFile,
  generateStoragePath,
  uploadMediaFile,
  deleteMediaFiles,
  isManagedStoragePath,
} from "../../lib/storage";
import MediaUploadInput from "../../components/admin/MediaUploadInput";

// A photo entry is either a plain string (URL/path) or a pending file upload
type PhotoEntry = string | { file: File; previewUrl: string };

interface AlbumFormData {
  slug: string;
  title: string;
  description: string;
  coverImage: string | File;
  date: string;
  photoCount: number;
  photos: PhotoEntry[];
  sortOrder: number;
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
};

/** Resolve a PhotoEntry to a displayable URL for preview */
function photoPreviewSrc(entry: PhotoEntry): string {
  if (typeof entry === "string") return resolveMediaUrl(entry);
  return entry.previewUrl;
}

/** Resolve a PhotoEntry to its string value (for string entries only, used in URL edit input) */
function photoStringValue(entry: PhotoEntry): string {
  return typeof entry === "string" ? entry : "";
}

export default function AdminGallery() {
  const { albums, addAlbum, updateAlbum, removeAlbum, loading, refetch } = useAdminData();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AlbumFormData>(emptyForm);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoFileError, setPhotoFileError] = useState<string | null>(null);
  // Track original cover + photo paths for Storage cleanup after edit
  const [originalCoverPath, setOriginalCoverPath] = useState("");
  const [originalPhotoPaths, setOriginalPhotoPaths] = useState<string[]>([]);

  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    const nextOrder = albums.length > 0 ? Math.max(...albums.map((a) => a.sortOrder ?? 0)) + 1 : 0;
    setForm({ ...emptyForm, sortOrder: nextOrder });
    setEditId(null);
    setPhotoUrlInput("");
    setPhotoFileError(null);
    setOriginalCoverPath("");
    setOriginalPhotoPaths([]);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (a: Album) => {
    setForm({
      slug: a.slug,
      title: a.title,
      description: a.description,
      coverImage: a.coverImage,
      date: a.date,
      photoCount: a.photoCount,
      photos: [...a.photos], // all strings from DB
      sortOrder: a.sortOrder ?? 0,
    });
    setEditId(a.id);
    setPhotoUrlInput("");
    setPhotoFileError(null);
    setOriginalCoverPath(a.coverImage);
    setOriginalPhotoPaths([...a.photos]);
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    // Revoke any lingering object URLs in photo entries
    form.photos.forEach((entry) => {
      if (typeof entry !== "string") URL.revokeObjectURL(entry.previewUrl);
    });
    setShowModal(false);
    setForm(emptyForm);
  };

  // ── Photo manager actions ──────────────────────────────────────────────────

  const addPhotoByUrl = () => {
    const p = photoUrlInput.trim();
    if (p) {
      setForm((f) => ({ ...f, photos: [...f.photos, p] }));
    }
    setPhotoUrlInput("");
  };

  const addPhotoByFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file, 5);
    if (!validation.valid) {
      setPhotoFileError(validation.error ?? "File tidak valid.");
      if (photoFileInputRef.current) photoFileInputRef.current.value = "";
      return;
    }
    setPhotoFileError(null);
    const previewUrl = URL.createObjectURL(file);
    setForm((f) => ({ ...f, photos: [...f.photos, { file, previewUrl }] }));
    if (photoFileInputRef.current) photoFileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    const entry = form.photos[index];
    if (typeof entry !== "string") URL.revokeObjectURL(entry.previewUrl);
    setForm((f) => ({ ...f, photos: f.photos.filter((_, idx) => idx !== index) }));
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.photos.length) return;
    const updated = [...form.photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setForm((f) => ({ ...f, photos: updated }));
  };

  const updatePhotoUrlAt = (index: number, val: string) => {
    const updated = [...form.photos];
    updated[index] = val; // Only valid for string entries
    setForm((f) => ({ ...f, photos: updated }));
  };

  // ── Submit handler ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setFormError("Judul dan Slug harus diisi.");
      return;
    }
    if (submitting) return;

    try {
      setSubmitting(true);
      setFormError(null);

      const uploadedPaths: string[] = []; // track for rollback

      // ── EDIT flow ──────────────────────────────────────────────────────────
      if (editId) {
        // 1. Upload cover if File
        let resolvedCover: string;
        let newCoverPath = "";
        if (form.coverImage instanceof File) {
          const storagePath = generateStoragePath("album-cover", form.coverImage.type);
          const uploadResult = await uploadMediaFile(form.coverImage, storagePath);
          if (!uploadResult.ok) {
            setFormError(uploadResult.error);
            return;
          }
          resolvedCover = uploadResult.path;
          newCoverPath = uploadResult.path;
          uploadedPaths.push(newCoverPath);
        } else {
          resolvedCover = form.coverImage.trim();
        }

        // 2. Upload any File photos
        const resolvedPhotos: string[] = [];
        for (const entry of form.photos) {
          if (typeof entry === "string") {
            resolvedPhotos.push(entry.trim());
          } else {
            const storagePath = generateStoragePath("album-photo", entry.file.type, editId);
            const uploadResult = await uploadMediaFile(entry.file, storagePath);
            if (!uploadResult.ok) {
              // Rollback already-uploaded files
              await deleteMediaFiles(uploadedPaths);
              setFormError(uploadResult.error);
              return;
            }
            resolvedPhotos.push(uploadResult.path);
            uploadedPaths.push(uploadResult.path);
          }
        }

        // 3. Commit to DB
        const cleanPhotos = resolvedPhotos.filter(Boolean);
        const patch = {
          title: form.title.trim(),
          slug: form.slug.trim().toLowerCase(),
          description: form.description.trim(),
          coverImage: resolvedCover,
          date: form.date,
          photos: cleanPhotos,
          photoCount: cleanPhotos.length,
          sortOrder: Math.max(0, Math.floor(form.sortOrder)),
        };

        const result = await updateAlbum(editId, patch);
        if (!result.ok) {
          // DB failed — rollback newly uploaded files
          await deleteMediaFiles(uploadedPaths);
          setFormError(result.error);
          return;
        }

        // 4. DB success — clean up old managed paths that are no longer in use
        const oldPaths = [originalCoverPath, ...originalPhotoPaths].filter(Boolean);
        const finalPaths = new Set([resolvedCover, ...cleanPhotos]);
        const toDelete = oldPaths.filter(
          (p) => isManagedStoragePath(p) && !finalPaths.has(p)
        );
        if (toDelete.length > 0) await deleteMediaFiles(toDelete);

        // Revoke object URLs
        form.photos.forEach((entry) => {
          if (typeof entry !== "string") URL.revokeObjectURL(entry.previewUrl);
        });

      } else {
        // ── CREATE flow ──────────────────────────────────────────────────────
        // We need the album ID before uploading photo files.
        // Step A: Determine cover string — if File, use placeholder first, update after.
        const coverIsFile = form.coverImage instanceof File;
        const initialCover = coverIsFile ? "" : (form.coverImage as string).trim();

        // Step B: Separate string photos from File photos — only string photos in initial insert
        const stringPhotos = form.photos
          .filter((p): p is string => typeof p === "string")
          .map((p) => p.trim())
          .filter(Boolean);
        const filePhotos = form.photos.filter(
          (p): p is { file: File; previewUrl: string } => typeof p !== "string"
        );

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
          .single();

        if (albumInsertError || !insertedAlbum) {
          setFormError("Gagal membuat album.");
          return;
        }
        const albumId: string = (insertedAlbum as { id: string }).id;

        // Step D: Upload cover file
        let resolvedCover = initialCover;
        if (coverIsFile && form.coverImage instanceof File) {
          const storagePath = generateStoragePath("album-cover", form.coverImage.type);
          const uploadResult = await uploadMediaFile(form.coverImage, storagePath);
          if (!uploadResult.ok) {
            // Rollback album row
            await supabase.from("albums").delete().eq("id", albumId);
            await refetch();
            setFormError(uploadResult.error);
            return;
          }
          resolvedCover = uploadResult.path;
          uploadedPaths.push(resolvedCover);
        }

        // Step E: Upload file photos
        const uploadedPhotoPaths: string[] = [];
        for (const entry of filePhotos) {
          const storagePath = generateStoragePath("album-photo", entry.file.type, albumId);
          const uploadResult = await uploadMediaFile(entry.file, storagePath);
          if (!uploadResult.ok) {
            // Rollback: delete album + uploaded files
            await supabase.from("albums").delete().eq("id", albumId);
            await deleteMediaFiles([...uploadedPaths, ...uploadedPhotoPaths]);
            await refetch();
            setFormError(uploadResult.error);
            return;
          }
          uploadedPhotoPaths.push(uploadResult.path);
          uploadedPaths.push(uploadResult.path);
        }

        // Step F: Build final resolved photos list, preserving order
        const finalPhotos: string[] = [];
        let filePhotoIdx = 0;
        for (const entry of form.photos) {
          if (typeof entry === "string") {
            const trimmed = entry.trim();
            if (trimmed) finalPhotos.push(trimmed);
          } else {
            if (filePhotoIdx < uploadedPhotoPaths.length) {
              finalPhotos.push(uploadedPhotoPaths[filePhotoIdx++]);
            }
          }
        }

        // Step G: Insert album_photos rows
        if (finalPhotos.length > 0) {
          const photoRows = finalPhotos.map((url, index) => ({
            album_id: albumId,
            image_url: url,
            sort_order: index + 1,
          }));
          const { error: photosError } = await supabase.from("album_photos").insert(photoRows);
          if (photosError) {
            console.error("Failed to insert album photos. Rolling back...", photosError);
            await supabase.from("albums").delete().eq("id", albumId);
            await deleteMediaFiles(uploadedPaths);
            await refetch();
            setFormError("Gagal menyimpan foto album. Pembuatan album dibatalkan.");
            return;
          }
        }

        // Step H: Update cover_image if it was a file
        if (resolvedCover && resolvedCover !== initialCover) {
          await supabase.from("albums").update({ cover_image: resolvedCover }).eq("id", albumId);
        }

        // Revoke object URLs
        form.photos.forEach((entry) => {
          if (typeof entry !== "string") URL.revokeObjectURL(entry.previewUrl);
        });

        // Refetch admin context so the newly created album appears immediately without page reload
        await refetch();
      }

      setShowModal(false);
      setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Galeri</h1>
          <p className="text-base font-medium text-muted-foreground">{albums.length} album</p>
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
        <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            <div key={album.id} className="neo-card bg-white rounded-3xl overflow-hidden neo-shadow-sm hover:neo-shadow-md transition-shadow group">
              {/* Cover Image */}
              <div className="relative w-full h-48 bg-muted overflow-hidden">
                {album.coverImage ? (
                  <img
                    src={resolveMediaUrl(album.coverImage)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon size={32} className="text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-black text-foreground mb-1 line-clamp-2">{album.title}</h3>
                <p className="text-xs font-bold text-muted-foreground mb-4 line-clamp-2">{album.description || "—"}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <ImageIcon size={14} strokeWidth={2} />
                    {album.photoCount} foto
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">{new Date(album.date).toLocaleDateString("id-ID")}</div>
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
                        const result = await removeAlbum(album.id);
                        if (!result.ok) alert(result.error);
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={closeModal} />
          <div className="relative w-full max-w-2xl neo-card bg-white rounded-3xl p-8 neo-shadow-lg anim-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ImageIcon size={20} className="text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">{editId ? "Edit Album" : "Tambah Album"}</h2>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Judul Album</label>
                  <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Slug</label>
                  <input required type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors resize-none" />
              </div>

              {/* Cover Image — dual-mode upload */}
              <MediaUploadInput
                label="Cover Image"
                value={typeof form.coverImage === "string" ? form.coverImage : ""}
                onChange={(v) => setForm({ ...form, coverImage: v })}
                maxSizeMB={5}
                previewClassName="size-16"
                placeholder="https://... atau /foto-kegiatan/cover.jpg"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Tanggal</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Urutan Tampilan</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Nilai lebih kecil akan tampil lebih dulu.</p>
                </div>
              </div>

              {/* Photo Manager */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Foto Kegiatan ({form.photos.length})
                  </label>
                  <span className="text-[11px] text-muted-foreground">Gunakan panah untuk mengatur urutan</span>
                </div>

                {/* Add by URL */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPhotoByUrl();
                      }
                    }}
                    placeholder="URL / Path foto (Enter untuk tambah)..."
                    className="flex-1 px-4 py-2.5 bg-muted border-2 border-transparent rounded-xl font-bold text-sm focus:border-border outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addPhotoByUrl}
                    className="px-4 py-2.5 bg-muted border-2 border-transparent rounded-xl font-bold hover:border-border transition-colors flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} strokeWidth={3} /> Tambah
                  </button>
                  {/* Add by File */}
                  <label
                    className="px-4 py-2.5 bg-muted border-2 border-transparent rounded-xl font-bold hover:border-border transition-colors flex items-center gap-1 text-sm cursor-pointer"
                    title="Upload foto dari file"
                  >
                    <Upload size={16} strokeWidth={2.5} />
                    <input
                      ref={photoFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={addPhotoByFile}
                      className="sr-only"
                    />
                  </label>
                </div>

                {photoFileError && (
                  <p className="text-[11px] font-bold text-red-600 mb-2">{photoFileError}</p>
                )}

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {form.photos.map((photo, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-xl border border-border/10">
                      <span className="text-xs font-black text-muted-foreground w-6 text-center shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={photoPreviewSrc(photo)}
                        alt={`Foto ${idx + 1}`}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
                        className="size-10 rounded-lg object-cover border border-border bg-white shrink-0"
                      />
                      {typeof photo === "string" ? (
                        <input
                          type="text"
                          value={photo}
                          onChange={(e) => updatePhotoUrlAt(idx, e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-border/30 rounded-lg text-xs font-bold text-foreground focus:outline-none focus:border-border transition-colors"
                        />
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{photo.file.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {(photo.file.size / 1024 / 1024).toFixed(2)} MB · Akan diupload
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => movePhoto(idx, idx - 1)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Pindah ke Atas"
                        >
                          <ChevronUp size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.photos.length - 1}
                          onClick={() => movePhoto(idx, idx + 1)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Pindah ke Bawah"
                        >
                          <ChevronDown size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ml-1"
                          title="Hapus Foto"
                        >
                          <X size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {form.photos.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 italic">Belum ada foto dalam album ini.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-4 bg-primary text-white border-2 border-border rounded-2xl font-black text-lg neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Album"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
