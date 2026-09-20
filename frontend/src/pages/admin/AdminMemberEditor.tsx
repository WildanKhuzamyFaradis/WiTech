import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useAdminData } from "../../context/AdminDataContext";
import type { Member } from "../../lib/types";
import { deleteMediaFiles, generateStoragePath, isManagedStoragePath, uploadMediaFile, resolveMediaUrl } from "../../lib/storage";

type FormState = Omit<Omit<Member, "id">, "avatar"> & { avatar: string | File };
const emptyForm: FormState = { name: "", role: "Anggota", divisionId: null, year: "2024", avatar: "", github: "", linkedin: "", active: true, sortOrder: 0 };

const field = "w-full min-h-11 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

export default function AdminMemberEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, divisions, addMember, updateMember, loading } = useAdminData();
  const editing = Boolean(id);
  const member = useMemo(() => members.find((item) => item.id === id), [members, id]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [initial, setInitial] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      const next = { name: member.name ?? "", role: member.role ?? "", divisionId: member.divisionId ?? null, year: member.year ?? "", avatar: member.avatar ?? "", github: member.github ?? "", linkedin: member.linkedin ?? "", active: member.active ?? true, sortOrder: member.sortOrder ?? 0 };
      setForm(next);
      setInitial(next);
    }
  }, [member]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  if (loading && editing) return <div className="py-20 text-center font-bold text-muted-foreground">Memuat data member...</div>;
  if (editing && !member) return <div className="max-w-3xl py-10"><h1 className="text-3xl font-black mb-3">Member tidak ditemukan.</h1><Link to="/admin/members" className="text-primary font-bold">Kembali ke Member</Link></div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); setSuccess("");
    if (!form.name.trim()) { setError("Nama lengkap wajib diisi."); return; }
    if (form.github.trim() && !/^https?:\/\//i.test(form.github.trim())) { setError("GitHub harus berupa URL lengkap."); return; }
    if (form.linkedin.trim() && !/^https?:\/\//i.test(form.linkedin.trim())) { setError("LinkedIn harus berupa URL lengkap."); return; }
    if (submitting) return;
    setSubmitting(true);
    let avatar = typeof form.avatar === "string" ? form.avatar.trim() : "";
    let uploaded = "";
    try {
      if (form.avatar instanceof File) {
        const result = await uploadMediaFile(form.avatar, generateStoragePath("member", form.avatar.type));
        if (!result.ok) { setError(result.error); return; }
        avatar = result.path; uploaded = result.path;
      }
      if (!avatar) avatar = member?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${form.name.trim().replace(/\s+/g, "")}&backgroundColor=transparent`;
      const payload: Omit<Member, "id"> = { ...form, name: form.name.trim(), role: form.role.trim(), year: form.year.trim(), avatar, github: form.github.trim(), linkedin: form.linkedin.trim() };
      const result = editing ? await updateMember(id!, payload) : await addMember(payload);
      if (!result.ok) { if (uploaded) await deleteMediaFiles([uploaded]); setError(result.error); return; }
      if (editing && member && member.avatar !== avatar && isManagedStoragePath(member.avatar)) await deleteMediaFiles([member.avatar]);
      setSuccess(editing ? "Perubahan member berhasil disimpan." : "Member berhasil ditambahkan.");
      navigate("/admin/members");
    } finally { setSubmitting(false); }
  };

  return <div className="max-w-[1100px] anim-fade-up">
    <Link to="/admin/members" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6"><ArrowLeft size={16} /> Kembali ke Member</Link>
    <div className="mb-8"><h1 className="text-3xl font-black tracking-tight">{editing ? "Edit Member" : "Tambah Member"}</h1><p className="text-base font-medium text-muted-foreground mt-1">{editing ? member?.name : "Tambahkan anggota baru ke data WiTECH."}</p></div>
    <form onSubmit={submit} className="bg-white border border-border/25 rounded-xl p-5 md:p-8 space-y-8 shadow-sm">
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-bold">{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-bold">{success}</div>}
      <section><h2 className="text-lg font-black pb-3 border-b-2 border-border/10">Informasi Utama</h2><div className="grid md:grid-cols-2 gap-5 mt-5">
        <label className="text-sm font-bold">Nama Lengkap<input required value={form.name} onChange={(e) => setValue("name", e.target.value)} placeholder="Nama lengkap anggota" className={`${field} mt-2`} /></label>
        <label className="text-sm font-bold">Role<input required value={form.role} onChange={(e) => setValue("role", e.target.value)} placeholder="Contoh: Anggota" className={`${field} mt-2`} /></label>
        <label className="text-sm font-bold">Divisi<select value={form.divisionId ?? "core"} onChange={(e) => setValue("divisionId", e.target.value === "core" ? null : e.target.value)} className={`${field} mt-2`}><option value="core">Core (Pengurus)</option>{divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}</select></label>
        <label className="text-sm font-bold">Angkatan<input required value={form.year} onChange={(e) => setValue("year", e.target.value)} className={`${field} mt-2`} /></label>
      </div></section>
      <section><h2 className="text-lg font-black pb-3 border-b-2 border-border/10">Foto Profil</h2><div className="mt-5 flex flex-wrap items-center gap-5"><div className="size-20 rounded-xl overflow-hidden bg-muted border-2 border-border/20">{form.avatar && <img src={form.avatar instanceof File ? URL.createObjectURL(form.avatar) : resolveMediaUrl(form.avatar)} alt="Preview avatar" className="w-full h-full object-cover" />}</div><label className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-border rounded-lg font-bold cursor-pointer"><UploadCloud size={17} /> Ganti Foto<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) setValue("avatar", file); }} /></label><p className="text-xs text-muted-foreground">JPG, PNG, atau WEBP. Maksimal 2 MB.</p></div></section>
      <section><h2 className="text-lg font-black pb-3 border-b-2 border-border/10">Social Media</h2><div className="grid md:grid-cols-2 gap-5 mt-5"><label className="text-sm font-bold">GitHub<input value={form.github} onChange={(e) => setValue("github", e.target.value)} placeholder="https://github.com/username" className={`${field} mt-2`} /></label><label className="text-sm font-bold">LinkedIn<input value={form.linkedin} onChange={(e) => setValue("linkedin", e.target.value)} placeholder="https://www.linkedin.com/in/username" className={`${field} mt-2`} /></label></div></section>
      <section><h2 className="text-lg font-black pb-3 border-b-2 border-border/10">Pengaturan Member</h2><div className="mt-5 space-y-5"><label className="flex items-start gap-3 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={(e) => setValue("active", e.target.checked)} className="size-4 mt-0.5 accent-primary" /><span>Member Aktif<small className="block font-medium text-muted-foreground mt-1">Member aktif akan ditampilkan di website publik.</small></span></label><label className="block text-sm font-bold max-w-xs">Urutan Tampilan<input type="number" min={0} value={form.sortOrder} onChange={(e) => setValue("sortOrder", Number(e.target.value))} className={`${field} mt-2`} /><small className="block font-medium text-muted-foreground mt-1">Angka lebih kecil ditampilkan lebih dulu.</small></label></div></section>
      <div className="flex justify-end gap-3 pt-5 border-t-2 border-border/10"><Link to="/admin/members" className="px-5 py-3 border-2 border-border rounded-lg font-bold">Batal</Link><button type="submit" disabled={submitting || !dirty} className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-lg font-bold disabled:opacity-50"><Save size={17} />{submitting ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Member"}</button></div>
    </form>
  </div>;
}
