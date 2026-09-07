import { Link } from 'react-router-dom'
import heroArt from '../assets/hero-let-it-test.jpg'

const TILES = [
  { to: '/configurator', label: 'Configurator', desc: 'Build any legal combo', color: '#22d3ee', icon: '⚙' },
  { to: '/wiki', label: 'Part Wiki', desc: 'Search every part', color: '#ec4899', icon: '≡' },
  { to: '/tier-lists', label: 'Tier Lists', desc: 'S-D rankings by meta', color: '#facc15', icon: '★' },
  { to: '/compare', label: 'Compare', desc: 'Part vs. part breakdown', color: '#f97316', icon: '⇄' },
  { to: '/battle', label: 'Battle Sim', desc: 'Simulate a match', color: '#ff2fd0', icon: '⚔' },
  { to: '/compendium', label: 'Compendium', desc: 'Release strategy codex', color: '#a3e635', icon: '⌘' },
]

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="pixel-border bg-panel p-6 mb-4 text-center" style={{ borderColor: '#000' }}>
        <img
          src={heroArt}
          alt="Beyblade X - Let It Test"
          className="mx-auto pixel-border w-full max-w-xs object-cover"
          style={{ borderColor: '#000' }}
        />
        <h1 className="font-pixel holo-text text-xl md:text-2xl mt-4">COMBO LAB</h1>
        <p className="mt-2 text-slate-200 text-lg">The Beyblade X workshop — build, study, rank, compare, and battle.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {TILES.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="pixel-btn pixel-border bg-panel-2 p-5 flex flex-col items-center text-center gap-2 group"
            style={{ borderColor: '#000' }}
          >
            <div
              className="w-16 h-16 flex items-center justify-center text-3xl pixel-border group-hover:animate-bounce-pixel"
              style={{ background: tile.color, borderColor: '#000', color: '#0b0817' }}
            >
              {tile.icon}
            </div>
            <div className="font-pixel text-[12px] text-white mt-2">{tile.label}</div>
            <div className="text-slate-300 text-base">{tile.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
