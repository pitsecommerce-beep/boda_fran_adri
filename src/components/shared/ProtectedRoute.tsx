import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingScreen from './LoadingScreen'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/admin" replace />

  return <>{children}</>
}
