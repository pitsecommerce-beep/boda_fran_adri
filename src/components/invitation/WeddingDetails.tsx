import type { WeddingConfig } from '@/types'
import FloralDivider from '@/components/shared/FloralDivider'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  config: WeddingConfig
}

function ChurchIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V10l9-8 9 8v12" />
      <path d="M9 22V15h6v7" />
      <path d="M12 2v5M9.5 4.5h5" />
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

function GiftIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
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
  const hasGiftSection = config.account_number || config.gift_registry_url

  return (
    <section id="detalles" className="py-24 px-6 max-w-4xl mx-auto">
      {/* Section heading */}
      <div className="text-center mb-12">
        <p className="section-label mb-4" style={{ display: 'block', color: 'var(--color-gold)' }}>
          Los detalles
        </p>
        <h2
          className="font-serif"
          style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: 'clamp(2.5rem,8vw,4rem)', margin: 0 }}
        >
          Nuestro Gran Día
        </h2>
        {weddingDate && (
          <p className="font-serif italic mt-3"
            style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.95rem' }}>
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

      {/* Venue cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(config.ceremony_venue || config.ceremony_address) && (
          <DetailCard
            icon={<ChurchIcon color="var(--color-gold)" />}
            title="Ceremonia"
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
      {config.dress_code && (
        <div className="mt-8 text-center">
          <FloralDivider icon="◆" color="var(--color-gold)" />
          <p className="section-label mb-4" style={{ display: 'block', color: 'var(--color-gold)' }}>
            Código de vestimenta
          </p>
          <p
            className="font-serif"
            style={{ color: 'var(--color-dark)', fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 300, fontStyle: 'italic' }}
          >
            {config.dress_code}
          </p>
        </div>
      )}

      {/* Gift section */}
      {hasGiftSection && (
        <div
          className="mt-8 text-center rounded-2xl p-8"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 1px 8px rgba(44,32,18,0.06)',
          }}
        >
          <div className="flex justify-center mb-4">
            <GiftIcon color="var(--color-gold)" />
          </div>
          <p className="section-label mb-3" style={{ display: 'block', color: 'var(--color-gold)' }}>
            Mesa de regalos
          </p>
          <p className="font-serif italic leading-relaxed" style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '1rem' }}>
            El mejor regalo es tu presencia. Si deseas obsequiarnos algo, puedes hacerlo aquí:
          </p>
          {config.gift_registry_url && (
            <a
              href={config.gift_registry_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 font-sans font-medium transition-all hover:shadow-md active:scale-95"
              style={{
                background: 'var(--color-gold)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 2,
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '12px 24px',
              }}
            >
              Ver mesa de regalos
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}
          {config.account_number && (
            <div className="mt-5">
              {config.gift_registry_url && (
                <p className="font-sans text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                  O por transferencia:
                </p>
              )}
              <p className="font-sans font-medium text-xl tracking-wider"
                style={{ color: 'var(--color-dark)', whiteSpace: 'pre-line' }}>
                {config.account_number}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
