import type { WeddingConfig } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  config: WeddingConfig
  guestName?: string
}

export default function HeroSection({ config, guestName }: Props) {
  const weddingDate = config.wedding_date ? new Date(config.wedding_date) : null
  const formattedDate = weddingDate
    ? format(weddingDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
    : null

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{
        background: config.cover_photo_url
          ? `linear-gradient(rgba(255,255,255,0.50), rgba(255,255,255,0.82)), url(${config.cover_photo_url}) center/cover no-repeat`
          : '#FFFFFF',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-40 h-40 rounded-full opacity-25"
        style={{ background: 'var(--color-yellow)' }} />
      <div className="absolute bottom-16 left-8 w-28 h-28 rounded-full opacity-15"
        style={{ background: 'var(--color-yellow)' }} />
      <div className="absolute top-1/3 left-4 w-16 h-16 rounded-full opacity-10"
        style={{ background: 'var(--color-yellow)' }} />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Top floral accent */}
        <div className="animate-fade-in-up text-4xl mb-4 animate-float">🌸</div>

        {/* Saludo personalizado */}
        {guestName && (
          <p className="animate-fade-in-up delay-100 font-serif text-lg mb-3 italic"
            style={{ color: 'var(--color-muted)' }}>
            Con todo nuestro cariño, para
          </p>
        )}
        {guestName && (
          <p className="animate-fade-in-up delay-200 font-serif text-2xl md:text-3xl mb-6"
            style={{ color: 'var(--color-dark)' }}>
            {guestName}
          </p>
        )}

        {/* Invitation text */}
        <p className="animate-fade-in-up delay-200 font-serif tracking-[0.25em] uppercase text-sm mb-4"
          style={{ color: 'var(--color-muted)' }}>
          Nos complace invitarte a la celebración de nuestra boda
        </p>

        {/* Names */}
        <div className="animate-fade-in-up delay-300">
          <h1 className="font-display text-7xl md:text-9xl leading-none"
            style={{ color: 'var(--color-dark)' }}>
            {config.groom_name}
          </h1>
          <p className="font-serif text-2xl my-3" style={{ color: 'var(--color-yellow)' }}>
            &amp;
          </p>
          <h1 className="font-display text-7xl md:text-9xl leading-none"
            style={{ color: 'var(--color-dark)' }}>
            {config.bride_name}
          </h1>
        </div>

        {/* Date */}
        {formattedDate && (
          <div className="animate-fade-in-up delay-400 mt-8">
            <p className="font-serif text-xl md:text-2xl capitalize"
              style={{ color: 'var(--color-muted)' }}>
              {formattedDate}
            </p>
          </div>
        )}

        {/* Scroll cue */}
        <div className="animate-fade-in-up delay-600 mt-12">
          <button
            type="button"
            onClick={() => document.getElementById('detalles')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex flex-col items-center gap-2 transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <span className="font-serif italic text-sm">Desplázate para descubrir</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" className="animate-bounce">
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      {/* Yellow accent line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: 'var(--color-yellow)' }} />
    </section>
  )
}
