const DELTA_FACTOR = 0.6   // reduce wheel distance (< 1 = slower)
const LERP = 0.055          // easing factor — smaller = more gradual

let targetY = 0
let rafId: number | null = null
let initialized = false

function tick() {
  const current = window.scrollY
  const diff = targetY - current
  if (Math.abs(diff) < 0.8) {
    window.scrollTo(0, targetY)
    rafId = null
    return
  }
  window.scrollTo(0, current + diff * LERP)
  rafId = requestAnimationFrame(tick)
}

export function initSmoothScroll() {
  if (initialized) return
  initialized = true
  targetY = window.scrollY

  window.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      const maxY = document.documentElement.scrollHeight - window.innerHeight
      targetY = Math.max(0, Math.min(targetY + e.deltaY * DELTA_FACTOR, maxY))
      if (!rafId) rafId = requestAnimationFrame(tick)
    },
    { passive: false },
  )

  // Keep targetY in sync on touch/keyboard scroll
  window.addEventListener('scroll', () => {
    if (!rafId) targetY = window.scrollY
  }, { passive: true })
}
