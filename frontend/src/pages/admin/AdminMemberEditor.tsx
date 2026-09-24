import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Save, Search, Trash2, UploadCloud, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useAdminData } from "../../context/AdminDataContext";
import type { Member } from "../../lib/types";
import { deleteMediaFiles, generateStoragePath, uploadMediaFile, resolveMediaUrl } from "../../lib/storage";
import { avatarAfterSave, cancelStagedAvatar, confirmAvatarRemoval, shouldDeletePreviousAvatar } from "../../lib/avatarRemoval";
import { supabase } from "../../lib/supabaseClient";

type FormState = Omit<Omit<Member, "id">, "avatar"> & { avatar: string | File | null };
type Submission = { id: string; name: string; preview_url: string; division_id: string; division_name?: string; linkedin_url?: string | null; github_url?: string | null; created_at: string };
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [avatarRemovalRequested, setAvatarRemovalRequested] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState("");
  const [createdMemberId, setCreatedMemberId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (member) {
      const next = { name: member.name ?? "", role: member.role ?? "", divisionId: member.divisionId ?? null, year: member.year ?? "", avatar: member.avatar ?? "", github: member.github ?? "", linkedin: member.linkedin ?? "", active: member.active ?? true, sortOrder: member.sortOrder ?? 0 };
      setForm(next); setInitial(next); setSelectedSubmission(null); setAvatarRemovalRequested(false);
    }
  }, [member]);

  useEffect(() => {
    if (!(form.avatar instanceof File)) { setAvatarPreview(""); return; }
    const url = URL.createObjectURL(form.avatar); setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.avatar]);

  useEffect(() => {
    if (!pickerOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); setPickerOpen(false); } };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => { document.removeEventListener("keydown", onKeyDown); (openerRef.current || previous)?.focus?.(); };
  }, [pickerOpen]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial) || selectedSubmission !== null || avatarRemovalRequested;
  const fallbackAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${form.name.trim().replace(/\s+/g, "")}&backgroundColor=transparent`;
  const hasAvatarToRemove = !avatarRemovalRequested && (selectedSubmission !== null || form.avatar instanceof File || Boolean(form.avatar) || Boolean(member?.avatar));
  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const visibleSubmissions = useMemo(() => submissions.filter((item) => (!divisionFilter || item.division_id === divisionFilter) && item.name.toLowerCase().includes(search.trim().toLowerCase())), [submissions, divisionFilter, search]);

  const openPicker = async (event: React.MouseEvent<HTMLButtonElement>) => {
    openerRef.current = event.currentTarget;
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) { setError("Sesi admin sudah berakhir."); return; }
    const response = await fetch("/api/photo-submissions", { headers: { Authorization: `Bearer ${token}` } });
    const payload = await response.json();
    if (!response.ok || !payload.ok) { setError(payload.error || "Upload masuk belum dapat dimuat."); return; }
    setSubmissions(payload.submissions || []); setRejectError(""); setPickerOpen(true);
  };

  const rejectSubmission = async (submission: Submission) => {
    if (rejecting) return;
    setRejecting(submission.id); setRejectError("");
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch("/api/photo-submissions/reject", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.session?.access_token || ""}` }, body: JSON.stringify({ submissionId: submission.id }) });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Penolakan gagal.");
      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
    } catch (rejectErr) { setRejectError(rejectErr instanceof Error ? rejectErr.message : "Upload belum dapat ditolak."); }
    finally { setRejecting(null); }
  };

  const requestRemoveAvatar = () => {
    if (selectedSubmission) {
      const next = cancelStagedAvatar({ avatar: form.avatar, selectedSubmission: true, removalRequested: avatarRemovalRequested }, member?.avatar ?? null);
      setSelectedSubmission(next.selectedSubmission ? selectedSubmission : null);
      return;
    }
    if (form.avatar instanceof File) {
      const next = cancelStagedAvatar({ avatar: form.avatar, selectedSubmission: false, removalRequested: avatarRemovalRequested }, member?.avatar ?? null);
      setValue("avatar", next.avatar);
      setAvatarRemovalRequested(next.removalRequested);
      return;
    }
    if (member?.avatar || form.avatar) setRemoveDialogOpen(true);
  };

  const confirmRemoveAvatar = () => {
    setRemoveDialogOpen(false);
    const next = confirmAvatarRemoval();
    setSelectedSubmission(null);
    setAvatarRemovalRequested(next.removalRequested);
    setValue("avatar", next.avatar);
  };

  if (loading && editing) return <div className="py-20 text-center font-bold text-muted-foreground">Memuat data member...</div>;
  if (editing && !member) return <div className="max-w-3xl py-10"><h1 className="text-3xl font-black mb-3">Member tidak ditemukan.</h1><Link to="/admin/members" className="text-primary font-bold">Kembali ke Member</Link></div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setSuccess("");
    if (!form.name.trim()) { setError("Nama lengkap wajib diisi."); return; }
    if (form.github.trim() && !/^https?:\/\//i.test(form.github.trim())) { setError("GitHub harus berupa URL lengkap."); return; }
    if (form.linkedin.trim() && !/^https?:\/\//i.test(form.linkedin.trim())) { setError("LinkedIn harus berupa URL lengkap."); return; }
    if (submitting) return;
    setSubmitting(true); const previousAvatar = member?.avatar ?? null; let uploaded = "";
    try {
      if (form.avatar instanceof File) { const result = await uploadMediaFile(form.avatar, generateStoragePath("member", form.avatar.type)); if (!result.ok) { setError(result.error); return; } uploaded = result.path; }
      const avatar = avatarAfterSave({ avatar: form.avatar, selectedSubmission: selectedSubmission !== null, removalRequested: avatarRemovalRequested }, previousAvatar, uploaded || null, fallbackAvatar);
      const payload: Omit<Member, "id"> = { ...form, name: form.name.trim(), role: form.role.trim(), year: form.year.trim(), avatar, github: form.github.trim(), linkedin: form.linkedin.trim() };
      const existingId = editing ? id : createdMemberId;
      const result = existingId ? await updateMember(existingId, payload) : await addMember(payload);
      if (!result.ok) { if (uploaded) await deleteMediaFiles([uploaded]); setError(result.error); return; }
      const targetId = existingId || result.id;
      if (!editing && !createdMemberId && targetId) setCreatedMemberId(targetId);
      if (selectedSubmission) {
        if (!targetId) { setError("Member tersimpan, tetapi ID tidak tersedia untuk menghubungkan foto. Coba simpan ulang."); return; }
        const { data: session } = await supabase.auth.getSession();
        const response = await fetch("/api/photo-submissions/use", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.session?.access_token || ""}` }, body: JSON.stringify({ submissionId: selectedSubmission.id, memberId: targetId }) });
        const used = await response.json();
        if (!response.ok || !used.ok) { setError("Member sudah tersimpan. Foto belum terhubung; periksa submission lalu tekan Simpan lagi untuk mencoba ulang."); return; }
      }
      if (editing && shouldDeletePreviousAvatar(previousAvatar, avatar)) {
        const cleanup = await deleteMediaFiles([previousAvatar]);
        if (!cleanup.ok) console.error("Avatar cleanup failed after member update.");
      }
      setInitial(payload); setForm(payload); setSelectedSubmission(null); setAvatarRemovalRequested(false);
      setSuccess(editing ? "Perubahan member berhasil disimpan." : "Member berhasil ditambahkan."); navigate("/admin/members");
    } finally { setSubmitting(false); }
  };

  return <div className="max-w-[1100px] anim-fade-up">
    <Link to="/admin/members" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6"><ArrowLeft size={16} /> Kembali ke Member</Link>
    <div className="mb-8"><h1 className="text-3xl font-black tracking-tight">{editing ? "Edit Member" : "Tambah Member"}</h1><p className="text-base font-medium text-muted-foreground mt-1">{editing ? member?.name : "Tambahkan anggota baru ke data WiTECH."}</p></div>
    <form onSubmit={submit} className="bg-white border border-border/25 rounded-xl p-5 md:p-8 space-y-8">
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-bold" role="alert">{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-bold" role="status">{success}</div>}
      <section><h2 className="text-lg font-black pb-3 border-b-2 border-border/10">Informasi Utama</h2><div className="grid md:grid-cols-2 gap-5 mt-5"><label className="text-sm font-bold">Nama Lengkap<input required value={form.name} onChange={(e) => setValue("name", e.target.value)} placeholder="Nama lengkap anggota" className={`${field} mt-2`} /></label><label className="text-sm font-bold">Role<input required value={form.role} onChange={(e) => setValue("role", e.target.value)} placeholder="Contoh: Anggota" className={`${field} mt-2`} /></label><label className="text-sm font-bold">Divisi<select value={form.divisionId ?? "core"} onChange={(e) => setValue("divisionId", e.target.value === "core" ? null : e.target.value)} className={`${field} mt-2`}><option value="core">Core (Pengurus)</option>{divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}</select></label><label className="text-sm font-bold">Angkatan<input required value={form.year} onChange={(e) => setValue("year", e.target.value)} className={`${field} mt-2`} /></label></div></section>
      <section>
        <h2 className="text-lg font-black pb-3 border-b-2 border-border/10">Foto Profil</h2>
        <div className="mt-5 flex flex-wrap items-center gap-5">
          <div className="size-20 rounded-xl overflow-hidden bg-muted border-2 border-border/20">
            {selectedSubmission ? <img src={selectedSubmission.preview_url} alt={`Preview ${selectedSubmission.name}`} className="w-full h-full object-cover" /> : <img src={avatarPreview || resolveMediaUrl(typeof form.avatar === "string" ? form.avatar : "") || fallbackAvatar} alt="Preview avatar" className="w-full h-full object-cover" />}
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-border rounded-lg font-bold cursor-pointer focus-within:ring-2 focus-within:ring-primary"><UploadCloud size={17} /> Ganti Foto<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setAvatarRemovalRequested(false); setSelectedSubmission(null); setValue("avatar", file); } }} /></label>
          <button ref={openerRef as React.RefObject<HTMLButtonElement>} type="button" onClick={openPicker} className="px-4 py-2.5 border-2 border-border rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary">Pilih dari Upload Masuk</button>
          <button type="button" onClick={requestRemoveAvatar} disabled={!hasAvatarToRemove} className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-700 rounded-lg font-bold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={17} /> Hapus Foto</button>
          <p className="text-xs text-muted-foreground">JPG, PNG, atau WEBP. Maksimal 2 MB.</p>
          {removeDialogOpen && <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="remove-avatar-title"><div className="max-w-sm w-full bg-white rounded-xl p-6"><h2 id="remove-avatar-title" className="text-lg font-black">Hapus foto profil member ini?</h2><div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setRemoveDialogOpen(false)} className="px-4 py-2.5 border-2 border-border rounded-lg font-bold">Batal</button><button type="button" onClick={confirmRemoveAvatar} className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold">Hapus Foto</button></div></div></div>}
        </div>
      </section>
      <section><h2 className="text-lg font-black pb-3 border-b-2 border-border/10">Social Media</h2><div className="grid md:grid-cols-2 gap-5 mt-5"><label className="text-sm font-bold">GitHub<input value={form.github} onChange={(e) => setValue("github", e.target.value)} placeholder="https://github.com/username" className={`${field} mt-2`} /></label><label className="text-sm font-bold">LinkedIn<input value={form.linkedin} onChange={(e) => setValue("linkedin", e.target.value)} placeholder="https://www.linkedin.com/in/username" className={`${field} mt-2`} /></label></div></section>
      <section><h2 className="text-lg font-black pb-3 border-b-2 border-border/10">Pengaturan Member</h2><div className="mt-5 space-y-5"><label className="flex items-start gap-3 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={(e) => setValue("active", e.target.checked)} className="size-4 mt-0.5 accent-primary" /><span>Member Aktif<small className="block font-medium text-muted-foreground mt-1">Member aktif akan ditampilkan di website publik.</small></span></label><label className="block text-sm font-bold max-w-xs">Urutan Tampilan<input type="number" min={0} value={form.sortOrder} onChange={(e) => setValue("sortOrder", Number(e.target.value))} className={`${field} mt-2`} /><small className="block font-medium text-muted-foreground mt-1">Angka lebih kecil ditampilkan lebih dulu.</small></label></div></section>
      <div className="flex justify-end gap-3 pt-5 border-t-2 border-border/10"><Link to="/admin/members" className="px-5 py-3 border-2 border-border rounded-lg font-bold">Batal</Link><button type="submit" disabled={submitting || !dirty} className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-lg font-bold disabled:opacity-50"><Save size={17} />{submitting ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Member"}</button></div>
    </form>
    {pickerOpen && <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="photo-picker-title"><div ref={dialogRef} tabIndex={-1} className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl p-6 outline-none"><div className="flex justify-between items-center mb-5"><h2 id="photo-picker-title" className="text-xl font-black">Pilih dari Upload Masuk</h2><button type="button" onClick={() => setPickerOpen(false)} className="font-black text-2xl focus:outline-none focus:ring-2 focus:ring-primary rounded" aria-label="Tutup"><X /></button></div><div className="grid md:grid-cols-[1fr_220px] gap-3 mb-5"><label className="relative"><Search size={17} className="absolute left-3 top-3.5 text-muted-foreground" /><span className="sr-only">Cari nama</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama..." className={`${field} pl-10`} /></label><label><span className="sr-only">Filter divisi</span><select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)} className={field}><option value="">Semua divisi</option>{divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}</select></label></div>{rejectError && <p role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-bold">{rejectError}</p>}<div className="grid sm:grid-cols-2 gap-4">{visibleSubmissions.map((submission) => <div key={submission.id} className="text-left border-2 border-border rounded-xl p-3"><button type="button" onClick={() => { setSelectedSubmission(submission); setPickerOpen(false); }} className="w-full text-left hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"><img src={submission.preview_url} alt={`Foto ${submission.name}`} className="w-full h-40 object-cover rounded-lg mb-3" /><p className="font-black">{submission.name}</p><p className="text-xs text-muted-foreground">{submission.division_name || "Divisi belum tersedia"} · {new Date(submission.created_at).toLocaleDateString("id-ID")}</p>{submission.github_url && <a href={submission.github_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-primary font-bold mr-3 mt-2">GitHub</a>}{submission.linkedin_url && <a href={submission.linkedin_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-2">LinkedIn</a>}</button><button type="button" disabled={Boolean(rejecting)} onClick={() => rejectSubmission(submission)} className="mt-3 text-xs font-bold text-red-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 rounded">{rejecting === submission.id ? "Menolak..." : "Tolak"}</button></div>)}</div>{visibleSubmissions.length === 0 && <p className="text-sm text-muted-foreground mt-4">Tidak ada upload yang cocok.</p>}</div></div>}
  </div>;
}
