import { useState } from "react";
import { Search, Plus, Edit, Trash, GitFork, Briefcase, X, Users, AlertCircle } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import type { Member } from "../../lib/types";
import { divisionName } from "../../lib/dataContract";
import {
  resolveMediaUrl,
  generateStoragePath,
  uploadMediaFile,
  deleteMediaFiles,
  isManagedStoragePath,
} from "../../lib/storage";
import MediaUploadInput from "../../components/admin/MediaUploadInput";

interface MemberFormData {
  name: string;
  role: string;
  divisionId: string | null;
  year: string;
  avatar: string | File;
  github: string;
  linkedin: string;
  active: boolean;
  sortOrder: number;
}

const emptyForm: MemberFormData = {
  name: "",
  role: "Anggota",
  divisionId: null,
  year: "2024",
  avatar: "",
  github: "",
  linkedin: "",
  active: true,
  sortOrder: 0,
};

export default function AdminMembers() {
  const { members, divisions, addMember, updateMember, removeMember, loading } = useAdminData();
  const [search, setSearch] = useState("");
  const [divFilter, setDivFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Track original raw DB avatar path for cleanup after successful edit
  const [originalAvatarPath, setOriginalAvatarPath] = useState("");

  const filtered = members.filter((m) => {
    const matchDiv =
      divFilter === "all" ||
      (divFilter === "core" ? m.divisionId === null : m.divisionId === divFilter);
    const matchSearch =
      search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    return matchDiv && matchSearch;
  });

  const openAdd = () => {
    const nextOrder = members.length > 0 ? Math.max(...members.map((m) => m.sortOrder ?? 0)) + 1 : 0;
    setForm({ ...emptyForm, divisionId: divisions[0]?.id ?? null, sortOrder: nextOrder });
    setEditId(null);
    setOriginalAvatarPath("");
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (member: Member) => {
    setForm({
      name: member.name,
      role: member.role,
      divisionId: member.divisionId,
      year: member.year,
      avatar: member.avatar,
      github: member.github,
      linkedin: member.linkedin,
      active: member.active ?? true,
      sortOrder: member.sortOrder ?? 0,
    });
    setEditId(member.id);
    setOriginalAvatarPath(member.avatar);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Nama harus diisi.");
      return;
    }
    if (submitting) return;

    try {
      setSubmitting(true);
      setFormError(null);

      let avatarValue: string;
      let newlyUploadedPath = "";

      if (form.avatar instanceof File) {
        // Upload file → get raw storage path
        const storagePath = generateStoragePath("member", form.avatar.type);
        const uploadResult = await uploadMediaFile(form.avatar, storagePath);
        if (!uploadResult.ok) {
          setFormError(uploadResult.error);
          return;
        }
        avatarValue = uploadResult.path;
        newlyUploadedPath = uploadResult.path;
      } else {
        // String: use as-is, or fallback to DiceBear if empty
        avatarValue =
          form.avatar.trim() ||
          `https://api.dicebear.com/7.x/notionists/svg?seed=${form.name.trim().replace(/\s+/g, "")}&backgroundColor=transparent`;
      }

      const payload: Omit<Member, "id"> = {
        ...form,
        name: form.name.trim(),
        role: form.role.trim(),
        year: form.year.trim(),
        avatar: avatarValue,
        github: form.github.trim(),
        linkedin: form.linkedin.trim(),
      };

      const result = editId ? await updateMember(editId, payload) : await addMember(payload);

      if (!result.ok) {
        // DB failed — clean up newly uploaded file to avoid orphan objects
        if (newlyUploadedPath) await deleteMediaFiles([newlyUploadedPath]);
        setFormError(result.error);
        return;
      }

      // DB succeeded — clean up old managed avatar if it was changed (replaced with new upload or reset to DiceBear)
      if (editId && originalAvatarPath !== avatarValue && isManagedStoragePath(originalAvatarPath)) {
        await deleteMediaFiles([originalAvatarPath]);
      }

      setShowModal(false);
      setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Members</h1>
          <p className="text-base font-medium text-muted-foreground">{members.length} anggota Witech</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-5 py-3 border-2 border-border bg-white rounded-xl text-sm font-bold text-foreground hover:-translate-y-1 transition-transform neo-shadow-sm">
            Import CSV
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-xl text-sm font-bold hover:-translate-y-1 transition-transform neo-shadow-sm hover:neo-shadow-md"
          >
            <Plus size={18} strokeWidth={3} /> Tambah
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-transparent rounded-xl text-base font-bold text-foreground placeholder:text-muted-foreground placeholder:font-medium focus:outline-none focus:border-border transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setDivFilter("all")}
            className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
              divFilter === "all"
                ? "bg-foreground text-background border-border neo-shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setDivFilter("core")}
            className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
              divFilter === "core"
                ? "bg-accent text-foreground border-border neo-shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted"
            }`}
          >
            Core
          </button>
          {divisions.map((d) => (
            <button
              key={d.id}
              onClick={() => setDivFilter(d.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                divFilter === d.id
                  ? "text-white border-border neo-shadow-sm"
                  : "bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted"
              }`}
              style={divFilter === d.id ? { backgroundColor: d.color } : {}}
            >
              {d.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="neo-card bg-white rounded-3xl overflow-hidden neo-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border/10 bg-muted/50">
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Divisi</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Angkatan</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Sosmed</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((member) => {
                const color = member.divisionId === null ? "#ffe66d" : divisions.find(d => d.id === member.divisionId)?.color || "#6366f1";
                return (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="size-12 rounded-xl overflow-hidden border-2 shrink-0 bg-muted group-hover:scale-105 transition-transform"
                          style={{ borderColor: color }}
                        >
                          <img
                            src={resolveMediaUrl(member.avatar)}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-base text-foreground tracking-tight">{member.name}</p>
                            {!member.active && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                Nonaktif
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-muted-foreground md:hidden">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-muted-foreground hidden md:table-cell">
                      {member.role}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span
                        className="text-xs font-black px-3 py-1.5 rounded-full inline-block"
                        style={{ backgroundColor: color + "15", color: color }}
                      >
                        {divisionName(divisions, member.divisionId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-muted-foreground hidden xl:table-cell">
                      {member.year}
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <div className="flex gap-2">
                        <a href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <GitFork size={16} strokeWidth={2.5} />
                        </a>
                        <a href={`https://linkedin.com/in/${member.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Briefcase size={16} strokeWidth={2.5} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(member)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
                          <Edit size={16} strokeWidth={2.5} />
                        </button>
                        <button onClick={async () => {
                          if (confirm(`Hapus member "${member.name}"?`)) {
                            const result = await removeMember(member.id);
                            if (!result.ok) alert(result.error);
                          }
                        }} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Remove">
                          <Trash size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center text-2xl mb-4">🔍</div>
            <p className="text-lg font-bold">Waduh, nggak ada member yang cocok.</p>
          </div>
        )}

        <div className="px-6 py-4 border-t-2 border-border/10 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase">
            Menampilkan {filtered.length} dari {members.length}
          </p>
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-8">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto neo-card bg-white rounded-3xl p-6 neo-shadow-lg anim-pop">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={20} strokeWidth={3} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">{editId ? "Edit Member" : "Tambah Member"}</h2>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Nama Lengkap</label>
                  <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Role</label>
                  <input required type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Divisi</label>
                  <select required value={form.divisionId ?? "core"} onChange={e => setForm({ ...form, divisionId: e.target.value === "core" ? null : e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors">
                    <option value="core">Core (Pengurus)</option>
                    {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Angkatan</label>
                  <input required type="text" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>

              {/* Avatar — dual-mode upload */}
              <MediaUploadInput
                label="Avatar"
                value={typeof form.avatar === "string" ? form.avatar : ""}
                onChange={(v) => setForm({ ...form, avatar: v })}
                maxSizeMB={2}
                previewClassName="size-12"
                placeholder="https://... atau /foto-anggota/nama.jpg (opsional)"
              />
              <p className="text-[11px] text-muted-foreground -mt-1">Kosongkan URL untuk menggunakan avatar otomatis.</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">GitHub</label>
                  <input type="text" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} placeholder="username" className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">LinkedIn</label>
                  <input type="text" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="username" className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                  Urutan Tampilan
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Nilai lebih kecil akan tampil lebih dulu.</p>
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border/10">
                <input
                  type="checkbox"
                  id="member-active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="size-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="member-active" className="text-xs font-bold text-foreground cursor-pointer select-none">
                  Anggota Aktif (Tampil di website publik)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3 bg-primary text-white border-2 border-border rounded-2xl font-black text-base neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
