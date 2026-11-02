import { useState } from "react"

import { useNavigate } from "react-router"

import {
  Search,
  Plus,
  Edit,
  Trash,
  X,
  Calendar,
  LockOpen,
  Lock,
  AlertCircle,
} from "lucide-react"

import { useAdminData } from "../../context/AdminDataContext"

import type { Event } from "../../lib/types"

import {
  formatEventDate,
  formatEventTime,
  todayInJakarta,
} from "../../lib/dataContract"

import {
  generateStoragePath,
  uploadMediaFile,
  deleteMediaFiles,
  isManagedStoragePath,
} from "../../lib/storage"

import MediaUploadInput from "../../components/admin/MediaUploadInput"

interface EventFormData extends Omit<Event, "id" | "image"> {
  image: string | File
}

const emptyForm: EventFormData = {
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
}

export default function AdminEvents() {
  const { events, addEvent, updateEvent, removeEvent, loading } = useAdminData()

  const navigate = useNavigate()

  const [search, setSearch] = useState("")

  const [editId, setEditId] = useState<string | null>(null)

  const [form, setForm] = useState<EventFormData>(emptyForm)

  const [submitting, setSubmitting] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const [originalImagePath, setOriginalImagePath] = useState("")

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()),
  )

  const openAdd = () => {
    navigate("/admin/events/new")

    return

    setForm({ ...emptyForm, date: todayInJakarta() })

    setEditId(null)

    setOriginalImagePath("")

    setFormError(null)
  }

  const openEdit = (e: Event) => {
    navigate(`/admin/events/${e.id}/edit`)

    return

    setForm({ ...e })

    setEditId(e.id)

    setOriginalImagePath(e.image)

    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim() || !form.location.trim()) {
      setFormError("Judul dan Lokasi harus diisi.")

      return
    }

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      setFormError("Jam selesai harus lebih akhir dari jam mulai.")

      return
    }

    if (submitting) return

    try {
      setSubmitting(true)

      setFormError(null)

      let imageValue: string

      let newlyUploadedPath = ""

      if (form.image instanceof File) {
        const storagePath = generateStoragePath("event", form.image.type)

        const uploadResult = await uploadMediaFile(form.image, storagePath)

        if (!uploadResult.ok) {
          setFormError(uploadResult.error)

          return
        }

        imageValue = uploadResult.path

        newlyUploadedPath = uploadResult.path
      } else {
        imageValue = form.image.trim()
      }

      const payload: Omit<Event, "id"> = {
        ...form,

        image: imageValue,

        title: form.title.trim(),

        location: form.location.trim(),

        description: form.description.trim(),

        registrationLink: (form.registrationLink ?? "").trim(),
      }

      const result = editId
        ? await updateEvent(editId, payload)
        : await addEvent(payload)

      if (!result.ok) {
        if (newlyUploadedPath) await deleteMediaFiles([newlyUploadedPath])

        setFormError(result.error)

        return
      }

      if (
        editId &&
        newlyUploadedPath &&
        isManagedStoragePath(originalImagePath)
      ) {
        await deleteMediaFiles([originalImagePath])
      }

      setForm(emptyForm)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleRegistration = async (id: string) => {
    if (togglingId === id) return

    const e = events.find((x) => x.id === id)

    if (!e) return

    try {
      setTogglingId(id)

      const result = await updateEvent(id, {
        registrationOpen: !e.registrationOpen,
      })

      if (!result.ok) alert(result.error)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Event</h1>
          <p className="text-base font-medium text-muted-foreground">
            {events.length} event aktif
          </p>
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
        <Search
          size={18}
          strokeWidth={2.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
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
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Tipe
                </th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Lokasi
                </th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-muted/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl border-2 border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-muted">
                        <Calendar
                          size={20}
                          className="text-muted-foreground"
                          strokeWidth={2.5}
                        />
                      </div>
                      <div>
                        <p className="font-black text-base text-foreground tracking-tight">
                          {e.title}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground">
                          {formatEventTime(e)}
                        </p>
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
                        title={
                          e.registrationOpen
                            ? "Tutup Pendaftaran"
                            : "Buka Pendaftaran"
                        }
                      >
                        {e.registrationOpen ? (
                          <LockOpen size={16} strokeWidth={2.5} />
                        ) : (
                          <Lock size={16} strokeWidth={2.5} />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(e)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus event "${e.title}"?`)) {
                            const result = await removeEvent(e.id)

                            if (!result.ok) alert(result.error)
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
    </div>
  )
}
