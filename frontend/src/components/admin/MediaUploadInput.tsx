/**
 * MediaUploadInput.tsx
 * Dual-mode media input: "URL / Path" text input OR "Upload File" file picker.
 *
 * ARCHITECTURE NOTES:
 * - The component does NOT upload directly; uploading happens in the form submit handler.
 * - URL mode: controlled by `value` prop (raw DB string, resolved for preview).
 * - Upload mode: manages pending local File + object URL preview; calls onChange(File) on selection.
 * - Switching modes or canceling a pending file reverts/preserves existing media value.
 * - Object URLs are revoked on file clear, cancellation, replacement, mode switch, and unmount.
 */

import { useState, useEffect, useRef } from "react"

import { Upload, Link2, X } from "lucide-react"

import { validateMediaFile, resolveMediaUrl } from "../../lib/storage"

interface MediaUploadInputProps {
  /** Current raw DB value (storage path, https URL, /local-path, or ""). */

  value: string

  /** Called with a File when user selects a file, or string when URL input changes. */

  onChange: (newValue: string | File) => void

  label: string

  /** Max size in MB. Enforced during selection. */

  maxSizeMB: number

  /** Tailwind classes for the preview image (default: "size-12"). */

  previewClassName?: string

  placeholder?: string
}

type Mode = "url" | "upload"

export default function MediaUploadInput({
  value,

  onChange,

  label,

  maxSizeMB,

  previewClassName = "size-12",

  placeholder,
}: MediaUploadInputProps) {
  const [mode, setMode] = useState<Mode>("url")

  const [localFile, setLocalFile] = useState<File | null>(null)

  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  const [fileError, setFileError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep track of the persisted/current string value so canceling a file selection

  // or switching modes never destroys the existing media value.

  const lastStringRef = useRef<string>(typeof value === "string" ? value : "")

  const objectUrlRef = useRef<string | null>(null)

  // Sync lastStringRef whenever parent passes a string and no local file is pending

  useEffect(() => {
    if (typeof value === "string" && !localFile) {
      lastStringRef.current = value
    }
  }, [value, localFile])

  // Clean up object URL on unmount

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)

        objectUrlRef.current = null
      }
    }
  }, [])

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)

      objectUrlRef.current = null
    }

    setObjectUrl(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    const validation = validateMediaFile(file, maxSizeMB)

    if (!validation.valid) {
      setFileError(validation.error ?? "File tidak valid.")

      if (fileInputRef.current) fileInputRef.current.value = ""

      return
    }

    setFileError(null)

    revokeObjectUrl()

    const newUrl = URL.createObjectURL(file)

    objectUrlRef.current = newUrl

    setObjectUrl(newUrl)

    setLocalFile(file)

    onChange(file)
  }

  /**
   * Cancel pending file selection:
   * Revoke object URL, reset file state, and restore the existing string media value.
   */

  const handleClearFile = () => {
    revokeObjectUrl()

    setLocalFile(null)

    setFileError(null)

    if (fileInputRef.current) fileInputRef.current.value = ""

    // Revert to existing persisted string value instead of blanking out

    onChange(lastStringRef.current)
  }

  /**
   * Switch between URL and Upload tabs:
   * Never clears the parent's existing media value.
   */

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return

    if (mode === "upload") {
      // If a local file was pending and user leaves upload mode,

      // revoke its preview and restore the existing string media value

      if (localFile) {
        revokeObjectUrl()

        setLocalFile(null)

        setFileError(null)

        if (fileInputRef.current) fileInputRef.current.value = ""

        onChange(lastStringRef.current)
      }
    }

    setMode(newMode)
  }

  const displayValue = typeof value === "string" ? value : lastStringRef.current

  const resolvedPreview = resolveMediaUrl(displayValue)

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
        {label}
      </label>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-2 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => switchMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            mode === "url"
              ? "bg-white text-foreground neo-shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 size={12} strokeWidth={2.5} />
          URL / Path
        </button>
        <button
          type="button"
          onClick={() => switchMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            mode === "upload"
              ? "bg-white text-foreground neo-shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload size={12} strokeWidth={2.5} />
          Upload File
        </button>
      </div>

      {/* URL Mode */}
      {mode === "url" && (
        <>
          <input
            type="text"
            value={displayValue}
            onChange={(e) => {
              const newVal = e.target.value

              lastStringRef.current = newVal

              onChange(newVal)
            }}
            placeholder={placeholder ?? "https://... atau /path/ke/gambar.jpg"}
            className="w-full px-3 py-2.5 bg-muted border-2 border-transparent rounded-lg text-sm font-bold focus:border-border outline-none transition-colors"
          />
          {resolvedPreview && (
            <div className="mt-2 flex items-center gap-3 p-2 bg-muted rounded-xl border border-border/20">
              <img
                src={resolvedPreview}
                alt="Preview"
                onLoad={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.opacity = "1"
                }}
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.opacity = "0.3"
                }}
                className={`${previewClassName} rounded-lg object-cover border border-border bg-white shrink-0`}
              />
              <div className="text-xs text-muted-foreground min-w-0">
                <p className="font-bold text-foreground">Preview</p>
                <p className="truncate max-w-[200px]">{displayValue}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Mode */}
      {mode === "upload" && (
        <div>
          {!localFile ? (
            <>
              <label className="flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-border/40 rounded-lg bg-muted cursor-pointer hover:border-border hover:bg-muted/80 transition-all">
                <Upload
                  size={20}
                  className="text-muted-foreground"
                  strokeWidth={2}
                />
                <span className="text-xs font-bold text-muted-foreground text-center">
                  Klik untuk pilih gambar
                  <br />
                  <span className="font-medium opacity-75">
                    JPG, PNG, WebP - Maks. {maxSizeMB} MB
                  </span>
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {/* Show existing media info if present so admin knows what will be replaced */}
              {lastStringRef.current && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-muted/60 rounded-xl border border-border/10">
                  <img
                    src={resolveMediaUrl(lastStringRef.current)}
                    alt="Media Saat Ini"
                    onLoad={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.opacity = "1"
                    }}
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.opacity =
                        "0.3"
                    }}
                    className={`${previewClassName} rounded-lg object-cover border border-border bg-white shrink-0`}
                  />
                  <div className="text-xs text-muted-foreground min-w-0">
                    <p className="font-bold text-foreground">Media Saat Ini</p>
                    <p className="truncate max-w-[200px]">
                      {lastStringRef.current}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 p-2 bg-muted rounded-xl border border-border/20">
              {objectUrl && (
                <img
                  src={objectUrl}
                  alt="Preview"
                  className={`${previewClassName} rounded-lg object-cover border border-border bg-white shrink-0`}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {localFile.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {(localFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                title="Batalkan pilihan file"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
          {fileError && (
            <p className="mt-1.5 text-[11px] font-bold text-red-600">
              {fileError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
