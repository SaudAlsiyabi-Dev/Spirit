/**
 * Everything that can tell the runner what to do.
 *
 * Keyboard and gamepad are folded into one shape before the game sees them, so
 * nothing downstream has to care which is in use — and both can be used at once,
 * which people genuinely do.
 *
 * Gamepads are polled rather than evented: the browser gives no events for them
 * at all, so the pad is read fresh once per frame. That also makes an analogue
 * stick straightforward, since what matters is where it is now, not that it
 * moved.
 */

export type Intent = {
  /** -1 to 1. Analogue from a stick, hard over from a key. */
  move: number
  jump: boolean
  dash: boolean
}

const KEYS: Record<string, keyof typeof held> = {
  ArrowLeft: 'left',
  a: 'left',
  ArrowRight: 'right',
  d: 'right',
  ArrowUp: 'jump',
  w: 'jump',
  ' ': 'jump',
  Shift: 'dash',
  Control: 'dash',
  x: 'dash',
  j: 'dash',
}

const held = { left: false, right: false, jump: false, dash: false }

/** A stick is never quite centred, so a little of the middle is ignored. */
const DEAD_ZONE = 0.28

let pausePressed = false

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    pausePressed = true
    return
  }
  const what = KEYS[e.key] ?? KEYS[e.key.toLowerCase()]
  if (!what) return
  e.preventDefault()
  held[what] = true
}

function onKeyUp(e: KeyboardEvent) {
  const what = KEYS[e.key] ?? KEYS[e.key.toLowerCase()]
  if (!what) return
  held[what] = false
}

export function listen(): () => void {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    for (const k of Object.keys(held) as (keyof typeof held)[]) held[k] = false
  }
}

/** The first gamepad with anything on it, or nothing. */
function pad(): Gamepad | null {
  const pads = navigator.getGamepads?.() ?? []
  for (const p of pads) if (p) return p
  return null
}

/**
 * Takes the pending pause, if there is one, and clears it.
 *
 * Pausing is owned by the menu rather than by the run, because the run stops
 * being stepped the moment it is paused — so a latch drained only inside the
 * loop would sit there until play resumed and then immediately pause it again.
 */
let padPauseWas = false

export function takePause(): boolean {
  let pressed = pausePressed
  pausePressed = false

  const gp = pad()
  const padPause = !!gp?.buttons[9]?.pressed
  if (padPause && !padPauseWas) pressed = true
  padPauseWas = padPause

  return pressed
}

export function read(): Intent {
  let move = (held.right ? 1 : 0) - (held.left ? 1 : 0)
  let jump = held.jump
  let dash = held.dash

  const gp = pad()
  if (gp) {
    const stick = gp.axes[0] ?? 0
    if (Math.abs(stick) > DEAD_ZONE) {
      // Rescaled past the dead zone, so a small push is still a slow walk
      // rather than jumping straight to a third of full speed.
      const past = (Math.abs(stick) - DEAD_ZONE) / (1 - DEAD_ZONE)
      move = Math.sign(stick) * Math.min(1, past)
    }
    // The standard mapping: 12-15 are the d-pad, 0 is the bottom face button.
    if (gp.buttons[14]?.pressed) move = -1
    if (gp.buttons[15]?.pressed) move = 1
    jump = jump || !!gp.buttons[0]?.pressed || !!gp.buttons[12]?.pressed
    dash = dash || !!gp.buttons[2]?.pressed || !!gp.buttons[5]?.pressed || !!gp.buttons[7]?.pressed
  }

  return { move: Math.max(-1, Math.min(1, move)), jump, dash }
}

export function hasPad(): boolean {
  return pad() !== null
}

/** A short rumble, where there is a pad that can do it. Silently ignored if not. */
export function rumble(strength = 0.4, ms = 90): void {
  const gp = pad() as (Gamepad & { vibrationActuator?: { playEffect: (t: string, o: object) => Promise<unknown> } }) | null
  try {
    void gp?.vibrationActuator?.playEffect('dual-rumble', {
      duration: ms,
      strongMagnitude: strength,
      weakMagnitude: strength * 0.6,
    })
  } catch {
    // Decoration; never worth an error.
  }
}
