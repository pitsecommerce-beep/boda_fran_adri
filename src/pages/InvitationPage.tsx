import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Guest } from '@/types'
import { useWeddingConfig } from '@/hooks/useWeddingConfig'
import { useGuest } from '@/hooks/useGuest'
import LoadingScreen from '@/components/shared/LoadingScreen'
import SealedEnvelope from '@/components/invitation/SealedEnvelope'
import MusicPlayer from '@/components/invitation/MusicPlayer'
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
  const [letterOpened, setLetterOpened] = useState(false)
  const [searchedGuest, setSearchedGuest] = useState<Guest | null>(null)

  if (configLoading || (token && guestLoading)) return <LoadingScreen />
  if (!config) return <LoadingScreen />

  if (token && notFound) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          background: 'var(--color-khaki)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✉️</div>
        <h2
          className="font-serif"
          style={{ fontSize: '1.8rem', color: 'var(--color-dark)', marginBottom: 12, fontWeight: 300 }}
        >
          Invitación no encontrada
        </h2>
        <p className="font-serif" style={{ fontStyle: 'italic', color: 'var(--color-muted)' }}>
          Este enlace no es válido. Pide el tuyo a los novios.
        </p>
      </div>
    )
  }

  const activeGuest = guest ?? null

  if (!letterOpened) {
    return (
      <>
        <MusicPlayer musicUrl={config.music_url ?? null} started={false} />
        <SealedEnvelope
          guest={activeGuest}
          brideName={config.bride_name}
          groomName={config.groom_name}
          weddingDate={config.wedding_date}
          welcomeMessage={config.welcome_message ?? null}
          sealImageUrl={config.seal_image_url ?? null}
          onOpen={() => setLetterOpened(true)}
        />
      </>
    )
  }

  return (
    <>
      <MusicPlayer musicUrl={config.music_url ?? null} started={true} />
      <div className="invitation-revealed" style={{ background: 'var(--color-paper-dark)', minHeight: '100dvh' }}>
        <div className="invitation-column">
          <HeroSection
            config={config}
            guestName={activeGuest?.name ?? searchedGuest?.name}
          />

          {config.wedding_date && (
            <CountdownTimer weddingDate={config.wedding_date} />
          )}

          <WeddingDetails config={config} />

          <GallerySection photos={config.gallery_urls ?? []} />

          {activeGuest && activeGuest.is_family_head && activeGuest.family_id ? (
            <FamilyRSVPSection selectedGuest={activeGuest} />
          ) : activeGuest ? (
            <RSVPSection guest={activeGuest} existingRSVP={rsvp} onSubmitted={refresh} />
          ) : null}

          {!activeGuest && !searchedGuest && (
            <GuestSearchForm onGuestSelected={(g) => setSearchedGuest(g)} />
          )}

          {!activeGuest && searchedGuest && (
            <FamilyRSVPSection selectedGuest={searchedGuest} onBack={() => setSearchedGuest(null)} />
          )}

          <WeddingFooter
            brideName={config.bride_name}
            groomName={config.groom_name}
            weddingDate={config.wedding_date}
          />
        </div>
      </div>
    </>
  )
}
