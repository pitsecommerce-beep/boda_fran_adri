function Sprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="46" height="46" viewBox="0 0 46 46" fill="none"
      stroke="var(--color-gold)" strokeWidth="0.9" strokeLinecap="round"
      style={{ transform: flip ? 'scale(-1, 1)' : undefined, opacity: 0.75 }}
      aria-hidden="true"
    >
      <path d="M3 43C12 34 20 22 24 4" />
      <path d="M9 36c-4-1-6-4-6-7 3 0 6 2 6 7z" fill="var(--color-gold)" fillOpacity="0.12" />
      <path d="M14 28c-4-2-5-5-4-8 3 1 5 4 4 8z" fill="var(--color-gold)" fillOpacity="0.12" />
      <path d="M19 19c-3-2-4-6-2-8 2 1 4 4 2 8z" fill="var(--color-gold)" fillOpacity="0.12" />
      <path d="M12 38c2-4 6-5 9-4-1 3-5 5-9 4z" fill="var(--color-gold)" fillOpacity="0.12" />
      <path d="M17 30c2-4 6-5 9-4-1 3-5 5-9 4z" fill="var(--color-gold)" fillOpacity="0.12" />
      <circle cx="24" cy="4" r="1.4" fill="var(--color-gold)" stroke="none" />
    </svg>
  )
}

function Rings() {
  return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" stroke="var(--color-gold)" strokeWidth="1.2" aria-hidden="true">
      <circle cx="16" cy="16" r="10" />
      <circle cx="28" cy="16" r="10" />
      <path d="M13 4l3-3 3 3" strokeLinejoin="round" />
    </svg>
  )
}

export default function AdultsOnlyNotice() {
  return (
    <div className="relative mx-auto text-center" style={{ maxWidth: 380 }}>
      {/* Outer frame with inner hairline */}
      <div
        className="relative px-7 pt-10 pb-9"
        style={{
          background: 'linear-gradient(180deg, #FFFDF9 0%, var(--color-khaki) 100%)',
          border: '1px solid rgba(184,150,110,0.35)',
          borderRadius: 6,
          boxShadow: '0 6px 28px rgba(44,32,18,0.07)',
        }}
      >
        <div
          className="pointer-events-none absolute"
          style={{ inset: 7, border: '1px solid rgba(184,150,110,0.18)', borderRadius: 3 }}
        />

        {/* Corner sprigs */}
        <div className="absolute" style={{ top: 10, left: 10 }}><Sprig /></div>
        <div className="absolute" style={{ top: 10, right: 10 }}><Sprig flip /></div>

        <div className="relative">
          <div className="flex justify-center mb-4"><Rings /></div>

          <p className="section-label mb-2" style={{ display: 'block', fontSize: '0.6rem' }}>
            Con todo nuestro cariño
          </p>
          <h3
            className="font-display"
            style={{ color: 'var(--color-wine)', fontSize: '2.5rem', fontWeight: 400, lineHeight: 1.2, margin: 0 }}
          >
            Una noche para adultos
          </h3>

          <div className="flex items-center justify-center gap-3 my-5">
            <span className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, rgba(184,150,110,0.6))' }} />
            <span style={{ color: 'var(--color-gold)', fontSize: '0.7rem' }}>♡</span>
            <span className="h-px w-10" style={{ background: 'linear-gradient(to left, transparent, rgba(184,150,110,0.6))' }} />
          </div>

          <p
            className="font-serif italic"
            style={{ color: 'var(--color-dark)', fontSize: '1.12rem', fontWeight: 400, lineHeight: 1.75, margin: 0 }}
          >
            Queremos que disfruten esta noche al máximo, por eso nuestra celebración será
            únicamente para adultos.
          </p>

          <div
            className="inline-block mt-5 px-5 py-3"
            style={{
              background: 'rgba(184,150,110,0.10)',
              border: '1px solid rgba(184,150,110,0.25)',
              borderRadius: 14,
            }}
          >
            <p
              className="font-sans"
              style={{ fontSize: '0.58rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: 0 }}
            >
              Excepto
            </p>
            <p
              className="font-serif italic"
              style={{ fontSize: '1rem', color: 'var(--color-muted)', margin: '2px 0 0' }}
            >
              bebés de brazos menores de 2 años
            </p>
          </div>

          <p
            className="font-serif italic mt-5"
            style={{ color: 'var(--color-muted)', fontSize: '1rem', fontWeight: 300, lineHeight: 1.75, margin: '20px 0 0' }}
          >
            Gracias por su comprensión y por organizarse con anticipación.
          </p>

          <p
            className="font-serif mt-4"
            style={{ color: 'var(--color-gold)', fontSize: '1.15rem', fontWeight: 500, margin: '16px 0 0' }}
          >
            ¡Estamos ansiosos por festejar con ustedes!
          </p>
        </div>
      </div>
    </div>
  )
}
