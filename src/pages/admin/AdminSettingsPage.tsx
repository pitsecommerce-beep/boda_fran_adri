import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useWeddingConfig } from '@/hooks/useWeddingConfig'
import { updateWeddingConfig } from '@/lib/supabase'
import type { WeddingConfig } from '@/types'

type FormData = Omit<WeddingConfig, 'id' | 'updated_at' | 'gallery_urls' | 'itinerary'>

const defaultForm: FormData = {
  bride_name: 'Adriana',
  groom_name: 'Francisco',
  wedding_date: '',
  ceremony_time: '',
  ceremony_venue: '',
  ceremony_address: '',
  ceremony_maps_url: '',
  reception_time: '',
  reception_venue: '',
  reception_address: '',
  reception_maps_url: '',
  welcome_message: '',
  dress_code: '',
  cover_photo_url: '',
  account_number: '',
}

interface FieldProps {
  label: string
  name: keyof FormData
  type?: string
  placeholder?: string
  hint?: string
  form: FormData
  onChange: (name: keyof FormData, value: string) => void
}

function Field({ label, name, type = 'text', placeholder, hint, form, onChange }: FieldProps) {
  return (
    <div>
      <label className="block font-sans text-sm font-medium mb-1" style={{ color: 'var(--color-dark)' }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={(form[name] ?? '') as string}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full border rounded-xl px-4 py-3 font-sans text-sm bg-white resize-none outline-none"
          style={{ borderColor: 'var(--color-rose)66' }}
        />
      ) : (
        <input
          type={type}
          value={(form[name] ?? '') as string}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-xl px-4 py-3 font-sans text-sm bg-white outline-none"
          style={{ borderColor: 'var(--color-rose)66' }}
        />
      )}
      {hint && <p className="mt-1 font-sans text-xs" style={{ color: 'var(--color-muted)' }}>{hint}</p>}
    </div>
  )
}

export default function AdminSettingsPage() {
  const { config, loading, refresh } = useWeddingConfig()
  const [form, setForm] = useState<FormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (config) {
      setForm({
        bride_name:          config.bride_name,
        groom_name:          config.groom_name,
        wedding_date:        config.wedding_date?.slice(0, 16) ?? '',
        ceremony_time:       config.ceremony_time ?? '',
        ceremony_venue:      config.ceremony_venue ?? '',
        ceremony_address:    config.ceremony_address ?? '',
        ceremony_maps_url:   config.ceremony_maps_url ?? '',
        reception_time:      config.reception_time ?? '',
        reception_venue:     config.reception_venue ?? '',
        reception_address:   config.reception_address ?? '',
        reception_maps_url:  config.reception_maps_url ?? '',
        welcome_message:     config.welcome_message ?? '',
        dress_code:          config.dress_code ?? '',
        cover_photo_url:     config.cover_photo_url ?? '',
        account_number:      config.account_number ?? '',
      })
    }
  }, [config])

  const handleChange = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const updates: Partial<WeddingConfig> = {
      ...form,
      wedding_date: form.wedding_date ? new Date(form.wedding_date).toISOString() : null,
    }

    const { error } = await updateWeddingConfig(updates)

    if (error) {
      setError('No se pudo guardar la configuración.')
    } else {
      setSaved(true)
      void refresh()
    }
    setSaving(false)
  }

  if (loading) return (
    <AdminLayout title="Configuración">
      <div className="text-center py-16 font-serif italic" style={{ color: 'var(--color-muted)' }}>
        Cargando…
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="Configuración de la Boda">
      <form onSubmit={handleSubmit}>
        {/* Section: Couple */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          style={{ border: '1px solid var(--color-rose)33' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            👫 Los novios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre del novio" name="groom_name" placeholder="Francisco" form={form} onChange={handleChange} />
            <Field label="Nombre de la novia" name="bride_name" placeholder="Adriana" form={form} onChange={handleChange} />
          </div>
        </div>

        {/* Section: Date & messages */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          style={{ border: '1px solid var(--color-yellow)44' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            📅 Fecha y mensaje
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Fecha y hora de la boda" name="wedding_date" type="datetime-local" form={form} onChange={handleChange} />
            <Field label="Código de vestimenta" name="dress_code" placeholder="Formal / Etiqueta" form={form} onChange={handleChange} />
          </div>
          <div className="mt-4">
            <Field
              label="Mensaje de bienvenida"
              name="welcome_message"
              type="textarea"
              placeholder="Ej. Con toda la ilusión del mundo queremos compartir este día tan especial con ustedes…"
              form={form}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section: Ceremony */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          style={{ border: '1px solid var(--color-orchid)44' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            ⛪ Ceremonia religiosa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Horario" name="ceremony_time" placeholder="Ej. 12:00 p.m." form={form} onChange={handleChange} />
            <Field label="Nombre del lugar" name="ceremony_venue" placeholder="Ej. Parroquia de San Miguel" form={form} onChange={handleChange} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <Field label="Dirección" name="ceremony_address" placeholder="Ej. Av. Principal 123, Col. Centro" form={form} onChange={handleChange} />
            <Field label="Enlace a Google Maps" name="ceremony_maps_url" placeholder="https://maps.google.com/..." form={form} onChange={handleChange}
              hint="Pega aquí el enlace que Google Maps te da al compartir la ubicación" />
          </div>
        </div>

        {/* Section: Reception */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          style={{ border: '1px solid var(--color-apricot)44' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            🥂 Recepción
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Horario" name="reception_time" placeholder="Ej. 2:00 p.m." form={form} onChange={handleChange} />
            <Field label="Nombre del lugar" name="reception_venue" placeholder="Ej. Hacienda Los Pinos" form={form} onChange={handleChange} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <Field label="Dirección" name="reception_address" placeholder="Ej. Km. 5 Carretera a…" form={form} onChange={handleChange} />
            <Field label="Enlace a Google Maps" name="reception_maps_url" form={form} onChange={handleChange}
              hint="Pega aquí el enlace que Google Maps te da al compartir la ubicación" />
          </div>
        </div>

        {/* Section: Extras */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          style={{ border: '1px solid var(--color-blue)44' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            🎁 Extras
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Foto de portada (URL)"
              name="cover_photo_url"
              placeholder="https://…"
              hint="URL pública de la imagen que aparecerá de fondo en el hero"
              form={form}
              onChange={handleChange}
            />
            <Field
              label="Número de cuenta / CLABE para regalos (opcional)"
              name="account_number"
              placeholder="Ej. CLABE: 000 000 0000 0000 00 00"
              form={form}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Save */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        {saved && (
          <p className="text-sm mb-4 text-center" style={{ color: 'var(--color-jade)' }}>
            ✓ Guardado correctamente
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl font-sans text-sm font-medium transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
          style={{ background: 'var(--color-rose)', color: 'white' }}>
          {saving ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </form>
    </AdminLayout>
  )
}
