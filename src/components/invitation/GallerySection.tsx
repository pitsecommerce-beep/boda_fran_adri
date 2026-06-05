import { useState, useRef, useEffect, useCallback } from 'react'

interface Props {
  photos: string[]
}

const AUTOPLAY_MS = 3500  // ms between auto-advances

export default function GallerySection({ photos }: Props) {
  const [index, setIndex] = useState(0)
  const [manual, setManual] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goNext = useCallback(() => {
    setIndex(i => (i + 1) % photos.length)
  }, [photos.length])

  // Autoplay — paused when user takes control
  useEffect(() => {
    if (manual || photos.length <= 1) return
    timerRef.current = setTimeout(goNext, AUTOPLAY_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index, manual, goNext, photos.length])

  if (!photos.length) return null

  const stopAutoplay = () => {
    setManual(true)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const prev = () => { stopAutoplay(); setIndex(i => (i - 1 + photos.length) % photos.length) }
  const next = () => { stopAutoplay(); setIndex(i => (i + 1) % photos.length) }
  const goTo = (i: number) => { stopAutoplay(); setIndex(i) }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <section className="py-14 px-0" style={{ background: 'var(--color-khaki)' }}>
      <div className="text-center mb-8 px-5">
        <p className="section-label mb-3" style={{ display: 'block', color: 'var(--color-gold)' }}>
          Nuestra historia
        </p>
        <h2 className="font-serif" style={{ color: 'var(--color-dark)', fontWeight: 300, fontSize: '2.2rem', margin: 0 }}>
          Galería
        </h2>
      </div>

      {/* Carousel */}
      <div
        className="relative select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Photo */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden' }}>
          {photos.map((url, i) => (
            <img
              key={url}
              src={url}
              alt={`Foto ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: i === index ? 1 : 0,
                transition: 'opacity 0.45s ease',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Autoplay progress bar */}
          {!manual && photos.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: 2,
                background: 'var(--color-gold)',
                opacity: 0.7,
                animation: `carouselProgress ${AUTOPLAY_MS}ms linear`,
                animationFillMode: 'forwards',
              }}
              key={index}
            />
          )}
        </div>

        {/* Prev arrow */}
        {photos.length > 1 && (
          <button
            onClick={prev}
            aria-label="Foto anterior"
            style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(250,247,242,0.82)', border: '1px solid rgba(184,150,110,0.30)',
              backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'var(--color-dark)',
              boxShadow: '0 2px 10px rgba(44,32,18,0.14)', zIndex: 2,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Next arrow */}
        {photos.length > 1 && (
          <button
            onClick={next}
            aria-label="Siguiente foto"
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(250,247,242,0.82)', border: '1px solid rgba(184,150,110,0.30)',
              backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'var(--color-dark)',
              boxShadow: '0 2px 10px rgba(44,32,18,0.14)', zIndex: 2,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Counter */}
        <div style={{
          position: 'absolute', bottom: 14, right: 14,
          background: 'rgba(44,32,18,0.42)', backdropFilter: 'blur(6px)',
          borderRadius: 20, padding: '3px 10px',
          fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
          letterSpacing: '0.12em', color: 'rgba(255,255,255,0.90)', zIndex: 2,
        }}>
          {index + 1} / {photos.length}
        </div>
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a foto ${i + 1}`}
              style={{
                width: i === index ? 20 : 7, height: 7, borderRadius: 4,
                background: i === index ? 'var(--color-gold)' : 'rgba(184,150,110,0.35)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
