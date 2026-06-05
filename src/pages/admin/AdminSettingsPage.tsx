import { useEffect, useRef, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useWeddingConfig } from '@/hooks/useWeddingConfig'
import { updateWeddingConfig, uploadPhoto } from '@/lib/supabase'
import type { WeddingConfig } from '@/types'

type FormData = Omit<WeddingConfig, 'id' | 'updated_at' | 'gallery_urls' | 'itinerary' | 'dress_code_image_url' | 'seal_image_url'>

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
  favicon_url: '',
  account_number: '',
  gift_registry_url: '',
  music_url: '',
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
          style={{ borderColor: 'var(--color-yellow)66' }}
        />
      ) : (
        <input
          type={type}
          value={(form[name] ?? '') as string}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-xl px-4 py-3 font-sans text-sm bg-white outline-none"
          style={{ borderColor: 'var(--color-yellow)66' }}
        />
      )}
      {hint && <p className="mt-1 font-sans text-xs" style={{ color: 'var(--color-muted)' }}>{hint}</p>}
    </div>
  )
}

interface ImageUploaderProps {
  label: string
  currentUrl: string | null | undefined
  onUploaded: (url: string) => void
  onRemove?: () => void
  hint?: string
  accept?: string
}

function ImageUploader({ label, currentUrl, onUploaded, onRemove, hint, accept = 'image/*' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    setError(null)
    const url = await uploadPhoto(file)
    if (url) { onUploaded(url) } else { setError('No se pudo subir el archivo.') }
    setUploading(false)
  }

  return (
    <div>
      {/* Confirm remove modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(44,32,18,0.50)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full shadow-2xl text-center"
            style={{ border: '1px solid var(--color-border)' }}>
            <p className="font-serif text-lg mb-2" style={{ color: 'var(--color-dark)', fontWeight: 300 }}>
              ¿Quitar esta imagen?
            </p>
            <p className="font-sans text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
              Se quitará del sitio (el archivo en storage no se elimina).
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(false)}
                className="flex-1 py-3 rounded-xl font-sans text-sm"
                style={{ background: 'var(--color-khaki)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                Cancelar
              </button>
              <button
                onClick={() => { onRemove?.(); setConfirmRemove(false) }}
                className="flex-1 py-3 rounded-xl font-sans text-sm font-medium"
                style={{ background: '#E05555', color: 'white' }}>
                Sí, quitar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <label className="block font-sans text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
          {label}
        </label>
        {currentUrl && onRemove && (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="font-sans text-xs px-2 py-1 rounded-lg"
            style={{ color: '#E05555', background: '#FFF0F0', border: '1px solid #FFCCCC' }}>
            ✕ Quitar
          </button>
        )}
      </div>
      <div
        className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all"
        style={{ borderColor: 'var(--color-yellow)55', background: 'var(--color-yellow)06' }}
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void handleFile(f) }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f) }} />
        {uploading ? (
          <p className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>Subiendo…</p>
        ) : currentUrl ? (
          <div className="flex flex-col items-center gap-2">
            {accept.startsWith('image') ? (
              <img src={currentUrl} alt="" className="max-h-24 rounded object-cover" style={{ maxWidth: '100%' }} />
            ) : (
              <p className="font-sans text-xs break-all" style={{ color: 'var(--color-muted)' }}>{currentUrl}</p>
            )}
            <p className="font-sans text-xs" style={{ color: 'var(--color-gold)' }}>Clic para cambiar</p>
          </div>
        ) : (
          <p className="font-sans text-sm" style={{ color: 'var(--color-muted)' }}>
            Arrastra o <span style={{ color: 'var(--color-gold)' }}>selecciona un archivo</span>
          </p>
        )}
      </div>
      {error && <p className="mt-1 font-sans text-xs text-red-500">{error}</p>}
      {hint && <p className="mt-1 font-sans text-xs" style={{ color: 'var(--color-muted)' }}>{hint}</p>}
    </div>
  )
}

export default function AdminSettingsPage() {
  const { config, loading, refresh } = useWeddingConfig()
  const [form, setForm] = useState<FormData>(defaultForm)
  const [dressCodeImageUrl, setDressCodeImageUrl] = useState<string>('')
  const [sealImageUrl, setSealImageUrl] = useState<string>('')
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
        favicon_url:         config.favicon_url ?? '',
        account_number:      config.account_number ?? '',
        gift_registry_url:   config.gift_registry_url ?? '',
        music_url:           config.music_url ?? '',
      })
      setDressCodeImageUrl(config.dress_code_image_url ?? '')
      setSealImageUrl(config.seal_image_url ?? '')
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
      wedding_date: form.wedding_date ? form.wedding_date + ':00.000Z' : null,
      dress_code_image_url: dressCodeImageUrl || null,
      seal_image_url: sealImageUrl || null,
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
          style={{ border: '1px solid var(--color-yellow)22' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            Los novios
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
            Fecha y mensaje
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
          <div className="mt-4">
            <ImageUploader
              label="Imagen de inspiración (código de vestimenta)"
              currentUrl={dressCodeImageUrl}
              onUploaded={(url) => { setDressCodeImageUrl(url); setSaved(false) }}
              onRemove={() => { setDressCodeImageUrl(''); setSaved(false) }}
              hint="Sube una foto de inspiración que se mostrará junto al código de vestimenta"
            />
          </div>
        </div>

        {/* Section: Ceremony */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          style={{ border: '1px solid var(--color-yellow)33' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            Ceremonia religiosa
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
          style={{ border: '1px solid var(--color-yellow)33' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            Recepción
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

        {/* Section: Media */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          style={{ border: '1px solid var(--color-yellow)33' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            Imagen y audio
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <ImageUploader
              label="Logo / ícono del sitio (favicon)"
              currentUrl={form.favicon_url}
              onUploaded={(url) => { handleChange('favicon_url', url) }}
              onRemove={() => { handleChange('favicon_url', ''); setSaved(false) }}
              hint="Se mostrará como el ícono en la pestaña del navegador. Se recomienda imagen cuadrada (PNG o SVG)."
            />
            <ImageUploader
              label="Foto de portada"
              currentUrl={form.cover_photo_url}
              onUploaded={(url) => { handleChange('cover_photo_url', url) }}
              onRemove={() => { handleChange('cover_photo_url', ''); setSaved(false) }}
              hint="Aparecerá de fondo en la primera pantalla de la invitación"
            />
            <ImageUploader
              label="Imagen del sello de cera (fondo transparente)"
              currentUrl={sealImageUrl}
              onUploaded={(url) => { setSealImageUrl(url); setSaved(false) }}
              onRemove={() => { setSealImageUrl(''); setSaved(false) }}
              hint="Sube una imagen PNG con fondo transparente del sello. Si no se sube, se usa el sello generado automáticamente con los nombres."
            />
            <div>
              <label className="block font-sans text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Canción de fondo
              </label>
              <p className="font-sans text-xs mb-3" style={{ color: 'var(--color-muted)' }}>
                Se reproducirá automáticamente al abrir la carta. Sube un archivo de audio, pega una URL pública (MP3, OGG, WAV) <strong>o pega un enlace de YouTube</strong> — solo se reproducirá el audio, sin mostrar video.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <ImageUploader
                  label="Subir archivo de audio"
                  currentUrl={form.music_url || null}
                  onUploaded={(url) => { handleChange('music_url', url) }}
                  accept="audio/*"
                  hint="Formatos: MP3, OGG, WAV, M4A"
                />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  <span className="font-sans text-xs" style={{ color: 'var(--color-muted)' }}>o pega URL</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                </div>
                <Field
                  label=""
                  name="music_url"
                  placeholder="https://… (.mp3, .ogg, .wav)"
                  form={form}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Gifts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          style={{ border: '1px solid var(--color-yellow)44' }}>
          <h2 className="font-serif text-xl mb-1" style={{ color: 'var(--color-dark)' }}>
            Mesa de regalos
          </h2>
          <p className="font-sans text-xs mb-4" style={{ color: 'var(--color-muted)' }}>
            Puedes poner una liga a tu mesa de regalos (Liverpool, Palacio de Hierro, etc.) y/o una CLABE para transferencias. Ambos campos son opcionales.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Liga a mesa de regalos (opcional)"
              name="gift_registry_url"
              placeholder="https://www.liverpool.com.mx/mesa-de-regalos/…"
              hint="Enlace a tu mesa de regalos en Liverpool, Palacio de Hierro u otra tienda"
              form={form}
              onChange={handleChange}
            />
            <Field
              label="Número de cuenta / CLABE (opcional)"
              name="account_number"
              type="textarea"
              placeholder={"Ej.\nBBVA · CLABE: 012 345 6789 0123 45\nBanorte · CLABE: 072 345 0000 0000 00"}
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
          <p className="text-sm mb-4 text-center" style={{ color: 'var(--color-yellow)' }}>
            ✓ Guardado correctamente
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl font-sans text-sm font-medium transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
          style={{ background: 'var(--color-yellow)', color: 'var(--color-dark)' }}>
          {saving ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </form>
    </AdminLayout>
  )
}
