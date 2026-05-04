import { useEffect, useState } from 'react'
import { getWeddingConfig } from '@/lib/supabase'
import { DEFAULT_CONFIG } from '@/lib/defaultConfig'
import type { WeddingConfig } from '@/types'

export function useWeddingConfig() {
  const [config, setConfig] = useState<WeddingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  // true when config comes from Supabase, false when using local default
  const [isDefault, setIsDefault] = useState(false)

  const refresh = async () => {
    setLoading(true)
    const data = await getWeddingConfig()
    if (data) {
      setConfig(data)
      setIsDefault(false)
    } else {
      setConfig(DEFAULT_CONFIG)
      setIsDefault(true)
    }
    setLoading(false)
  }

  useEffect(() => { void refresh() }, [])

  return { config, loading, isDefault, refresh }
}
