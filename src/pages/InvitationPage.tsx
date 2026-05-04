import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Guest } from '@/types'
import { useWeddingConfig } from '@/hooks/useWeddingConfig'
import { useGuest } from '@/hooks/useGuest'
import LoadingScreen from '@/components/shared/LoadingScreen'
import HeroSection from '@/components/invitation/HeroSection'
import CountdownTimer from '@/components/invitation/CountdownTimer'
import WeddingDetails from '@/components/invitation/WeddingDetails'
import GallerySection from '@/components/invitation/GallerySection'
import RSVPSection from '@/components/invitation/RSVPSection'
import GuestSearchForm from '@/components/invitation/GuestSearchForm'
import FamilyRSVPSection from '@/components/invitation/FamilyRSVPSection'
import WeddingFooter from '@/components/invitation/WeddingFooter'

export default function InvitationPage() {
  const { token } = useParams<{ token?: string }>()
  const { config, loading: configLoading } = useWeddingConfig()
  const { guest, rsvp, loading: guestLoading, notFound, refresh } = useGuest(token)

  // State for the self-search flow (no token)
  const [searchedGuest, setSearchedGuest] = useState<Guest | null>(null)

  if (configLoading || (token && guestLoading)) return <LoadingScreen />

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-cream)' }}>
        <p className="font-serif text-xl text-center px-6" style={{ color: 'var(--color-muted)' }}>
          La invitación estará disponible muy pronto. 🌸
        </p>
      </div>
    )
  }

  if (token && notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ background: 'var(--color-cream)' }}>
        <div className="text-5xl mb-4">🌸</div>
        <h2 className="font-serif text-3xl mb-3" style={{ color: 'var(--color-dark)' }}>
          Invitación no encontrada
        </h2>
        <p className="font-serif italic" style={{ color: 'var(--color-muted)' }}>
          Parece que este enlace no es válido. Pide el tuyo a los novios.
        </p>
      </div>
    )
  }

  // Guest from token (legacy personalized link)
  const activeGuest = guest ?? null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>
      <HeroSection
        config={config}
        guestName={activeGuest?.name ?? searchedGuest?.name}
      />

      {config.wedding_date && (
        <CountdownTimer weddingDate={config.wedding_date} />
      )}

      <WeddingDetails config={config} />

      <GallerySection photos={config.gallery_urls ?? []} />

      {/* ── Token-based personalized invitation ──────────────────────── */}
      {activeGuest && (
        <RSVPSection
          guest={activeGuest}
          existingRSVP={rsvp}
          onSubmitted={refresh}
        />
      )}

      {/* ── Self-search flow (no token) ──────────────────────────────── */}
      {!activeGuest && !searchedGuest && (
        <GuestSearchForm onGuestSelected={(g) => setSearchedGuest(g)} />
      )}

      {!activeGuest && searchedGuest && (
        <FamilyRSVPSection
          selectedGuest={searchedGuest}
          onBack={() => setSearchedGuest(null)}
        />
      )}

      <WeddingFooter
        brideName={config.bride_name}
        groomName={config.groom_name}
        weddingDate={config.wedding_date}
      />
    </div>
  )
}
