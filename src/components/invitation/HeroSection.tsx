import type { WeddingConfig } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  config: WeddingConfig
  guestName?: string
}

const cornerStyle = (pos: { top?: number; bottom?: number; left?: number; right?: number }) =>
  ({
    position: 'absolute' as const,
    width: 48,
    height: 48,
    borderTop: pos.top !== undefined ? '1px solid rgba(184,150,110,0.30)' : undefined,
    borderBottom: pos.bottom !== undefined ? '1px solid rgba(184,150,110,0.30)' : undefined,
    borderLeft: pos.left !== undefined ? '1px solid rgba(184,150,110,0.30)' : undefined,
    borderRight: pos.right !== undefined ? '1px solid rgba(184,150,110,0.30)' : undefined,
    ...pos,
  })

export default function HeroSection({ config, guestName }: Props) {
  const weddingDate = config.wedding_date
    ? (() => { const d = new Date(config.wedding_date!.slice(0, 10) + 'T12:00:00'); return isNaN(d.getTime()) ? null : d })()
    : null
  const rawDate = weddingDate
    ? format(weddingDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
    : null
  const formattedDate = rawDate
    ? rawDate.charAt(0).toUpperCase() + rawDate.slice(1)
    : null

  return (
    <section
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
        background: config.cover_photo_url
          ? `linear-gradient(rgba(250,247,242,0.42), rgba(250,247,242,0.78)), url(${config.cover_photo_url}) center/cover no-repeat`
          : 'var(--color-surface)',
        position: 'relative',
      }}
    >
      {/* Corner accents */}
      <div style={cornerStyle({ top: 24, left: 24 })} />
      <div style={cornerStyle({ top: 24, right: 24 })} />
      <div style={cornerStyle({ bottom: 24, left: 24 })} />
      <div style={cornerStyle({ bottom: 24, right: 24 })} />

      <div style={{ maxWidth: 420, position: 'relative', zIndex: 1, width: '100%' }}>

        {/* Guest name — protagonist */}
        {guestName ? (
          <div className="animate-fade-in-up" style={{ marginBottom: 36 }}>
            <p
              className="font-sans"
              style={{ margin: '0 0 10px', color: 'var(--color-gold)', fontSize: '0.58rem', letterSpacing: '0.38em', textTransform: 'uppercase' }}
            >
              Con cariño, para
            </p>
            <p
              className="font-display"
              style={{
                margin: 0,
                fontSize: 'clamp(3rem, 14vw, 5rem)',
                lineHeight: 1.1,
                color: 'var(--color-dark)',
                fontWeight: 400,
              }}
            >
              {guestName}
            </p>
            <div style={{ margin: '16px auto 0', width: 60, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)' }} />
          </div>
        ) : (
          <p className="animate-fade-in-up section-label" style={{ margin: '0 0 24px' }}>
            Nos casamos
          </p>
        )}

        {/* Groom name */}
        <h1
          className={`animate-fade-in-up delay-100 font-display`}
          style={{
            fontSize: guestName ? 'clamp(2.8rem, 13vw, 4.5rem)' : 'clamp(3.8rem, 18vw, 6rem)',
            lineHeight: 1.05,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: 'var(--color-dark)',
            margin: 0,
          }}
        >
          {config.groom_name}
        </h1>

        {/* & divider */}
        <div
          className="animate-fade-in-up delay-200"
          style={{ margin: '10px auto', display: 'flex', alignItems: 'center', gap: 12, width: 180 }}
        >
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold))' }} />
          <span className="font-serif" style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>
            &amp;
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, var(--color-gold))' }} />
        </div>

        {/* Bride name */}
        <h1
          className="animate-fade-in-up delay-300 font-display"
          style={{
            fontSize: guestName ? 'clamp(2.8rem, 13vw, 4.5rem)' : 'clamp(3.8rem, 18vw, 6rem)',
            lineHeight: 1.05,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: 'var(--color-dark)',
            margin: 0,
          }}
        >
          {config.bride_name}
        </h1>

        {/* Wedding date */}
        {formattedDate && (
          <p
            className="animate-fade-in-up delay-400 font-serif"
            style={{
              marginTop: 22,
              fontSize: '0.95rem',
              fontStyle: 'italic',
              fontWeight: 300,
              letterSpacing: '0.08em',
              color: 'var(--color-muted)',
              lineHeight: 1.6,
            }}
          >
            {formattedDate}
          </p>
        )}

        {/* "Nos casamos" label when guest is shown */}
        {guestName && (
          <p className="animate-fade-in-up delay-500 section-label" style={{ margin: '18px 0 0' }}>
            Nos casamos
          </p>
        )}
      </div>
    </section>
  )
}
