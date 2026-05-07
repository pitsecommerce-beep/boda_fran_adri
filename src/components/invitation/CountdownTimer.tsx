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
  const target = new Date(weddingDate)
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
      style={{ background: 'linear-gradient(135deg, #EDD97A0F, #FFFEF5)' }}>
      <p className="font-serif text-lg italic mb-8" style={{ color: 'var(--color-muted)' }}>
        {isPast ? '¡Ya estamos casados! 🎉' : 'Faltan…'}
      </p>

      <div className="flex justify-center gap-4 md:gap-8">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <div
              className="w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: 'white', border: '1px solid #EDD97A66' }}>
              <span className="font-serif text-4xl md:text-5xl font-light"
                style={{ color: 'var(--color-dark)' }}>
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="mt-2 font-sans text-xs tracking-widest uppercase"
              style={{ color: 'var(--color-muted)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
