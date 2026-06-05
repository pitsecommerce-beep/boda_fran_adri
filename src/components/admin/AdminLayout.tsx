import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin/dashboard',     label: 'Dashboard' },
  { to: '/admin/invitados',     label: 'Invitados' },
  { to: '/admin/configuracion', label: 'Configuración' },
  { to: '/admin/galeria',       label: 'Galería' },
]

interface Props {
  children: ReactNode
  title: string
}

export default function AdminLayout({ children, title }: Props) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white shadow-sm"
        style={{ borderBottom: '1px solid var(--color-yellow)33' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-4 flex-shrink-0">
            <span className="text-xl">💍</span>
            <span className="font-display text-2xl hidden sm:block" style={{ color: 'var(--color-dark)' }}>
              Fran &amp; Adri
            </span>
            <span className="font-sans text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-yellow)22', color: 'var(--color-muted)' }}>
              Admin
            </span>
          </div>

          {/* Nav — scrollable on mobile */}
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl font-sans text-xs transition-all flex items-center whitespace-nowrap ${
                    isActive ? 'font-semibold' : 'opacity-60 hover:opacity-100'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'var(--color-yellow)1A' : 'transparent',
                  color: 'var(--color-dark)',
                })}
              >
                {label}
              </NavLink>
            ))}

            {/* Ver invitación */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl font-sans text-xs opacity-60 hover:opacity-100 transition-all flex items-center gap-1.5 whitespace-nowrap ml-1"
              style={{ color: 'var(--color-dark)' }}
            >
              <span className="hidden lg:inline">Ver invitación</span>
            </a>
          </nav>

        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl mb-6" style={{ color: 'var(--color-dark)' }}>
          {title}
        </h1>
        {children}
      </main>
    </div>
  )
}
