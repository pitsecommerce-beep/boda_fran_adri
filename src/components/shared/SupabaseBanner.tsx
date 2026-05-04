import { supabaseConfigured } from '@/lib/supabase'

export default function SupabaseBanner() {
  if (supabaseConfigured) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 text-center font-sans text-sm"
      style={{ background: '#FFF3CD', borderTop: '1px solid #FFCC70', color: '#856404' }}
    >
      ⚙️ <strong>Modo de demostración:</strong> Las variables de Supabase no están configuradas.
      El contenido dinámico no estará disponible hasta que configures{' '}
      <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> y{' '}
      <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>.
    </div>
  )
}
