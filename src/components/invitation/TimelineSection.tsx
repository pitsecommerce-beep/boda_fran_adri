import type { ItineraryItem, WeddingConfig } from '@/types'

interface Props {
  config: WeddingConfig
}

// Uses the itinerary saved in settings; falls back to the ceremony/reception
// times so the section still shows something before an itinerary is set up.
function timelineItems(config: WeddingConfig): ItineraryItem[] {
  const items = (config.itinerary ?? []).filter((i) => i.time?.trim() || i.label?.trim())
  if (items.length > 0) return items

  const fallback: ItineraryItem[] = []
  if (config.ceremony_time) fallback.push({ time: config.ceremony_time, label: 'Ceremonia', note: 'En punto' })
  if (config.reception_time) fallback.push({ time: config.reception_time, label: 'Recepción' })
  if (fallback.length > 0) fallback.push({ time: '1:00 horas', label: 'Fin del evento' })
  return fallback
}

export default function TimelineSection({ config }: Props) {
  const items = timelineItems(config)
  if (items.length === 0) return null

  return (
    <section
      id="itinerario"
      className="py-20 px-6 flex flex-col justify-center"
      style={{ background: 'var(--color-khaki)', minHeight: '100svh' }}
    >
      <div className="text-center mb-14">
        <p className="section-label mb-4" style={{ display: 'block', color: 'var(--color-gold)' }}>
          Itinerario
        </p>
        <h2
          className="font-serif"
          style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '2.2rem', margin: 0, lineHeight: 1.2 }}
        >
          Acompáñanos en cada momento
        </h2>
      </div>

      <ol className="timeline">
        {items.map((item, idx) => (
          <li key={idx} className="timeline-item">
            <div className="timeline-time">
              <span className="font-sans" style={{ color: 'var(--color-dark)', fontSize: '0.95rem' }}>
                {item.time}
              </span>
              {item.note && (
                <span className="font-sans" style={{ color: 'var(--color-muted)', fontSize: '0.7rem', marginTop: 2 }}>
                  {item.note}
                </span>
              )}
            </div>
            <span className="timeline-dot" aria-hidden />
            <span className="timeline-label font-serif" style={{ color: 'var(--color-dark)', fontSize: '1.25rem', fontWeight: 400 }}>
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
