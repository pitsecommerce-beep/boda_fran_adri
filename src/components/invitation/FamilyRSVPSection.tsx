import { useEffect, useState } from 'react'
import type { Guest } from '@/types'
import { deleteRSVPByGuestId, getFamilyMembers, getRSVPByGuestId, submitRSVP } from '@/lib/supabase'

interface Props {
  selectedGuest: Guest
  /** Only show the selected guest, even if they belong to a family */
  onlySelf?: boolean
  onBack?: () => void
}

// 'pending' = "No puedo confirmar aún": stored as no RSVP row, so the guest
// stays as "sin respuesta" in the dashboard until they decide.
type Status = 'yes' | 'no' | 'pending'

interface MemberState {
  guest: Guest
  status: Status | null
  companion_count: number
  saving: boolean
  saved: boolean
}

const OPTIONS: { value: Status; label: string }[] = [
  { value: 'yes', label: 'Ahí estaré' },
  { value: 'no', label: 'No podré asistir' },
  { value: 'pending', label: 'No puedo confirmar aún' },
]

export default function FamilyRSVPSection({ selectedGuest, onlySelf, onBack }: Props) {
  const [members, setMembers] = useState<MemberState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let family: Guest[] = []
      if (!onlySelf && selectedGuest.family_id) {
        family = await getFamilyMembers(selectedGuest.family_id)
      }
      if (!family.length) family = [selectedGuest]

      const states: MemberState[] = await Promise.all(
        family.map(async (g) => {
          const rsvp = await getRSVPByGuestId(g.id)
          return {
            guest: g,
            status: rsvp ? (rsvp.attending ? 'yes' : 'no') : null,
            companion_count: rsvp?.companion_count ?? 0,
            saving: false,
            saved: false,
          }
        }),
      )

      setMembers(states)
      setLoading(false)
    }
    void load()
  }, [selectedGuest, onlySelf])

  const updateMember = (id: string, patch: Partial<Omit<MemberState, 'guest'>>) => {
    setMembers((prev) => prev.map((m) => m.guest.id === id ? { ...m, ...patch } : m))
  }

  const save = async (member: MemberState, status: Status, companionCount: number) => {
    const id = member.guest.id
    updateMember(id, { status, companion_count: companionCount, saving: true, saved: false })
    setError(null)

    const { error } = status === 'pending'
      ? await deleteRSVPByGuestId(id)
      : await submitRSVP({
          guest_id: id,
          attending: status === 'yes',
          companion_count: status === 'yes' ? Math.min(companionCount, member.guest.max_companions) : 0,
        })

    if (error) {
      updateMember(id, { status: member.status, companion_count: member.companion_count, saving: false })
      setError('Hubo un problema al guardar tu respuesta. Intenta de nuevo.')
    } else {
      updateMember(id, { saving: false, saved: true })
    }
  }

  const totalCapacity = members.reduce((acc, m) => acc + 1 + m.guest.max_companions, 0)

  if (loading) {
    return (
      <section className="py-20 px-6 text-center" style={{ background: 'var(--color-surface)' }}>
        <p className="font-serif italic" style={{ color: 'var(--color-muted)' }}>
          Cargando tu invitación…
        </p>
      </section>
    )
  }

  return (
    <section id="rsvp" className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="section-label mb-4" style={{ display: 'block', color: 'var(--color-gold)' }}>
            Confirmación de asistencia
          </p>
          <h2
            className="font-serif"
            style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '2.2rem', margin: 0 }}
          >
            Por favor confirma tu asistencia
          </h2>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full font-sans text-xs tracking-widest uppercase"
            style={{ background: 'rgba(184,150,110,0.12)', color: 'var(--color-muted)', letterSpacing: '0.2em' }}>
            <span style={{ color: 'var(--color-gold)', fontSize: '0.4rem' }}>✦</span>
            <span>
              Invitación para{' '}
              <strong style={{ fontWeight: 600, color: 'var(--color-dark)' }}>{totalCapacity}</strong>{' '}
              {totalCapacity === 1 ? 'persona' : 'personas'}
            </span>
            <span style={{ color: 'var(--color-gold)', fontSize: '0.4rem' }}>✦</span>
          </div>
        </div>

        {members.map((m) => (
          <div key={m.guest.id} className="pt-8 pb-10" style={{ borderTop: '1px solid rgba(184,150,110,0.30)' }}>
            <p className="font-serif mb-5" style={{ color: 'var(--color-dark)', fontSize: '1.8rem', fontWeight: 400, lineHeight: 1.2 }}>
              {m.guest.name}
            </p>

            <div className="flex flex-col gap-3">
              {OPTIONS.map(({ value, label }) => {
                const active = m.status === value
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={m.saving}
                    onClick={() => void save(m, value, m.companion_count)}
                    className="w-full font-sans uppercase transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{
                      background: active ? 'var(--color-gold)' : 'transparent',
                      color: active ? '#FFFFFF' : 'var(--color-dark)',
                      border: `1px solid ${active ? 'var(--color-gold)' : 'rgba(184,150,110,0.55)'}`,
                      borderRadius: 999,
                      padding: '18px 16px',
                      fontSize: '0.72rem',
                      letterSpacing: '0.3em',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {m.status === 'yes' && m.guest.max_companions > 0 && (
              <div className="mt-4">
                <label className="block font-sans text-xs mb-2 text-center" style={{ color: 'var(--color-muted)' }}>
                  Número de acompañantes (máximo {m.guest.max_companions})
                </label>
                <select
                  value={m.companion_count}
                  disabled={m.saving}
                  onChange={(e) => void save(m, 'yes', Number(e.target.value))}
                  className="w-full font-sans text-sm outline-none text-center"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(184,150,110,0.55)',
                    borderRadius: 999,
                    padding: '12px 16px',
                    color: 'var(--color-dark)',
                  }}
                >
                  {Array.from({ length: m.guest.max_companions + 1 }, (_, i) => (
                    <option key={i} value={i}>{i === 0 ? 'Sin acompañantes' : `${i} acompañante${i > 1 ? 's' : ''}`}</option>
                  ))}
                </select>
              </div>
            )}

            <p className="font-serif italic text-center mt-4" style={{ color: 'var(--color-muted)', fontSize: '0.9rem', minHeight: '1.4em' }}>
              {m.saving ? 'Guardando…' : m.saved ? (
                m.status === 'yes' ? '¡Gracias! Te esperamos.'
                  : m.status === 'no' ? 'Gracias por avisarnos, te echaremos de menos.'
                  : 'Sin problema, puedes confirmar más adelante.'
              ) : ''}
            </p>
          </div>
        ))}

        {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

        {onBack && (
          <div className="text-center">
            <button type="button" onClick={onBack} className="font-sans text-sm underline" style={{ color: 'var(--color-muted)' }}>
              ← Buscar otro nombre
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
