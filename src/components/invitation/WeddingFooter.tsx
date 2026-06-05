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
      className="py-16 px-6 text-center"
      style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
    >
      <h3
        className="font-display"
        style={{ color: 'var(--color-dark)', fontSize: '3.2rem', margin: '0 0 8px' }}
      >
        {groomName} &amp; {brideName}
      </h3>
      <p
        className="font-sans"
        style={{
          color: 'var(--color-muted)',
          fontSize: '0.65rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontStyle: 'normal',
          margin: 0,
        }}
      >
        Para siempre · {year}
      </p>
      <div className="mt-8 flex justify-center items-center" style={{ gap: 16 }}>
        {[
          'var(--color-gold)',
          'var(--color-paper-dark)',
          'var(--color-gold)',
        ].map((c, i) => (
          <div
            key={i}
            style={{
              background: c,
              width: 8,
              height: 8,
              borderRadius: '50%',
              opacity: i === 1 ? 0.5 : 0.8,
            }}
          />
        ))}
      </div>
    </footer>
  )
}
