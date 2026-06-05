import { useState } from 'react'
import type { Guest, RSVP } from '@/types'
import { submitRSVP } from '@/lib/supabase'

interface Props {
  guest: Guest
  existingRSVP: RSVP | null
  onSubmitted: () => void
}

export default function RSVPSection({ guest, existingRSVP, onSubmitted }: Props) {
  const [attending, setAttending] = useState<boolean | null>(
    existingRSVP ? existingRSVP.attending : null,
  )
  const [companionCount, setCompanionCount] = useState(existingRSVP?.companion_count ?? 0)
  const [dietaryNotes, setDietaryNotes] = useState(existingRSVP?.dietary_notes ?? '')
  const [message, setMessage] = useState(existingRSVP?.message ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!existingRSVP)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (attending === null) { setError('Por favor indica si podrás asistir.'); return }
    setSubmitting(true)
    setError(null)

    const { error } = await submitRSVP({
      guest_id: guest.id,
      attending,
      companion_count: attending ? companionCount : 0,
      dietary_notes: dietaryNotes || undefined,
      needs_accommodation: false,
      message: message || undefined,
    })

    setSubmitting(false)
    if (error) {
      setError('Hubo un problema al enviar tu respuesta. Intenta de nuevo.')
    } else {
      setSubmitted(true)
      onSubmitted()
    }
  }

  if (submitted && attending !== null) {
    return (
      <section className="py-20 px-6 text-center" style={{ background: 'var(--color-surface)' }}>
        <div
          className="max-w-lg mx-auto rounded-2xl p-10"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 24px rgba(44,32,18,0.07)' }}
        >
          
          <h3 className="font-serif mb-3" style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '1.8rem' }}>
            {attending ? '¡Nos vemos pronto!' : '¡Te echaremos de menos!'}
          </h3>
          <p className="font-serif italic" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
            {attending
              ? 'Gracias por confirmar tu asistencia. ¡Será una noche inolvidable!'
              : 'Recibimos tu respuesta. Gracias por hacernos saber.'}
          </p>
          {attending && (
            <button onClick={() => setSubmitted(false)} className="mt-6 text-sm underline"
              style={{ color: 'var(--color-muted)' }}>
              Modificar respuesta
            </button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section id="rsvp" className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="section-label mb-4" style={{ display: 'block', color: 'var(--color-gold)' }}>
            Tu respuesta
          </p>
          <h2
            className="font-serif"
            style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '2.2rem', margin: 0 }}
          >
            Confirmación
          </h2>
          <p className="mt-3 font-serif italic" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
            Por favor confirma tu asistencia antes de la boda
          </p>
          {guest.max_companions >= 0 && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full font-sans text-xs tracking-widest uppercase"
              style={{ background: 'rgba(184,150,110,0.12)', color: 'var(--color-muted)', letterSpacing: '0.2em' }}>
              <span style={{ color: 'var(--color-gold)', fontSize: '0.4rem' }}>✦</span>
              <span>
                Invitación válida para{' '}
                <strong style={{ fontWeight: 600, color: 'var(--color-dark)' }}>
                  {1 + guest.max_companions}
                </strong>{' '}
                {1 + guest.max_companions === 1 ? 'persona' : 'personas'}
              </span>
              <span style={{ color: 'var(--color-gold)', fontSize: '0.4rem' }}>✦</span>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 24px rgba(44,32,18,0.07)',
          }}
        >
          {/* Attending choice */}
          <div className="mb-6">
            <p className="font-serif text-lg mb-4 text-center" style={{ color: 'var(--color-dark)', fontWeight: 300 }}>
              ¿Podrás acompañarnos, <em>{guest.name}</em>?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true,  label: '¡Sí, asistiré!' },
                { value: false, label: 'No podré asistir' },
              ].map(({ value, label }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setAttending(value)}
                  className="py-4 font-sans transition-all"
                  style={{
                    background: attending === value ? 'var(--color-gold)' : '#FFFFFF',
                    color: attending === value ? '#FFFFFF' : 'var(--color-muted)',
                    border: `1px solid ${attending === value ? 'var(--color-gold)' : 'rgba(184,150,110,0.28)'}`,
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontWeight: attending === value ? 500 : 400,
                    letterSpacing: '0.05em',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Companions */}
          {attending && guest.max_companions > 0 && (
            <div className="mb-6">
              <label className="block font-sans text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
                Número de acompañantes (máximo {guest.max_companions})
              </label>
              <select
                value={companionCount}
                onChange={(e) => setCompanionCount(Number(e.target.value))}
                className="w-full font-sans text-sm outline-none"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(184,150,110,0.30)',
                  borderRadius: 4,
                  padding: '12px 16px',
                  color: 'var(--color-dark)',
                }}
              >
                {Array.from({ length: guest.max_companions + 1 }, (_, i) => (
                  <option key={i} value={i}>{i === 0 ? 'Sólo yo' : `${i} acompañante${i > 1 ? 's' : ''}`}</option>
                ))}
              </select>
            </div>
          )}

          {/* Dietary notes */}
          {attending && (
            <div className="mb-6">
              <label className="block font-sans text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
                ¿Alguna restricción alimenticia o alergia? (opcional)
              </label>
              <input
                type="text"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="Ej. vegetariano, alergia al marisco…"
                className="w-full font-sans text-sm outline-none"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(184,150,110,0.30)',
                  borderRadius: 4,
                  padding: '12px 16px',
                  color: 'var(--color-dark)',
                }}
              />
            </div>
          )}

          {/* Message */}
          <div className="mb-6">
            <label className="block font-sans text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
              Déjanos un mensaje (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="¡Con mucho cariño y emoción…!"
              className="w-full font-sans text-sm resize-none outline-none"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(184,150,110,0.30)',
                borderRadius: 4,
                padding: '12px 16px',
                color: 'var(--color-dark)',
              }}
            />
          </div>

          {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

          <button
            type="submit"
            disabled={submitting || attending === null}
            className="w-full font-sans transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-gold)',
              color: '#FFFFFF',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '16px',
              border: 'none',
            }}
          >
            {submitting ? 'Enviando…' : 'Confirmar respuesta'}
          </button>
        </form>
      </div>
    </section>
  )
}
