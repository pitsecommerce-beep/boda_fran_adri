const goldRule = 'linear-gradient(to right, transparent, var(--color-gold), transparent)'

export default function AdultsOnlyNotice() {
  return (
    <div className="text-center py-20 px-6" style={{ background: 'var(--color-khaki)' }}>
      {/* Top ornament */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, transparent, var(--color-gold)88)', margin: '0 auto 10px' }} />
        <span className="font-serif" style={{ color: 'var(--color-gold)', fontSize: '1rem', letterSpacing: '0.1em' }}>✦</span>
      </div>

      <p
        className="font-serif italic mx-auto"
        style={{ color: 'var(--color-muted)', fontSize: '1.2rem', fontWeight: 300, lineHeight: 1.9, maxWidth: 330, margin: '0 auto' }}
      >
        Agradecemos su comprensión por asistir
      </p>

      <p
        className="font-serif"
        style={{ color: 'var(--color-dark)', fontSize: '1.2rem', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.9, margin: '4px 0' }}
      >
        sin niños mayores de dos años
      </p>

      <div style={{ width: 80, height: 1, background: goldRule, margin: '28px auto' }} />

      <p
        className="font-serif italic mx-auto"
        style={{ color: 'var(--color-muted)', fontSize: '1.2rem', fontWeight: 300, lineHeight: 1.9, maxWidth: 330, margin: '0 auto' }}
      >
        ¡Estamos felices por celebrar con ustedes!
      </p>
    </div>
  )
}
