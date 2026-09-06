import { useMemo, useState } from 'react'
import PartPicker from '../components/PartPicker'
import PixelBey from '../components/PixelBey'
import StatBars from '../components/StatBars'
import LineBadge from '../components/LineBadge'
import { BITS, BLADES, RATCHETS, isCompatible } from '../data/parts'
import { comboStats, comboWeight } from '../lib/stats'
import { exportComboCard, encodeBuildCode, decodeBuildCode } from '../lib/buildCode'
import { getBitById, getBladeById, getRatchetById, useBuildStore } from '../state/buildStore'

export default function Configurator() {
  const { bladeId, ratchetId, bitId, setBlade, setRatchet, setBit, savedBuilds, saveCurrentBuild, deleteBuild, loadBuild } =
    useBuildStore()
  const [buildName, setBuildName] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [codeMsg, setCodeMsg] = useState('')

  const blade = getBladeById(bladeId)
  const ratchet = getRatchetById(ratchetId)
  const bit = getBitById(bitId)

  const stats = useMemo(() => comboStats(blade, ratchet, bit), [blade, ratchet, bit])
  const weight = useMemo(() => comboWeight(blade, ratchet, bit), [blade, ratchet, bit])
  const compat = useMemo(() => isCompatible(blade, ratchet, bit), [blade, ratchet, bit])

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="space-y-3">
        <PartPicker label="BLADE" parts={BLADES} selectedId={bladeId} onSelect={setBlade} />
        <PartPicker label="RATCHET" parts={RATCHETS} selectedId={ratchetId} onSelect={setRatchet} />
        <PartPicker label="BIT" parts={BITS} selectedId={bitId} onSelect={setBit} />
      </div>

      <div className="pixel-border bg-panel p-4 flex flex-col items-center" style={{ borderColor: '#000' }}>
        <PixelBey blade={blade} ratchet={ratchet} bit={bit} size={200} />
        <div className="mt-3 text-center">
          <div className="font-pixel text-[11px] text-white">{blade.name}</div>
          <div className="text-slate-400 text-sm">{ratchet.name} / {bit.name}</div>
          <div className="flex gap-1 justify-center mt-2">
            <LineBadge line={blade.line} />
            <span className="font-pixel text-[9px] px-2 py-1 bg-black/40 text-slate-300 pixel-border" style={{ borderColor: '#000' }}>
              {blade.spinDirection} SPIN
            </span>
          </div>
          <div className="text-slate-500 text-sm mt-1">{weight}g total</div>
        </div>

        {!compat.legal && (
          <div className="mt-3 w-full pixel-border bg-red-950/60 border-red-500 p-2 text-red-300 text-sm flex gap-2" style={{ borderColor: '#ef4444' }}>
            <span className="animate-flicker">⚠</span>
            <div>
              <div className="font-pixel text-[9px] mb-1">ILLEGAL COMBO</div>
              {compat.reasons.map((r, i) => (
                <div key={i}>{r}</div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full mt-4 flex gap-2">
          <input
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            placeholder="Name this build..."
            className="flex-1 bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none"
            style={{ borderColor: '#000' }}
          />
          <button
            disabled={!buildName.trim()}
            onClick={() => {
              saveCurrentBuild(buildName.trim())
              setBuildName('')
            }}
            className="pixel-btn pixel-border bg-basic px-3 py-1 font-pixel text-[9px] text-white disabled:opacity-40"
            style={{ borderColor: '#000' }}
          >
            SAVE
          </button>
        </div>
        <div className="w-full flex gap-2 mt-2">
          <button
            onClick={() => exportComboCard(buildName || blade.name, { blade, ratchet, bit })}
            className="flex-1 pixel-btn pixel-border bg-custom px-3 py-1 font-pixel text-[9px] text-white"
            style={{ borderColor: '#000' }}
          >
            EXPORT PNG
          </button>
          <button
            onClick={() => {
              const code = encodeBuildCode(bladeId, ratchetId, bitId)
              navigator.clipboard?.writeText(code).catch(() => {})
              setCodeMsg(`Copied: ${code}`)
            }}
            className="flex-1 pixel-btn pixel-border bg-unique px-3 py-1 font-pixel text-[9px] text-white"
            style={{ borderColor: '#000' }}
          >
            COPY CODE
          </button>
        </div>
        <div className="w-full flex gap-2 mt-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Paste a build code..."
            className="flex-1 bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none"
            style={{ borderColor: '#000' }}
          />
          <button
            onClick={() => {
              const decoded = decodeBuildCode(codeInput.trim())
              if (!decoded) {
                setCodeMsg('Invalid code.')
                return
              }
              setBlade(decoded.bladeId)
              setRatchet(decoded.ratchetId)
              setBit(decoded.bitId)
              setCodeMsg('Build loaded from code.')
            }}
            className="pixel-btn pixel-border bg-panel-2 px-3 py-1 font-pixel text-[9px] text-white"
            style={{ borderColor: '#000' }}
          >
            LOAD
          </button>
        </div>
        {codeMsg && <div className="text-slate-400 text-sm mt-1">{codeMsg}</div>}
      </div>

      <div className="space-y-3">
        <div className="pixel-border bg-panel-2 p-3" style={{ borderColor: '#000' }}>
          <div className="font-pixel text-[10px] text-slate-300 mb-2">AGGREGATE STATS</div>
          <StatBars stats={stats} />
        </div>
        <div className="pixel-border bg-panel-2 p-3" style={{ borderColor: '#000' }}>
          <div className="font-pixel text-[10px] text-slate-300 mb-2">SAVED BUILDS</div>
          {savedBuilds.length === 0 && <div className="text-slate-500 text-sm">No saved builds yet.</div>}
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {savedBuilds.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-black/20 pixel-border px-2 py-1" style={{ borderColor: '#000' }}>
                <button onClick={() => loadBuild(b)} className="text-sm text-left flex-1 truncate hover:text-limited">
                  {b.name}
                </button>
                <button onClick={() => deleteBuild(b.id)} className="text-red-400 text-sm px-2 hover:text-red-300">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
