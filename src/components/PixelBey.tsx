import type { Blade, Bit, Ratchet } from '../data/types'
import { LINE_COLORS } from '../data/types'

/**
 * A stylized top-down "pixel art" render of an assembled combo, built from
 * layered SVG blocks (outer blade ring, ratchet collar, center bit) rather
 * than a bitmap asset. It spins continuously like a live preview would in a
 * Mario-Kart-style build screen, and re-colors/re-shapes per selected part.
 */
export default function PixelBey({
  blade,
  ratchet,
  bit,
  size = 220,
  spinning = true,
}: {
  blade?: Blade
  ratchet?: Ratchet
  bit?: Bit
  size?: number
  spinning?: boolean
}) {
  const bladeColor = blade ? LINE_COLORS[blade.line].accent : '#334155'
  const bladeEdge = blade ? LINE_COLORS[blade.line].border : '#475569'
  const spikes = blade?.type === 'Attack' ? 6 : blade?.type === 'Defense' ? 4 : blade?.type === 'Stamina' ? 10 : 8

  return (
    <div
      className="relative mx-auto pixel-border bg-black/40 flex items-center justify-center"
      style={{ width: size, height: size, borderColor: '#000' }}
    >
      <div
        style={{
          width: size * 0.82,
          height: size * 0.82,
          animation: spinning ? `spin ${blade ? Math.max(0.6, 1.8 - (blade.stats.dash || 0) * 0.12) : 1.4}s linear infinite` : undefined,
        }}
        className="relative"
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="crispEdges">
          {Array.from({ length: spikes }).map((_, i) => {
            const angle = (360 / spikes) * i
            return (
              <rect
                key={i}
                x="47"
                y="2"
                width="6"
                height="30"
                fill={bladeColor}
                stroke="#000"
                strokeWidth="1"
                transform={`rotate(${angle} 50 50)`}
              />
            )
          })}
          <circle cx="50" cy="50" r="30" fill={bladeColor} stroke={bladeEdge} strokeWidth="3" />
          <circle cx="50" cy="50" r="18" fill="#1e1b2e" stroke="#000" strokeWidth="2" />
          <circle cx="50" cy="50" r="11" fill={ratchet ? '#94a3b8' : '#334155'} stroke="#000" strokeWidth="2" />
          <circle cx="50" cy="50" r="5" fill={bit ? '#facc15' : '#475569'} stroke="#000" strokeWidth="1.5" />
        </svg>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  )
}
