import { useState } from 'react'

interface Entry {
  title: string
  distribution: string
  price: string
  identify: string
}

const ENTRIES: Entry[] = [
  {
    title: 'Standard Retail (Basic Line) Single Releases',
    distribution:
      'Sold individually as a complete "BX-##" starter: one Blade, one Ratchet, and one Bit packaged together at general retail (toy aisles, mass-market stores). This is the backbone of the line and how most players build their first collection.',
    price: 'Budget tier - lowest price point of the line, wide availability, frequent restocks.',
    identify: 'Numbered "BX-" product code on the box, solid-color blister packaging, no foil/holographic accents.',
  },
  {
    title: 'Booster / CX Line Bundles',
    distribution:
      'Custom (CX) line boosters bundle a combo blade (fused from two part halves) with a wide CX-compatible ratchet, sometimes with a fixed pairing rather than random chase odds.',
    price: 'Mid tier - priced above a single Basic release to reflect the extra tooling of a dual-half blade.',
    identify: 'A "CX" marking on the box and a visibly two-toned blade sculpt where the halves meet.',
  },
  {
    title: 'Starter Sets (Pre-built Combos)',
    distribution:
      'A ready-to-battle bundle: a complete pre-chosen combo plus a launcher and sometimes a mini stadium, aimed at new players who do not want to assemble a build themselves.',
    price: 'Higher tier due to bundled accessories (launcher/stadium), but the best per-item value if you need the hardware anyway.',
    identify: 'Box art emphasizes the launcher/stadium alongside the bey; part names are printed as a fixed set, not "mix and match."',
  },
  {
    title: 'Limited / Convention-Exclusive Drops',
    distribution:
      'Small-batch parts sold only at conventions, official tournaments, or pop-up events - often recolors of existing parts rather than new molds.',
    price: 'Premium/collector tier - scalped resale prices are common once the event ends.',
    identify: 'Translucent, chrome, or glow-in-the-dark plastic on an otherwise familiar sculpt; event-branded packaging insert or stamp.',
  },
  {
    title: 'Collaboration / Region-Exclusive Releases',
    distribution:
      'Tie-in releases with another franchise or region-locked variants (e.g. a market-specific colorway) distributed through select retail partners only.',
    price: 'Premium tier, frequently import-only, so secondary shipping/markup applies outside the origin region.',
    identify: 'Collaboration branding/logo on the packaging, or region-specific language/certification marks with no domestic equivalent listing.',
  },
  {
    title: 'Reissues / Recolors',
    distribution:
      'A previously released part brought back in a new color scheme, sometimes to correct supply shortages or refresh an older part for a new wave.',
    price: 'Same tier as the part\'s original release category - a Basic reissue stays budget-tier, a Limited recolor stays premium.',
    identify: 'Identical part name/mold to an earlier release with only the plastic color changed; check the release wave number on the box for the reissue date.',
  },
]

export default function Compendium() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="pixel-border bg-panel p-4 mb-4 text-center" style={{ borderColor: '#000' }}>
        <div className="font-pixel text-limited text-lg">RELEASE STRATEGY CODEX</div>
        <p className="text-slate-400 text-sm mt-2">An almanac of how Beyblade X parts reach players - distribution pattern, typical price tier, and how to spot each one at a glance.</p>
      </div>

      <div className="space-y-2">
        {ENTRIES.map((entry, i) => (
          <div key={entry.title} className="pixel-border bg-panel-2" style={{ borderColor: '#000' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-4 py-3 flex justify-between items-center pixel-btn"
            >
              <span className="font-pixel text-[10px] text-white">{entry.title}</span>
              <span className="text-limited font-pixel text-[10px]">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-slate-300 text-sm space-y-2">
                <div>
                  <span className="font-pixel text-[9px] text-slate-400 block mb-1">DISTRIBUTION</span>
                  {entry.distribution}
                </div>
                <div>
                  <span className="font-pixel text-[9px] text-slate-400 block mb-1">PRICE / PACKAGING</span>
                  {entry.price}
                </div>
                <div>
                  <span className="font-pixel text-[9px] text-slate-400 block mb-1">HOW TO SPOT IT</span>
                  {entry.identify}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
