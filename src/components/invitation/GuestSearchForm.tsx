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

  // Close dropdown on outside click
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
    <section id="buscar" className="py-20 px-6" style={{ background: '#FFFFFF' }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--color-yellow)' }}>
            Tu confirmación
          </p>
          <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--color-dark)' }}>
            ¿Quién eres?
          </h2>
          <p className="mt-3 font-serif italic leading-relaxed"
            style={{ color: 'var(--color-muted)' }}>
            Escribe tu nombre para encontrarte en la lista de invitados
            y confirmar tu asistencia.
          </p>
        </div>

        <div
          ref={containerRef}
          className="bg-white rounded-3xl p-8 relative"
          style={{ border: '1.5px solid var(--color-yellow)', boxShadow: '0 2px 16px rgba(237,217,122,0.12)' }}>

          <label
            htmlFor="guest-search"
            className="block font-sans text-sm font-medium mb-2"
            style={{ color: 'var(--color-dark)' }}>
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
              className="w-full border rounded-2xl px-5 py-4 font-serif text-lg bg-white outline-none transition-shadow focus:shadow-md"
              style={{
                borderColor: 'var(--color-yellow)88',
                color: 'var(--color-dark)',
              }}
            />

            {/* Loading spinner */}
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-muted)' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            )}

            {/* Dropdown */}
            {open && results.length > 0 && (
              <ul
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-lg z-20 overflow-hidden"
                style={{ border: '1px solid var(--color-yellow)44' }}>
                {results.map((guest) => (
                  <li key={guest.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(guest)}
                      className="w-full text-left px-5 py-3 font-serif text-base transition-colors hover:bg-yellow-50 flex items-center gap-3"
                      style={{ color: 'var(--color-dark)' }}>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ background: 'var(--color-yellow)33' }}>
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

            {/* No results */}
            {open && !loading && results.length === 0 && query.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-lg z-20 px-5 py-4 text-center"
                style={{ border: '1px solid var(--color-yellow)44' }}>
                <p className="font-serif italic text-sm" style={{ color: 'var(--color-muted)' }}>
                  No encontramos tu nombre. Intenta con tu apellido o verifica la ortografía.
                </p>
                <p className="font-sans text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Si tienes problemas, contacta a los novios.
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
