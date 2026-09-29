const goldRule = 'linear-gradient(to right, transparent, var(--color-gold), transparent)'

export default function AdultsOnlyNotice() {
  return (
    <div className="text-center py-12 px-6" style={{ background: 'var(--color-khaki)' }}>
      {/* Top ornament */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, transparent, var(--color-gold)88)', margin: '0 auto 10px' }} />
        <span className="font-serif" style={{ color: 'var(--color-gold)', fontSize: '1rem', letterSpacing: '0.1em' }}>✦</span>
      </div>

      <p className="section-label mb-3" style={{ display: 'block', color: 'var(--color-gold)' }}>
        Con cariño
      </p>
      <p
        className="font-serif"
        style={{ color: 'var(--color-dark)', fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', margin: 0 }}
      >
        Solo adultos
      </p>

      <div style={{ width: 80, height: 1, background: goldRule, margin: '28px auto' }} />

      <p
        className="font-serif italic mx-auto"
        style={{ color: 'var(--color-dark)', fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.8, maxWidth: 330, margin: '0 auto' }}
      >
        Queremos que disfruten esta noche al máximo, por eso nuestra celebración será
        únicamente para adultos.
      </p>

      <p
        className="font-sans uppercase"
        style={{ fontSize: '0.58rem', letterSpacing: '0.28em', color: 'var(--color-muted)', margin: '20px 0 0', lineHeight: 1.9 }}
      >
        Excepto bebés de brazos<br />menores de 2 años
      </p>

      <div style={{ width: 80, height: 1, background: goldRule, margin: '28px auto' }} />

      <p
        className="font-serif italic mx-auto"
        style={{ color: 'var(--color-muted)', fontSize: '1rem', fontWeight: 300, lineHeight: 1.8, maxWidth: 320, margin: '0 auto' }}
      >
        Gracias por su comprensión y por organizarse con anticipación.
        ¡Estamos ansiosos por festejar con ustedes!
      </p>
    </div>
  )
}
