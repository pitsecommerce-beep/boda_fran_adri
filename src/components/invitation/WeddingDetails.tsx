import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { WeddingConfig } from '@/types'
import FloralDivider from '@/components/shared/FloralDivider'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
// Gift/registry section moved to GiftSection.tsx (rendered at the end of the invitation)

interface Props {
  config: WeddingConfig
}

function ChurchIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* Cross — clearly above the roofline */}
      <line x1="12" y1="1" x2="12" y2="6" />
      <line x1="9.5" y1="3.2" x2="14.5" y2="3.2" />
      {/* Church building */}
      <path d="M4 22V11l8-7 8 7v11" />
      {/* Door */}
      <path d="M10 22v-5h4v5" />
    </svg>
  )
}

function GlassIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8M12 11v11M7 2h10l-2 9a5 5 0 01-6 0L7 2z" />
    </svg>
  )
}


function DetailCard({
  icon,
  title,
  venue,
  address,
  time,
  mapsUrl,
  accentColor,
}: {
  icon: React.ReactNode
  title: string
  venue?: string | null
  address?: string | null
  time?: string | null
  mapsUrl?: string | null
  accentColor: string
}) {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center text-center gap-3"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 8px rgba(44,32,18,0.06)',
      }}
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: `${accentColor}18` }}>
        {icon}
      </div>
      <h3 className="font-serif text-2xl" style={{ color: 'var(--color-dark)', fontWeight: 300 }}>{title}</h3>
      {venue && (
        <p className="font-serif italic" style={{ color: 'var(--color-muted)', fontSize: '1rem', fontWeight: 300 }}>{venue}</p>
      )}
      {time && (
        <p className="font-sans uppercase" style={{ color: accentColor, fontSize: '0.6rem', letterSpacing: '0.32em' }}>
          {time}
        </p>
      )}
      {address && (
        <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {address}
        </p>
      )}
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 transition-all hover:shadow-md active:scale-95"
          style={{
            background: `${accentColor}14`,
            color: accentColor,
            border: `1px solid ${accentColor}44`,
            borderRadius: 2,
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '10px 20px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Ver en mapa
        </a>
      )}
    </div>
  )
}

export default function WeddingDetails({ config }: Props) {
  const weddingDate = config.wedding_date ? new Date(config.wedding_date.slice(0, 10) + 'T12:00:00') : null
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <section id="detalles" className="py-16 px-6" style={{ background: 'var(--color-surface)' }}>
      {lightbox && createPortal(
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox}
            alt="Foto ampliada"
            style={{ maxWidth: '100%', maxHeight: '90dvh', objectFit: 'contain', borderRadius: 4 }}
          />
        </div>,
        document.body
      )}
      {/* Section heading */}
      <div className="text-center mb-12">
        <p className="section-label mb-4" style={{ display: 'block', color: 'var(--color-gold)' }}>
          Los detalles
        </p>
        <h2
          className="font-serif"
          style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '2.4rem', margin: 0 }}
        >
          Nuestro Gran Día
        </h2>
        {weddingDate && (
          <p className="font-serif italic mt-3"
            style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.45rem' }}>
            {(() => {
              const s = format(weddingDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
              return s.charAt(0).toUpperCase() + s.slice(1)
            })()}
          </p>
        )}
      </div>

      <FloralDivider icon="◆" color="var(--color-gold)" />

      {/* Welcome message */}
      {config.welcome_message && (
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p
            className="font-serif italic"
            style={{ color: 'var(--color-muted)', fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.9 }}
          >
            {config.welcome_message}
          </p>
        </div>
      )}

      {/* Venue cards — always stacked for the phone-width column */}
      <div className="grid grid-cols-1 gap-5">
        {(config.ceremony_venue || config.ceremony_address) && (
          <DetailCard
            icon={<ChurchIcon color="var(--color-gold)" />}
            title="Ceremonia Religiosa"
            venue={config.ceremony_venue}
            address={config.ceremony_address}
            time={config.ceremony_time}
            mapsUrl={config.ceremony_maps_url}
            accentColor="var(--color-gold)"
          />
        )}

        {(config.reception_venue || config.reception_address) && (
          <DetailCard
            icon={<GlassIcon color="var(--color-muted)" />}
            title="Recepción"
            venue={config.reception_venue}
            address={config.reception_address}
            time={config.reception_time}
            mapsUrl={config.reception_maps_url}
            accentColor="var(--color-muted)"
          />
        )}
      </div>

      {/* Dress code */}
      {(config.dress_code || config.dress_code_forbidden_text || config.dress_code_forbidden_image_url) && (
        <div className="mt-10">
          <div className="section-block-divider" />
          <div className="text-center py-8 px-6" style={{ background: 'var(--color-khaki)' }}>
            <p className="section-label mb-3" style={{ display: 'block', color: 'var(--color-gold)' }}>
              Código de vestimenta
            </p>
            <p
              className="font-serif"
              style={{ color: 'var(--color-dark)', fontSize: '2rem', fontWeight: 300, fontStyle: 'italic' }}
            >
              {config.dress_code}
            </p>
            {config.dress_code_image_url && (
              <div className="mt-6 flex justify-center">
                <img
                  src={config.dress_code_image_url}
                  alt="Inspiración de vestimenta"
                  onClick={() => setLightbox(config.dress_code_image_url!)}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 24px rgba(44,32,18,0.10)',
                    cursor: 'zoom-in',
                  }}
                />
              </div>
            )}

            {(config.dress_code_forbidden_text || config.dress_code_forbidden_image_url) && (
              <div
                className="mt-6 rounded-xl px-5 py-5 text-left"
                style={{
                  background: 'rgba(107,36,55,0.06)',
                  border: '1px solid rgba(107,36,55,0.15)',
                }}
              >
                <p
                  className="font-sans uppercase text-center mb-3"
                  style={{ fontSize: '0.58rem', letterSpacing: '0.28em', color: 'rgba(107,36,55,0.75)' }}
                >
                  Por favor evitar
                </p>
                {config.dress_code_forbidden_text && (
                  <p
                    className="font-serif italic text-center leading-relaxed"
                    style={{ color: 'rgba(107,36,55,0.80)', fontWeight: 300, fontSize: '0.95rem', whiteSpace: 'pre-line' }}
                  >
                    {config.dress_code_forbidden_text}
                  </p>
                )}
                {config.dress_code_forbidden_image_url && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={config.dress_code_forbidden_image_url}
                      alt="Vestimenta no permitida"
                      onClick={() => setLightbox(config.dress_code_forbidden_image_url!)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        width: '100%',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid rgba(107,36,55,0.20)',
                        boxShadow: '0 2px 12px rgba(107,36,55,0.10)',
                        cursor: 'zoom-in',
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  )
}
