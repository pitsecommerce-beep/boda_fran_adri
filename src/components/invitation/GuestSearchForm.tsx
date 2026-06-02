import { useEffect, useRef, useState } from 'react'
import type { Guest } from '@/types'
import { searchGuestsByName } from '@/lib/supabase'

interface Props {
  onGuestSelected: (guest: Guest) => void
}

export default function GuestSearchForm({ onGuestSelected }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const guests = await searchGuestsByName(value)
      setResults(guests)
      setOpen(true)
      setLoading(false)
    }, 300)
  }

  const handleSelect = (guest: Guest) => {
    setQuery(guest.name)
    setOpen(false)
    setResults([])
    onGuestSelected(guest)
  }

  return (
    <section id="buscar" className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="section-label mb-4" style={{ display: 'block', color: 'var(--color-gold)' }}>
            Tu confirmación
          </p>
          <h2
            className="font-serif"
            style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: 'clamp(2rem,6vw,3.2rem)', margin: 0 }}
          >
            ¿Quién eres?
          </h2>
          <p className="mt-3 font-serif italic leading-relaxed"
            style={{ color: 'var(--color-muted)', fontWeight: 300 }}>
            Escribe tu nombre para encontrarte en la lista de invitados
            y confirmar tu asistencia.
          </p>
        </div>

        <div
          ref={containerRef}
          className="rounded-2xl p-8 relative"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 16px rgba(44,32,18,0.06)',
          }}
        >
          <label
            htmlFor="guest-search"
            className="block font-sans text-sm font-medium mb-2"
            style={{ color: 'var(--color-dark)' }}
          >
            Tu nombre completo
          </label>

          <div className="relative">
            <input
              id="guest-search"
              type="text"
              autoComplete="off"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Ej. María García…"
              className="w-full font-serif outline-none transition-shadow focus:shadow-md"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(184,150,110,0.30)',
                borderRadius: 4,
                fontSize: '1rem',
                fontWeight: 300,
                padding: '14px 20px',
                color: 'var(--color-dark)',
              }}
            />

            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-muted)' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            )}

            {open && results.length > 0 && (
              <ul
                className="absolute left-0 right-0 top-full mt-2 z-20 overflow-hidden"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 8px 32px rgba(44,32,18,0.12)',
                  borderRadius: 8,
                }}
              >
                {results.map((guest) => (
                  <li key={guest.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(guest)}
                      className="w-full text-left px-5 py-3 font-serif text-base transition-colors flex items-center gap-3"
                      style={{ color: 'var(--color-dark)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,150,110,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ background: 'rgba(184,150,110,0.15)', color: 'var(--color-muted)' }}>
                        {guest.name.charAt(0).toUpperCase()}
                      </span>
                      <span>
                        {guest.name}
                        {guest.family_id && (
                          <span className="ml-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                            (grupo familiar)
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {open && !loading && results.length === 0 && query.trim().length >= 2 && (
              <div
                className="absolute left-0 right-0 top-full mt-2 z-20 px-5 py-4 text-center"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 8px 32px rgba(44,32,18,0.12)',
                  borderRadius: 8,
                }}
              >
                <p className="font-serif italic text-sm" style={{ color: 'var(--color-muted)' }}>
                  No encontramos tu nombre. Intenta con tu apellido o verifica la ortografía.
                </p>
              </div>
            )}
          </div>

          {query.trim().length < 2 && (
            <p className="mt-3 font-sans text-xs text-center" style={{ color: 'var(--color-muted)' }}>
              Escribe al menos 2 letras para buscar
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
