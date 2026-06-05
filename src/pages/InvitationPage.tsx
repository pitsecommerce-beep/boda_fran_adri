import { useEffect, useState } from 'react'
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
import GiftSection from '@/components/invitation/GiftSection'
import AccommodationSection from '@/components/invitation/AccommodationSection'

export default function InvitationPage() {
  const { token } = useParams<{ token?: string }>()
  const { config, loading: configLoading } = useWeddingConfig()
  const { guest, rsvp, loading: guestLoading, notFound, refresh } = useGuest(token)
  const [letterOpened, setLetterOpened] = useState(false)
  const [searchedGuest, setSearchedGuest] = useState<Guest | null>(null)
  const [assetsReady, setAssetsReady] = useState(false)

  // Preload cover photo (and seal) before showing the sealed envelope
  useEffect(() => {
    if (!config) return
    const urls = [config.cover_photo_url, config.seal_image_url].filter(Boolean) as string[]
    if (urls.length === 0) { setAssetsReady(true); return }
    let loaded = 0
    const done = () => { loaded++; if (loaded >= urls.length) setAssetsReady(true) }
    urls.forEach((src) => {
      const img = new Image()
      img.onload = done
      img.onerror = done
      img.src = src
    })
  }, [config?.cover_photo_url, config?.seal_image_url])

  if (configLoading || (token && guestLoading)) return <LoadingScreen />
  if (!config) return <LoadingScreen />
  if (!assetsReady) return <LoadingScreen />

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

        {/* Main content: hero, countdown, venue details */}
        <div className="invitation-column">
          <HeroSection
            config={config}
            guestName={activeGuest?.name ?? searchedGuest?.name}
          />

          {config.wedding_date && (
            <CountdownTimer weddingDate={config.wedding_date} />
          )}

          <WeddingDetails config={config} />
        </div>

        {/* Gallery — own phone-column section */}
        {(config.gallery_urls ?? []).length > 0 && (
          <div className="invitation-column">
            <GallerySection photos={config.gallery_urls ?? []} />
          </div>
        )}

        {/* Accommodations + RSVP */}
        <div className="invitation-column">
          <AccommodationSection accommodations={config.accommodations ?? []} />

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
        </div>

        {/* Gift registry — full-screen phone-column section */}
        <div className="invitation-column">
          <GiftSection config={config} />
        </div>

        {/* Footer */}
        <div className="invitation-column">
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
