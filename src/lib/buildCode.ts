import type { Combo } from '../data/types'
import { comboStats, comboWeight } from './stats'
import { STAT_KEYS, STAT_LABELS } from '../data/types'

export function encodeBuildCode(bladeId: string, ratchetId: string, bitId: string): string {
  const raw = `${bladeId}|${ratchetId}|${bitId}`
  return btoa(unescape(encodeURIComponent(raw)))
}

export function decodeBuildCode(code: string): { bladeId: string; ratchetId: string; bitId: string } | null {
  try {
    const raw = decodeURIComponent(escape(atob(code)))
    const [bladeId, ratchetId, bitId] = raw.split('|')
    if (!bladeId || !ratchetId || !bitId) return null
    return { bladeId, ratchetId, bitId }
  } catch {
    return null
  }
}

/** Renders a retro stat-card PNG for a combo and triggers a browser download. */
export function exportComboCard(name: string, combo: Combo) {
  const stats = comboStats(combo.blade, combo.ratchet, combo.bit)
  const weight = comboWeight(combo.blade, combo.ratchet, combo.bit)

  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 360
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#141024'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#facc15'
  ctx.lineWidth = 6
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)

  ctx.fillStyle = '#facc15'
  ctx.font = 'bold 22px monospace'
  ctx.fillText(name.toUpperCase(), 28, 44)

  ctx.fillStyle = '#a5f3fc'
  ctx.font = '14px monospace'
  ctx.fillText(`${combo.blade.name} / ${combo.ratchet.name} / ${combo.bit.name}`, 28, 70)
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`Weight: ${weight}g  Spin: ${combo.blade.spinDirection}`, 28, 90)

  let y = 130
  for (const key of STAT_KEYS) {
    const value = stats[key]
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '13px monospace'
    ctx.fillText(STAT_LABELS[key], 28, y)
    ctx.fillStyle = '#334155'
    ctx.fillRect(160, y - 12, 280, 14)
    ctx.fillStyle = '#22d3ee'
    ctx.fillRect(160, y - 12, (value / 10) * 280, 14)
    ctx.fillStyle = '#f8fafc'
    ctx.fillText(value.toFixed(1), 450 - 20, y)
    y += 32
  }

  ctx.fillStyle = '#64748b'
  ctx.font = '10px monospace'
  ctx.fillText('COMBO LAB - Beyblade X Configurator', 28, canvas.height - 20)

  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `${name.replace(/\s+/g, '_') || 'combo'}.png`
  a.click()
}
