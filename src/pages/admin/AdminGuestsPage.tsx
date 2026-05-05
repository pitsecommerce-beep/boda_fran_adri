import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import GuestTable from '@/components/admin/GuestTable'
import ExcelUploader from '@/components/admin/ExcelUploader'
import AddGuestModal from '@/components/admin/AddGuestModal'
import { listGuests, listRSVPs } from '@/lib/supabase'
import { downloadGuestTemplate } from '@/lib/excelTemplate'
import type { Guest, RSVP } from '@/types'

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

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
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium transition-all hover:shadow-sm"
          style={{ background: 'var(--color-rose)', color: 'white' }}>
          + Agregar invitado
        </button>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium transition-all hover:shadow-sm"
          style={{ background: 'var(--color-orchid)33', color: 'var(--color-dark)', border: '1px solid var(--color-orchid)66' }}>
          {showUploader ? '✕ Cerrar importación' : '📊 Importar Excel'}
        </button>
        <button
          onClick={downloadGuestTemplate}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-sans text-sm font-medium transition-all hover:shadow-sm"
          style={{ background: 'var(--color-jade)33', color: 'var(--color-dark)', border: '1px solid var(--color-jade)88' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Descargar plantilla
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

      {/* Add guest modal */}
      {showAddModal && (
        <AddGuestModal
          guests={guests}
          onSuccess={() => { setShowAddModal(false); void refresh() }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </AdminLayout>
  )
}
