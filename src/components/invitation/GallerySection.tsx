import { useState } from 'react'

interface Props {
  photos: string[]
}

export default function GallerySection({ photos }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!photos.length) return null

  return (
    <section className="py-20 px-6" style={{ background: '#FFFFFF' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--color-yellow)' }}>
            Nuestra historia
          </p>
          <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--color-dark)' }}>
            Galería
          </h2>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {photos.map((url, i) => (
            <button
              key={i}
              className="w-full break-inside-avoid overflow-hidden rounded-2xl shadow-sm cursor-pointer transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-rose-300"
              onClick={() => setSelected(url)}
            >
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                loading="lazy"
                className="w-full object-cover"
                style={{ aspectRatio: i % 3 === 1 ? '4/5' : '4/3' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(74,63,63,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected}
              alt="Foto ampliada"
              className="w-full rounded-3xl shadow-2xl"
              style={{ maxHeight: '85vh', objectFit: 'contain' }}
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ background: 'var(--color-yellow)', color: 'var(--color-dark)' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
