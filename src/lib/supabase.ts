import { createClient } from '@supabase/supabase-js'
import type { WeddingConfig, Guest, RSVP } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Use placeholder values when not configured so the client initializes
// without throwing — all DB calls will fail gracefully via null returns.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
)

// ─── Wedding Config ────────────────────────────────────────────────────────────

export async function getWeddingConfig(): Promise<WeddingConfig | null> {
  const { data, error } = await supabase
    .from('wedding_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('Error fetching wedding config:', error)
    return null
  }
  return data as WeddingConfig
}

export async function updateWeddingConfig(
  updates: Partial<Omit<WeddingConfig, 'id' | 'updated_at'>>,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('wedding_config')
    .upsert({ id: 1, ...updates, updated_at: new Date().toISOString() })

  return { error: error as Error | null }
}

// ─── Guests ────────────────────────────────────────────────────────────────────

export async function getGuestByToken(token: string): Promise<Guest | null> {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('token', token)
    .single()

  if (error) return null
  return data as Guest
}

export async function listGuests(): Promise<Guest[]> {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing guests:', error)
    return []
  }
  return (data ?? []) as Guest[]
}

export async function searchGuestsByName(query: string): Promise<Guest[]> {
  if (!query.trim()) return []
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .ilike('name', `%${query.trim()}%`)
    .order('name')
    .limit(15)

  if (error) return []
  return (data ?? []) as Guest[]
}

export async function getFamilyMembers(familyId: string): Promise<Guest[]> {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('family_id', familyId)
    .order('name')

  if (error) return []
  return (data ?? []) as Guest[]
}

export async function insertGuests(
  guests: Array<{ name: string; phone?: string; max_companions: number; family_id?: string | null }>,
): Promise<{ error: Error | null }> {
  const rows = guests.map((g) => ({
    name: g.name,
    phone: g.phone ?? null,
    max_companions: g.max_companions,
    family_id: g.family_id ?? null,
    token: crypto.randomUUID(),
  }))

  const { error } = await supabase.from('guests').insert(rows)
  return { error: error as Error | null }
}

export async function deleteGuest(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('guests').delete().eq('id', id)
  return { error: error as Error | null }
}

export async function updateGuest(
  id: string,
  updates: Partial<Pick<Guest, 'name' | 'phone' | 'max_companions' | 'family_id'>>,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('guests').update(updates).eq('id', id)
  return { error: error as Error | null }
}

// ─── RSVPs ─────────────────────────────────────────────────────────────────────

export async function getRSVPByGuestId(guestId: string): Promise<RSVP | null> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('guest_id', guestId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data as RSVP
}

export async function submitRSVP(rsvp: {
  guest_id: string
  attending: boolean
  companion_count: number
  dietary_notes?: string
  needs_accommodation?: boolean
  message?: string
}): Promise<{ error: Error | null }> {
  await supabase.from('rsvps').delete().eq('guest_id', rsvp.guest_id)

  const { error } = await supabase.from('rsvps').insert({
    ...rsvp,
    dietary_notes: rsvp.dietary_notes ?? null,
    needs_accommodation: rsvp.needs_accommodation ?? false,
    message: rsvp.message ?? null,
  })
  return { error: error as Error | null }
}

export async function submitFamilyRSVP(entries: Array<{
  guest_id: string
  attending: boolean
  dietary_notes: string
  needs_accommodation: boolean
  message: string
}>): Promise<{ error: Error | null }> {
  // Delete existing RSVPs for all guests in the batch
  const guestIds = entries.map((e) => e.guest_id)
  await supabase.from('rsvps').delete().in('guest_id', guestIds)

  const rows = entries.map((e) => ({
    guest_id: e.guest_id,
    attending: e.attending,
    companion_count: 0,
    dietary_notes: e.dietary_notes || null,
    needs_accommodation: e.needs_accommodation,
    message: e.message || null,
  }))

  const { error } = await supabase.from('rsvps').insert(rows)
  return { error: error as Error | null }
}

export async function listRSVPs(): Promise<RSVP[]> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) return []
  return (data ?? []) as RSVP[]
}

// ─── Storage helpers ───────────────────────────────────────────────────────────

export async function uploadPhoto(file: File, bucket = 'wedding-photos'): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deletePhoto(url: string, bucket = 'wedding-photos'): Promise<void> {
  const path = url.split(`/${bucket}/`).pop()
  if (!path) return
  await supabase.storage.from(bucket).remove([path])
}
