import { useState } from 'react'
import type { Guest, RSVP } from '@/types'
import { deleteGuest, deleteGuests, updateGuest, submitRSVP, deleteRSVPByGuestId } from '@/lib/supabase'
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

function ConfirmDeleteModal({
  count,
  onConfirm,
  onCancel,
  deleting,
}: {
  count: number
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        style={{ border: '1px solid var(--color-yellow)33' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: '#FFE0E0' }}>
            🗑️
          </div>
          <h3 className="font-serif text-lg" style={{ color: 'var(--color-dark)' }}>
            Confirmar eliminación
          </h3>
        </div>
        <p className="font-sans text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          Estás a punto de eliminar <strong style={{ color: 'var(--color-dark)' }}>{count} invitado{count > 1 ? 's' : ''}</strong>.
          También se borrarán sus RSVPs y asignaciones de mesa. Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-5 py-2 rounded-xl font-sans text-sm transition-all"
            style={{ background: '#f5f5f5', color: 'var(--color-muted)' }}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-5 py-2 rounded-xl font-sans text-sm font-medium transition-all"
            style={{ background: '#E04040', color: 'white', opacity: deleting ? 0.6 : 1 }}>
            {deleting ? 'Eliminando…' : `Eliminar ${count} invitado${count > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function GuestRow({
  guest,
  rsvp,
  onRefresh,
  selected,
  onToggleSelect,
}: {
  guest: Guest
  rsvp: RSVP | null
  onRefresh: () => void
  selected: boolean
  onToggleSelect: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(guest.name)
  const [phone, setPhone] = useState(guest.phone ?? '')
  const [maxComp, setMaxComp] = useState(guest.max_companions)
  const [attendingEdit, setAttendingEdit] = useState<'none' | 'yes' | 'no'>('none')
  const [dietaryEdit, setDietaryEdit] = useState('')
  const [sideEdit, setSideEdit] = useState<'none' | 'bride' | 'groom'>('none')
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
    setSideEdit(guest.side ?? 'none')
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateGuest(guest.id, { name, phone: phone || undefined, max_companions: maxComp, side: sideEdit === 'none' ? null : sideEdit })
    if (attendingEdit === 'none') {
      await deleteRSVPByGuestId(guest.id)
    } else {
      await submitRSVP({
        guest_id: guest.id,
        attending: attendingEdit === 'yes',
        companion_count: rsvp?.companion_count ?? 0,
        dietary_notes: dietaryEdit || undefined,
        needs_accommodation: false,
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
      <tr style={{ borderTop: '1px solid var(--color-yellow)1A', background: selected ? 'var(--color-yellow)0D' : undefined }}>
        {/* Checkbox */}
        <td className="px-3 py-3 w-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded accent-[var(--color-yellow)] cursor-pointer"
          />
        </td>

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
                  Responsable del grupo
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

        {/* Lado */}
        <td className="px-4 py-3">
          {editing ? (
            <select
              value={sideEdit}
              onChange={(e) => setSideEdit(e.target.value as 'none' | 'bride' | 'groom')}
              className="border rounded-lg px-2 py-1 text-sm"
              style={{ borderColor: 'var(--color-yellow)66' }}>
              <option value="none">Sin asignar</option>
              <option value="bride">Novia</option>
              <option value="groom">Novio</option>
            </select>
          ) : (
            <SideBadge side={guest.side} />
          )}
        </td>

        {/* Invitación entregada */}
        <td className="px-4 py-3">
          <button
            onClick={async () => {
              await updateGuest(guest.id, { invitation_delivered: !guest.invitation_delivered })
              onRefresh()
            }}
            title={guest.invitation_delivered ? 'Marcar como no entregada' : 'Marcar como entregada'}
            className="px-2 py-1 rounded-full text-xs font-sans transition-all"
            style={{
              background: guest.invitation_delivered ? '#E8F5E9' : '#f5f5f5',
              color: guest.invitation_delivered ? '#2E7D32' : 'var(--color-muted)',
              border: `1px solid ${guest.invitation_delivered ? '#A5D6A7' : '#ddd'}`,
            }}>
            {guest.invitation_delivered ? '✓ Entregada' : '✗ Pendiente'}
          </button>
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
                    title={guest.is_family_head ? 'Quitar responsable del grupo' : 'Marcar como responsable del grupo'}
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
          <td colSpan={9} className="px-4 py-4">
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

function SideBadge({ side }: { side: 'bride' | 'groom' | null }) {
  if (!side) return <span className="font-sans text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
  const label = side === 'bride' ? 'Novia' : 'Novio'
  const bg = side === 'bride' ? '#FCE4EC' : '#E3F2FD'
  const color = side === 'bride' ? '#AD1457' : '#1565C0'
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-sans" style={{ background: bg, color }}>
      {label}
    </span>
  )
}

type FilterType = 'all' | 'confirmed' | 'declined' | 'pending' | 'dietary' | 'delivered' | 'not_delivered'

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Todos',
  confirmed: 'Confirmados',
  declined: 'No asisten',
  pending: 'Sin respuesta',
  dietary: 'Con restricción alimentaria',
  delivered: 'Invitación entregada',
  not_delivered: 'Sin entregar',
}

const FILTER_COLORS: Record<FilterType, string> = {
  all: 'var(--color-yellow)',
  confirmed: 'var(--color-yellow)',
  declined: 'var(--color-yellow)',
  pending: 'var(--color-yellow)',
  dietary: 'var(--color-yellow)',
  delivered: 'var(--color-yellow)',
  not_delivered: 'var(--color-yellow)',
}

export default function GuestTable({ guests, rsvps, onRefresh }: Props) {
  const [search, setSearch] = useState('')
  const [filterRSVP, setFilterRSVP] = useState<FilterType>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.phone ?? '').includes(search)
    const rsvp = getRSVP(g.id, rsvps)
    const matchesFilter =
      filterRSVP === 'all'            ? true :
      filterRSVP === 'pending'        ? !rsvp :
      filterRSVP === 'confirmed'      ? (rsvp?.attending === true) :
      filterRSVP === 'declined'       ? (rsvp?.attending === false) :
      filterRSVP === 'delivered'      ? g.invitation_delivered :
      filterRSVP === 'not_delivered'  ? !g.invitation_delivered :
      /* dietary */                     (rsvp?.attending === true && !!rsvp?.dietary_notes)
    return matchesSearch && matchesFilter
  })

  const allFilteredSelected = filtered.length > 0 && filtered.every((g) => selectedIds.has(g.id))
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const g of filtered) next.delete(g.id)
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const g of filtered) next.add(g.id)
        return next
      })
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalSelectedCount = selectedIds.size

  const handleBulkDelete = async () => {
    setDeleting(true)
    await deleteGuests([...selectedIds])
    setDeleting(false)
    setShowDeleteModal(false)
    setSelectedIds(new Set())
    onRefresh()
  }

  const totalConfirmed     = rsvps.filter((r) => r.attending).reduce((acc, r) => acc + 1 + r.companion_count, 0)
  const totalDeclined      = rsvps.filter((r) => !r.attending).length
  const totalPending       = guests.length - rsvps.length
  const withDietary        = rsvps.filter((r) => r.attending && !!r.dietary_notes).length
  const totalDelivered     = guests.filter((g) => g.invitation_delivered).length
  const totalBride         = guests.filter((g) => g.side === 'bride').length
  const totalGroom         = guests.filter((g) => g.side === 'groom').length

  const stats = [
    { label: 'Total invitados',             value: guests.length,       color: 'var(--color-yellow)' },
    { label: 'Confirmados',                 value: totalConfirmed,      color: 'var(--color-yellow)' },
    { label: 'No asistirán',                value: totalDeclined,       color: 'var(--color-yellow)' },
    { label: 'Sin respuesta',               value: totalPending,        color: 'var(--color-yellow)' },
    { label: 'Invitación entregada',        value: totalDelivered,      color: 'var(--color-yellow)' },
    { label: 'De la novia',                 value: totalBride,          color: 'var(--color-yellow)' },
    { label: 'Del novio',                   value: totalGroom,          color: 'var(--color-yellow)' },
    { label: 'Con restricción alimentaria', value: withDietary,         color: 'var(--color-yellow)' },
  ]

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
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

      {/* Bulk actions bar */}
      {someSelected && (
        <div className="flex items-center gap-4 mb-4 px-4 py-3 rounded-xl"
          style={{ background: 'var(--color-yellow)15', border: '1px solid var(--color-yellow)44' }}>
          <span className="font-sans text-sm" style={{ color: 'var(--color-dark)' }}>
            {totalSelectedCount} invitado{totalSelectedCount > 1 ? 's' : ''} seleccionado{totalSelectedCount > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-1.5 rounded-lg font-sans text-xs font-medium transition-all"
            style={{ background: '#E04040', color: 'white' }}>
            Eliminar seleccionados
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-4 py-1.5 rounded-lg font-sans text-xs transition-all"
            style={{ background: '#f5f5f5', color: 'var(--color-muted)' }}>
            Deseleccionar todo
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: '1px solid var(--color-yellow)22' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-yellow)1A' }}>
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-[var(--color-yellow)] cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Nombre</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Celular</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Acomp. máx.</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Lado</th>
                <th className="text-left px-4 py-3 font-sans font-medium text-xs tracking-wide"
                  style={{ color: 'var(--color-dark)' }}>Invitación</th>
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
                  <td colSpan={9} className="px-4 py-10 text-center font-serif italic"
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
                    selected={selectedIds.has(g.id)}
                    onToggleSelect={() => toggleSelect(g.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          count={totalSelectedCount}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}
    </div>
  )
}
