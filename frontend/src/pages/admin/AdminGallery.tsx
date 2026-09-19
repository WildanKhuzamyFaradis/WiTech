import { useState } from "react";
import { Search, Plus, Edit, Trash, X, Image as ImageIcon, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import type { Album } from "../../lib/types";

interface AlbumFormData {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  photoCount: number;
  photos: string[];
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

export default function AdminGallery() {
  const { albums, addAlbum, updateAlbum, removeAlbum, loading } = useAdminData();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AlbumFormData>(emptyForm);
  const [photoInput, setPhotoInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    const nextOrder = albums.length > 0 ? Math.max(...albums.map((a) => a.sortOrder ?? 0)) + 1 : 0;
    setForm({ ...emptyForm, sortOrder: nextOrder });
    setEditId(null);
    setPhotoInput("");
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
      photos: [...a.photos],
      sortOrder: a.sortOrder ?? 0,
    });
    setEditId(a.id);
    setPhotoInput("");
    setFormError(null);
    setShowModal(true);
  };

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
      const cleanPhotos = form.photos.map((p) => p.trim()).filter(Boolean);
      const updated = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        coverImage: form.coverImage.trim(),
        photos: cleanPhotos,
        photoCount: cleanPhotos.length,
      };
      const result = editId ? await updateAlbum(editId, updated) : await addAlbum(updated);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setShowModal(false);
      setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  const addPhoto = () => {
    const p = photoInput.trim();
    if (p && !form.photos.includes(p)) {
      setForm({ ...form, photos: [...form.photos, p] });
    }
    setPhotoInput("");
  };

  const removePhoto = (index: number) => {
    setForm({ ...form, photos: form.photos.filter((_, idx) => idx !== index) });
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.photos.length) return;
    const updated = [...form.photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setForm({ ...form, photos: updated });
  };

  const updatePhotoAt = (index: number, val: string) => {
    const updated = [...form.photos];
    updated[index] = val;
    setForm({ ...form, photos: updated });
  };

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
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl neo-card bg-white rounded-3xl p-8 neo-shadow-lg anim-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">URL / Path Cover Image</label>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://... atau /foto-kegiatan/cover.jpg"
                  className="w-full px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors"
                />
                {form.coverImage && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-muted rounded-xl border border-border/20">
                    <img
                      src={form.coverImage}
                      alt="Preview Cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                      className="size-16 rounded-xl object-cover border border-border bg-white shrink-0"
                    />
                    <div className="text-xs text-muted-foreground min-w-0">
                      <p className="font-bold text-foreground">Preview Cover</p>
                      <p className="truncate max-w-xs">{form.coverImage}</p>
                    </div>
                  </div>
                )}
              </div>

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
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPhoto();
                      }
                    }}
                    placeholder="URL / Path foto (Enter untuk tambah)..."
                    className="flex-1 px-4 py-2.5 bg-muted border-2 border-transparent rounded-xl font-bold text-sm focus:border-border outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addPhoto}
                    className="px-4 py-2.5 bg-muted border-2 border-transparent rounded-xl font-bold hover:border-border transition-colors flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} strokeWidth={3} /> Tambah
                  </button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {form.photos.map((photo, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-xl border border-border/10">
                      <span className="text-xs font-black text-muted-foreground w-6 text-center shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={photo}
                        alt={`Foto ${idx + 1}`}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                        className="size-10 rounded-lg object-cover border border-border bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={photo}
                        onChange={(e) => updatePhotoAt(idx, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-border/30 rounded-lg text-xs font-bold text-foreground focus:outline-none focus:border-border transition-colors"
                      />
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
