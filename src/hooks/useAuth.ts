import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = getSupabaseClient()
    if (!db) {
      setLoading(false)
      return
    }

    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const db = getSupabaseClient()
    if (!db) return { error: new Error('Supabase no configurado') }
    const { error } = await db.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    const db = getSupabaseClient()
    await db?.auth.signOut()
  }

  return { user, session, loading, signIn, signOut }
}
