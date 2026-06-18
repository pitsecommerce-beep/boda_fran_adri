import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { WeddingConfig, Guest, RSVP, GuestGroup, SeatingTable, SeatAssignment } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(
  supabaseUrl?.startsWith('http') && supabaseAnonKey,
)

// Only create the real client when both env vars are valid URLs.
// All exported functions guard against a null client and return empty data.
let _client: SupabaseClient | null = null
function getClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null
  if (!_client) _client = createClient(supabaseUrl!, supabaseAnonKey!)
  return _client
}

// ─── Wedding Config ────────────────────────────────────────────────────────────

export async function getWeddingConfig(): Promise<WeddingConfig | null> {
  const db = getClient()
  if (!db) return null

  const { data, error } = await db
    .from('wedding_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    // PGRST205 = table doesn't exist yet (schema not run) — expected, suppress log
    if ((error as { code?: string }).code !== 'PGRST205') {
      console.error('Error fetching wedding config:', error)
    }
    return null
  }
  if (!data) return null
  // Normalize fields that may not exist in older DB schemas
  const config = data as WeddingConfig
  if (!Array.isArray(config.accommodations)) config.accommodations = []
  return config
}

export async function updateWeddingConfig(
  updates: Partial<Omit<WeddingConfig, 'id' | 'updated_at'>>,
): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }

  const { error } = await db
    .from('wedding_config')
    .upsert({ id: 1, ...updates, updated_at: new Date().toISOString() })

  return { error: error as Error | null }
}

// ─── Guests ────────────────────────────────────────────────────────────────────

export async function getGuestByToken(token: string): Promise<Guest | null> {
  const db = getClient()
  if (!db) return null

  const { data, error } = await db
    .from('guests')
    .select('*')
    .eq('token', token)
    .single()

  if (error) return null
  return data as Guest
}

export async function listGuests(): Promise<Guest[]> {
  const db = getClient()
  if (!db) return []

  const { data, error } = await db
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
  const db = getClient()
  if (!db || !query.trim()) return []

  const { data, error } = await db
    .from('guests')
    .select('*')
    .ilike('name', `%${query.trim()}%`)
    .order('name')
    .limit(15)

  if (error) return []
  return (data ?? []) as Guest[]
}

export async function getFamilyMembers(familyId: string): Promise<Guest[]> {
  const db = getClient()
  if (!db) return []

  const { data, error } = await db
    .from('guests')
    .select('*')
    .eq('family_id', familyId)
    .order('name')

  if (error) return []
  return (data ?? []) as Guest[]
}

export async function insertGuests(
  guests: Array<{ name: string; phone?: string; max_companions: number; family_id?: string | null; is_family_head?: boolean }>,
): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }

  const rows = guests.map((g) => ({
    name: g.name,
    phone: g.phone ?? null,
    max_companions: g.max_companions,
    family_id: g.family_id ?? null,
    is_family_head: g.is_family_head ?? false,
    token: crypto.randomUUID(),
  }))

  const { error } = await db.from('guests').insert(rows)
  return { error: error as Error | null }
}

export async function deleteGuest(id: string): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }

  const { error } = await db.from('guests').delete().eq('id', id)
  return { error: error as Error | null }
}

export async function updateGuest(
  id: string,
  updates: Partial<Pick<Guest, 'name' | 'phone' | 'max_companions' | 'family_id' | 'is_family_head' | 'group_id'>>,
): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }

  const { error } = await db.from('guests').update(updates).eq('id', id)
  return { error: error as Error | null }
}

// ─── RSVPs ─────────────────────────────────────────────────────────────────────

export async function getRSVPByGuestId(guestId: string): Promise<RSVP | null> {
  const db = getClient()
  if (!db) return null

  const { data, error } = await db
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
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }

  await db.from('rsvps').delete().eq('guest_id', rsvp.guest_id)

  const { error } = await db.from('rsvps').insert({
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
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }

  const guestIds = entries.map((e) => e.guest_id)
  await db.from('rsvps').delete().in('guest_id', guestIds)

  const rows = entries.map((e) => ({
    guest_id: e.guest_id,
    attending: e.attending,
    companion_count: 0,
    dietary_notes: e.dietary_notes || null,
    needs_accommodation: e.needs_accommodation,
    message: e.message || null,
  }))

  const { error } = await db.from('rsvps').insert(rows)
  return { error: error as Error | null }
}

