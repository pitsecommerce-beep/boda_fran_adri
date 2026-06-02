interface Props {
  icon?: string
  color?: string
}

export default function FloralDivider({ icon = '◆', color = 'var(--color-gold)' }: Props) {
  return (
    <div className="flex items-center gap-6 my-10 px-8">
      <div className="flex-1 h-px" style={{
        background: `linear-gradient(to right, transparent, ${color}44)`,
      }} />
      <span style={{ color, fontSize: '0.4rem', opacity: 0.7 }}>{icon}</span>
      <div className="flex-1 h-px" style={{
        background: `linear-gradient(to left, transparent, ${color}44)`,
      }} />
    </div>
  )
}
