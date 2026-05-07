interface Props {
  brideName: string
  groomName: string
  weddingDate?: string | null
}

export default function WeddingFooter({ brideName, groomName, weddingDate }: Props) {
  const year = weddingDate ? new Date(weddingDate).getFullYear() : new Date().getFullYear()

  return (
    <footer className="py-16 px-6 text-center"
      style={{ background: '#FFFFFF', borderTop: '1.5px solid var(--color-yellow)' }}>
      <div className="text-4xl mb-4">🌸</div>
      <h3 className="font-display text-5xl mb-2" style={{ color: 'var(--color-dark)' }}>
        {groomName} &amp; {brideName}
      </h3>
      <p className="font-serif italic text-sm" style={{ color: 'var(--color-muted)' }}>
        Para siempre · {year}
      </p>
      <div className="mt-8 flex justify-center gap-2 items-center">
        {['#EDD97A', '#D4B84A', '#FFFEF5', '#EDD97A', '#C8A830'].map((c, i) => (
          <div
            key={i}
            style={{
              background: c,
              width: i === 2 ? '10px' : '12px',
              height: i === 2 ? '10px' : '12px',
              borderRadius: '50%',
              border: i === 2 ? '1px solid #EDD97A66' : 'none',
            }}
          />
        ))}
      </div>
    </footer>
  )
}
