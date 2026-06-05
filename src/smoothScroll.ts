const WHEEL_FACTOR = 0.68  // desktop wheel distance damping
const LERP = 0.11          // desktop easing
// Touch: 0.68 = ~32% slower than native; no LERP so it stays responsive, not sticky
const TOUCH_FACTOR = 0.68

let targetY = 0
let rafId: number | null = null
let initialized = false
let touchPrevY = 0
let touchScrollY = 0  // tracks position for the touch path

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

// Returns true if the touch target is inside a scrollable element
// (e.g. an overflow:auto div like a modal or the admin nav),
// so we leave those alone and don't intercept their scroll.
function isInsideScrollable(el: EventTarget | null): boolean {
  let node = el as HTMLElement | null
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node)
    const overflow = style.overflowY
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) {
      return true
    }
    node = node.parentElement
  }
  return false
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

  // ── Mobile: slightly slower than native, no LERP lag ───────
  window.addEventListener('touchstart', (e) => {
    touchPrevY = e.touches[0].clientY
    touchScrollY = window.scrollY
  }, { passive: true })

  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length !== 1) return
      // Leave native scroll to inner scrollable containers (modals, dropdowns, etc.)
      if (isInsideScrollable(e.target)) return
      const y = e.touches[0].clientY
      const delta = touchPrevY - y
      touchPrevY = y
      touchScrollY = clamp(touchScrollY + delta * TOUCH_FACTOR)
      window.scrollTo(0, touchScrollY)
      e.preventDefault()
    },
    { passive: false },
  )

  // Keep desktop target in sync when scroll happens outside our handlers
  window.addEventListener('scroll', () => {
    if (!rafId) targetY = window.scrollY
  }, { passive: true })
}
