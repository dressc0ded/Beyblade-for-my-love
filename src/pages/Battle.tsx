import { useEffect, useRef, useState } from 'react'
import { BITS, BLADES, RATCHETS } from '../data/parts'
import type { Combo } from '../data/types'
import BladeIcon from '../components/BladeIcon'
import { runSeries, simulateBattle, type MatchSeriesResult } from '../lib/battle'
import { getBitById, getBladeById, getRatchetById, useBuildStore } from '../state/buildStore'

function randomCombo(): Combo {
  return {
    blade: BLADES[Math.floor(Math.random() * BLADES.length)],
    ratchet: RATCHETS[Math.floor(Math.random() * RATCHETS.length)],
    bit: BITS[Math.floor(Math.random() * BITS.length)],
  }
}

type SideMode = 'configurator' | 'custom' | 'cpu'

function SidePicker({
  label,
  mode,
  onModeChange,
  allowConfigurator,
  bladeId,
  ratchetId,
  bitId,
  onBladeChange,
  onRatchetChange,
  onBitChange,
}: {
  label: string
  mode: SideMode
  onModeChange: (m: SideMode) => void
  allowConfigurator: boolean
  bladeId: string
  ratchetId: string
  bitId: string
  onBladeChange: (id: string) => void
  onRatchetChange: (id: string) => void
  onBitChange: (id: string) => void
}) {
  const modes: SideMode[] = allowConfigurator ? ['configurator', 'custom'] : ['cpu', 'custom']
  const modeLabels: Record<SideMode, string> = { configurator: 'MY BUILD', custom: 'BUILD CUSTOM', cpu: 'CPU RANDOM' }
  return (
    <div className="pixel-border bg-panel-2 p-4" style={{ borderColor: '#000' }}>
      <div className="font-pixel text-[10px] text-slate-300 mb-3">{label}</div>
      <div className="flex gap-2 mb-3">
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`pixel-btn pixel-border px-2 py-1 font-pixel text-[9px] flex-1 ${mode === m ? 'bg-basic text-white' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>
      {mode === 'custom' ? (
        <div className="space-y-2">
          <SmallSelect label="Blade" value={bladeId} onChange={onBladeChange} options={BLADES} />
          <SmallSelect label="Ratchet" value={ratchetId} onChange={onRatchetChange} options={RATCHETS} />
          <SmallSelect label="Bit" value={bitId} onChange={onBitChange} options={BITS} />
        </div>
      ) : mode === 'cpu' ? (
        <div className="text-slate-300 text-sm">A random combo is generated fresh for each battle.</div>
      ) : (
        <div className="text-slate-300 text-sm">Using whatever combo is currently selected on the Configurator page.</div>
      )}
    </div>
  )
}

export default function Battle() {
  const { bladeId, ratchetId, bitId } = useBuildStore()
  const configuratorCombo: Combo = { blade: getBladeById(bladeId), ratchet: getRatchetById(ratchetId), bit: getBitById(bitId) }

  const [modeA, setModeA] = useState<SideMode>('configurator')
  const [aBladeId, setABladeId] = useState(BLADES[0].id)
  const [aRatchetId, setARatchetId] = useState(RATCHETS[0].id)
  const [aBitId, setABitId] = useState(BITS[0].id)

  const [modeB, setModeB] = useState<SideMode>('cpu')
  const [bBladeId, setBBladeId] = useState(BLADES[1].id)
  const [bRatchetId, setBRatchetId] = useState(RATCHETS[1].id)
  const [bBitId, setBBitId] = useState(BITS[1].id)

  const [bestOf, setBestOf] = useState<1 | 3 | 5>(1)

  const [series, setSeries] = useState<MatchSeriesResult | null>(null)
  const [frozenA, setFrozenA] = useState<Combo>(configuratorCombo)
  const [frozenB, setFrozenB] = useState<Combo>(configuratorCombo)
  const [activeMatch, setActiveMatch] = useState(0)
  const [tickIndex, setTickIndex] = useState(0)
  const timer = useRef<number | null>(null)

  function resolveSide(mode: SideMode, bId: string, rId: string, biId: string): Combo {
    if (mode === 'configurator') return configuratorCombo
    if (mode === 'cpu') return randomCombo()
    return { blade: getBladeById(bId), ratchet: getRatchetById(rId), bit: getBitById(biId) }
  }

  function startBattle() {
    const comboA = resolveSide(modeA, aBladeId, aRatchetId, aBitId)
    const comboB = resolveSide(modeB, bBladeId, bRatchetId, bBitId)
    const n = bestOf
    const result: MatchSeriesResult =
      n === 1
        ? (() => {
            const res = simulateBattle(comboA, comboB)
            return { results: [res], winsA: res.winner === 'A' ? 1 : 0, winsB: res.winner === 'B' ? 1 : 0, seriesWinner: res.winner }
          })()
        : runSeries(comboA, comboB, n as 3 | 5)
    setFrozenA(comboA)
    setFrozenB(comboB)
    setSeries(result)
    setActiveMatch(0)
    setTickIndex(0)
  }

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
    }, 220)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, activeMatch])

  const currentMatch = series?.results[activeMatch]
  const currentTick = currentMatch?.ticks[Math.min(tickIndex, currentMatch.ticks.length - 1)]
  const isPlaying = !!currentMatch && tickIndex < currentMatch.ticks.length - 1
  const isFinished = !!currentMatch && !isPlaying
  const clashKey = currentTick?.event ? tickIndex : null

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SidePicker
          label="SIDE A"
          mode={modeA}
          onModeChange={setModeA}
          allowConfigurator
          bladeId={aBladeId}
          ratchetId={aRatchetId}
          bitId={aBitId}
          onBladeChange={setABladeId}
          onRatchetChange={setARatchetId}
          onBitChange={setABitId}
        />
        <SidePicker
          label="SIDE B"
          mode={modeB}
          onModeChange={setModeB}
          allowConfigurator={false}
          bladeId={bBladeId}
          ratchetId={bRatchetId}
          bitId={bBitId}
          onBladeChange={setBBladeId}
          onRatchetChange={setBRatchetId}
          onBitChange={setBBitId}
        />
      </div>

      <div className="pixel-border bg-panel-2 p-4 flex flex-wrap items-center gap-3" style={{ borderColor: '#000' }}>
        <span className="font-pixel text-[9px] text-slate-300">BEST OF</span>
        {[1, 3, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setBestOf(n as 1 | 3 | 5)}
            className={`pixel-btn pixel-border w-8 h-8 font-pixel text-[10px] ${bestOf === n ? 'bg-limited text-black' : 'bg-black/30 text-slate-300'}`}
            style={{ borderColor: '#000' }}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={startBattle}
          className="ml-auto pixel-btn pixel-border bg-custom px-6 py-2 font-pixel text-[10px] text-white"
          style={{ borderColor: '#000' }}
        >
          ⚔ RUN BATTLE
        </button>
      </div>

      {series && currentMatch && currentTick && (
        <div className="pixel-border bg-panel p-4" style={{ borderColor: '#000' }}>
          <div className="flex justify-between items-center mb-3">
            <div className="font-pixel text-[10px] text-limited">
              MATCH {activeMatch + 1} / {series.results.length}
            </div>
            {bestOf > 1 && (
              <div className="font-pixel text-[10px] text-white">
                SERIES: {series.results.filter((r) => r.winner === 'A').length} - {series.results.filter((r) => r.winner === 'B').length}
              </div>
            )}
          </div>

          {/* Animated arena */}
          <div className="relative h-36 sm:h-44 mb-3 overflow-hidden pixel-border bg-black/60 flex items-center justify-between px-4 sm:px-10" style={{ borderColor: '#000' }}>
            {clashKey !== null && <div key={clashKey} className="absolute inset-0 bg-white/25 animate-clash-flash pointer-events-none" />}
            <div className={`transition-transform duration-150 ${clashKey !== null ? 'translate-x-3' : ''} ${isFinished && currentMatch.winner === 'B' ? 'opacity-30 scale-75' : ''}`}>
              <BladeIcon blade={frozenA.blade} size={84} spinning={isPlaying} />
            </div>
            <div className="font-pixel text-limited text-sm sm:text-lg shrink-0 px-2">VS</div>
            <div className={`transition-transform duration-150 ${clashKey !== null ? '-translate-x-3' : ''} ${isFinished && currentMatch.winner === 'A' ? 'opacity-30 scale-75' : ''}`}>
              <BladeIcon blade={frozenB.blade} size={84} spinning={isPlaying} />
            </div>
          </div>

          <div className="text-center min-h-[1.6em] text-sm text-slate-100 mb-3 px-2">
            {currentTick.event ?? (isPlaying ? 'Spinning...' : '')}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <PowerMeter name={frozenA.blade.name} power={currentTick.powerA} color="#22d3ee" />
            <PowerMeter name={frozenB.blade.name} power={currentTick.powerB} color="#ff2fd0" />
          </div>

          <div className="font-pixel text-[9px] text-slate-400 mb-1">FULL BATTLE LOG</div>
          <div className="bg-black/40 pixel-border p-2 h-28 overflow-y-auto text-sm space-y-1" style={{ borderColor: '#000' }}>
            {currentMatch.ticks.slice(0, tickIndex + 1).filter((t) => t.event).map((t, i) => (
              <div key={i} className="text-slate-300">
                <span className="text-slate-500">[{t.tick}]</span> {t.event}
              </div>
            ))}
          </div>

          {isFinished && (
            <div className="mt-4 pixel-border bg-panel-2 p-3 text-center" style={{ borderColor: '#000' }}>
              <div className="font-pixel text-[11px] text-limited mb-1">
                WINNER: {currentMatch.winner === 'A' ? frozenA.blade.name : frozenB.blade.name}
              </div>
              <div className="font-pixel text-[9px] text-white mb-2">{currentMatch.finish.toUpperCase()}</div>
              <div className="text-slate-300 text-sm">{currentMatch.summary}</div>
              {activeMatch < series.results.length - 1 && (
                <button
                  type="button"
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
                  SERIES WINNER: {series.seriesWinner === 'A' ? frozenA.blade.name : frozenB.blade.name}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
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
