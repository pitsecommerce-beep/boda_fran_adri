import { useState } from 'react'
import type { Guest, RSVP } from '@/types'
import { deleteGuest, updateGuest } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

async function toggleFamilyHead(guest: Guest, onRefresh: () => void) {
  await updateGuest(guest.id, { is_family_head: !guest.is_family_head })
  onRefresh()
}

interface Props {
  guests: Guest[]
  rsvps: RSVP[]
  onRefresh: () => void
}

const BASE_URL = `${window.location.origin}${import.meta.env.BASE_URL}#/invitacion`

function getRSVP(guestId: string, rsvps: RSVP[]) {
  return rsvps.find((r) => r.guest_id === guestId) ?? null
}

function AttendanceBadge({ rsvp }: { rsvp: RSVP | null }) {
  if (!rsvp) return (
    <span className="px-2 py-1 rounded-full text-xs font-sans"
      style={{ background: '#f5f5f5', color: 'var(--color-muted)' }}>
      Sin respuesta
    </span>
  )
  return (
    <div className="flex flex-wrap gap-1">
      {rsvp.attending ? (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-sans"
          style={{ background: 'var(--color-jade)44', color: '#4A7A4A' }}>
          ✓ Confirmado{rsvp.companion_count > 0 ? ` +${rsvp.companion_count}` : ''}
        </span>
      ) : (
        <span className="px-2 py-1 rounded-full text-xs font-sans"
          style={{ background: '#FFE0E0', color: '#A04040' }}>
          ✗ No asistirá
        </span>
      )}
      {rsvp.needs_accommodation && (
        <span className="px-2 py-1 rounded-full text-xs font-sans"
          style={{ background: 'var(--color-blue)22', color: 'var(--color-blue)', border: '1px solid var(--color-blue)66' }}>
          Hospedaje
        </span>
      )}
    </div>
  )
}