export async function deleteRSVPByGuestId(guestId: string): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }
  const { error } = await db.from('rsvps').delete().eq('guest_id', guestId)
  return { error: error as Error | null }
}

export async function listRSVPs(): Promise<RSVP[]> {
  const db = getClient()
  if (!db) return []

  const { data, error } = await db
    .from('rsvps')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) return []
  return (data ?? []) as RSVP[]
}

// ─── Guest Groups ─────────────────────────────────────────────────────────────

export async function listGuestGroups(): Promise<GuestGroup[]> {
  const db = getClient()
  if (!db) return []
  const { data, error } = await db.from('guest_groups').select('*').order('name')
  if (error) { console.error('Error listing guest groups:', error); return [] }
  return (data ?? []) as GuestGroup[]
}

export async function createGuestGroup(group: { name: string; color: string }): Promise<GuestGroup | null> {
  const db = getClient()
  if (!db) return null
  const { data, error } = await db.from('guest_groups').insert(group).select().single()
  if (error) { console.error('Error creating guest group:', error); return null }
  return data as GuestGroup
}

export async function updateGuestGroup(id: string, updates: Partial<Pick<GuestGroup, 'name' | 'color'>>): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }
  const { error } = await db.from('guest_groups').update(updates).eq('id', id)
  return { error: error as Error | null }
}

export async function deleteGuestGroup(id: string): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }
  await db.from('guests').update({ group_id: null }).eq('group_id', id)
  const { error } = await db.from('guest_groups').delete().eq('id', id)
  return { error: error as Error | null }
}

// ─── Seating Tables ───────────────────────────────────────────────────────────

export async function listSeatingTables(): Promise<SeatingTable[]> {
  const db = getClient()
  if (!db) return []
  const { data, error } = await db.from('seating_tables').select('*').order('created_at')
  if (error) { console.error('Error listing seating tables:', error); return [] }
  return (data ?? []) as SeatingTable[]
}

export async function createSeatingTable(table: Omit<SeatingTable, 'id' | 'created_at'>): Promise<SeatingTable | null> {
  const db = getClient()
  if (!db) return null
  const { data, error } = await db.from('seating_tables').insert(table).select().single()
  if (error) { console.error('Error creating seating table:', error); return null }
  return data as SeatingTable
}

export async function updateSeatingTable(id: string, updates: Partial<Omit<SeatingTable, 'id' | 'created_at'>>): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }
  const { error } = await db.from('seating_tables').update(updates).eq('id', id)
  return { error: error as Error | null }
}

export async function deleteSeatingTable(id: string): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }
  const { error } = await db.from('seating_tables').delete().eq('id', id)
  return { error: error as Error | null }
}

// ─── Seat Assignments ─────────────────────────────────────────────────────────

export async function listSeatAssignments(): Promise<SeatAssignment[]> {
  const db = getClient()
  if (!db) return []
  const { data, error } = await db.from('seat_assignments').select('*')
  if (error) { console.error('Error listing seat assignments:', error); return [] }
  return (data ?? []) as SeatAssignment[]
}

export async function assignGuestToTable(guestId: string, tableId: string): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }
  await db.from('seat_assignments').delete().eq('guest_id', guestId)
  const { error } = await db.from('seat_assignments').insert({ guest_id: guestId, table_id: tableId })
  return { error: error as Error | null }
}

export async function removeGuestFromTable(guestId: string): Promise<{ error: Error | null }> {
  const db = getClient()
  if (!db) return { error: new Error('Supabase no configurado') }
  const { error } = await db.from('seat_assignments').delete().eq('guest_id', guestId)
  return { error: error as Error | null }
}

// ─── Storage helpers ───────────────────────────────────────────────────────────

export async function uploadPhoto(file: File, bucket = 'wedding-photos'): Promise<string | null> {
  const db = getClient()
  if (!db) return null

  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error } = await db.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = db.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deletePhoto(url: string, bucket = 'wedding-photos'): Promise<void> {
  const db = getClient()
  if (!db) return

  const path = url.split(`/${bucket}/`).pop()
  if (!path) return
  await db.storage.from(bucket).remove([path])
}

// Also export for auth use in useAuth hook
export function getSupabaseClient(): SupabaseClient | null {
  return getClient()
}
