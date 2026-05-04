import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import { listGuests, listRSVPs } from '@/lib/supabase'
import { useWeddingConfig } from '@/hooks/useWeddingConfig'
import type { Guest, RSVP } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface StatCardProps {
  icon: string
  label: string
  value: number | string
  sub?: string
  accent: string
}

function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-2"
      style={{ border: `1px solid ${accent}44` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${accent}22` }}
      >
        {icon}
      </div>
      <p className="font-sans text-xs tracking-widest uppercase mt-1" style={{ color: accent }}>
        {label}
      </p>
      <p className="font-serif text-4xl" style={{ color: 'var(--color-dark)' }}>
        {value}
      </p>
      {sub && (
        <p className="font-sans text-xs" style={{ color: 'var(--color-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

interface QuickLinkProps {
  to: string
  icon: string
  title: string
  description: string
  accent: string
}

function QuickLink({ to, icon, title, description, accent }: QuickLinkProps) {
  return (
    <Link
      to={to}
      className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4 transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ border: `1px solid ${accent}33`, textDecoration: 'none' }}
    >
      <div
        className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
        style={{ background: `${accent}22` }}
      >
        {icon}
      </div>
      <div>
        <p className="font-serif text-lg" style={{ color: 'var(--color-dark)' }}>
          {title}
        </p>
        <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {description}
        </p>
      </div>
      <svg
        className="ml-auto flex-shrink-0 mt-1"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ color: accent }}
      >
        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const { config, isDefault } = useWeddingConfig()
  const [guests, setGuests] = useState<Guest[]>([])
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [g, r] = await Promise.all([listGuests(), listRSVPs()])
      setGuests(g)
      setRsvps(r)
      setLoading(false)
    }
    void load()
  }, [])

  const totalGuests = guests.length
  const responded = rsvps.length
  const attending = rsvps.filter((r) => r.attending).length
  const declined = rsvps.filter((r) => !r.attending).length
  const pending = totalGuests - responded

  const confirmedWithCompanions =
    rsvps.filter((r) => r.attending).reduce((acc, r) => acc + 1 + r.companion_count, 0)
  const needsAccommodation = rsvps.filter((r) => r.attending && r.needs_accommodation).length
  const withDietary        = rsvps.filter((r) => r.attending && !!r.dietary_notes)

  const dietaryList = withDietary.map((r) => {
    const guest = guests.find((g) => g.id === r.guest_id)
    return { name: guest?.name ?? 'Invitado', note: r.dietary_notes! }
  })

  const weddingDate = config?.wedding_date ? new Date(config.wedding_date) : null
  const daysUntil = weddingDate
    ? Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <AdminLayout title="Panel de control">
      {/* Supabase / config banner */}
      {isDefault && (
        <div
          className="mb-6 rounded-2xl px-5 py-4 font-sans text-sm flex items-start gap-3"
          style={{ background: '#FFF3CD', border: '1px solid #FFCC7066', color: '#856404' }}
        >
          <span className="text-lg flex-shrink-0">⚙️</span>
          <div>
            <strong>Supabase no configurado o tabla vacía.</strong> Los datos que ves son de ejemplo.
            Configura <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> y{' '}
            <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> y ejecuta el
            schema SQL para activar la base de datos.
          </div>
        </div>
      )}

      {/* Wedding countdown hero */}
      {weddingDate && (
        <div
          className="mb-8 rounded-3xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, #F4AABC22 0%, #ACCBD822 100%)',
            border: '1px solid var(--color-rose)33',
          }}
        >
          <p className="font-sans text-xs tracking-[0.3em] uppercase mb-1" style={{ color: 'var(--color-rose)' }}>
            La boda de {config?.groom_name} &amp; {config?.bride_name}
          </p>
          <p className="font-serif text-2xl capitalize mb-2" style={{ color: 'var(--color-dark)' }}>
            {format(weddingDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          {daysUntil !== null && daysUntil > 0 && (
            <p className="font-display text-6xl" style={{ color: 'var(--color-rose)' }}>
              {daysUntil} días
            </p>
          )}
          {daysUntil !== null && daysUntil <= 0 && (
            <p className="font-display text-5xl" style={{ color: 'var(--color-rose)' }}>
              ¡Ya están casados! 🎉
            </p>
          )}
          {daysUntil !== null && (
            <p className="font-serif italic text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              {daysUntil > 0
                ? formatDistanceToNow(weddingDate, { locale: es, addSuffix: true })
                : ''}
            </p>
          )}
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="text-center py-12 font-serif italic" style={{ color: 'var(--color-muted)' }}>
          Cargando estadísticas…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon="👥"
              label="Invitados"
              value={totalGuests}
              sub="en la lista"
              accent="var(--color-blue)"
            />
            <StatCard
              icon="✅"
              label="Confirmados"
              value={attending}
              sub={`${confirmedWithCompanions} personas en total`}
              accent="var(--color-jade)"
            />
            <StatCard
              icon="❌"
              label="No asisten"
              value={declined}
              accent="var(--color-rose)"
            />
            <StatCard
              icon="⏳"
              label="Pendientes"
              value={pending}
              sub={`${totalGuests > 0 ? Math.round((pending / totalGuests) * 100) : 0}% sin responder`}
              accent="var(--color-yellow)"
            />
            <StatCard
              icon="🏨"
              label="Necesitan hospedaje"
              value={needsAccommodation}
              sub="solicitan apoyo"
              accent="var(--color-orchid)"
            />
            <StatCard
              icon="🥗"
              label="Restricción alimentaria"
              value={withDietary.length}
              sub={withDietary.length > 0 ? 'ver detalle abajo' : 'ninguna registrada'}
              accent="var(--color-apricot)"
            />
          </div>

          {/* Response rate bar */}
          {totalGuests > 0 && (
            <div
              className="bg-white rounded-2xl p-6 shadow-sm mb-8"
              style={{ border: '1px solid var(--color-blue)33' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-serif text-lg" style={{ color: 'var(--color-dark)' }}>
                  Tasa de respuesta
                </p>
                <p className="font-sans text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
                  {responded} / {totalGuests}
                </p>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-cream)' }}>
                {/* Attending segment */}
                <div className="h-full flex">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${(attending / totalGuests) * 100}%`,
                      background: 'var(--color-jade)',
                    }}
                  />
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${(declined / totalGuests) * 100}%`,
                      background: 'var(--color-rose)',
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <span className="flex items-center gap-1.5 font-sans text-xs" style={{ color: 'var(--color-muted)' }}>
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--color-jade)' }} />
                  Confirman ({attending})
                </span>
                <span className="flex items-center gap-1.5 font-sans text-xs" style={{ color: 'var(--color-muted)' }}>
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--color-rose)' }} />
                  No asisten ({declined})
                </span>
                <span className="flex items-center gap-1.5 font-sans text-xs" style={{ color: 'var(--color-muted)' }}>
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#ddd' }} />
                  Pendientes ({pending})
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dietary restrictions detail */}
      {!loading && dietaryList.length > 0 && (
        <div
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
          style={{ border: '1px solid var(--color-apricot)44' }}
        >
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            Restricciones alimentarias
          </h2>
          <div className="divide-y" style={{ borderColor: 'var(--color-apricot)22' }}>
            {dietaryList.map(({ name, note }) => (
              <div key={name + note} className="py-3 flex items-start gap-4">
                <span className="font-sans text-sm font-medium flex-shrink-0 w-40 truncate"
                  style={{ color: 'var(--color-dark)' }} title={name}>
                  {name}
                </span>
                <span className="font-sans text-sm italic" style={{ color: 'var(--color-muted)' }}>
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <h2 className="font-serif text-2xl mb-4" style={{ color: 'var(--color-dark)' }}>
        Acceso rápido
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <QuickLink
          to="/admin/invitados"
          icon="👥"
          title="Gestión de invitados"
          description="Importar lista, ver RSVPs, generar QR y links personalizados"
          accent="var(--color-blue)"
        />
        <QuickLink
          to="/admin/configuracion"
          icon="⚙️"
          title="Configuración de la boda"
          description="Editar nombres, fechas, lugar, mensaje y código de vestimenta"
          accent="var(--color-orchid)"
        />
        <QuickLink
          to="/admin/galeria"
          icon="🖼️"
          title="Galería de fotos"
          description="Subir, ordenar y eliminar fotos que verán los invitados"
          accent="var(--color-apricot)"
        />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4 transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ border: '1px solid var(--color-rose)33', textDecoration: 'none' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
            style={{ background: 'var(--color-rose)22' }}
          >
            🌸
          </div>
          <div>
            <p className="font-serif text-lg" style={{ color: 'var(--color-dark)' }}>
              Ver invitación
            </p>
            <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Previsualizar la invitación como la verán los invitados
            </p>
          </div>
          <svg
            className="ml-auto flex-shrink-0 mt-1"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--color-rose)' }}
          >
            <path
              d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      {/* Config summary */}
      {config && !isDefault && (
        <div
          className="bg-white rounded-2xl p-6 shadow-sm"
          style={{ border: '1px solid var(--color-yellow)33' }}
        >
          <h2 className="font-serif text-xl mb-4" style={{ color: 'var(--color-dark)' }}>
            Resumen de configuración
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: 'Novios', value: `${config.groom_name} & ${config.bride_name}` },
              { label: 'Fecha', value: weddingDate ? format(weddingDate, "d 'de' MMMM yyyy", { locale: es }) : '—' },
              { label: 'Ceremonia', value: config.ceremony_venue ?? '—' },
              { label: 'Recepción', value: config.reception_venue ?? '—' },
              { label: 'Vestimenta', value: config.dress_code ?? '—' },
              { label: 'Fotos en galería', value: config.gallery_urls.length },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt className="font-sans text-xs uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
                  {label}
                </dt>
                <dd className="font-serif text-base" style={{ color: 'var(--color-dark)' }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            to="/admin/configuracion"
            className="inline-flex items-center gap-1.5 mt-5 font-sans text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-orchid)' }}
          >
            Editar configuración →
          </Link>
        </div>
      )}
    </AdminLayout>
  )
}
