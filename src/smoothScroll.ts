const WHEEL_FACTOR = 0.68   // desktop wheel distance damping
const LERP = 0.11           // easing — higher = faster/snappier

let targetY = 0
let rafId: number | null = null
let initialized = false

function tick() {
  const current = window.scrollY
  const diff = targetY - current
  if (Math.abs(diff) < 0.6) {
    window.scrollTo(0, targetY)
    rafId = null
    return
  }
  window.scrollTo(0, current + diff * LERP)
  rafId = requestAnimationFrame(tick)
}

function clampTarget(y: number) {
  const maxY = document.documentElement.scrollHeight - window.innerHeight
  return Math.max(0, Math.min(y, maxY))
}

export function initSmoothScroll() {
  if (initialized) return
  initialized = true
  targetY = window.scrollY

  // ── Desktop only: mouse wheel smooth scroll ──────────────
  window.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      targetY = clampTarget(targetY + e.deltaY * WHEEL_FACTOR)
      if (!rafId) rafId = requestAnimationFrame(tick)
    },
    { passive: false },
  )

  // Touch scroll: let the browser handle it natively (fastest on mobile)

  // Keyboard / programmatic scroll: keep target in sync
  window.addEventListener('scroll', () => {
    if (!rafId) targetY = window.scrollY
  }, { passive: true })
}
