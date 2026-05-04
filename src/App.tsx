import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import LoadingScreen from '@/components/shared/LoadingScreen'
import SupabaseBanner from '@/components/shared/SupabaseBanner'

const InvitationPage    = lazy(() => import('@/pages/InvitationPage'))
const AdminLoginPage    = lazy(() => import('@/pages/AdminLoginPage'))
const AdminGuestsPage   = lazy(() => import('@/pages/admin/AdminGuestsPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminGalleryPage  = lazy(() => import('@/pages/admin/AdminGalleryPage'))
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <>
    <SupabaseBanner />
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Invitation pública con token de invitado */}
        <Route path="/invitacion/:token" element={<InvitationPage />} />

        {/* Invitación genérica (sin token) */}
        <Route path="/" element={<InvitationPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/invitados"
          element={
            <ProtectedRoute>
              <AdminGuestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/configuracion"
          element={
            <ProtectedRoute>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/galeria"
          element={
            <ProtectedRoute>
              <AdminGalleryPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </>
  )
}
