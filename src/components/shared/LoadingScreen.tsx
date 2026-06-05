import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  // Simulated progress: fast to 70%, then slows until the parent unmounts
  useEffect(() => {
    const steps: [number, number][] = [
      [25, 120],
      [50, 280],
      [65, 500],
      [72, 800],
      [78, 1400],
      [83, 2400],
    ]
    const timers = steps.map(([target, delay]) =>
      setTimeout(() => setProgress(target), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-khaki)',
        padding: '0 40px',
        gap: 20,
      }}
    >
      {/* Monogram / brand mark */}
      <p
        className="font-display"
        style={{ fontSize: '3rem', color: 'var(--color-gold)', margin: 0, lineHeight: 1 }}
      >
        F &amp; A
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 220,
          height: 2,
          background: 'rgba(184,150,110,0.22)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--color-gold)',
            borderRadius: 2,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      <p
        className="font-serif"
        style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: 0, letterSpacing: '0.12em', fontStyle: 'italic' }}
      >
        Cargando...
      </p>
    </div>
  )
}
