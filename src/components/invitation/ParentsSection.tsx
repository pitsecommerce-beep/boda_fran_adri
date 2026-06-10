import type { WeddingConfig } from '@/types'

interface Props {
  config: WeddingConfig
}

function ParentNames({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <p
          key={i}
          className="font-serif"
          style={{
            margin: '2px 0',
            fontSize: '0.95rem',
            fontWeight: 300,
            color: 'var(--color-dark)',
            lineHeight: 1.6,
          }}
        >
          {line}
        </p>
      ))}
    </>
  )
}

export default function ParentsSection({ config }: Props) {
  const { parents_phrase, bride_parents, groom_parents } = config

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
            margin: '0 0 32px',
            lineHeight: 1.6,
          }}
        >
          {parents_phrase}
        </p>
      )}

      {/* Divider */}
      <div style={{ margin: '0 auto 32px', width: 60, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)' }} />

      {/* Side-by-side parents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: bride_parents && groom_parents ? '1fr 1px 1fr' : '1fr',
          gap: '0 24px',
          alignItems: 'start',
          maxWidth: 380,
          margin: '0 auto',
        }}
      >
        {bride_parents && (
          <div style={{ textAlign: 'right' }}>
            <ParentNames text={bride_parents} />
          </div>
        )}

        {bride_parents && groom_parents && (
          <div style={{ background: 'linear-gradient(to bottom, transparent, var(--color-gold)66, transparent)', width: 1, alignSelf: 'stretch', minHeight: 40 }} />
        )}

        {groom_parents && (
          <div style={{ textAlign: 'left' }}>
            <ParentNames text={groom_parents} />
          </div>
        )}
      </div>

      {/* Divider bottom */}
      <div style={{ margin: '32px auto 0', width: 60, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)' }} />
    </section>
  )
}
