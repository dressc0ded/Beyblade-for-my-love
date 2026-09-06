import type { Combo } from '../data/types'
import { comboStats, comboWeight } from './stats'

export type FinishType = 'Spin Finish' | 'Over Finish' | 'Burst Finish' | 'Xtreme Finish'

export interface BattleTick {
  tick: number
  powerA: number
  powerB: number
  event?: string
}

export interface BattleResult {
  winner: 'A' | 'B'
  finish: FinishType
  ticks: BattleTick[]
  summary: string
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export function simulateBattle(comboA: Combo, comboB: Combo): BattleResult {
  const statsA = comboStats(comboA.blade, comboA.ratchet, comboA.bit)
  const statsB = comboStats(comboB.blade, comboB.ratchet, comboB.bit)
  const weightA = comboWeight(comboA.blade, comboA.ratchet, comboA.bit)
  const weightB = comboWeight(comboB.blade, comboB.ratchet, comboB.bit)
  const oppositeSpin = comboA.blade.spinDirection !== comboB.blade.spinDirection

  let powerA = 100
  let powerB = 100
  const ticks: BattleTick[] = [{ tick: 0, powerA, powerB }]

  const decayA = 0.9 - statsA.stamina * 0.055
  const decayB = 0.9 - statsB.stamina * 0.055

  const maxTicks = 45
  for (let t = 1; t <= maxTicks; t++) {
    powerA = clamp(powerA - decayA * rand(0.7, 1.3), 0, 100)
    powerB = clamp(powerB - decayB * rand(0.7, 1.3), 0, 100)
    let event: string | undefined

    const clashChance = 0.28 + (statsA.dash + statsB.dash) / 60
    if (Math.random() < clashChance) {
      const netA = statsA.attack - statsB.defense * 0.6 - statsB.burstResistance * 0.2
      const netB = statsB.attack - statsA.defense * 0.6 - statsA.burstResistance * 0.2
      const swing = oppositeSpin ? 1.35 : 0.9

      if (netA > netB) {
        const dmg = clamp((netA - netB) * swing * rand(0.8, 1.4), 0.5, 14)
        powerB = clamp(powerB - dmg, 0, 100)
        event = `${comboA.blade.name} combo lands a clash - ${dmg.toFixed(1)} spin power knocked off the opponent.`
      } else if (netB > netA) {
        const dmg = clamp((netB - netA) * swing * rand(0.8, 1.4), 0.5, 14)
        powerA = clamp(powerA - dmg, 0, 100)
        event = `${comboB.blade.name} combo lands a clash - ${dmg.toFixed(1)} spin power knocked off the opponent.`
      } else {
        event = 'Beys collide head-on with no clear advantage.'
      }

      // Burst check: attacker's attack vs defender's burst resistance
      const burstChanceA = Math.max(0, (statsA.attack - statsB.burstResistance) / 220)
      const burstChanceB = Math.max(0, (statsB.attack - statsA.burstResistance) / 220)
      if (Math.random() < burstChanceB) {
        ticks.push({ tick: t, powerA, powerB: 0, event: `${comboA.blade.name} bursts ${comboB.blade.name} apart on impact!` })
        return finish('A', 'Burst Finish', ticks, comboA, comboB)
      }
      if (Math.random() < burstChanceA) {
        ticks.push({ tick: t, powerA: 0, powerB, event: `${comboB.blade.name} bursts ${comboA.blade.name} apart on impact!` })
        return finish('B', 'Burst Finish', ticks, comboA, comboB)
      }

      // Over Finish check: big weight mismatch + high attack + opposite spin
      if (oppositeSpin) {
        const overChanceA = Math.max(0, (statsA.attack - 5) / 260) * clamp((weightB - weightA) / 8 + 1, 0.3, 2)
        const overChanceB = Math.max(0, (statsB.attack - 5) / 260) * clamp((weightA - weightB) / 8 + 1, 0.3, 2)
        if (Math.random() < overChanceA) {
          ticks.push({ tick: t, powerA, powerB, event: `${comboA.blade.name} sends ${comboB.blade.name} flying out of the stadium!` })
          return finish('A', 'Over Finish', ticks, comboA, comboB)
        }
        if (Math.random() < overChanceB) {
          ticks.push({ tick: t, powerA, powerB, event: `${comboB.blade.name} sends ${comboA.blade.name} flying out of the stadium!` })
          return finish('B', 'Over Finish', ticks, comboA, comboB)
        }
      }

      // Xtreme Finish: rare, both combos very fast + opposite spin
      if (oppositeSpin && statsA.dash > 7 && statsB.dash > 7 && Math.random() < 0.015) {
        const aWins = statsA.attack + statsA.dash >= statsB.attack + statsB.dash
        ticks.push({ tick: t, powerA, powerB, event: 'The beys enter a violent Xtreme collision loop!' })
        return finish(aWins ? 'A' : 'B', 'Xtreme Finish', ticks, comboA, comboB)
      }
    }

    ticks.push({ tick: t, powerA, powerB, event })

    if (powerA <= 0 || powerB <= 0) {
      const winner = powerA <= 0 && powerB <= 0 ? (statsA.stamina >= statsB.stamina ? 'A' : 'B') : powerA <= 0 ? 'B' : 'A'
      return finish(winner, 'Spin Finish', ticks, comboA, comboB)
    }
  }

  const winner = powerA >= powerB ? 'A' : 'B'
  return finish(winner, 'Spin Finish', ticks, comboA, comboB)
}

function finish(winner: 'A' | 'B', finishType: FinishType, ticks: BattleTick[], comboA: Combo, comboB: Combo): BattleResult {
  const winnerName = winner === 'A' ? comboA.blade.name : comboB.blade.name
  const loserName = winner === 'A' ? comboB.blade.name : comboA.blade.name
  const finishText: Record<FinishType, string> = {
    'Spin Finish': `${winnerName} outlasted ${loserName}, still spinning after the opponent ground to a halt.`,
    'Over Finish': `${winnerName} knocked ${loserName} clean out of the stadium.`,
    'Burst Finish': `${winnerName} burst ${loserName} apart on a heavy clash.`,
    'Xtreme Finish': `${winnerName} won a spectacular Xtreme collision against ${loserName}.`,
  }
  return { winner, finish: finishType, ticks, summary: finishText[finishType] }
}

export interface MatchSeriesResult {
  results: BattleResult[]
  winsA: number
  winsB: number
  seriesWinner: 'A' | 'B'
}

export function runSeries(comboA: Combo, comboB: Combo, bestOf: 3 | 5): MatchSeriesResult {
  const results: BattleResult[] = []
  let winsA = 0
  let winsB = 0
  const needed = Math.ceil(bestOf / 2)
  while (winsA < needed && winsB < needed) {
    const res = simulateBattle(comboA, comboB)
    results.push(res)
    if (res.winner === 'A') winsA++
    else winsB++
  }
  return { results, winsA, winsB, seriesWinner: winsA > winsB ? 'A' : 'B' }
}
