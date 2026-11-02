import { useState } from "react"

import { useNavigate } from "react-router"

import {
  Search,
  Plus,
  Edit,
  Trash,
  X,
  Building2,
  AlertCircle,
} from "lucide-react"

import { useAdminData } from "../../context/AdminDataContext"

import type { Division } from "../../lib/types"

export const SUPPORTED_DIVISION_ICONS = [
  { value: "Code", label: "Code (Software / Pemrograman)" },

  { value: "Smartphone", label: "Smartphone (Mobile / Academy)" },

  { value: "Brain", label: "Brain (AI / Research)" },

  { value: "Shield", label: "Shield (Security / Network)" },

  { value: "Palette", label: "Palette (Design / Creative)" },

  { value: "Cpu", label: "Cpu (Hardware / IoT)" },
] as const

interface DivisionFormData {
  name: string

  shortName: string

  description: string

  icon: string

  color: string

  technologies: string[]

  sortOrder: number
}

const emptyForm: DivisionFormData = {
  name: "",

  shortName: "",

  description: "",

  icon: "Code",

  color: "#6366f1",

  technologies: [],

  sortOrder: 0,
}

export default function AdminDivisions() {
  const { divisions, addDivision, updateDivision, removeDivision, loading } =
    useAdminData()

  const navigate = useNavigate()

  const [search, setSearch] = useState("")

  const [editId, setEditId] = useState<string | null>(null)

  const [form, setForm] = useState<DivisionFormData>(emptyForm)

  const [techInput, setTechInput] = useState("")

  const [submitting, setSubmitting] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)

  const filtered = divisions.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.shortName.toLowerCase().includes(search.toLowerCase()),
  )

  const openAdd = () => {
    navigate("/admin/divisions/new")

    return

    const nextOrder =
      divisions.length > 0
        ? Math.max(...divisions.map((d) => d.sortOrder ?? 0)) + 1
        : 0

    setForm({ ...emptyForm, sortOrder: nextOrder })

    setEditId(null)

    setTechInput("")

    setFormError(null)
  }

  const openEdit = (d: Division) => {
    navigate(`/admin/divisions/${d.id}/edit`)

    return

    setForm({
      name: d.name,

      shortName: d.shortName,

      description: d.description,

      icon: d.icon || "Code",

      color: d.color,

      technologies: [...d.technologies],

      sortOrder: d.sortOrder ?? 0,
    })

    setEditId(d.id)

    setTechInput("")

    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !form.name.trim() ||
      !form.shortName.trim() ||
      !form.description.trim()
    ) {
      setFormError("Nama divisi, nama singkat, dan deskripsi wajib diisi.")

      return
    }

    if (submitting) return

    try {
      setSubmitting(true)

      setFormError(null)

      const payload = {
        name: form.name.trim(),

        shortName: form.shortName.trim(),

        description: form.description.trim(),

        icon: form.icon,

        color: form.color,

        technologies: form.technologies,

        sortOrder: Math.max(0, Math.floor(form.sortOrder)),
      }

      const result = editId
        ? await updateDivision(editId, payload)
        : await addDivision({ ...payload, memberCount: 0 })

      if (!result.ok) {
        setFormError(result.error)

        return
      }
    } finally {
      setSubmitting(false)
    }
  }

  const addTech = () => {
    const t = techInput.trim()

    if (t && !form.technologies.includes(t)) {
      setForm({ ...form, technologies: [...form.technologies, t] })
    }

    setTechInput("")
  }

  const removeTech = (t: string) => {
    setForm({ ...form, technologies: form.technologies.filter((x) => x !== t) })
  }

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Divisi</h1>
          <p className="text-base font-medium text-muted-foreground">
            {divisions.length} divisi aktif
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-xl text-sm font-bold hover:-translate-y-1 transition-transform neo-shadow-sm hover:neo-shadow-md"
        >
          <Plus size={18} strokeWidth={3} /> Tambah Divisi
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
          placeholder="Cari divisi..."
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
                  Divisi
                </th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Member
                </th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Teknologi
                </th>
                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-muted/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="size-12 rounded-xl border-2 border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: d.color + "22" }}
                      >
                        <Building2
                          size={20}
                          style={{ color: d.color }}
                          strokeWidth={2.5}
                        />
                      </div>
                      <div>
                        <p className="font-black text-base text-foreground tracking-tight">
                          {d.name}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground">
                          {d.shortName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-muted-foreground hidden md:table-cell">
                    {d.memberCount}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {d.technologies.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                      {d.technologies.length > 3 && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          +{d.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(d)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus divisi "${d.name}"?`)) {
                            const result = await removeDivision(d.id)

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
              <Building2 size={28} className="text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">Belum ada divisi.</p>
          </div>
        )}

        <div className="px-6 py-4 border-t-2 border-border/10 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase">
            Menampilkan {filtered.length} dari {divisions.length}
          </p>
        </div>
      </div>
    </div>
  )
}
