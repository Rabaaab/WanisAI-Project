import { useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useUpload } from "@workspace/object-storage-web"

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "")

export function photoSrc(objectPath: string | null | undefined): string | undefined {
  if (!objectPath) return undefined
  if (objectPath.startsWith("http")) return objectPath
  if (
    objectPath === "/female_avatar.png" ||
    objectPath === "/male_avatar.png" ||
    objectPath === "female_avatar.png" ||
    objectPath === "male_avatar.png" ||
    objectPath === "/female_avatar_non_muslim.png" ||
    objectPath === "/male_avatar_non_muslim.png" ||
    objectPath === "female_avatar_non_muslim.png" ||
    objectPath === "male_avatar_non_muslim.png"
  ) {
    const cleanPath = objectPath.startsWith("/") ? objectPath : `/${objectPath}`
    return `${BASE_URL}${cleanPath}`
  }
  return `${BASE_URL}/api/storage${objectPath}`
}

export function PhotoUploader({
  value,
  onChange,
  label = "Photo (Optional)",
}: {
  value: string
  onChange: (objectPath: string) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(
    value ? photoSrc(value) : undefined,
  )
  const [dragOver, setDragOver] = useState(false)

  const { uploadFile, isUploading, error } = useUpload({
    onSuccess: (res) => onChange(res.objectPath),
  })

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    setPreview(URL.createObjectURL(file))
    await uploadFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clearPhoto() {
    setPreview(undefined)
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {preview ? (
        <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-card border border-border">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <span className="text-white text-xs font-sans font-medium">Uploading…</span>
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={[
            "w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer",
            dragOver
              ? "border-primary bg-primary/8"
              : "border-border hover:border-primary/50 hover:bg-card",
          ].join(" ")}
        >
          <ImagePlus className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm font-sans text-muted-foreground text-center leading-snug px-4">
            Tap to choose a photo<br />
            <span className="text-xs opacity-70">or drag and drop here</span>
          </span>
        </button>
      )}

      {!preview && (
        <div className="pt-2">
          <p className="text-xs text-center text-muted-foreground mb-3">Or choose an avatar</p>
          <div className="grid grid-cols-4 gap-3 max-w-[280px] mx-auto">
            <button
              type="button"
              onClick={() => {
                setPreview("/male_avatar.png")
                onChange("/male_avatar.png")
              }}
              title="Muslim Male"
              className="w-14 h-14 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-all focus:outline-none focus:border-primary mx-auto"
            >
              <img src="/male_avatar.png" alt="Male Avatar" className="w-full h-full object-cover" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview("/female_avatar.png")
                onChange("/female_avatar.png")
              }}
              title="Muslim Female"
              className="w-14 h-14 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-all focus:outline-none focus:border-primary mx-auto"
            >
              <img src="/female_avatar.png" alt="Female Avatar" className="w-full h-full object-cover" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview("/male_avatar_non_muslim.png")
                onChange("/male_avatar_non_muslim.png")
              }}
              title="Male"
              className="w-14 h-14 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-all focus:outline-none focus:border-primary mx-auto"
            >
              <img src="/male_avatar_non_muslim.png" alt="Male Avatar" className="w-full h-full object-cover" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview("/female_avatar_non_muslim.png")
                onChange("/female_avatar_non_muslim.png")
              }}
              title="Female"
              className="w-14 h-14 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-all focus:outline-none focus:border-primary mx-auto"
            >
              <img src="/female_avatar_non_muslim.png" alt="Female Avatar" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive font-sans">{error.message}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
        tabIndex={-1}
      />
    </div>
  )
}
