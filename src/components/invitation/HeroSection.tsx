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
          ? `linear-gradient(rgba(30,18,8,0.38) 0%, rgba(30,18,8,0.52) 100%), url(${config.cover_photo_url}) center/cover no-repeat`
          : 'var(--color-surface)',
        position: 'relative',
      }}
    >
      {/* Corner accents */}
      <div style={cornerStyle({ top: 24, left: 24 })} />
      <div style={cornerStyle({ top: 24, right: 24 })} />
      <div style={cornerStyle({ bottom: 24, left: 24 })} />
      <div style={cornerStyle({ bottom: 24, right: 24 })} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', padding: '0 8px' }}>

        {/* Guest name — above couple, clearly secondary */}
        {guestName ? (
          <div className="animate-fade-in-up" style={{ marginBottom: 40 }}>
            <p
              className="font-sans"
              style={{
                margin: '0 0 8px',
                color: '#D4A96A',
                fontSize: '0.65rem',
                letterSpacing: '0.38em',
                textTransform: 'uppercase',
                textShadow: '0 1px 6px rgba(0,0,0,0.55)',
              }}
            >
              Con cariño, para
            </p>
            <p
              className="font-serif"
              style={{
                margin: 0,
                fontSize: '1.7rem',
                lineHeight: 1.2,
                color: '#FFFFFF',
                fontWeight: 300,
                fontStyle: 'italic',
                textShadow: '0 2px 12px rgba(0,0,0,0.50)',
              }}
            >
              {guestName}
            </p>
            <div style={{ margin: '14px auto 0', width: 48, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)' }} />
          </div>
        ) : (
          <p className="animate-fade-in-up section-label hero-label" style={{ margin: '0 0 24px' }}>
            Nos casamos
          </p>
        )}

        {/* Groom name */}
        <h1
          className="animate-fade-in-up delay-100 font-display"
          style={{
            fontSize: '4rem',
            lineHeight: 1.05,
            fontWeight: 400,
            color: '#FFFFFF',
            margin: 0,
            textShadow: '0 2px 16px rgba(0,0,0,0.40)',
          }}
        >
          {config.groom_name}
        </h1>

        {/* & divider */}
        <div
          className="animate-fade-in-up delay-200"
          style={{ margin: '10px auto', display: 'flex', alignItems: 'center', gap: 12, width: 160 }}
        >
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold))' }} />
          <span className="font-serif" style={{ color: '#D4A96A', fontSize: '1.1rem', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            &amp;
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, var(--color-gold))' }} />
        </div>

        {/* Bride name */}
        <h1
          className="animate-fade-in-up delay-300 font-display"
          style={{
            fontSize: '4rem',
            lineHeight: 1.05,
            fontWeight: 400,
            color: '#FFFFFF',
            margin: 0,
            textShadow: '0 2px 16px rgba(0,0,0,0.40)',
          }}
        >
          {config.bride_name}
        </h1>

        {/* Wedding date */}
        {formattedDate && (
          <p
            className="animate-fade-in-up delay-400 font-serif"
            style={{
              marginTop: 20,
              fontSize: '0.92rem',
              fontStyle: 'italic',
              fontWeight: 300,
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.6,
              textShadow: '0 1px 8px rgba(0,0,0,0.45)',
            }}
          >
            {formattedDate}
          </p>
        )}

        {/* "Nos casamos" label when guest is shown */}
        {guestName && (
          <p className="animate-fade-in-up delay-500 section-label hero-label" style={{ margin: '18px 0 0' }}>
            Nos casamos
          </p>
        )}
      </div>
    </section>
  )
}
