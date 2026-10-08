import { useCallback, useEffect, useState } from 'react'
import Game, { type Outcome } from './Game'
import { hasPad, takePause } from './input'
import { newSeed } from './level'

/**
 * The shell: a title, the run, a pause menu, and what it says when you stop.
 *
 * The run is kept mounted while paused rather than torn down, so the scene sits
 * behind the menu instead of the screen going black — and so resuming puts you
 * back exactly where you were, which a remount could not.
 */

type Screen = 'title' | 'playing' | 'paused' | 'over'

const BEST = 'emberwake-best'

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST) ?? 0) || 0
  } catch {
    return 0
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [seed, setSeed] = useState(() => newSeed())
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [best, setBest] = useState(readBest)
  const [pad, setPad] = useState(false)

  // Polled, because a pad announces itself only once a button is pressed.
  useEffect(() => {
    const id = setInterval(() => setPad(hasPad()), 1000)
    return () => clearInterval(id)
  }, [])

  const start = useCallback(() => {
    setSeed(newSeed())
    setOutcome(null)
    setScreen('playing')
  }, [])

  const finish = useCallback((result: Outcome) => {
    setOutcome(result)
    setScreen('over')
    if (result.score > readBest()) {
      try {
        localStorage.setItem(BEST, String(result.score))
      } catch {
        // Private browsing, or storage turned off. Not worth failing over.
      }
      setBest(result.score)
    }
  }, [])

  /*
   * Pause is polled here rather than handled in the run, because a paused run
   * is not being stepped — a latch drained only inside its loop would sit
   * there until play resumed and pause it again on the first frame.
   */
  useEffect(() => {
    if (screen !== 'playing' && screen !== 'paused') return
    let id = 0
    const watch = () => {
      if (takePause()) setScreen((s) => (s === 'playing' ? 'paused' : 'playing'))
      id = requestAnimationFrame(watch)
    }
    id = requestAnimationFrame(watch)
    return () => cancelAnimationFrame(id)
  }, [screen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'F11') {
        e.preventDefault()
        void toggleFullscreen()
      }
      if (screen === 'title' && (e.key === 'Enter' || e.key === ' ')) start()
      if (screen === 'over' && (e.key === 'Enter' || e.key === ' ')) start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, start])

  return (
    <div className="app">
      {screen !== 'title' && (
        <Game seed={seed} paused={screen !== 'playing'} onEnd={finish} />
      )}

      {screen === 'title' && (
        <div className="screen title">
          <h1>Emberwake</h1>
          <p className="sub">Your lamp is going out. Kindle the stones before it does.</p>
          <button className="primary" onClick={start} autoFocus>
            Begin
          </button>
          {best > 0 && <p className="best">Best {best}</p>}
          <Controls pad={pad} />
          <button className="ghost" onClick={() => void toggleFullscreen()}>
            Fullscreen (F11)
          </button>
        </div>
      )}

      {screen === 'paused' && (
        <div className="screen veil">
          <h2>Paused</h2>
          <button className="primary" onClick={() => setScreen('playing')}>
            Resume
          </button>
          <button className="ghost" onClick={start}>
            Restart
          </button>
          <button className="ghost" onClick={() => setScreen('title')}>
            Leave the forest
          </button>
          <Controls pad={pad} />
        </div>
      )}

      {screen === 'over' && outcome && (
        <div className="screen veil">
          <h2>{outcome.won ? 'Every stone alight' : 'The dark took you'}</h2>
          <p className="sub">
            {outcome.reach}% of the way · {outcome.lit} kindled · {outcome.embers} embers ·{' '}
            {outcome.score} points
          </p>
          {outcome.score >= best && outcome.score > 0 && <p className="best">A new best.</p>}
          <button className="primary" onClick={start} autoFocus>
            Again
          </button>
          <button className="ghost" onClick={() => setScreen('title')}>
            Title
          </button>
        </div>
      )}
    </div>
  )
}

function Controls({ pad }: { pad: boolean }) {
  return (
    <dl className="controls">
      <dt>Move</dt>
      <dd>{pad ? 'Stick / D-pad' : 'A D or arrows'}</dd>
      <dt>Jump</dt>
      <dd>{pad ? 'A — twice, the second is a wingbeat' : 'Space — twice, the second is a wingbeat'}</dd>
      <dt>Flare</dt>
      <dd>{pad ? 'X or a trigger' : 'Shift'}</dd>
      <dt>Kindle</dt>
      <dd>Walk into a wick-stone</dd>
      <dt>Pause</dt>
      <dd>{pad ? 'Start' : 'Esc'}</dd>
    </dl>
  )
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    // Refused, or not allowed from here. The window still works.
  }
}
