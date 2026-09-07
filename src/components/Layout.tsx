import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Garage', end: true },
  { to: '/configurator', label: 'Configurator' },
  { to: '/wiki', label: 'Wiki' },
  { to: '/tier-lists', label: 'Tier Lists' },
  { to: '/compare', label: 'Compare' },
  { to: '/battle', label: 'Battle' },
  { to: '/compendium', label: 'Compendium' },
]

export default function Layout() {
  return (
    <div className="min-h-full flex flex-col">
      <div className="crt-scanlines" />
      <header className="pixel-border bg-panel m-2 mb-0 p-3 flex flex-wrap items-center gap-3" style={{ borderColor: '#000' }}>
        <NavLink to="/" className="font-pixel text-[11px] holo-text whitespace-nowrap">
          COMBO LAB
        </NavLink>
        <nav className="flex flex-wrap gap-2 text-[11px] font-pixel">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-2 py-1 pixel-btn pixel-border ${isActive ? 'bg-basic text-white' : 'bg-panel-2 text-slate-300'}`
              }
              style={{ borderColor: '#000' }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-2">
        <Outlet />
      </main>
      <footer className="text-center text-[10px] text-slate-500 py-3 font-pixel">
        COMBO LAB — fan-made Beyblade X companion — stats are estimated, not official
      </footer>
    </div>
  )
}
