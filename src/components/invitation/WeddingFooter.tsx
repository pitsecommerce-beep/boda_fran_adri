interface Props {
  brideName: string
  groomName: string
  weddingDate?: string | null
}

export default function WeddingFooter({ brideName, groomName, weddingDate }: Props) {
  const year = weddingDate ? new Date(weddingDate).getFullYear() : new Date().getFullYear()

  return (
    <footer className="py-16 px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #F4AABC18, #D4AACC18)' }}>
      <div className="text-4xl mb-4">🌸</div>
      <h3 className="font-display text-5xl mb-2" style={{ color: 'var(--color-dark)' }}>
        {groomName} &amp; {brideName}
      </h3>
      <p className="font-serif italic text-sm" style={{ color: 'var(--color-muted)' }}>
        Para siempre · {year}
      </p>
      <div className="mt-8 flex justify-center gap-2">
        {['#F4AABC', '#EDD97A', '#ACCBD8', '#D4AACC', '#C8D89A'].map((c) => (
          <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </footer>
  )
}
