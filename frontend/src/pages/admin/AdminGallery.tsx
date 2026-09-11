import { useState } from "react";
import { Search, Plus, Edit, Trash, X, Image as ImageIcon } from "lucide-react";
import { useStore } from "../../lib/store";
import type { Album } from "../../lib/data";

const emptyForm: Omit<Album, "id"> = {
  slug: "",
  title: "",
  description: "",
  coverImage: "",
  date: new Date().toISOString().split("T")[0],
  photoCount: 0,
  photos: [],
};

export default function AdminGallery() {
  const { albums, addAlbum, updateAlbum, removeAlbum } = useStore();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Album, "id">>(emptyForm);
  const [photoInput, setPhotoInput] = useState("");

  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setPhotoInput("");
    setShowModal(true);
  };

  const openEdit = (a: Album) => {
    setForm({ ...a });
    setEditId(a.id);
    setPhotoInput("");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) {
      alert("Judul dan Slug harus diisi");
      return;
    }
    const updated = { ...form, photoCount: form.photos.length };
    if (editId) {
      updateAlbum(editId, updated);
    } else {
      addAlbum(updated);
    }
    setShowModal(false);
  };

  const addPhoto = () => {
    const p = photoInput.trim();
    if (p && !form.photos.includes(p)) {
      setForm({ ...form, photos: [...form.photos, p] });
    }
    setPhotoInput("");
  };

  const removePhoto = (p: string) => {
    setForm({ ...form, photos: form.photos.filter((x) => x !== p) });
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
                    onClick={() => {
                      if (confirm(`Hapus album "${album.title}"?`)) removeAlbum(album.id);
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

            <div className="flex items-center gap-3 mb-8">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ImageIcon size={20} className="text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">{editId ? "Edit Album" : "Tambah Album"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Judul Album</label>
                  <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Slug</label>
                  <input required type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">URL Cover Image</label>
                <input type="url" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Tanggal</label>
                <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
              </div>

              {/* Photo URLs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Foto ({form.photos.length})</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPhoto(); } }}
                    placeholder="URL foto (Enter untuk tambah)..."
                    className="flex-1 px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors"
                  />
                  <button type="button" onClick={addPhoto} className="px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold hover:border-border transition-colors">
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {form.photos.map((photo, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg group">
                      <img src={photo} alt={`Photo ${idx + 1}`} className="size-10 rounded object-cover border border-border" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{photo}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(photo)}
                        className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full mt-4 py-4 bg-primary text-white border-2 border-border rounded-2xl font-black text-lg neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all">
                {editId ? "Simpan Perubahan" : "Tambah Album"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
