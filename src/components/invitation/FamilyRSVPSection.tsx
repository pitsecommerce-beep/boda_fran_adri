import { useEffect, useState } from 'react'
import type { Guest, RSVP, FamilyRSVPEntry } from '@/types'
import { getFamilyMembers, getRSVPByGuestId, submitFamilyRSVP } from '@/lib/supabase'

interface Props {
  selectedGuest: Guest
  onBack?: () => void
}

interface MemberState {
  guest: Guest
  attending: boolean
  dietary_notes: string
  existingRSVP: RSVP | null
}

export default function FamilyRSVPSection({ selectedGuest, onBack }: Props) {
  const [members, setMembers] = useState<MemberState[]>([])
  const [needsAccommodation, setNeedsAccommodation] = useState(false)
  const [globalMessage, setGlobalMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let family: Guest[] = []
      if (selectedGuest.family_id) {
        family = await getFamilyMembers(selectedGuest.family_id)
      }
      if (!family.length) family = [selectedGuest]

      const states: MemberState[] = await Promise.all(
        family.map(async (g) => {
          const rsvp = await getRSVPByGuestId(g.id)
          return { guest: g, attending: rsvp?.attending ?? true, dietary_notes: rsvp?.dietary_notes ?? '', existingRSVP: rsvp }
        }),
      )

      setMembers(states)
      const anyAccom = states.some((s) => s.existingRSVP?.needs_accommodation)
      setNeedsAccommodation(anyAccom)
      const anyMsg = states.find((s) => s.existingRSVP?.message)?.existingRSVP?.message
      if (anyMsg) setGlobalMessage(anyMsg)
      setLoading(false)
    }
    void load()
  }, [selectedGuest])

  const updateMember = (id: string, patch: Partial<Omit<MemberState, 'guest' | 'existingRSVP'>>) => {
    setMembers((prev) => prev.map((m) => m.guest.id === id ? { ...m, ...patch } : m))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const entries: FamilyRSVPEntry[] = members.map((m) => ({
      guest: m.guest,
      attending: m.attending,
      dietary_notes: m.dietary_notes,
    }))

    const payload = entries.map((e) => ({
      guest_id: e.guest.id,
      attending: e.attending,
      dietary_notes: e.dietary_notes,
      needs_accommodation: e.attending && needsAccommodation,
      message: globalMessage,
    }))

    const { error } = await submitFamilyRSVP(payload)
    setSubmitting(false)
    if (error) {
      setError('Hubo un error al enviar la confirmación. Por favor intenta de nuevo.')
    } else {
      setSubmitted(true)
    }
  }

  const confirmedCount = members.filter((m) => m.attending).length

  if (loading) {
    return (
      <section className="py-20 px-6 text-center" style={{ background: 'var(--color-surface)' }}>
        <p className="font-serif italic" style={{ color: 'var(--color-muted)' }}>
          Cargando tu invitación…
        </p>
      </section>
    )
  }

  if (submitted) {
    return (
      <section id="rsvp" className="py-20 px-6 text-center" style={{ background: 'var(--color-surface)' }}>
        <div
          className="max-w-lg mx-auto rounded-2xl p-10"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 2px 24px rgba(44,32,18,0.07)', background: 'var(--color-surface)' }}
        >
          <div className="text-5xl mb-4">{confirmedCount > 0 ? '🎉' : '💌'}</div>
          <h3 className="font-serif mb-3" style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '1.8rem' }}>
            {confirmedCount > 0 ? '¡Gracias por confirmar!' : '¡Los tendremos presentes!'}
          </h3>
          <p className="font-serif italic leading-relaxed" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
            {confirmedCount > 0
              ? `Hemos registrado la asistencia de ${confirmedCount} ${confirmedCount === 1 ? 'persona' : 'personas'}. ¡Será una noche increíble!`
              : 'Recibimos que no podrán acompañarnos. Gracias por avisarnos.'}
          </p>
          {needsAccommodation && (
            <div className="mt-4 p-3 rounded-lg font-sans text-sm"
              style={{ background: 'rgba(184,150,110,0.10)', color: 'var(--color-dark)' }}>
              Registramos que necesitan ayuda con hospedaje. Los novios se pondrán en contacto.
            </div>
          )}
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-sm underline"
            style={{ color: 'var(--color-muted)' }}
          >
            Modificar respuesta
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="rsvp" className="py-16 px-6" style={{ background: 'var(--color-surface)', minHeight: '100dvh' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="section-label mb-4" style={{ display: 'block', color: 'var(--color-gold)' }}>
            Confirmación de asistencia
          </p>
          <h2
            className="font-serif"
            style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '2.2rem', margin: 0 }}
          >
            {members.length > 1 ? 'Confirma por tu familia' : 'Tu respuesta'}
          </h2>
          {members.length > 1 && (
            <p className="mt-3 font-serif italic" style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
              Confirmamos {members.length} personas en tu invitación.
              Indica quiénes podrán asistir.
            </p>
          )}
        </div>

        {/* Children notice */}
        <div
          className="mb-6 p-4 rounded-lg"
          style={{ background: 'rgba(184,150,110,0.08)', border: '1px solid rgba(184,150,110,0.20)' }}
        >
          <p className="font-sans text-sm leading-relaxed text-center" style={{ color: 'var(--color-dark)' }}>
            <span className="font-medium">Celebración para adultos</span> — no se admiten menores de 15 años.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 24px rgba(44,32,18,0.07)',
          }}
        >
          {/* Family members */}
          <div className="space-y-4 mb-8">
            {members.map((m) => (
              <div
                key={m.guest.id}
                className="rounded-xl p-5 transition-all"
                style={{
                  background: 'var(--color-surface)',
                  border: `1px solid ${m.attending ? 'rgba(184,150,110,0.35)' : 'rgba(44,32,18,0.08)'}`,
                }}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: 'rgba(184,150,110,0.15)', color: 'var(--color-muted)' }}
                    >
                      {m.guest.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-serif text-lg" style={{ color: 'var(--color-dark)' }}>
                      {m.guest.name}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updateMember(m.guest.id, { attending: true })}
                      className="font-sans font-medium transition-all"
                      style={{
                        background: m.attending ? 'var(--color-gold)' : '#f0f0f0',
                        color: m.attending ? '#FFFFFF' : 'var(--color-muted)',
                        borderRadius: 2,
                        fontSize: '0.6rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        padding: '6px 10px',
                        border: 'none',
                      }}
                    >
                      ✓ Asistirá
                    </button>
                    <button
                      type="button"
                      onClick={() => updateMember(m.guest.id, { attending: false })}
                      className="font-sans font-medium transition-all"
                      style={{
                        background: !m.attending ? 'var(--color-dark)' : '#f0f0f0',
                        color: !m.attending ? 'white' : 'var(--color-muted)',
                        borderRadius: 2,
                        fontSize: '0.6rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        padding: '6px 10px',
                        border: 'none',
                      }}
                    >
                      ✗ No asistirá
                    </button>
                  </div>
                </div>

                {m.attending && (
                  <div>
                    <label className="block font-sans text-xs mb-1" style={{ color: 'var(--color-muted)' }}>
                      ¿Tiene alguna restricción alimenticia o alergia? (opcional)
                    </label>
                    <input
                      type="text"
                      value={m.dietary_notes}
                      onChange={(e) => updateMember(m.guest.id, { dietary_notes: e.target.value })}
                      placeholder="Ej. vegetariano, alérgico al gluten…"
                      className="w-full font-sans text-sm outline-none"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid rgba(184,150,110,0.30)',
                        borderRadius: 4,
                        padding: '8px 14px',
                        color: 'var(--color-dark)',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Accommodation */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setNeedsAccommodation(!needsAccommodation)}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
              style={{
                background: needsAccommodation ? 'rgba(184,150,110,0.08)' : 'rgba(44,32,18,0.03)',
                border: `1px solid ${needsAccommodation ? 'rgba(184,150,110,0.35)' : 'rgba(44,32,18,0.08)'}`,
              }}
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: needsAccommodation ? 'var(--color-gold)' : 'white',
                  border: `1.5px solid ${needsAccommodation ? 'var(--color-gold)' : 'rgba(44,32,18,0.20)'}`,
                }}
              >
                {needsAccommodation && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
                  Necesitamos ayuda para encontrar hospedaje
                </p>
                <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Los novios te contactarán con opciones de hoteles cercanos
                </p>
              </div>
            </button>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block font-sans text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
              Mensaje para los novios (opcional)
            </label>
            <textarea
              value={globalMessage}
              onChange={(e) => setGlobalMessage(e.target.value)}
              rows={3}
              placeholder="¡Con mucho amor y emoción los acompañamos…!"
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

          {/* Summary */}
          <div
            className="mb-6 p-4 rounded-xl font-sans text-sm text-center"
            style={{ background: 'rgba(184,150,110,0.08)', border: '1px solid rgba(184,150,110,0.15)' }}
          >
            <span style={{ color: 'var(--color-muted)' }}>Confirmarás la asistencia de </span>
            <span className="font-semibold" style={{ color: 'var(--color-dark)' }}>
              {confirmedCount} de {members.length} {members.length === 1 ? 'persona' : 'personas'}
            </span>
          </div>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <div className="flex gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-4 font-sans text-sm transition-all"
                style={{ background: 'rgba(44,32,18,0.05)', color: 'var(--color-muted)', borderRadius: 4, border: 'none' }}
              >
                ← Cambiar
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 font-sans transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
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
              {submitting ? 'Enviando…' : 'Confirmar asistencia'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
