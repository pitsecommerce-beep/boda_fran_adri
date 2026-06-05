import type { Accommodation } from '@/types'

interface Props {
  accommodations: Accommodation[]
}

export default function AccommodationSection({ accommodations }: Props) {
  if (!accommodations.length) return null

  return (
    <section className="py-12 px-5" style={{ background: 'var(--color-khaki)' }}>
      <div className="text-center mb-8">
        <p className="section-label mb-3" style={{ display: 'block', color: 'var(--color-gold)' }}>
          Dónde quedarse
        </p>
        <h2 className="font-serif" style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '2.2rem', margin: 0 }}>
          Hospedajes
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        {accommodations.map((h) => (
          <div
            key={h.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 1px 8px rgba(44,32,18,0.07)',
            }}
          >
            {h.photo_url && (
              <div style={{ height: 180, overflow: 'hidden' }}>
                <img
                  src={h.photo_url}
                  alt={h.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-5 flex flex-col gap-3">
              <h3
                className="font-serif"
                style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '1.5rem', margin: 0 }}
              >
                {h.name}
              </h3>
              {h.description && (
                <p
                  className="font-sans text-sm leading-relaxed"
                  style={{ color: 'var(--color-muted)', margin: 0 }}
                >
                  {h.description}
                </p>
              )}
              {h.details_url && (
                <a
                  href={h.details_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start inline-flex items-center gap-2 font-sans font-medium transition-all hover:shadow-md active:scale-95"
                  style={{
                    background: 'var(--color-gold)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 2,
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '10px 20px',
                  }}
                >
                  Ver Detalles
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
