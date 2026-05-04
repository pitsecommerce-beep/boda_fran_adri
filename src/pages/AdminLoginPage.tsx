import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function AdminLoginPage() {
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/admin/dashboard', { replace: true })
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #FDF9F5 0%, #F4AABC22 50%, #FDF9F5 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💍</div>
          <h1 className="font-display text-5xl" style={{ color: 'var(--color-dark)' }}>
            Admin
          </h1>
          <p className="font-serif italic mt-1" style={{ color: 'var(--color-muted)' }}>
            Panel de Fran &amp; Adri
          </p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 shadow-sm"
          style={{ border: '1px solid var(--color-rose)44' }}>

          <div className="mb-4">
            <label className="block font-sans text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 font-sans text-sm bg-white outline-none"
              style={{ borderColor: 'var(--color-rose)66', color: 'var(--color-dark)' }}
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div className="mb-6">
            <label className="block font-sans text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 font-sans text-sm bg-white outline-none"
              style={{ borderColor: 'var(--color-rose)66', color: 'var(--color-dark)' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-sans text-sm font-medium transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--color-rose)', color: 'white' }}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
