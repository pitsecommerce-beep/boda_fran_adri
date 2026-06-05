import { useState } from 'react'

interface Props {
  photos: string[]
}

export default function GallerySection({ photos }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!photos.length) return null

  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="section-label mb-3" style={{ display: 'block', color: 'var(--color-gold)' }}>
            Nuestra historia
          </p>
          <h2 className="font-serif" style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '2.2rem', margin: 0 }}>
            Galería
          </h2>
        </div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {photos.map((url, i) => (
            <button
              key={i}
              className="w-full break-inside-avoid overflow-hidden rounded-xl shadow-sm cursor-pointer focus:outline-none"
              style={{ transition: 'transform 0.4s ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.015)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
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

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(30,20,10,0.88)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected}
              alt="Foto ampliada"
              className="w-full rounded-xl shadow-2xl"
              style={{ maxHeight: '85vh', objectFit: 'contain' }}
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'var(--color-gold)', color: '#FFFFFF', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
