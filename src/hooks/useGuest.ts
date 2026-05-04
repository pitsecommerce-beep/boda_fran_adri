import { useEffect, useState } from 'react'
import { getGuestByToken, getRSVPByGuestId } from '@/lib/supabase'
import type { Guest, RSVP } from '@/types'

export function useGuest(token: string | undefined) {
  const [guest, setGuest] = useState<Guest | null>(null)
  const [rsvp, setRsvp] = useState<RSVP | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const refresh = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    const guestData = await getGuestByToken(token)

    if (!guestData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setGuest(guestData)
    const rsvpData = await getRSVPByGuestId(guestData.id)
    setRsvp(rsvpData)
    setLoading(false)
  }

  useEffect(() => { void refresh() }, [token])

  return { guest, rsvp, loading, notFound, refresh }
}
