import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/admin/invitados',     label: 'Invitados',     icon: '👥' },
  { to: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
  { to: '/admin/galeria',       label: 'Galería',       icon: '🖼️' },
]

interface Props {
  children: ReactNode
  title: string
}

export default function AdminLayout({ children, title }: Props) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white shadow-sm"
        style={{ borderBottom: '1px solid var(--color-rose)44' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💍</span>
            <span className="font-display text-3xl hidden sm:block" style={{ color: 'var(--color-dark)' }}>
              Fran &amp; Adri
            </span>
            <span className="font-sans text-xs px-3 py-1 rounded-full"
              style={{ background: 'var(--color-rose)33', color: 'var(--color-muted)' }}>
              Admin
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl font-sans text-xs transition-all flex items-center gap-1.5 ${
                    isActive ? 'font-semibold' : 'opacity-60 hover:opacity-100'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'var(--color-rose)22' : 'transparent',
                  color: 'var(--color-dark)',
                })}
              >
                <span>{icon}</span>
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl font-sans text-xs transition-all hover:shadow-sm"
            style={{
              background: 'var(--color-dark)11',
              color: 'var(--color-muted)',
              border: '1px solid var(--color-dark)22',
            }}>
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl mb-6" style={{ color: 'var(--color-dark)' }}>
          {title}
        </h1>
        {children}
      </main>
    </div>
  )
}
