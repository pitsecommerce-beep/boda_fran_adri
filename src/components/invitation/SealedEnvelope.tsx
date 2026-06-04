import { useState } from 'react'
import type { Guest } from '@/types'

interface Props {
  guest: Guest | null
  brideName: string
  groomName: string
  weddingDate: string | null
  welcomeMessage: string | null
  sealImageUrl: string | null
  onOpen: () => void
}

type Phase = 'idle' | 'opening'

export default function SealedEnvelope({
  guest,
  brideName,
  groomName,
  weddingDate,
  welcomeMessage,
  sealImageUrl,
  onOpen,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle')

  const handleClick = () => {
    if (phase !== 'idle') return
    setPhase('opening')
    setTimeout(() => onOpen(), 2400)
  }

  const totalPeople = guest ? 1 + guest.max_companions : null

  const formattedDate = weddingDate
    ? (() => {
        const d = new Date(weddingDate.slice(0, 10) + 'T12:00:00')
        return isNaN(d.getTime())
          ? null
          : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      })()
    : null

  const blessingText = welcomeMessage?.trim() || 'Con la bendición de Dios, nuestro Amor los invita a celebrar.'

  return (
    <div
      className={`letter-sealed-bg${phase === 'opening' ? ' letter-is-opening' : ''}`}
      onClick={handleClick}
      role="button"
      aria-label="Abrir invitación"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
    >
      {/* Centered phone-width envelope column */}
      <div className="letter-column">
        {/* Diagonal fold crease lines (corner-to-corner X) */}
        <svg
          className="letter-creases"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(44,32,18,0.09)" strokeWidth="0.3" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(44,32,18,0.09)" strokeWidth="0.3" />
        </svg>

        {/* Top space */}
        <div style={{ flex: '1 1 0' }} />

        {/* Wax seal */}
        <div className={`letter-seal-wrap${phase === 'opening' ? ' seal-dissolving' : ''}`}>
          {sealImageUrl ? (
            <img
              src={sealImageUrl}
              alt="Sello"
              className="letter-seal-img"
            />
          ) : (
            <svg
              width="150"
              height="150"
              viewBox="0 0 140 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block', filter: 'drop-shadow(0 4px 18px rgba(107,36,55,0.40))' }}
            >
              <circle cx="70" cy="70" r="68" fill="#6B2437" />
              <circle cx="70" cy="70" r="62" fill="none" stroke="#8B3450" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx="70" cy="70" r="55" fill="#7D2B41" />
              <text x="70" y="57" textAnchor="middle" dominantBaseline="middle"
                fontFamily="Cormorant Garamond, Georgia, serif" fontSize="14"
                fill="#F0E8E0" fontWeight="300" letterSpacing="1">
                {groomName}
              </text>
              <text x="70" y="74" textAnchor="middle" dominantBaseline="middle"
                fontFamily="Cormorant Garamond, Georgia, serif" fontSize="22"
                fill="#F0E8E0" fontWeight="300" opacity="0.85">
                &amp;
              </text>
              <text x="70" y="91" textAnchor="middle" dominantBaseline="middle"
                fontFamily="Cormorant Garamond, Georgia, serif" fontSize="14"
                fill="#F0E8E0" fontWeight="300" letterSpacing="1">
                {brideName}
              </text>
            </svg>
          )}
        </div>

        {/* Guest info */}
        <div className="letter-guest-block">
          {guest ? (
            <>
              <p className="letter-to-label">Para</p>
              <p className="letter-guest-name">{guest.name}</p>
            </>
          ) : (
            <p className="letter-guest-name" style={{ opacity: 0.6, fontSize: '0.9rem' }}>
              Invitación personal
            </p>
          )}
          {totalPeople !== null && (
            <div className="letter-validity">
              <span style={{ color: 'var(--color-gold)', fontSize: '0.45rem' }}>✦</span>
              <span>
                Válida para <strong style={{ fontWeight: 600 }}>{totalPeople}</strong>{' '}
                {totalPeople === 1 ? 'persona' : 'personas'}
              </span>
              <span style={{ color: 'var(--color-gold)', fontSize: '0.45rem' }}>✦</span>
            </div>
          )}
          {formattedDate && (
            <p className="letter-date">{formattedDate}</p>
          )}
        </div>

        {/* Bottom space */}
        <div style={{ flex: '1 1 0' }} />

        {/* Blessing text */}
        <p className="letter-blessing">{blessingText}</p>

        {/* Tap hint */}
        <div className={`letter-hint${phase === 'opening' ? ' letter-hint-hiding' : ''}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8l-9-5-9 5v10a1 1 0 001 1h16a1 1 0 001-1V8z" />
            <polyline points="9 21 9 12 15 12 15 21" />
          </svg>
          <span>Toca para abrir tu invitación</span>
        </div>
      </div>
    </div>
  )
}
