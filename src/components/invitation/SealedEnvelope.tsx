import { useState } from 'react'
import type { Guest } from '@/types'

interface Props {
  guest: Guest | null
  brideName: string
  groomName: string
  weddingDate: string | null
  onOpen: () => void
}

type Phase = 'idle' | 'opening'

export default function SealedEnvelope({ guest, brideName, groomName, weddingDate, onOpen }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')

  const handleClick = () => {
    if (phase !== 'idle') return
    setPhase('opening')
    setTimeout(() => onOpen(), 2600)
  }

  const totalPeople = guest ? 1 + guest.max_companions : null

  const formattedDate = weddingDate
    ? new Date(weddingDate + 'T12:00:00').toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const brideInitial = brideName.charAt(0).toUpperCase()
  const groomInitial = groomName.charAt(0).toUpperCase()

  return (
    <div
      className={`sealed-screen${phase === 'opening' ? ' envelope-is-opening' : ''}`}
      onClick={handleClick}
      role="button"
      aria-label="Abrir invitación"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
    >
      {/* Envelope card */}
      <div className="envelope-card">
        {/* Flap triangle (clip-path) */}
        <div className="flap-container" />

        {/* Wax seal — overlaps flap/body fold */}
        <div className="wax-seal-wrapper">
          <svg
            className="wax-seal-svg"
            width="86"
            height="86"
            viewBox="0 0 86 86"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="43" cy="43" r="42" fill="#6B2437" />
            <circle cx="43" cy="43" r="37" fill="none" stroke="#8B3450" strokeWidth="0.8" strokeDasharray="2.5 2.5" />
            <circle cx="43" cy="43" r="32" fill="#7D2B41" />
            <line x1="22" y1="37" x2="64" y2="37" stroke="#F0E8E0" strokeWidth="0.5" opacity="0.5" />
            <text
              x="43" y="44"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Cormorant Garamond, Georgia, serif"
              fontSize="18"
              fill="#F0E8E0"
              fontWeight="300"
              letterSpacing="4"
            >
              {groomInitial}&amp;{brideInitial}
            </text>
            <line x1="22" y1="51" x2="64" y2="51" stroke="#F0E8E0" strokeWidth="0.5" opacity="0.5" />
            <text
              x="43" y="61"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Montserrat, system-ui, sans-serif"
              fontSize="6"
              fill="#F0E8E0"
              opacity="0.75"
              letterSpacing="3"
            >
              BODA
            </text>
          </svg>
        </div>

        {/* Envelope body */}
        <div className="envelope-body">
          {/* Couple names */}
          <div className="envelope-initials">
            {groomName}
            <span className="envelope-ampersand">&amp;</span>
            {brideName}
          </div>

          <div className="envelope-divider" />

          {/* Guest address */}
          {guest ? (
            <>
              <p className="envelope-to-label">Para</p>
              <p className="envelope-guest-name">{guest.name}</p>
            </>
          ) : (
            <p className="envelope-guest-name" style={{ opacity: 0.65, fontSize: '0.9rem' }}>
              Invitación personal
            </p>
          )}

          {/* Validity count */}
          {totalPeople !== null && (
            <div className="envelope-validity">
              <span style={{ color: 'var(--color-gold)', fontSize: '0.5rem' }}>✦</span>
              <span>
                Válida para{' '}
                <strong style={{ fontWeight: 600 }}>{totalPeople}</strong>{' '}
                {totalPeople === 1 ? 'persona' : 'personas'}
              </span>
              <span style={{ color: 'var(--color-gold)', fontSize: '0.5rem' }}>✦</span>
            </div>
          )}

          {/* Date */}
          {formattedDate && (
            <p className="envelope-date-text">{formattedDate}</p>
          )}
        </div>
      </div>

      {/* Open hint */}
      <div className={`open-hint${phase === 'opening' ? ' fading' : ''}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8l-9-5-9 5v10a1 1 0 001 1h16a1 1 0 001-1V8z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
        <span>Toca para abrir tu invitación</span>
      </div>
    </div>
  )
}
