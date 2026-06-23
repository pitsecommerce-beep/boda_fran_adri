import { useEffect } from 'react'

/**
 * Reveals the text elements of the invitation sections as the user scrolls.
 * Each piece of text starts slightly lowered and faded, then rises into place
 * (bottom-to-top) once it enters the viewport.
 *
 * Works automatically over the already-rendered DOM so individual sections
 * don't need to be touched. The hero is skipped because it has its own
 * entrance animation, and elements that already animate are left alone.
 *
 * @param active  Run only once the invitation has been revealed.
 */
export function useScrollReveal(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.querySelector('.invitation-revealed')
    if (!root) return

    const SELECTOR = 'h1, h2, h3, h4, h5, h6, p, blockquote, li, figcaption, .section-label'

    // Defer one frame so all sections are laid out before we measure them.
    const raf = requestAnimationFrame(() => {
      const targets = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => {
        if (!el.textContent || el.textContent.trim().length === 0) return false
        // The hero already has its own entrance animation.
        if (el.classList.contains('animate-fade-in-up') || el.closest('.animate-fade-in-up')) return false
        // Opt-out hook for anything we don't want to touch.
        if (el.closest('.no-reveal')) return false
        // Skip nested text (e.g. a <p> inside an <li>) to avoid double-hiding.
        if (el.parentElement?.closest(SELECTOR)) return false
        return true
      })

      if (targets.length === 0) return

      targets.forEach((el) => el.classList.add('reveal-on-scroll'))

      const observer = new IntersectionObserver(
        (entries) => {
          // Stagger items that appear together so a section cascades upward.
          const incoming = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

          incoming.forEach((entry, i) => {
            const el = entry.target as HTMLElement
            el.style.transitionDelay = `${Math.min(i, 6) * 90}ms`
            el.classList.add('is-revealed')
            observer.unobserve(el)
          })
        },
        { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
      )

      targets.forEach((el) => observer.observe(el))

      cleanup = () => observer.disconnect()
    })

    let cleanup = () => {}
    return () => {
      cancelAnimationFrame(raf)
      cleanup()
    }
  }, [active])
}
