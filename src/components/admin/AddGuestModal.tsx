import { useState } from 'react'
import type { Guest } from '@/types'
import { insertGuests } from '@/lib/supabase'

interface Props {
  guests: Guest[]
  onSuccess: () => void
  onClose: () => void
}

type FamilyOption = 'none' | 'new' | string // string = existing family_id

function getExistingFamilies(guests: Guest[]): { id: string; label: string }[] {
  const map = new Map<string, string[]>()
  for (const g of guests) {
    if (!g.family_id) continue
    if (!map.has(g.family_id)) map.set(g.family_id, [])
    map.get(g.family_id)!.push(g.name)
  }
  return Array.from(map.entries()).map(([id, names]) => ({
    id,
    label: names.slice(0, 3).join(', ') + (names.length > 3 ? ` +${names.length - 3}` : ''),
  }))
}

export default function AddGuestModal({ guests, onSuccess, onClose }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [maxComp, setMaxComp] = useState(0)
  const [familyOption, setFamilyOption] = useState<FamilyOption>('none')
  const [newFamilyName, setNewFamilyName] = useState('')
  const [isFamilyHead, setIsFamilyHead] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existingFamilies = getExistingFamilies(guests)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    setError(null)
    setSaving(true)

    let family_id: string | null = null
    if (familyOption === 'new') {
      family_id = crypto.randomUUID()
    } else if (familyOption !== 'none') {
      family_id = familyOption
    }

    const { error: err } = await insertGuests([{
      name: name.trim(),
      phone: phone.trim() || undefined,
      max_companions: maxComp,
      family_id,
      is_family_head: family_id ? isFamilyHead : false,
    }])

    setSaving(false)
    if (err) {
      setError('Error al guardar el invitado. Intenta de nuevo.')
    } else {
      onSuccess()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        style={{ border: '1px solid var(--color-rose)33' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid var(--color-rose)22' }}>
          <h2 className="font-serif text-xl" style={{ color: 'var(--color-dark)' }}>
            Agregar invitado
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-100"
            style={{ color: 'var(--color-muted)' }}>
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
              Nombre <span style={{ color: 'var(--color-rose)' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              autoFocus
              className="border rounded-xl px-4 py-2.5 font-sans text-sm bg-white outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-rose)66', '--tw-ring-color': 'var(--color-rose)44' } as React.CSSProperties}
            />
          </div>

          {/* Celular */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
              Celular <span className="font-normal" style={{ color: 'var(--color-muted)' }}>(opcional)</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 3001234567"
              className="border rounded-xl px-4 py-2.5 font-sans text-sm bg-white outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-rose)66', '--tw-ring-color': 'var(--color-rose)44' } as React.CSSProperties}
            />
          </div>

          {/* Acompañantes máx. */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
              Acompañantes máximos
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={maxComp}
              onChange={(e) => setMaxComp(Number(e.target.value))}
              className="border rounded-xl px-4 py-2.5 font-sans text-sm bg-white outline-none focus:ring-2 w-28"
              style={{ borderColor: 'var(--color-rose)66', '--tw-ring-color': 'var(--color-rose)44' } as React.CSSProperties}
            />
          </div>

          {/* Familia */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
              Grupo familiar <span className="font-normal" style={{ color: 'var(--color-muted)' }}>(opcional)</span>
            </label>
            <select
              value={familyOption}
              onChange={(e) => { setFamilyOption(e.target.value as FamilyOption); setIsFamilyHead(false) }}
              className="border rounded-xl px-4 py-2.5 font-sans text-sm bg-white outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-rose)66', '--tw-ring-color': 'var(--color-rose)44' } as React.CSSProperties}
            >
              <option value="none">Sin grupo familiar</option>
              <option value="new">✦ Crear nuevo grupo</option>
              {existingFamilies.length > 0 && (
                <optgroup label="Grupos existentes">
                  {existingFamilies.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </optgroup>
              )}
            </select>

            {familyOption === 'new' && (
              <input
                type="text"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="Nombre del grupo (solo referencia)"
                className="border rounded-xl px-4 py-2.5 font-sans text-sm bg-white outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-orchid)66', '--tw-ring-color': 'var(--color-orchid)44' } as React.CSSProperties}
              />
            )}

            {familyOption !== 'none' && (
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isFamilyHead}
                  onChange={(e) => setIsFamilyHead(e.target.checked)}
                  className="rounded"
                />
                <span className="font-sans text-sm" style={{ color: 'var(--color-dark)' }}>
                  Cabeza de familia{' '}
                  <span className="font-normal" style={{ color: 'var(--color-muted)' }}>
                    (puede confirmar por todo el grupo)
                  </span>
                </span>
              </label>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-sans">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-sans text-sm transition-all hover:shadow-sm"
              style={{ background: '#f5f5f5', color: 'var(--color-muted)' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-all hover:shadow-sm disabled:opacity-50"
              style={{ background: 'var(--color-rose)', color: 'white' }}>
              {saving ? 'Guardando…' : 'Agregar invitado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
