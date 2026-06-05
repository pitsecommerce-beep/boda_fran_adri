import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'var(--color-cream)' }}>
      <h1 className="font-serif text-4xl mb-3" style={{ color: 'var(--color-dark)' }}>
        Página no encontrada
      </h1>
      <p className="font-serif italic mb-8" style={{ color: 'var(--color-muted)' }}>
        Parece que esta página no existe.
      </p>
      <Link
        to="/"
        className="px-8 py-3 rounded-full font-sans text-sm font-medium"
        style={{ background: 'var(--color-yellow)', color: 'var(--color-dark)' }}>
        Ir a la invitación
      </Link>
    </div>
  )
}
