const WHEEL_FACTOR = 0.58   // desktop wheel distance damping
const TOUCH_FACTOR = 0.52   // touch drag damping — lower = slower
const LERP = 0.048          // easing — smaller = smoother/slower

let targetY = 0
let rafId: number | null = null
let initialized = false
let touchPrevY = 0

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

  // ── Desktop: mouse wheel ──────────────────────────────
  window.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      targetY = clampTarget(targetY + e.deltaY * WHEEL_FACTOR)
      if (!rafId) rafId = requestAnimationFrame(tick)
    },
    { passive: false },
  )

  // ── Mobile: touch drag ────────────────────────────────
  window.addEventListener('touchstart', (e) => {
    touchPrevY = e.touches[0].clientY
    // Sync target on new touch so there's no jump
    if (!rafId) targetY = window.scrollY
  }, { passive: true })

  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length !== 1) return
      const y = e.touches[0].clientY
      const delta = touchPrevY - y
      touchPrevY = y
      targetY = clampTarget(targetY + delta * TOUCH_FACTOR)
      if (!rafId) rafId = requestAnimationFrame(tick)
      e.preventDefault()
    },
    { passive: false },
  )

  // Keyboard / programmatic scroll: keep target in sync
  window.addEventListener('scroll', () => {
    if (!rafId) targetY = window.scrollY
  }, { passive: true })
}
