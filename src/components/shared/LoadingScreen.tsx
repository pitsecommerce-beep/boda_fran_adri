export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--color-cream)' }}>
      <div className="animate-float text-6xl mb-4">🌸</div>
      <p className="font-serif text-xl" style={{ color: 'var(--color-muted)' }}>
        Un momento...
      </p>
    </div>
  )
}
