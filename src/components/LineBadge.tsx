import type { Line } from '../data/types'
import { LINE_COLORS } from '../data/types'

export default function LineBadge({ line, className = '' }: { line: Line; className?: string }) {
  const c = LINE_COLORS[line]
  return (
    <span
      className={`font-pixel text-[9px] px-2 py-1 inline-block pixel-border ${className}`}
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {line}
    </span>
  )
}
