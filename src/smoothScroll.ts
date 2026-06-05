const WHEEL_FACTOR = 0.68  // desktop wheel distance damping
const LERP = 0.11          // desktop easing

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

function clamp(y: number) {
  const maxY = document.documentElement.scrollHeight - window.innerHeight
  return Math.max(0, Math.min(y, maxY))
}

export function initSmoothScroll() {
  if (initialized) return
  initialized = true
  targetY = window.scrollY

  // ── Desktop: mouse wheel with smooth LERP ──────────────────
  window.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      targetY = clamp(targetY + e.deltaY * WHEEL_FACTOR)
      if (!rafId) rafId = requestAnimationFrame(tick)
    },
    { passive: false },
  )

  // Touch scroll: 100% native browser handling (fastest, hardware-accelerated)

  // Keep desktop target in sync
  window.addEventListener('scroll', () => {
    if (!rafId) targetY = window.scrollY
  }, { passive: true })
}
