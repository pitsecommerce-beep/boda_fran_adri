interface Props {
  icon?: string
  color?: string
}

export default function FloralDivider({ icon = '✦', color = 'var(--color-yellow)' }: Props) {
  return (
    <div className="flex items-center gap-4 my-8 px-8">
      <div className="flex-1 h-px" style={{
        background: `linear-gradient(to right, transparent, ${color})`,
      }} />
      <span className="text-lg" style={{ color }}>{icon}</span>
      <div className="flex-1 h-px" style={{
        background: `linear-gradient(to left, transparent, ${color})`,
      }} />
    </div>
  )
}
