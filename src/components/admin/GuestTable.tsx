import { useState } from 'react'
import type { Guest, RSVP } from '@/types'
import { deleteGuest, updateGuest, submitRSVP, deleteRSVPByGuestId } from '@/lib/supabase'
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

function AttendanceStatus({ rsvp }: { rsvp: RSVP | null }) {
  if (!rsvp) return (
    <span className="px-2 py-1 rounded-full text-xs font-sans"
      style={{ background: '#f5f5f5', color: 'var(--color-muted)' }}>
      Sin respuesta
    </span>
  )
  if (rsvp.attending) return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-sans"
      style={{ background: 'var(--color-yellow)33', color: '#4A7A4A' }}>
      ✓ Confirmado{rsvp.companion_count > 0 ? ` +${rsvp.companion_count}` : ''}
    </span>
  )
  return (
    <span className="px-2 py-1 rounded-full text-xs font-sans"
      style={{ background: '#FFE0E0', color: '#A04040' }}>
      ✗ No asistirá
    </span>
  )
}

function DietaryInfo({ rsvp }: { rsvp: RSVP | null }) {
  if (!rsvp?.attending || !rsvp.dietary_notes) return (
    <span className="font-sans text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
  )
  return (
    <span
      className="font-sans text-xs italic"
      style={{ color: 'var(--color-dark)' }}
      title={rsvp.dietary_notes}>
      {rsvp.dietary_notes.length > 35 ? rsvp.dietary_notes.slice(0, 35) + '…' : rsvp.dietary_notes}
    </span>
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
  const [attendingEdit, setAttendingEdit] = useState<'none' | 'yes' | 'no'>('none')
  const [dietaryEdit, setDietaryEdit] = useState('')
  const [saving, setSaving] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${BASE_URL}/${guest.token}`

  const handleCopy = () => {
    void navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartEdit = () => {
    setName(guest.name)
    setPhone(guest.phone ?? '')
    setMaxComp(guest.max_companions)
    setAttendingEdit(rsvp === null ? 'none' : rsvp.attending ? 'yes' : 'no')
    setDietaryEdit(rsvp?.dietary_notes ?? '')
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateGuest(guest.id, { name, phone: phone || undefined, max_companions: maxComp })
    if (attendingEdit === 'none') {
      await deleteRSVPByGuestId(guest.id)
    } else {
      await submitRSVP({
        guest_id: guest.id,
        attending: attendingEdit === 'yes',
        companion_count: rsvp?.companion_count ?? 0,
        dietary_notes: dietaryEdit || undefined,
        needs_accommodation: rsvp?.needs_accommodation ?? false,
        message: rsvp?.message ?? undefined,
      })
    }
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
      <tr style={{ borderTop: '1px solid var(--color-yellow)1A' }}>
        {/* Nombre */}
        <td className="px-4 py-3">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm w-full"
              style={{ borderColor: 'var(--color-yellow)66' }}
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

        {/* Celular */}
        <td className="px-4 py-3">
          {editing ? (
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm w-full"
              style={{ borderColor: 'var(--color-yellow)66' }}
            />
          ) : (
            <span className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
              {guest.phone ?? '—'}
            </span>
          )}
        </td>

        {/* Acomp. máx. */}
        <td className="px-4 py-3">
          {editing ? (
            <input
              type="number"
              min={0}
              max={10}
              value={maxComp}
              onChange={(e) => setMaxComp(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 text-sm w-16"
              style={{ borderColor: 'var(--color-yellow)66' }}
            />
          ) : (
            <span className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
              {guest.max_companions}
            </span>
          )}
        </td>

        {/* Asistencia */}
        <td className="px-4 py-3">
          {editing ? (
            <select
              value={attendingEdit}
              onChange={(e) => setAttendingEdit(e.target.value as 'none' | 'yes' | 'no')}
              className="border rounded-lg px-2 py-1 text-sm"
              style={{ borderColor: 'var(--color-yellow)66' }}>
              <option value="none">Sin respuesta</option>
              <option value="yes">✓ Confirmado</option>
              <option value="no">✗ No asistirá</option>
            </select>
          ) : (
            <AttendanceStatus rsvp={rsvp} />
          )}
        </td>

        {/* Restricciones alimenticias */}
        <td className="px-4 py-3">
          {editing ? (
            <input
              value={dietaryEdit}
              onChange={(e) => setDietaryEdit(e.target.value)}
              placeholder="Ninguna"
              className="border rounded-lg px-2 py-1 text-sm w-full"
              style={{ borderColor: 'var(--color-yellow)66' }}
              disabled={attendingEdit === 'no' || attendingEdit === 'none'}
            />
          ) : (
            <DietaryInfo rsvp={rsvp} />
          )}
        </td>

        {/* Acciones */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1 rounded-lg text-xs font-sans"
                  style={{ background: 'var(--color-yellow)', color: 'var(--color-dark)' }}>
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
                  style={{ background: copied ? 'var(--color-yellow)22' : 'var(--color-yellow)1A' }}>
                  {copied ? '✓' : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  title="Ver QR"
                  className="p-1.5 rounded-lg text-sm"
                  style={{ background: 'var(--color-yellow)1A' }}>
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
                  onClick={handleStartEdit}
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
          <td colSpan={6} className="px-4 py-4">
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

type FilterType = 'all' | 'confirmed' | 'declined' | 'pending' | 'accommodation' | 'dietary'

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Todos',
  confirmed: 'Confirmados',
  declined: 'No asisten',
  pending: 'Sin respuesta',
  accommodation: 'Hospedaje',
  dietary: 'Restricción alimentaria',
}

const FILTER_COLORS: Record<FilterType, string> = {
  all: 'var(--color-yellow)',
  confirmed: 'var(--color-yellow)',
  declined: 'var(--color-yellow)',
  pending: 'var(--color-yellow)',
  accommodation: 'var(--color-yellow)',
  dietary: 'var(--color-yellow)',
}

export default function GuestTable({ guests, rsvps, onRefresh }: Props) {
  const [search, setSearch] = useState('')
  const [filterRSVP, setFilterRSVP] = useState<FilterType>('all')

  const filtered = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.phone ?? '').includes(search)
    const rsvp = getRSVP(g.id, rsvps)
    const matchesFilter =
      filterRSVP === 'all'            ? true :
      filterRSVP === 'pending'        ? !rsvp :
      filterRSVP === 'confirmed'      ? (rsvp?.attending === true) :
      filterRSVP === 'declined'       ? (rsvp?.attending === false) :
      filterRSVP === 'accommodation'  ? (rsvp?.attending === true && rsvp?.needs_accommodation === true) :
      /* dietary */                     (rsvp?.attending === true && !!rsvp?.dietary_notes)
    return matchesSearch && matchesFilter
  })

  const totalConfirmed     = rsvps.filter((r) => r.attending).reduce((acc, r) => acc + 1 + r.companion_count, 0)
  const totalDeclined      = rsvps.filter((r) => !r.attending).length
  const totalPending       = guests.length - rsvps.length
  const needsAccommodation = rsvps.filter((r) => r.attending && r.needs_accommodation).length
  const withDietary        = rsvps.filter((r) => r.attending && !!r.dietary_notes).length

  const stats = [
    { label: 'Total invitados',             value: guests.length,       color: 'var(--color-yellow)' },
    { label: 'Confirmados',                 value: totalConfirmed,      color: 'var(--color-yellow)' },
    { label: 'No asistirán',                value: totalDeclined,       color: 'var(--color-yellow)' },
    { label: 'Sin respuesta',               value: totalPending,        color: 'var(--color-yellow)' },
    { label: 'Necesitan hospedaje',         value: needsAccommodation,  color: 'var(--color-yellow)' },
    { label: 'Restricción alimentaria',     value: withDietary,         color: 'var(--color-yellow)' },
  ]

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        {stats.map(({ label, value, color }) => (
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
          style={{ borderColor: 'var(--color-yellow)66' }}
        />
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterRSVP(f)}
              className="px-4 py-2 rounded-xl font-sans text-xs transition-all"
              style={{
                background: filterRSVP === f ? FILTER_COLORS[f] : '#f5f5f5',
                color: filterRSVP === f ? 'white' : 'var(--color-muted)',
              }}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: '1px solid var(--color-yellow)22' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-yellow)1A' }}>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Nombre</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Celular</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Acomp. máx.</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Asistencia</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Restricciones alimenticias</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center font-serif italic"
                    style={{ color: 'var(--color-muted)' }}>
                    No hay invitados que coincidan.
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
