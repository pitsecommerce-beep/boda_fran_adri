import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import LoadingScreen from '@/components/shared/LoadingScreen'
import SupabaseBanner from '@/components/shared/SupabaseBanner'
import { useWeddingConfig } from '@/hooks/useWeddingConfig'

function FaviconUpdater() {
  const { config } = useWeddingConfig()
  useEffect(() => {
    if (!config?.favicon_url) return
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = config.favicon_url
  }, [config?.favicon_url])
  return null
}

const InvitationPage      = lazy(() => import('@/pages/InvitationPage'))
const AdminDashboardPage  = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminGuestsPage     = lazy(() => import('@/pages/admin/AdminGuestsPage'))
const AdminSettingsPage   = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminGalleryPage    = lazy(() => import('@/pages/admin/AdminGalleryPage'))
const AdminSeatingPage    = lazy(() => import('@/pages/admin/AdminSeatingPage'))
const NotFoundPage        = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <>
    <FaviconUpdater />
    <SupabaseBanner />
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Invitación pública */}
        <Route path="/invitacion/:token" element={<InvitationPage />} />
        <Route path="/" element={<InvitationPage />} />

        {/* Admin — sin autenticación */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/invitados" element={<AdminGuestsPage />} />
        <Route path="/admin/configuracion" element={<AdminSettingsPage />} />
        <Route path="/admin/galeria" element={<AdminGalleryPage />} />
        <Route path="/admin/mesas" element={<AdminSeatingPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </>
  )
}
