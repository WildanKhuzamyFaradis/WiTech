import { useEffect, useState } from "react"

import { Save, Settings } from "lucide-react"

import { useAdminData } from "../../context/AdminDataContext"

import { deleteStoredLogo, saveLogoUrl } from "../../lib/siteSettings"

import {
  generateStoragePath,
  isManagedStoragePath,
  uploadMediaFile,
} from "../../lib/storage"

import MediaUploadInput from "../../components/admin/MediaUploadInput"

export default function AdminSettings() {
  const { logoUrl, refetch } = useAdminData()

  const [logo, setLogo] = useState<string | File>(logoUrl)

  const [originalLogo, setOriginalLogo] = useState(logoUrl)

  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState("")

  const [error, setError] = useState("")

  useEffect(() => {
    setLogo(logoUrl)

    setOriginalLogo(logoUrl)
  }, [logoUrl])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (saving) return

    setSaving(true)

    setMessage("")

    setError("")

    let savedLogo = typeof logo === "string" ? logo.trim() : ""

    let uploadedPath = ""

    try {
      if (logo instanceof File) {
        const path = generateStoragePath("logo", logo.type)

        const uploadResult = await uploadMediaFile(logo, path)

        if (!uploadResult.ok) {
          setError(uploadResult.error)

          return
        }

        savedLogo = uploadResult.path

        uploadedPath = uploadResult.path
      }

      const result = await saveLogoUrl(savedLogo)

      if (!result.ok) {
        if (uploadedPath) await deleteStoredLogo(uploadedPath)

        setError(result.error)

        return
      }

      if (originalLogo !== savedLogo && isManagedStoragePath(originalLogo)) {
        await deleteStoredLogo(originalLogo)
      }

      await refetch()

      setLogo(savedLogo)

      setOriginalLogo(savedLogo)

      setMessage("Logo berhasil disimpan.")
    } catch {
      if (uploadedPath) await deleteStoredLogo(uploadedPath)

      setError("Gagal menyimpan logo. Silakan coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl anim-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-primary text-white border-2 border-border flex items-center justify-center neo-shadow-sm">
            <Settings size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Pengaturan Website
          </h1>
        </div>
        <p className="text-base font-medium text-muted-foreground">
          Kelola logo yang tampil di navbar dan footer website.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white border border-border/25 rounded-xl p-5 md:p-8 space-y-7 shadow-sm"
      >
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
            {message}
          </div>
        )}

        <section>
          <h2 className="text-lg font-black pb-3 border-b-2 border-border/10">
            Logo Website
          </h2>
          <div className="mt-5 max-w-xl">
            <MediaUploadInput
              label="Logo"
              value={logo instanceof File ? originalLogo : logo}
              onChange={setLogo}
              maxSizeMB={2}
              previewClassName="h-16 w-28"
              placeholder="https://... atau /logo.png"
            />
            <p className="text-xs text-muted-foreground mt-3">
              Gunakan upload file untuk menyimpan logo ke Supabase Storage, atau
              masukkan URL/path gambar.
            </p>
          </div>
        </section>

        <div className="flex justify-end border-t-2 border-border/10 pt-5">
          <button
            type="submit"
            disabled={saving || !logo}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white border-2 border-border rounded-lg font-bold disabled:opacity-50 neo-shadow-sm"
          >
            <Save size={17} />
            {saving ? "Menyimpan..." : "Simpan Logo"}
          </button>
        </div>
      </form>
    </div>
  )
}
