import { useParams } from 'react-router-dom'
import { useWeddingConfig } from '@/hooks/useWeddingConfig'
import { useGuest } from '@/hooks/useGuest'
import LoadingScreen from '@/components/shared/LoadingScreen'
import HeroSection from '@/components/invitation/HeroSection'
import CountdownTimer from '@/components/invitation/CountdownTimer'
import WeddingDetails from '@/components/invitation/WeddingDetails'
import GallerySection from '@/components/invitation/GallerySection'
import RSVPSection from '@/components/invitation/RSVPSection'
import WeddingFooter from '@/components/invitation/WeddingFooter'

export default function InvitationPage() {
  const { token } = useParams<{ token?: string }>()
  const { config, loading: configLoading } = useWeddingConfig()
  const { guest, rsvp, loading: guestLoading, notFound, refresh } = useGuest(token)

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>
      <HeroSection config={config} guestName={guest?.name} />

      {config.wedding_date && (
        <CountdownTimer weddingDate={config.wedding_date} />
      )}

      <WeddingDetails config={config} />

      <GallerySection photos={config.gallery_urls ?? []} />

      {guest && (
        <RSVPSection
          guest={guest}
          existingRSVP={rsvp}
          onSubmitted={refresh}
        />
      )}

      {!guest && (
        <section className="py-16 px-6 text-center">
          <p className="font-serif text-lg italic" style={{ color: 'var(--color-muted)' }}>
            ¿Tienes tu invitación personalizada? Usa el enlace que te enviaron para confirmar tu asistencia.
          </p>
        </section>
      )}

      <WeddingFooter
        brideName={config.bride_name}
        groomName={config.groom_name}
        weddingDate={config.wedding_date}
      />
    </div>
  )
}
