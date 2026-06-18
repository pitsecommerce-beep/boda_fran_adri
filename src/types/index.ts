export interface WeddingConfig {
  id: number
  bride_name: string
  groom_name: string
  wedding_date: string | null
  ceremony_time: string | null
  ceremony_venue: string | null
  ceremony_address: string | null
  ceremony_maps_url: string | null
  reception_time: string | null
  reception_venue: string | null
  reception_address: string | null
  reception_maps_url: string | null
  welcome_message: string | null
  dress_code: string | null
  cover_photo_url: string | null
  favicon_url: string | null
  gallery_urls: string[]
  music_url: string | null
  dress_code_image_url: string | null
  dress_code_forbidden_text: string | null
  dress_code_forbidden_image_url: string | null
  seal_image_url: string | null
  parents_phrase: string | null
  bride_parents: string | null
  groom_parents: string | null
  account_number: string | null
  gift_registry_url: string | null
  itinerary: ItineraryItem[]
  accommodations: Accommodation[]
  updated_at: string
}

export interface Accommodation {
  id: string
  name: string
  description: string
  photo_url: string
  details_url: string
  maps_url: string
}

export interface ItineraryItem {
  time: string
  label: string
  icon: string
}

export interface Guest {
  id: string
  name: string
  phone: string | null
  token: string
  max_companions: number
  family_id: string | null
  is_family_head: boolean
  group_id: string | null
  created_at: string
}

export interface GuestGroup {
  id: string
  name: string
  color: string
  created_at: string
}

export interface SeatingTable {
  id: string
  name: string
  shape: 'circle' | 'square' | 'rectangle'
  capacity: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  created_at: string
}

export interface SeatAssignment {
  id: string
  guest_id: string
  table_id: string
  created_at: string
}

export interface RSVP {
  id: string
  guest_id: string
  attending: boolean
  companion_count: number
  dietary_notes: string | null
  needs_accommodation: boolean
  message: string | null
  submitted_at: string
}

export interface GuestWithRSVP extends Guest {
  rsvp?: RSVP | null
}

export interface FamilyRSVPEntry {
  guest: Guest
  attending: boolean
  dietary_notes: string
}

export interface ExcelRow {
  nombre: string
  celular?: string
  /** Identifier grouping family members — accepts column name "id_familia" or "familia" */
  id_familia?: string
  /** Marks this guest as the family representative who confirms for everyone */
  cabeza_familia?: boolean
  /** Friend/social group name for seating chart — accepts "grupo_amigos" or "grupo" */
  grupo_amigos?: string
}
