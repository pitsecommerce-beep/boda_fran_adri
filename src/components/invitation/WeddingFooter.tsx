interface Props {
  brideName: string
  groomName: string
  weddingDate?: string | null
}

export default function WeddingFooter({ brideName, groomName, weddingDate }: Props) {
  const year = weddingDate
    ? new Date(weddingDate.slice(0, 10) + 'T12:00:00').getFullYear()
    : new Date().getFullYear()

  return (
    <footer
      style={{
        minHeight: '100svh',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Top ornament */}
      <div style={{ marginBottom: '2.5rem', opacity: 0.35 }}>
        <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
          <line x1="0" y1="12" x2="48" y2="12" stroke="var(--color-gold)" strokeWidth="0.8" />
          <circle cx="56" cy="12" r="3" fill="var(--color-gold)" />
          <circle cx="64" cy="12" r="5" fill="none" stroke="var(--color-gold)" strokeWidth="0.8" />
          <circle cx="64" cy="12" r="1.5" fill="var(--color-gold)" />
          <circle cx="72" cy="12" r="3" fill="var(--color-gold)" />
          <line x1="80" y1="12" x2="120" y2="12" stroke="var(--color-gold)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Names */}
      <h2
        className="font-display"
        style={{
          color: 'var(--color-dark)',
          fontSize: 'clamp(2.8rem, 10vw, 4.5rem)',
          margin: '0 0 0.5rem',
          lineHeight: 1.1,
        }}
      >
        {groomName} &amp; {brideName}
      </h2>

      {/* Tagline */}
      <p
        className="font-sans"
        style={{
          color: 'var(--color-muted)',
          fontSize: '0.7rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          margin: '0.75rem 0 0',
        }}
      >
        Para siempre · {year}
      </p>

      {/* Bottom ornament */}
      <div style={{ marginTop: '2.5rem', opacity: 0.35 }}>
        <svg width="80" height="16" viewBox="0 0 80 16" fill="none">
          <line x1="0" y1="8" x2="30" y2="8" stroke="var(--color-gold)" strokeWidth="0.8" />
          <circle cx="40" cy="8" r="4" fill="none" stroke="var(--color-gold)" strokeWidth="0.8" />
          <circle cx="40" cy="8" r="1.5" fill="var(--color-gold)" />
          <line x1="50" y1="8" x2="80" y2="8" stroke="var(--color-gold)" strokeWidth="0.8" />
        </svg>
      </div>
    </footer>
  )
}
