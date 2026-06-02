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

      <div style={{ maxWidth: 380, position: 'relative', zIndex: 1 }}>
        {/* Label */}
        <p className="animate-fade-in-up section-label" style={{ margin: '0 0 24px' }}>
          Nos casamos
        </p>

        {/* Groom name */}
        <h1
          className="animate-fade-in-up delay-100 font-display"
          style={{
            fontSize: 'clamp(3.8rem, 18vw, 6rem)',
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
          style={{ margin: '14px auto', display: 'flex', alignItems: 'center', gap: 12, width: 200 }}
        >
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold))' }} />
          <span className="font-serif" style={{ color: 'var(--color-gold)', fontSize: '1.4rem' }}>
            &amp;
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, var(--color-gold))' }} />
        </div>

        {/* Bride name */}
        <h1
          className="animate-fade-in-up delay-300 font-display"
          style={{
            fontSize: 'clamp(3.8rem, 18vw, 6rem)',
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
              marginTop: 28,
              fontSize: '1rem',
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

        {/* Guest greeting card */}
        {guestName && (
          <div
            className="animate-fade-in-up delay-500"
            style={{
              marginTop: 28,
              padding: '14px 22px',
              border: '1px solid rgba(184,150,110,0.25)',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.48)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            <p
              className="font-sans"
              style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.58rem', letterSpacing: '0.32em', textTransform: 'uppercase' }}
            >
              Con cariño, para
            </p>
            <p
              className="font-serif"
              style={{ margin: '5px 0 0', color: 'var(--color-dark)', fontSize: '1.15rem', fontStyle: 'italic' }}
            >
              {guestName}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
