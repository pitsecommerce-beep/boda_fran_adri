import type { Guest } from '@/types'

/** "Adriana Acevedo Medina" → "adriana_acevedo_medina" */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Name-based link slug for a guest. When two guests share a name, a short
 * piece of their token is appended so each link stays unique.
 */
export function guestSlug(guest: Guest, allGuests: Guest[]): string {
  const base = slugify(guest.name) || guest.token
  const duplicated = allGuests.some((g) => g.id !== guest.id && slugify(g.name) === base)
  return duplicated ? `${base}_${guest.token.slice(0, 4)}` : base
}

/** Finds the guest a slug produced by guestSlug points to. */
export function findGuestBySlug(slug: string, allGuests: Guest[]): Guest | null {
  const exact = allGuests.filter((g) => slugify(g.name) === slug)
  if (exact.length === 1) return exact[0]
  const match = /^(.*)_([0-9a-f]{4})$/.exec(slug)
  if (!match) return null
  const [, base, prefix] = match
  return allGuests.find((g) => slugify(g.name) === base && g.token.startsWith(prefix)) ?? null
}
