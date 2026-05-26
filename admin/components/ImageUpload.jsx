import { useState, useRef } from "react"
import { uploadToCloudinary } from "../lib/cloudinary"

export default function ImageUpload({ value, onChange, label = "Image" }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex gap-3 items-start">
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className="w-20 h-20 rounded border-2 border-dashed border-border hover:border-accent transition-colors cursor-pointer flex items-center justify-center shrink-0 overflow-hidden bg-surface"
        >
          {uploading ? (
            <span className="text-accent font-mono text-xs animate-pulse">...</span>
          ) : value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-muted text-2xl">+</span>
          )}
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <input
            type="text"
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder="Or paste image URL"
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
          />
          <p className="text-muted text-xs mt-1">Click the box to upload, or paste a URL</p>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}
