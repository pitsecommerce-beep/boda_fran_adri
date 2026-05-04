import { useEffect, useState } from 'react'
import { getWeddingConfig } from '@/lib/supabase'
import type { WeddingConfig } from '@/types'

export function useWeddingConfig() {
  const [config, setConfig] = useState<WeddingConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    const data = await getWeddingConfig()
    setConfig(data)
    setLoading(false)
  }

  useEffect(() => { void refresh() }, [])

  return { config, loading, refresh }
}
