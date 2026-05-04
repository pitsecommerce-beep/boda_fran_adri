import type { WeddingConfig } from '@/types'
import FloralDivider from '@/components/shared/FloralDivider'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  config: WeddingConfig
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
  icon: string
  title: string
  venue?: string | null
  address?: string | null
  time?: string | null
  mapsUrl?: string | null
  accentColor: string
}) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center text-center gap-3"
      style={{ border: `1px solid ${accentColor}44` }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
        style={{ background: `${accentColor}33` }}>
        {icon}
      </div>
      <h3 className="font-serif text-2xl" style={{ color: 'var(--color-dark)' }}>{title}</h3>
      {venue && (
        <p className="font-serif text-lg italic" style={{ color: 'var(--color-muted)' }}>{venue}</p>
      )}
      {time && (
        <p className="font-sans text-sm tracking-widest uppercase" style={{ color: accentColor }}>
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
          className="inline-flex items-center gap-2 mt-2 px-5 py-2 rounded-full text-sm font-sans transition-all hover:shadow-md active:scale-95"
          style={{
            background: `${accentColor}22`,
            color: accentColor,
            border: `1px solid ${accentColor}66`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  const weddingDate = config.wedding_date ? new Date(config.wedding_date) : null

  return (
    <section id="detalles" className="py-20 px-6 max-w-5xl mx-auto">
      {/* Section heading */}
      <div className="text-center mb-12">
        <p className="font-sans text-xs tracking-[0.3em] uppercase mb-3"
          style={{ color: 'var(--color-rose)' }}>
          Los detalles
        </p>
        <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--color-dark)' }}>
          Nuestro Gran Día
        </h2>
        {weddingDate && (
          <p className="mt-3 font-serif text-lg capitalize italic"
            style={{ color: 'var(--color-muted)' }}>
            {format(weddingDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        )}
      </div>

      <FloralDivider icon="✦" color="var(--color-rose)" />

      {/* Welcome message */}
      {config.welcome_message && (
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="font-serif text-xl leading-relaxed italic"
            style={{ color: 'var(--color-muted)' }}>
            "{config.welcome_message}"
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(config.ceremony_venue || config.ceremony_address) && (
          <DetailCard
            icon="⛪"
            title="Ceremonia"
            venue={config.ceremony_venue}
            address={config.ceremony_address}
            time={config.ceremony_time}
            mapsUrl={config.ceremony_maps_url}
            accentColor="var(--color-orchid)"
          />
        )}

        {(config.reception_venue || config.reception_address) && (
          <DetailCard
            icon="🥂"
            title="Recepción"
            venue={config.reception_venue}
            address={config.reception_address}
            time={config.reception_time}
            mapsUrl={config.reception_maps_url}
            accentColor="var(--color-apricot)"
          />
        )}
      </div>

      {/* Dress code */}
      {config.dress_code && (
        <div className="mt-8 text-center">
          <FloralDivider icon="👗" color="var(--color-blue)" />
          <p className="font-sans text-xs tracking-[0.3em] uppercase mb-1"
            style={{ color: 'var(--color-blue)' }}>
            Código de vestimenta
          </p>
          <p className="font-serif text-2xl" style={{ color: 'var(--color-dark)' }}>
            {config.dress_code}
          </p>
        </div>
      )}

      {/* Account for gifts */}
      {config.account_number && (
        <div className="mt-8 text-center bg-white rounded-3xl p-8 shadow-sm"
          style={{ border: '1px solid var(--color-yellow)44' }}>
          <p className="font-sans text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color: 'var(--color-yellow)' }}>
            🎁 Mesa de regalos
          </p>
          <p className="font-serif text-lg" style={{ color: 'var(--color-muted)' }}>
            El mejor regalo es tu presencia. Si deseas obsequiarnos algo, puedes hacerlo en:
          </p>
          <p className="mt-3 font-sans font-medium text-xl tracking-wider"
            style={{ color: 'var(--color-dark)' }}>
            {config.account_number}
          </p>
        </div>
      )}
    </section>
  )
}
