import { useEffect, useRef, useState } from 'react'
import BeybladeBox from '../components/BeybladeBox'
import countdownAudioM4a from '../assets/countdown.m4a'
import countdownAudioOgg from '../assets/countdown.ogg'
import { loadLeaderboard, recordWin, type LeaderboardEntry } from '../lib/storage'

const WIN_POINTS = 5

// Measured from the countdown clip's actual speech timing (silence-gap
// analysis) so the on-screen word changes right as it's spoken rather than
// on a guessed fixed interval.
const STEPS: { at: number; label: string }[] = [
  { at: 0.55, label: '3' },
  { at: 1.16, label: '2' },
  { at: 1.87, label: '1' },
  { at: 2.56, label: 'GO' },
  { at: 3.23, label: 'SHOOT' },
]

const RULES = [
  { points: 1, label: 'Spin Finish' },
  { points: 2, label: 'Burst Finish' },
  { points: 2, label: 'Over Finish' },
  { points: 3, label: 'Xtreme Finish' },
]

export default function Gameplay() {
  const [p1Name, setP1Name] = useState('')
  const [p2Name, setP2Name] = useState('')
  const [p1Beys, setP1Beys] = useState<[string, string, string]>(['', '', ''])
  const [p2Beys, setP2Beys] = useState<[string, string, string]>(['', '', ''])

  const [round, setRound] = useState(0)
  const [p1Points, setP1Points] = useState(0)
  const [p2Points, setP2Points] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadLeaderboard())

  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [stepLabel, setStepLabel] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    function onTimeUpdate() {
      if (!audio) return
      let current: string | null = null
      for (const step of STEPS) {
        if (audio.currentTime >= step.at) current = step.label
      }
      setStepLabel(current)
    }
    function onEnded() {
      setPlaying(false)
      setStepLabel(null)
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  function startCountdown() {
    if (playing || !audioRef.current) return
    setPlaying(true)
    setStepLabel(null)
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => setPlaying(false))
  }

  function addRound() {
    setRound((r) => r + 1)
  }

  function addPoint(side: 'p1' | 'p2') {
    if (winner) return
    const name = side === 'p1' ? p1Name || 'Player 1' : p2Name || 'Player 2'
    const next = side === 'p1' ? p1Points + 1 : p2Points + 1
    if (side === 'p1') setP1Points(next)
    else setP2Points(next)
    if (next >= WIN_POINTS) {
      setWinner(name)
      setLeaderboard(recordWin(name))
    }
  }

  function resetMatch() {
    setRound(0)
    setP1Points(0)
    setP2Points(0)
    setWinner(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="pixel-border bg-panel p-4 text-center" style={{ borderColor: '#000' }}>
        <h1 className="font-pixel holo-text text-lg">AT-HOME GAMEPLAY</h1>
        <p className="text-slate-200 text-base mt-2">Register your decks, launch on the countdown, and track the score.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="pixel-border bg-panel-2 p-3" style={{ borderColor: '#000' }}>
          <div className="font-pixel text-[11px] mb-2" style={{ color: '#ff2fd0' }}>
            PLAYER 1
          </div>
          <input
            value={p1Name}
            onChange={(e) => setP1Name(e.target.value)}
            placeholder="Custom name..."
            className="w-full mb-3 bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none"
            style={{ borderColor: '#ff2fd0' }}
          />
          <BeybladeBox accent="#ff2fd0" names={p1Beys} onChange={(i, v) => setP1Beys((prev) => { const next = [...prev] as typeof prev; next[i] = v; return next })} />
        </div>

        <div className="pixel-border bg-panel-2 p-3" style={{ borderColor: '#000' }}>
          <div className="font-pixel text-[11px] mb-2" style={{ color: '#22d3ee' }}>
            PLAYER 2
          </div>
          <input
            value={p2Name}
            onChange={(e) => setP2Name(e.target.value)}
            placeholder="Custom name..."
            className="w-full mb-3 bg-black/40 pixel-border px-2 py-1 text-sm text-white outline-none"
            style={{ borderColor: '#22d3ee' }}
          />
          <BeybladeBox accent="#22d3ee" names={p2Beys} onChange={(i, v) => setP2Beys((prev) => { const next = [...prev] as typeof prev; next[i] = v; return next })} />
        </div>
      </div>

      <div className="pixel-border bg-panel p-4 text-center" style={{ borderColor: '#000' }}>
        <div className="font-pixel text-[12px] text-limited mb-3">COUNTDOWN</div>
        <audio ref={audioRef} preload="auto">
          <source src={countdownAudioM4a} type="audio/mp4" />
          <source src={countdownAudioOgg} type="audio/ogg" />
        </audio>
        <button
          type="button"
          onClick={startCountdown}
          disabled={playing}
          className="pixel-btn pixel-border bg-custom px-6 py-2 font-pixel text-[10px] text-white disabled:opacity-40"
          style={{ borderColor: '#000' }}
        >
          {playing ? 'GO!' : '▶ 3 · 2 · 1 · GO · SHOOT'}
        </button>
        <div className="h-20 flex items-center justify-center mt-3">
          {stepLabel && (
            <div
              className="font-pixel text-4xl animate-bounce-pixel"
              style={{ color: stepLabel === 'SHOOT' ? '#ff2fd0' : stepLabel === 'GO' ? '#4ade80' : '#facc15' }}
            >
              {stepLabel}
            </div>
          )}
        </div>
      </div>

      <div className="pixel-border bg-panel-2 p-4" style={{ borderColor: '#000' }}>
        {winner && (
          <div className="mb-3 pixel-border bg-limited text-black text-center py-2 font-pixel text-[11px]" style={{ borderColor: '#000' }}>
            🏆 {winner.toUpperCase()} WINS THE MATCH!
          </div>
        )}
        <button
          type="button"
          onClick={addRound}
          className="mx-auto mb-4 flex flex-col items-center pixel-btn pixel-border bg-black/30 px-6 py-2"
          style={{ borderColor: '#facc15' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-slate-300">ROUND</span>
            <span className="font-pixel text-lg text-white">{round}</span>
          </div>
          <div className="text-slate-400 text-sm mt-1">tap to add a round</div>
        </button>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            type="button"
            onClick={() => addPoint('p1')}
            className="pixel-btn pixel-border bg-black/30 p-4 text-center"
            style={{ borderColor: '#ff2fd0' }}
          >
            <div className="font-pixel text-[10px] mb-2 truncate" style={{ color: '#ff2fd0' }}>
              {p1Name || 'Player 1'}
            </div>
            <div className="font-pixel text-3xl text-white">{p1Points}</div>
            <div className="text-slate-400 text-sm mt-1">tap to add a point</div>
          </button>
          <button
            type="button"
            onClick={() => addPoint('p2')}
            className="pixel-btn pixel-border bg-black/30 p-4 text-center"
            style={{ borderColor: '#22d3ee' }}
          >
            <div className="font-pixel text-[10px] mb-2 truncate" style={{ color: '#22d3ee' }}>
              {p2Name || 'Player 2'}
            </div>
            <div className="font-pixel text-3xl text-white">{p2Points}</div>
            <div className="text-slate-400 text-sm mt-1">tap to add a point</div>
          </button>
        </div>

        <div className="text-slate-300 text-sm mb-4 space-y-1">
          <div className="font-pixel text-[9px] text-slate-400 mb-1">OFFICIAL POINT VALUES</div>
          {RULES.map((r) => (
            <div key={r.label}>
              <span className="text-limited font-pixel text-[9px]">{r.points} PT{r.points > 1 ? 'S' : ''}</span> — {r.label}
            </div>
          ))}
          <div className="pt-1 text-white">First to {WIN_POINTS} points wins the match.</div>
        </div>

        <button
          type="button"
          onClick={resetMatch}
          className="w-full pixel-btn pixel-border bg-panel px-4 py-2 font-pixel text-[9px] text-white"
          style={{ borderColor: '#000' }}
        >
          ↺ REFRESH ROUND & POINTS
        </button>
      </div>

      <div className="pixel-border bg-panel-2 p-4" style={{ borderColor: '#000' }}>
        <div className="font-pixel text-[11px] text-limited mb-3">LEADERBOARD</div>
        {leaderboard.length === 0 ? (
          <div className="text-slate-400 text-sm">No games won yet - first to {WIN_POINTS} points takes the first spot.</div>
        ) : (
          <div className="space-y-1">
            {leaderboard.map((entry, i) => (
              <div key={entry.name} className="flex justify-between items-center bg-black/20 pixel-border px-3 py-1.5" style={{ borderColor: '#000' }}>
                <span className="text-white text-sm">
                  <span className="text-slate-500 mr-2">#{i + 1}</span>
                  {entry.name}
                </span>
                <span className="font-pixel text-[10px] text-limited">{entry.wins} win{entry.wins === 1 ? '' : 's'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
