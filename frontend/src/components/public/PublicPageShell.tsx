/**
 * PublicPageShell.tsx
 * Minimal loading/error wrapper for public pages that consume Supabase data.
 * Consistent with existing design language — no redesign.
 */

import type { ReactNode } from "react"

interface Props {
  loading: boolean

  error: unknown

  children: ReactNode
}

export default function PublicPageShell({ loading, error, children }: Props) {
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-32">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="font-medium text-sm">Memuat data…</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.error("Public data load error:", error)

    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-32 px-6">
        <div className="max-w-sm w-full text-center neo-card bg-white rounded-2xl p-8 neo-shadow-sm border-2 border-border">
          <p className="text-2xl mb-4">⚠️</p>
          <h2 className="font-black text-lg mb-2 tracking-tight">
            Gagal memuat data.
          </h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Silakan coba lagi.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2.5 bg-foreground text-background font-bold rounded-xl border-2 border-border neo-shadow-sm hover:-translate-y-0.5 transition-transform text-sm"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
