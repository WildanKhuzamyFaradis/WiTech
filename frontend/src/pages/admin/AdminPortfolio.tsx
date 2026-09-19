import { useState } from "react";
import { Search, Plus, Edit, Trash, X, Folder, Eye, AlertCircle } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import type { Project } from "../../lib/types";
import {
  resolveMediaUrl,
  generateStoragePath,
  uploadMediaFile,
  deleteMediaFiles,
  isManagedStoragePath,
} from "../../lib/storage";
import MediaUploadInput from "../../components/admin/MediaUploadInput";

interface ProjectFormData extends Omit<Project, "id" | "image"> {
  sortOrder: number;
  image: string | File;
}

const emptyForm: ProjectFormData = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  divisionId: "",
  tags: [],
  year: new Date().getFullYear(),
  status: "draft",
  featured: false,
  image: "",
  members: [],
  award: "",
  githubUrl: "",
  liveUrl: "",
  sortOrder: 0,
};

export default function AdminPortfolio() {
  const { projects, divisions, addProject, updateProject, removeProject, loading } = useAdminData();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormData>(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [originalImagePath, setOriginalImagePath] = useState("");

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    const nextOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.sortOrder ?? 0)) + 1 : 0;
    setForm({ ...emptyForm, sortOrder: nextOrder });
    setEditId(null);
    setTagInput("");
    setMemberInput("");
    setOriginalImagePath("");
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setForm({
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      divisionId: p.divisionId,
      tags: [...p.tags],
      year: p.year,
      status: p.status,
      featured: p.featured,
      image: p.image,
      members: [...p.members],
      award: p.award,
      githubUrl: p.githubUrl ?? "",
      liveUrl: p.liveUrl ?? "",
      sortOrder: p.sortOrder ?? 0,
    });
    setEditId(p.id);
    setTagInput("");
    setMemberInput("");
    setOriginalImagePath(p.image);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.divisionId || !form.slug.trim()) {
      setFormError("Judul, Slug, dan Divisi harus diisi.");
      return;
    }
    if (form.year < 1900 || form.year > 2100) {
      setFormError("Tahun harus antara 1900 dan 2100.");
      return;
    }
    if (submitting) return;

    try {
      setSubmitting(true);
      setFormError(null);

      let imageValue: string;
      let newlyUploadedPath = "";

      if (form.image instanceof File) {
        const storagePath = generateStoragePath("project", form.image.type);
        const uploadResult = await uploadMediaFile(form.image, storagePath);
        if (!uploadResult.ok) {
          setFormError(uploadResult.error);
          return;
        }
        imageValue = uploadResult.path;
        newlyUploadedPath = uploadResult.path;
      } else {
        imageValue = form.image.trim();
      }

      const payload = {
        ...form,
        image: imageValue,
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        award: form.award.trim(),
        githubUrl: form.githubUrl?.trim() || undefined,
        liveUrl: form.liveUrl?.trim() || undefined,
        sortOrder: Math.max(0, Math.floor(form.sortOrder)),
      };

      const result = editId ? await updateProject(editId, payload) : await addProject(payload);

      if (!result.ok) {
        if (newlyUploadedPath) await deleteMediaFiles([newlyUploadedPath]);
        setFormError(result.error);
        return;
      }

      if (editId && newlyUploadedPath && isManagedStoragePath(originalImagePath)) {
        await deleteMediaFiles([originalImagePath]);
      }

      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) });
  };

  const addMember = () => {
    const m = memberInput.trim();
    if (m && !form.members.includes(m)) {
      setForm({ ...form, members: [...form.members, m] });
    }
    setMemberInput("");
  };

  const removeMember = (m: string) => {
    setForm({ ...form, members: form.members.filter((x) => x !== m) });
  };

  const toggleStatus = async (id: string) => {
    if (togglingId === id) return;
    const p = projects.find((x) => x.id === id);
    if (p) {
      try {
        setTogglingId(id);
        const result = await updateProject(id, { status: p.status === "published" ? "draft" : "published" });
        if (!result.ok) alert(result.error);
      } finally {
        setTogglingId(null);
      }
    }
  };


  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Portofolio</h1>
          <p className="text-base font-medium text-muted-foreground">{projects.length} proyek aktif</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-xl text-sm font-bold hover:-translate-y-1 transition-transform neo-shadow-sm hover:neo-shadow-md"
        >
          <Plus size={18} strokeWidth={3} /> Tambah Proyek
        </button>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mb-6">
        <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari proyek..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-transparent rounded-xl text-base font-bold text-foreground placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
        />
      </div>

      {/* Table */}
      <div className="neo-card bg-white rounded-3xl overflow-hidden neo-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border/10 bg-muted/50">
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Proyek</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden md:table-cell">Divisi</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Tahun</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {p.image ? (
                        <img
                          src={resolveMediaUrl(p.image)}
                          alt={p.title}
                          className="size-12 rounded-xl object-cover border-2 border-border group-hover:scale-105 transition-transform"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
                        />
                      ) : (
                        <div className="size-12 rounded-xl border-2 border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-muted">
                          <Folder size={20} className="text-muted-foreground" strokeWidth={2.5} />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-base text-foreground tracking-tight">{p.title}</p>
                        <p className="text-xs font-bold text-muted-foreground">{p.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-muted-foreground hidden md:table-cell">
                    {divisions.find((d) => d.id === p.divisionId)?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-muted-foreground hidden lg:table-cell">{p.year}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                        p.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {p.status === "published" ? "Dipublikasikan" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(p.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={p.status === "published" ? "Ubah ke Draft" : "Publikasikan"}
                      >
                        <Eye size={16} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus proyek "${p.title}"?`)) {
                            const result = await removeProject(p.id);
                            if (!result.ok) alert(result.error);
                          }
                        }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Hapus"
                      >
                        <Trash size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Folder size={28} className="text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">Belum ada proyek.</p>
          </div>
        )}

        <div className="px-6 py-4 border-t-2 border-border/10 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase">
            Menampilkan {filtered.length} dari {projects.length}
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-8">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto neo-card bg-white rounded-3xl p-6 neo-shadow-lg anim-pop">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Folder size={20} className="text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">{editId ? "Edit Proyek" : "Tambah Proyek"}</h2>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Judul</label>
                  <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Slug</label>
                  <input required type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Subtitle</label>
                <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Deskripsi</label>
                <textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors resize-none" />
              </div>

              {/* Division & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Divisi</label>
                  <select
                    required
                    value={form.divisionId}
                    onChange={(e) => {
                      const div = divisions.find((d) => d.id === e.target.value);
                      if (div) setForm({ ...form, divisionId: div.id });
                    }}
                    className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
                  >
                    <option value="">Pilih Divisi</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Tahun</label>
                  <input required type="number" min={1900} max={2100} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>

              {/* Image — dual-mode upload */}
              <MediaUploadInput
                label="Gambar Proyek"
                value={typeof form.image === "string" ? form.image : ""}
                onChange={(v) => setForm({ ...form, image: v })}
                maxSizeMB={5}
                previewClassName="size-14"
                placeholder="https://... atau /foto-proyek/image.jpg"
              />

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Urutan Tampilan</label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1">Nilai lebih kecil akan tampil lebih dulu.</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Tag</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Ketik lalu Enter..."
                    className="flex-1 px-3 py-2 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
                  />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-muted border-2 border-transparent rounded-lg font-bold hover:border-border transition-colors">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-muted text-foreground">
                      {t}
                      <button type="button" onClick={() => removeTag(t)} className="text-muted-foreground hover:text-primary">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Members */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Anggota Tim</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMember(); } }}
                    placeholder="Nama anggota..."
                    className="flex-1 px-3 py-2 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
                  />
                  <button type="button" onClick={addMember} className="px-3 py-2 bg-muted border-2 border-transparent rounded-lg font-bold hover:border-border transition-colors">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.members.map((m) => (
                    <span key={m} className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-muted text-foreground">
                      {m}
                      <button type="button" onClick={() => removeMember(m)} className="text-muted-foreground hover:text-primary">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Award & Links */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Penghargaan</label>
                <input type="text" value={form.award} onChange={(e) => setForm({ ...form, award: e.target.value })} className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">GitHub URL</label>
                  <input type="url" value={form.githubUrl || ""} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Live URL</label>
                  <input type="url" value={form.liveUrl || ""} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>

              {/* Featured & Status */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold cursor-pointer hover:border-border transition-colors">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="size-5 rounded border-2 border-border cursor-pointer"
                  />
                  <span className="text-sm">Proyek Unggulan</span>
                </label>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "published" | "draft" })}
                    className="w-full px-4 py-3.5 bg-muted border-2 border-transparent rounded-xl font-bold focus:border-border outline-none transition-colors"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Dipublikasikan</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3 bg-primary text-white border-2 border-border rounded-2xl font-black text-base neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Proyek"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
