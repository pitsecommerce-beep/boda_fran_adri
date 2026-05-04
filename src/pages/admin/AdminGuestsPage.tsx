import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import GuestTable from '@/components/admin/GuestTable'
import ExcelUploader from '@/components/admin/ExcelUploader'
import { listGuests, listRSVPs } from '@/lib/supabase'
import type { Guest, RSVP } from '@/types'

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)

  const refresh = async () => {
    setLoading(true)
    const [g, r] = await Promise.all([listGuests(), listRSVPs()])
    setGuests(g)
    setRsvps(r)
    setLoading(false)
  }

  useEffect(() => { void refresh() }, [])

  return (
    <AdminLayout title="Gestión de Invitados">
      {/* Actions bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium transition-all hover:shadow-sm"
          style={{ background: 'var(--color-rose)', color: 'white' }}>
          {showUploader ? '✕ Cerrar importación' : '📊 Importar Excel'}
        </button>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl font-sans text-sm transition-all hover:shadow-sm disabled:opacity-50"
          style={{
            background: '#f5f5f5',
            color: 'var(--color-muted)',
            border: '1px solid var(--color-dark)22',
          }}>
          {loading ? 'Cargando…' : '↻ Actualizar'}
        </button>
      </div>

      {/* Excel Uploader */}
      {showUploader && (
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm"
          style={{ border: '1px solid var(--color-rose)33' }}>
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            Importar invitados desde Excel
          </h2>
          <p className="font-sans text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
            Sube un archivo Excel o CSV con las columnas: <strong>nombre</strong>, celular (opcional),
            acompanantes (opcional). Se generará automáticamente un enlace único para cada invitado.
          </p>
          <ExcelUploader onSuccess={() => { setShowUploader(false); void refresh() }} />
        </div>
      )}

      {/* Guest list */}
      {loading ? (
        <div className="text-center py-16 font-serif italic" style={{ color: 'var(--color-muted)' }}>
          Cargando invitados…
        </div>
      ) : (
        <GuestTable guests={guests} rsvps={rsvps} onRefresh={refresh} />
      )}
    </AdminLayout>
  )
}
