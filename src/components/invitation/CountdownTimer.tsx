import { useEffect, useState } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

interface Props {
  weddingDate: string
}

export default function CountdownTimer({ weddingDate }: Props) {
  const target = new Date(weddingDate.slice(0, 10) + 'T12:00:00')
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calculateTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [weddingDate])

  const isPast = target.getTime() <= Date.now()

  const units = [
    { label: 'Días',    value: timeLeft.days },
    { label: 'Horas',   value: timeLeft.hours },
    { label: 'Minutos', value: timeLeft.minutes },
    { label: 'Seg',     value: timeLeft.seconds },
  ]

  return (
    <section id="countdown" className="py-16 px-6 text-center"
      style={{ background: 'var(--color-khaki)' }}>

      <p className="section-label mb-10" style={{ color: 'var(--color-gold)', display: 'block' }}>
        {isPast ? '¡Ya estamos casados!' : 'Faltan'}
      </p>

      <div className="flex justify-center gap-6">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-2" style={{ minWidth: 56 }}>
            <span
              className="font-serif"
              style={{
                fontSize: '2.6rem',
                fontWeight: 300,
                color: 'var(--color-dark)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {String(value).padStart(2, '0')}
            </span>
            <div style={{ width: 28, height: 1, background: 'var(--color-gold)', opacity: 0.5 }} />
            <span
              className="font-sans"
              style={{
                fontSize: '0.55rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