function GuestRow({
  guest,
  rsvp,
  onRefresh,
}: {
  guest: Guest
  rsvp: RSVP | null
  onRefresh: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(guest.name)
  const [phone, setPhone] = useState(guest.phone ?? '')
  const [maxComp, setMaxComp] = useState(guest.max_companions)
  const [saving, setSaving] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${BASE_URL}/${guest.token}`

  const handleCopy = () => {
    void navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateGuest(guest.id, { name, phone: phone || undefined, max_companions: maxComp })
    setSaving(false)
    setEditing(false)
    onRefresh()
  }

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${guest.name}? Esta acción también borrará su RSVP.`)) return
    await deleteGuest(guest.id)
    onRefresh()
  }

  return (
    <>
      <tr style={{ borderTop: '1px solid var(--color-rose)22' }}>
        <td className="px-4 py-3">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm w-full"
              style={{ borderColor: 'var(--color-rose)66' }}
            />
          ) : (
            <div className="flex flex-col gap-1">
              <span className="font-sans text-sm" style={{ color: 'var(--color-dark)' }}>
                {guest.name}
              </span>
              {guest.is_family_head && guest.family_id && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sans w-fit"
                  style={{ background: 'var(--color-yellow)44', color: '#7a6500', border: '1px solid var(--color-yellow)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                  </svg>
                  Cabeza de familia
                </span>
              )}
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          {editing ? (
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm w-full"
              style={{ borderColor: 'var(--color-rose)66' }}
            />
          ) : (
            <span className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
              {guest.phone ?? '—'}
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          {editing ? (
            <input
              type="number"
              min={0}
              max={10}
              value={maxComp}
              onChange={(e) => setMaxComp(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 text-sm w-16"
              style={{ borderColor: 'var(--color-rose)66' }}
            />
          ) : (
            <span className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
              {guest.max_companions}
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <AttendanceBadge rsvp={rsvp} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1 rounded-lg text-xs font-sans"
                  style={{ background: 'var(--color-jade)', color: 'var(--color-dark)' }}>
                  {saving ? '…' : 'Guardar'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 rounded-lg text-xs font-sans"
                  style={{ background: '#f5f5f5', color: 'var(--color-muted)' }}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCopy}
                  title="Copiar enlace"
                  className="p-1.5 rounded-lg text-sm transition-all"
                  style={{ background: copied ? 'var(--color-jade)33' : 'var(--color-blue)22' }}>
                  {copied ? '✓' : '🔗'}
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  title="Ver QR"
                  className="p-1.5 rounded-lg text-sm"
                  style={{ background: 'var(--color-orchid)22' }}>
                  QR
                </button>
                {guest.family_id && (
                  <button
                    onClick={() => void toggleFamilyHead(guest, onRefresh)}
                    title={guest.is_family_head ? 'Quitar cabeza de familia' : 'Marcar como cabeza de familia'}
                    className="p-1.5 rounded-lg text-sm transition-all"
                    style={{ background: guest.is_family_head ? 'var(--color-yellow)88' : 'var(--color-yellow)22' }}>
                    👑
                  </button>
                )}
                <button
                  onClick={() => setEditing(true)}
                  title="Editar"
                  className="p-1.5 rounded-lg text-sm"
                  style={{ background: 'var(--color-yellow)33' }}>
                  ✏️
                </button>
                <button
                  onClick={handleDelete}
                  title="Eliminar"
                  className="p-1.5 rounded-lg text-sm"
                  style={{ background: '#FFE0E022' }}>
                  🗑️
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {showQR && (
        <tr style={{ background: 'var(--color-cream)' }}>
          <td colSpan={5} className="px-4 py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <QRCodeSVG value={inviteUrl} size={120} />
              </div>
              <div>
                <p className="font-sans text-xs mb-1" style={{ color: 'var(--color-muted)' }}>
                  Enlace personalizado:
                </p>
                <p className="font-sans text-xs break-all" style={{ color: 'var(--color-dark)' }}>
                  {inviteUrl}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function GuestTable({ guests, rsvps, onRefresh }: Props) {
  const [search, setSearch] = useState('')
  const [filterRSVP, setFilterRSVP] = useState<'all' | 'confirmed' | 'declined' | 'pending' | 'accommodation'>('all')

  const filtered = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.phone ?? '').includes(search)
    const rsvp = getRSVP(g.id, rsvps)
    const matchesFilter =
      filterRSVP === 'all' ? true :
      filterRSVP === 'pending' ? !rsvp :
      filterRSVP === 'confirmed' ? (rsvp?.attending === true) :
      filterRSVP === 'accommodation' ? (rsvp?.needs_accommodation === true) :
      (rsvp?.attending === false)
    return matchesSearch && matchesFilter
  })

  const totalConfirmed    = rsvps.filter((r) => r.attending).reduce((acc, r) => acc + 1 + r.companion_count, 0)
  const totalDeclined     = rsvps.filter((r) => !r.attending).length
  const totalPending      = guests.length - rsvps.length
  const needsAccommodation = (() => {
    const familiesWithAccom = new Set<string>()
    let individualCount = 0
    rsvps.filter((r) => r.needs_accommodation).forEach((r) => {
      const guest = guests.find((g) => g.id === r.guest_id)
      if (guest?.family_id) {
        familiesWithAccom.add(guest.family_id)
      } else {
        individualCount++
      }
    })
    return familiesWithAccom.size + individualCount
  })()

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total invitados', value: guests.length,       color: 'var(--color-orchid)' },
          { label: 'Confirmados',     value: totalConfirmed,      color: 'var(--color-jade)' },
          { label: 'No asistirán',    value: totalDeclined,       color: 'var(--color-apricot)' },
          { label: 'Sin respuesta',   value: totalPending,        color: 'var(--color-blue)' },
          { label: 'Necesitan hospedaje', value: needsAccommodation, color: 'var(--color-yellow)' },
        ].map(({ label, value, color }) => (
          <div key={label}
            className="bg-white rounded-2xl p-4 text-center shadow-sm"
            style={{ border: `1px solid ${color}55` }}>
            <p className="font-serif text-3xl" style={{ color }}>{value}</p>
            <p className="font-sans text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o celular…"
          className="flex-1 min-w-48 border rounded-xl px-4 py-2 font-sans text-sm bg-white"
          style={{ borderColor: 'var(--color-rose)66' }}
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'confirmed', 'declined', 'pending', 'accommodation'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterRSVP(f)}
              className="px-4 py-2 rounded-xl font-sans text-xs transition-all"
              style={{
                background: filterRSVP === f
                  ? f === 'accommodation' ? 'var(--color-blue)' : 'var(--color-rose)'
                  : '#f5f5f5',
                color: filterRSVP === f ? 'white' : 'var(--color-muted)',
              }}>
              {{ all: 'Todos', confirmed: 'Confirmados', declined: 'No asisten', pending: 'Sin respuesta', accommodation: 'Hospedaje' }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: '1px solid var(--color-rose)33' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-rose)22' }}>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Nombre</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Celular</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Acomp. máx.</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>RSVP</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center font-serif italic"
                    style={{ color: 'var(--color-muted)' }}>
                    No hay invitados que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <GuestRow
                    key={g.id}
                    guest={g}
                    rsvp={getRSVP(g.id, rsvps)}
                    onRefresh={onRefresh}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
