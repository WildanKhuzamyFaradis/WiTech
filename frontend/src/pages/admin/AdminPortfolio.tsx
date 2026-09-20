import { useState } from "react";
import { useNavigate } from "react-router";
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
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
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
    navigate("/admin/portfolio/new");
    return;
    const nextOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.sortOrder ?? 0)) + 1 : 0;
    setForm({ ...emptyForm, sortOrder: nextOrder });
    setEditId(null);
    setTagInput("");
    setMemberInput("");
    setOriginalImagePath("");
    setFormError(null);
  };

  const openEdit = (p: Project) => {
    navigate(`/admin/portfolio/${p.id}/edit`);
    return;
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

    </div>
  );
}
