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
    setTimeout(() => onOpen(), 2050)
  }

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
        {/* Paper fold creases with shadow + highlight to simulate real paper doblez */}
        <svg
          className="letter-creases"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradient for triangular panel shading */}
            <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id="bottomShade" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(44,32,18,0.045)" />
              <stop offset="100%" stopColor="rgba(44,32,18,0)" />
            </linearGradient>
            <linearGradient id="leftShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(44,32,18,0.03)" />
              <stop offset="100%" stopColor="rgba(44,32,18,0)" />
            </linearGradient>
            <linearGradient id="rightShade" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* Triangular flap panels — subtle tonal difference per section */}
          <polygon points="0,0 100,0 50,50" fill="url(#topShade)" />
          <polygon points="0,100 100,100 50,50" fill="url(#bottomShade)" />
          <polygon points="0,0 0,100 50,50" fill="url(#leftShade)" />
          <polygon points="100,0 100,100 50,50" fill="url(#rightShade)" />

          {/* ── Diagonal TL→BR ── */}
          {/* Shadow strip (below/right of fold) */}
          <line x1="0.8" y1="0" x2="100" y2="99.2" stroke="rgba(44,32,18,0.14)" strokeWidth="0.55" />
          {/* Main crease */}
          <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(44,32,18,0.08)" strokeWidth="0.25" />
          {/* Highlight strip (above/left of fold) */}
          <line x1="0" y1="0.8" x2="99.2" y2="100" stroke="rgba(255,255,255,0.40)" strokeWidth="0.45" />

          {/* ── Diagonal TR→BL ── */}
          {/* Shadow strip */}
          <line x1="99.2" y1="0" x2="0" y2="99.2" stroke="rgba(44,32,18,0.14)" strokeWidth="0.55" />
          {/* Main crease */}
          <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(44,32,18,0.08)" strokeWidth="0.25" />
          {/* Highlight strip */}
          <line x1="100" y1="0.8" x2="0.8" y2="100" stroke="rgba(255,255,255,0.40)" strokeWidth="0.45" />
        </svg>

        {/* Wax seal */}
        <div
          className="letter-seal-wrap"
          style={phase === 'opening' ? { willChange: 'transform, opacity' } : undefined}
        >
          {sealImageUrl ? (
            <img
              src={sealImageUrl}
              alt="Sello"
              className="letter-seal-img"
            />
          ) : (
            <svg
              width="190"
              height="190"
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
          {formattedDate && (
            <p className="letter-date">{formattedDate}</p>
          )}
        </div>

        {/* Blessing text — absolute bottom */}
        <p className="letter-blessing">{blessingText}</p>

      </div>
    </div>
  )
}
