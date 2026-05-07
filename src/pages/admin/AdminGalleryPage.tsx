import { useRef, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useWeddingConfig } from '@/hooks/useWeddingConfig'
import { updateWeddingConfig, uploadPhoto, deletePhoto } from '@/lib/supabase'

export default function AdminGalleryPage() {
  const { config, loading, refresh } = useWeddingConfig()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const photos: string[] = config?.gallery_urls ?? []

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    setError(null)
    const urls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const url = await uploadPhoto(file)
      if (url) urls.push(url)
    }

    if (urls.length) {
      const updated = [...photos, ...urls]
      const { error } = await updateWeddingConfig({ gallery_urls: updated })
      if (error) setError('Error al guardar fotos.')
      else void refresh()
    }
    setUploading(false)
  }

  const handleDelete = async (url: string) => {
    if (!confirm('¿Eliminar esta foto?')) return
    await deletePhoto(url)
    const updated = photos.filter((p) => p !== url)
    await updateWeddingConfig({ gallery_urls: updated })
    void refresh()
  }

  const handleSetCover = async (url: string) => {
    await updateWeddingConfig({ cover_photo_url: url })
    void refresh()
  }

  const handleReorder = async (from: number, to: number) => {
    const reordered = [...photos]
    const [item] = reordered.splice(from, 1)
    reordered.splice(to, 0, item)
    await updateWeddingConfig({ gallery_urls: reordered })
    void refresh()
  }

  if (loading) return (
    <AdminLayout title="Galería">
      <div className="text-center py-16 font-serif italic" style={{ color: 'var(--color-muted)' }}>
        Cargando…
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="Galería de Fotos">
      {/* Upload zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files) }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-6"
        style={{
          borderColor: dragOver ? 'var(--color-yellow)' : 'var(--color-yellow)66',
          background: dragOver ? 'var(--color-yellow)0A' : 'var(--color-yellow)06',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) void handleFiles(e.target.files) }}
        />
        {uploading ? (
          <p className="font-serif text-lg animate-pulse-soft" style={{ color: 'var(--color-muted)' }}>
            Subiendo fotos…
          </p>
        ) : (
          <>
            <div className="text-4xl mb-3">🖼️</div>
            <p className="font-serif text-lg" style={{ color: 'var(--color-dark)' }}>
              Arrastra fotos aquí o haz clic para seleccionar
            </p>
            <p className="font-sans text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              Formatos: JPG, PNG, WebP — Puedes subir varias a la vez
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-sans">
          {error}
        </div>
      )}

      {/* Cover photo note */}
      {config?.cover_photo_url && (
        <div className="mb-4 p-3 rounded-xl font-sans text-sm"
          style={{ background: 'var(--color-yellow)33', color: 'var(--color-dark)' }}>
          ⭐ La foto de portada actual está configurada.
          Para cambiarla, haz clic en "Usar como portada" en cualquier foto.
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 font-serif italic" style={{ color: 'var(--color-muted)' }}>
          No hay fotos en la galería todavía.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((url, i) => (
            <div key={url} className="relative group rounded-2xl overflow-hidden shadow-sm"
              style={{ border: url === config?.cover_photo_url ? '3px solid var(--color-yellow)' : '1px solid var(--color-yellow)22' }}>
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="w-full h-40 object-cover"
                loading="lazy"
              />

              {url === config?.cover_photo_url && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-sans"
                  style={{ background: 'var(--color-yellow)', color: 'var(--color-dark)' }}>
                  ⭐ Portada
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(74,63,63,0.6)' }}>
                <button
                  onClick={() => handleSetCover(url)}
                  className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium"
                  style={{ background: 'var(--color-yellow)', color: 'var(--color-dark)' }}>
                  ⭐ Portada
                </button>
                <div className="flex gap-2">
                  <button
                    disabled={i === 0}
                    onClick={() => void handleReorder(i, i - 1)}
                    className="px-2 py-1 rounded-lg text-xs font-sans disabled:opacity-40"
                    style={{ background: 'white', color: 'var(--color-dark)' }}>
                    ←
                  </button>
                  <button
                    disabled={i === photos.length - 1}
                    onClick={() => void handleReorder(i, i + 1)}
                    className="px-2 py-1 rounded-lg text-xs font-sans disabled:opacity-40"
                    style={{ background: 'white', color: 'var(--color-dark)' }}>
                    →
                  </button>
                </div>
                <button
                  onClick={() => void handleDelete(url)}
                  className="px-3 py-1.5 rounded-lg text-xs font-sans"
                  style={{ background: '#FF8080', color: 'white' }}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
