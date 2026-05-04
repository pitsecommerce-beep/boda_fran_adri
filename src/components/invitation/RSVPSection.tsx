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
  const [needsAccommodation, setNeedsAccommodation] = useState(existingRSVP?.needs_accommodation ?? false)
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
      needs_accommodation: needsAccommodation,
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
      <section className="py-20 px-6 text-center">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-10 shadow-sm"
          style={{ border: '1px solid var(--color-rose)44' }}>
          <div className="text-5xl mb-4">{attending ? '🎉' : '💌'}</div>
          <h3 className="font-serif text-3xl mb-3" style={{ color: 'var(--color-dark)' }}>
            {attending ? '¡Nos vemos pronto!' : '¡Te echaremos de menos!'}
          </h3>
          <p className="font-serif text-lg italic" style={{ color: 'var(--color-muted)' }}>
            {attending
              ? 'Gracias por confirmar tu asistencia. ¡Será una noche inolvidable!'
              : 'Recibimos tu respuesta. Gracias por hacernos saber.'}
          </p>
          {attending && needsAccommodation && (
            <div className="mt-4 p-3 rounded-xl font-sans text-sm"
              style={{ background: 'var(--color-blue)22', color: 'var(--color-dark)' }}>
              Registramos que necesitas ayuda con hospedaje. Los novios se pondrán en contacto.
            </div>
          )}
          {attending && (
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-sm underline"
              style={{ color: 'var(--color-muted)' }}>
              Modificar respuesta
            </button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section id="rsvp" className="py-20 px-6" style={{ background: '#ACCBD811' }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--color-blue)' }}>
            Tu respuesta
          </p>
          <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--color-dark)' }}>
            Confirmación
          </h2>
          <p className="mt-3 font-serif italic" style={{ color: 'var(--color-muted)' }}>
            Por favor confirma tu asistencia antes de la boda
          </p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 shadow-sm"
          style={{ border: '1px solid var(--color-blue)44' }}>

          {/* Attending choice */}
          <div className="mb-6">
            <p className="font-serif text-lg mb-4 text-center" style={{ color: 'var(--color-dark)' }}>
              ¿Podrás acompañarnos, <strong>{guest.name}</strong>?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true,  label: '¡Sí, asistiré!',  emoji: '🎊' },
                { value: false, label: 'No podré asistir', emoji: '💌' },
              ].map(({ value, label, emoji }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setAttending(value)}
                  className="py-4 rounded-2xl font-sans text-sm transition-all"
                  style={{
                    background: attending === value
                      ? value ? 'var(--color-jade)' : 'var(--color-rose)'
                      : '#f9f9f9',
                    color: attending === value ? 'var(--color-dark)' : 'var(--color-muted)',
                    border: `2px solid ${attending === value
                      ? value ? 'var(--color-jade)' : 'var(--color-rose)'
                      : '#e5e5e5'}`,
                    fontWeight: attending === value ? 600 : 400,
                  }}>
                  <span className="block text-2xl mb-1">{emoji}</span>
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
                className="w-full border rounded-xl px-4 py-3 font-sans text-sm bg-white"
                style={{ borderColor: 'var(--color-blue)66', color: 'var(--color-dark)' }}>
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
                placeholder="Ej. vegetariano, alergia al mariscos…"
                className="w-full border rounded-xl px-4 py-3 font-sans text-sm bg-white"
                style={{ borderColor: 'var(--color-blue)66', color: 'var(--color-dark)' }}
              />
            </div>
          )}

          {/* Accommodation */}
          {attending && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setNeedsAccommodation(!needsAccommodation)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                style={{
                  background: needsAccommodation ? 'var(--color-blue)22' : '#f9f9f9',
                  border: `1px solid ${needsAccommodation ? 'var(--color-blue)88' : '#e5e5e5'}`,
                }}>
                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: needsAccommodation ? 'var(--color-blue)' : 'white',
                    border: `2px solid ${needsAccommodation ? 'var(--color-blue)' : '#ccc'}`,
                  }}>
                  {needsAccommodation && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3" strokeLinecap="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
                    Necesito ayuda para encontrar hospedaje
                  </p>
                  <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    Los novios te contactarán con opciones de hoteles cercanos
                  </p>
                </div>
              </button>
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
              className="w-full border rounded-xl px-4 py-3 font-sans text-sm bg-white resize-none"
              style={{ borderColor: 'var(--color-rose)66', color: 'var(--color-dark)' }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || attending === null}
            className="w-full py-4 rounded-2xl font-sans text-sm font-medium transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-rose)', color: 'white' }}>
            {submitting ? 'Enviando…' : 'Confirmar respuesta'}
          </button>
        </form>
      </div>
    </section>
  )
}
