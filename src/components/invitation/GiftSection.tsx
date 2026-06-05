import type { WeddingConfig } from '@/types'

function GiftIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  )
}

interface Props {
  config: WeddingConfig
}

export default function GiftSection({ config }: Props) {
  if (!config.account_number && !config.gift_registry_url) return null

  return (
    <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
      <div className="section-block-divider" />
      <div
        className="text-center py-8 px-6"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="flex justify-center mb-4">
          <GiftIcon color="var(--color-gold)" />
        </div>
        <p className="section-label mb-3" style={{ display: 'block', color: 'var(--color-gold)' }}>
          Mesa de regalos
        </p>
        <p className="font-serif italic leading-relaxed" style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '1rem' }}>
          El mejor regalo es tu presencia. Si deseas obsequiarnos algo, puedes hacerlo aquí:
        </p>
        {config.gift_registry_url && (
          <a
            href={config.gift_registry_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 font-sans font-medium transition-all hover:shadow-md active:scale-95"
            style={{
              background: 'var(--color-gold)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 2,
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '12px 24px',
            }}
          >
            Ver mesa de regalos
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
        {config.account_number && (
          <div className="mt-5">
            {config.gift_registry_url && (
              <p className="font-sans text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                O por transferencia:
              </p>
            )}
            <p className="font-sans font-medium text-xl tracking-wider"
              style={{ color: 'var(--color-dark)', whiteSpace: 'pre-line' }}>
              {config.account_number}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
