import { useEffect, useRef, useState } from 'react'
import { BITS, BLADES, RATCHETS } from '../data/parts'
import type { Combo } from '../data/types'
import PixelBey from '../components/PixelBey'
import { runSeries, simulateBattle, type BattleResult, type MatchSeriesResult } from '../lib/battle'
import { getBitById, getBladeById, getRatchetById, useBuildStore } from '../state/buildStore'

function randomCombo(): Combo {
  return {
    blade: BLADES[Math.floor(Math.random() * BLADES.length)],
    ratchet: RATCHETS[Math.floor(Math.random() * RATCHETS.length)],
    bit: BITS[Math.floor(Math.random() * BITS.length)],
  }
}

export default function Battle() {
  const { bladeId, ratchetId, bitId } = useBuildStore()
  const playerCombo: Combo = { blade: getBladeById(bladeId), ratchet: getRatchetById(ratchetId), bit: getBitById(bitId) }

  const [mode, setMode] = useState<'cpu' | 'custom'>('cpu')
  const [oppBladeId, setOppBladeId] = useState(BLADES[1].id)
  const [oppRatchetId, setOppRatchetId] = useState(RATCHETS[1].id)
  const [oppBitId, setOppBitId] = useState(BITS[1].id)
  const [bestOf, setBestOf] = useState<1 | 3 | 5>(1)

  const [series, setSeries] = useState<MatchSeriesResult | null>(null)
  const [activeMatch, setActiveMatch] = useState(0)
  const [tickIndex, setTickIndex] = useState(0)
  const timer = useRef<number | null>(null)

  function opponentCombo(): Combo {
    if (mode === 'cpu') return randomCombo()
    return { blade: getBladeById(oppBladeId), ratchet: getRatchetById(oppRatchetId), bit: getBitById(oppBitId) }
  }

  function startBattle() {
    const opp = opponentCombo()
    const n = bestOf === 1 ? 1 : bestOf
    const result = n === 1 ? { results: [runOne(playerCombo, opp)], winsA: 0, winsB: 0, seriesWinner: 'A' as const } : runSeries(playerCombo, opp, n as 3 | 5)
    if (n === 1) {
      result.winsA = result.results[0].winner === 'A' ? 1 : 0
      result.winsB = result.results[0].winner === 'B' ? 1 : 0
      result.seriesWinner = result.results[0].winner
    }
    setLastOpponent(opp)
    setSeries(result)
    setActiveMatch(0)
    setTickIndex(0)
  }

  const [lastOpponent, setLastOpponent] = useState<Combo>(playerCombo)

  useEffect(() => {
    if (!series) return
    if (timer.current) window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      setTickIndex((i) => {
        const match = series.results[activeMatch]
        if (i >= match.ticks.length - 1) {
          window.clearInterval(timer.current!)
          return i
        }
        return i + 1
      })
    }, 60)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, activeMatch])

  const currentMatch = series?.results[activeMatch]
  const currentTick = currentMatch?.ticks[Math.min(tickIndex, currentMatch.ticks.length - 1)]
  const isPlaying = currentMatch && tickIndex < currentMatch.ticks.length - 1

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="pixel-border bg-panel-2 p-4" style={{ borderColor: '#000' }}>
        <div className="font-pixel text-[10px] text-slate-300 mb-3">YOUR COMBO</div>
        <PixelBey blade={playerCombo.blade} ratchet={playerCombo.ratchet} bit={playerCombo.bit} size={140} />
        <div className="text-center mt-2 text-white font-pixel text-[10px]">{playerCombo.blade.name}</div>
        <div className="text-center text-slate-400 text-sm">{playerCombo.ratchet.name} / {playerCombo.bit.name}</div>
        <div className="text-center text-slate-500 text-xs mt-1">Set this on the Configurator page.</div>
      </div>

      <div className="pixel-border bg-panel-2 p-4" style={{ borderColor: '#000' }}>
        <div className="font-pixel text-[10px] text-slate-300 mb-3">OPPONENT</div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('cpu')}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] flex-1 ${mode === 'cpu' ? 'bg-basic text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            CPU RANDOM
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] flex-1 ${mode === 'custom' ? 'bg-basic text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            BUILD ONE
          </button>
        </div>
        {mode === 'custom' ? (
          <div className="space-y-2 mb-3">
            <SmallSelect label="Blade" value={oppBladeId} onChange={setOppBladeId} options={BLADES} />
            <SmallSelect label="Ratchet" value={oppRatchetId} onChange={setOppRatchetId} options={RATCHETS} />
            <SmallSelect label="Bit" value={oppBitId} onChange={setOppBitId} options={BITS} />
          </div>
        ) : (
          <div className="text-slate-400 text-sm mb-3">A random legal-ish combo is generated each battle.</div>
        )}
        <div className="flex gap-2 mb-3 items-center">
          <span className="font-pixel text-[9px] text-slate-400">BEST OF</span>
          {[1, 3, 5].map((n) => (
            <button
              key={n}
              onClick={() => setBestOf(n as 1 | 3 | 5)}
              className={`pixel-btn pixel-border w-8 h-8 font-pixel text-[10px] ${bestOf === n ? 'bg-limited text-black' : 'bg-black/30 text-slate-300'}`}
              style={{ borderColor: '#000' }}
            >
              {n}
            </button>
          ))}
        </div>
        <button onClick={startBattle} className="w-full pixel-btn pixel-border bg-custom py-2 font-pixel text-[10px] text-white" style={{ borderColor: '#000' }}>
          ⚔ RUN BATTLE
        </button>
      </div>

      {series && currentMatch && currentTick && (
        <div className="lg:col-span-2 pixel-border bg-panel p-4" style={{ borderColor: '#000' }}>
          <div className="flex justify-between items-center mb-3">
            <div className="font-pixel text-[10px] text-limited">
              MATCH {activeMatch + 1} / {series.results.length}
            </div>
            {bestOf > 1 && (
              <div className="font-pixel text-[10px] text-white">
                SERIES: {series.winsA ?? series.results.filter((r) => r.winner === 'A').length} - {series.winsB ?? series.results.filter((r) => r.winner === 'B').length}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <PowerMeter name={playerCombo.blade.name} power={currentTick.powerA} color="#3b82f6" />
            <PowerMeter name={lastOpponent.blade.name} power={currentTick.powerB} color="#ef4444" />
          </div>

          <div className="bg-black/40 pixel-border p-2 h-32 overflow-y-auto text-sm space-y-1" style={{ borderColor: '#000' }}>
            {currentMatch.ticks.slice(0, tickIndex + 1).filter((t) => t.event).map((t, i) => (
              <div key={i} className="text-slate-300">
                <span className="text-slate-500">[{t.tick}]</span> {t.event}
              </div>
            ))}
          </div>

          {!isPlaying && (
            <div className="mt-4 pixel-border bg-panel-2 p-3 text-center" style={{ borderColor: '#000' }}>
              <div className="font-pixel text-[11px] text-limited mb-1">
                WINNER: {currentMatch.winner === 'A' ? playerCombo.blade.name : lastOpponent.blade.name}
              </div>
              <div className="font-pixel text-[9px] text-white mb-2">{currentMatch.finish.toUpperCase()}</div>
              <div className="text-slate-300 text-sm">{currentMatch.summary}</div>
              {activeMatch < series.results.length - 1 && (
                <button
                  onClick={() => {
                    setActiveMatch((i) => i + 1)
                    setTickIndex(0)
                  }}
                  className="mt-3 pixel-btn pixel-border bg-basic px-3 py-1 font-pixel text-[9px] text-white"
                  style={{ borderColor: '#000' }}
                >
                  NEXT MATCH ▶
                </button>
              )}
              {activeMatch === series.results.length - 1 && bestOf > 1 && (
                <div className="mt-3 font-pixel text-[10px] text-white">
                  SERIES WINNER: {series.seriesWinner === 'A' ? playerCombo.blade.name : lastOpponent.blade.name}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function runOne(a: Combo, b: Combo): BattleResult {
  return simulateBattle(a, b)
}

function PowerMeter({ name, power, color }: { name: string; power: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white">{name}</span>
        <span className="text-slate-400">{power.toFixed(0)}%</span>
      </div>
      <div className="h-5 bg-black/50 pixel-border" style={{ borderColor: '#000' }}>
        <div className="h-full stat-chunk" style={{ width: `${power}%`, background: color }} />
      </div>
    </div>
  )
}

function SmallSelect<T extends { id: string; name: string }>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (id: string) => void
  options: T[]
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-pixel text-[9px] text-slate-400 w-16">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none"
        style={{ borderColor: '#000' }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  )
}
