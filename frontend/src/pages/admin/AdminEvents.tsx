import { useState } from "react";
import { Search, Plus, Edit, Trash, X, Calendar, LockOpen, Lock, AlertCircle } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import type { Event } from "../../lib/types";
import { formatEventDate, formatEventTime, todayInJakarta } from "../../lib/dataContract";

const emptyForm: Omit<Event, "id"> = {
  title: "",
  date: todayInJakarta(),
  startTime: "09:00",
  endTime: "12:00",
  location: "",
  type: "Workshop",
  description: "",
  image: "",
  registrationOpen: true,
  registrationLink: "",
};

export default function AdminEvents() {
  const { events, addEvent, updateEvent, removeEvent, loading } = useAdminData();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Event, "id">>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ ...emptyForm, date: todayInJakarta() });
    setEditId(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (e: Event) => {
    setForm({ ...e });
    setEditId(e.id);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) {
      setFormError("Judul dan Lokasi harus diisi.");
      return;
    }
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      setFormError("Jam selesai harus lebih akhir dari jam mulai.");
      return;
    }
    if (submitting) return;
    try {
      setSubmitting(true);
      setFormError(null);
      const payload: Omit<Event, "id"> = {
        ...form,
        title: form.title.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        registrationLink: (form.registrationLink ?? "").trim(),
      };
      const result = editId ? await updateEvent(editId, payload) : await addEvent(payload);
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

  const toggleRegistration = async (id: string) => {
    if (togglingId === id) return;
    const e = events.find((x) => x.id === id);
    if (!e) return;
    try {
      setTogglingId(id);
      const result = await updateEvent(id, { registrationOpen: !e.registrationOpen });
      if (!result.ok) alert(result.error);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Event</h1>
          <p className="text-base font-medium text-muted-foreground">{events.length} event aktif</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-xl text-sm font-bold hover:-translate-y-1 transition-transform neo-shadow-sm hover:neo-shadow-md"
        >
          <Plus size={18} strokeWidth={3} /> Tambah Event
        </button>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mb-6">
        <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari event..."
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
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden md:table-cell">Tipe</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Lokasi</th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl border-2 border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-muted">
                        <Calendar size={20} className="text-muted-foreground" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-black text-base text-foreground tracking-tight">{e.title}</p>
                        <p className="text-xs font-bold text-muted-foreground">{formatEventTime(e)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-muted-foreground hidden md:table-cell">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {e.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-muted-foreground hidden lg:table-cell">
                    {formatEventDate(e.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-muted-foreground hidden sm:table-cell line-clamp-1">
                    {e.location}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        disabled={togglingId === e.id}
                        onClick={() => toggleRegistration(e.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={e.registrationOpen ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
                      >
                        {e.registrationOpen ? <LockOpen size={16} strokeWidth={2.5} /> : <Lock size={16} strokeWidth={2.5} />}
                      </button>
                      <button onClick={() => openEdit(e)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus event "${e.title}"?`)) {
                            const result = await removeEvent(e.id);
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
              <Calendar size={28} className="text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">Belum ada event.</p>
          </div>
        )}

        <div className="px-6 py-4 border-t-2 border-border/10 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase">
            Menampilkan {filtered.length} dari {events.length}
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
                <Calendar size={20} className="text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">{editId ? "Edit Event" : "Tambah Event"}</h2>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Judul Event</label>
                <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Tanggal</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Jam Mulai</label>
                  <input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                  <label className="block text-xs font-bold uppercase tracking-wider mt-2 mb-1.5 text-muted-foreground">Jam Selesai</label>
                  <input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Lokasi</label>
                <input required type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Tipe Event</label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Event["type"] })}
                  className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Bootcamp">Bootcamp</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Sharing Session">Sharing Session</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Deskripsi</label>
                <textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">URL / Path Gambar</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://... atau /foto-event/poster.jpg"
                  className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
                />
                {form.image && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-muted rounded-xl border border-border/20">
                    <img
                      src={form.image}
                      alt="Preview Event"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                      className="size-16 rounded-xl object-cover border border-border bg-white shrink-0"
                    />
                    <div className="text-xs text-muted-foreground min-w-0">
                      <p className="font-bold text-foreground">Preview Poster</p>
                      <p className="truncate max-w-xs">{form.image}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Link Pendaftaran</label>
                <input
                  type="text"
                  value={form.registrationLink || ""}
                  onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                  placeholder="https://... atau link pendaftaran"
                  className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
                />
              </div>

              <label className="flex items-center gap-2 px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold cursor-pointer hover:border-border transition-colors">
                <input
                  type="checkbox"
                  checked={form.registrationOpen}
                  onChange={(e) => setForm({ ...form, registrationOpen: e.target.checked })}
                  className="size-5 rounded border-2 border-border cursor-pointer"
                />
                <span className="text-sm">Pendaftaran Buka</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3 bg-primary text-white border-2 border-border rounded-2xl font-black text-base neo-shadow-sm hover:-translate-y-1 hover:neo-shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
