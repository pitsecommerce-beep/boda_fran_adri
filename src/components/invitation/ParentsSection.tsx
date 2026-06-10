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
            fontSize: '1rem',
            fontWeight: 300,
            color: 'var(--color-dark)',
            lineHeight: 1.65,
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

  const bothSides = Boolean(bride_parents && groom_parents)

  return (
    <section
      className="animate-fade-in-up"
      style={{
        minHeight: '50dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '72px 32px',
        background: 'var(--color-surface)',
        textAlign: 'center',
      }}
    >
      {/* Top ornament */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, transparent, var(--color-gold)88)', margin: '0 auto 10px' }} />
        <span className="font-serif" style={{ color: 'var(--color-gold)', fontSize: '1rem', letterSpacing: '0.1em' }}>✦</span>
        <div style={{ width: 1, height: 32, background: 'linear-gradient(to top, transparent, var(--color-gold)88)', margin: '10px auto 0' }} />
      </div>

      {/* Phrase */}
      {parents_phrase && (
        <p
          className="font-serif"
          style={{
            fontSize: '1.1rem',
            fontStyle: 'italic',
            fontWeight: 300,
            color: 'var(--color-dark)',
            letterSpacing: '0.03em',
            margin: '0 0 40px',
            lineHeight: 1.7,
            maxWidth: 320,
          }}
        >
          {parents_phrase}
        </p>
      )}

      {/* Horizontal rule */}
      <div style={{ width: 80, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)', marginBottom: 40 }} />

      {/* Side-by-side parents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: bothSides ? '1fr 1px 1fr' : '1fr',
          gap: '0 32px',
          alignItems: 'center',
          width: '100%',
          maxWidth: 400,
        }}
      >
        {bride_parents && (
          <div style={{ textAlign: 'center' }}>
            <ParentNames text={bride_parents} />
          </div>
        )}

        {bothSides && (
          <div style={{
            background: 'linear-gradient(to bottom, transparent, var(--color-gold)55, transparent)',
            width: 1,
            alignSelf: 'stretch',
            minHeight: 48,
          }} />
        )}

        {groom_parents && (
          <div style={{ textAlign: 'center' }}>
            <ParentNames text={groom_parents} />
          </div>
        )}
      </div>

      {/* Bottom ornament */}
      <div style={{ marginTop: 40 }}>
        <div style={{ width: 80, height: 1, background: 'linear-gradient(to right, transparent, var(--color-gold), transparent)', marginBottom: 24 }} />
      </div>
    </section>
  )
}
