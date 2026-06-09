import type { WeddingConfig } from '@/types'

interface Props {
  config: WeddingConfig
}

export default function ParentsSection({ config }: Props) {
  const { parents_phrase, bride_parents, groom_parents, bride_name, groom_name } = config

  if (!bride_parents && !groom_parents) return null

  return (
    <section
      className="animate-fade-in-up"
      style={{
        padding: '56px 32px',
        textAlign: 'center',
        background: 'var(--color-surface)',
      }}
    >
      {/* Phrase */}
      {parents_phrase && (
        <p
          className="font-serif"
          style={{
            fontSize: '1.05rem',
            fontStyle: 'italic',
            fontWeight: 300,
            color: 'var(--color-dark)',
            letterSpacing: '0.03em',
            margin: '0 0 36px',
            lineHeight: 1.6,
          }}
        >
          {parents_phrase}
        </p>
      )}

      {/* Divider top */}
      <div style={{ margin: '0 auto 32px', width: 60, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)' }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {/* Bride parents */}
        {bride_parents && (
          <div>
            <p
              className="font-sans"
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                margin: '0 0 8px',
              }}
            >
              Papás de {bride_name}
            </p>
            {bride_parents.split('\n').map((line, i) => (
              <p
                key={i}
                className="font-serif"
                style={{
                  margin: '2px 0',
                  fontSize: '1rem',
                  fontWeight: 300,
                  color: 'var(--color-dark)',
                  lineHeight: 1.55,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Ornamental separator between parents */}
        {bride_parents && groom_parents && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 120 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold)44)' }} />
            <span className="font-serif" style={{ color: 'var(--color-gold)', fontSize: '0.85rem' }}>✦</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, var(--color-gold)44)' }} />
          </div>
        )}

        {/* Groom parents */}
        {groom_parents && (
          <div>
            <p
              className="font-sans"
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                margin: '0 0 8px',
              }}
            >
              Papás de {groom_name}
            </p>
            {groom_parents.split('\n').map((line, i) => (
              <p
                key={i}
                className="font-serif"
                style={{
                  margin: '2px 0',
                  fontSize: '1rem',
                  fontWeight: 300,
                  color: 'var(--color-dark)',
                  lineHeight: 1.55,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Divider bottom */}
      <div style={{ margin: '32px auto 0', width: 60, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)' }} />
    </section>
  )
}
