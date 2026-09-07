import { Link } from 'react-router-dom'
import heroArt from '../assets/hero-let-it-test.jpg'
import tileConfigurator from '../assets/tile-configurator.jpg'
import tileWiki from '../assets/tile-wiki.jpg'
import tileTierLists from '../assets/tile-tierlists.jpg'
import tileCompare from '../assets/tile-compare.jpg'
import tileBattle from '../assets/tile-battle.jpg'
import tileCompendium from '../assets/tile-compendium.jpg'
import tileGameplay from '../assets/tile-gameplay.jpg'

const TILES = [
  { to: '/configurator', label: 'Configurator', desc: 'Build any legal combo', image: tileConfigurator },
  { to: '/wiki', label: 'Part Wiki', desc: 'Search every part', image: tileWiki },
  { to: '/tier-lists', label: 'Tier Lists', desc: 'S-D rankings by meta', image: tileTierLists },
  { to: '/compare', label: 'Compare', desc: 'Part vs. part breakdown', image: tileCompare },
  { to: '/battle', label: 'Battle Sim', desc: 'Simulate a match', image: tileBattle },
  { to: '/compendium', label: 'Compendium', desc: 'Release strategy codex', image: tileCompendium },
  { to: '/gameplay', label: 'Gameplay', desc: 'At-home matches & scoring', image: tileGameplay },
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
            className="pixel-btn pixel-border relative h-40 overflow-hidden group block"
            style={{ borderColor: '#000' }}
          >
            <img
              src={tile.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-end p-3 text-center">
              <div className="font-pixel text-[12px] text-white drop-shadow-[2px_2px_0_#000]">{tile.label}</div>
              <div className="text-slate-200 text-base drop-shadow-[1px_1px_0_#000]">{tile.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
