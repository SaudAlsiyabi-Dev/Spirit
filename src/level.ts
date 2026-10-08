/**
 * The world of the platformer, and the numbers that make it feel right.
 *
 * Everything here is the level and the rules — no drawing — so a level can be
 * checked on its own, which matters because a generated level that cannot be
 * finished is not obvious by looking at it.
 *
 * Levels are built from a seed rather than from Math.random, so two people
 * given the same seed get the identical run. That is what makes racing each
 * other down the same level possible later.
 *
 * Distances are in tiles and times in seconds. Gravity and jump strength are
 * expressed that way too, so the physics does not change meaning if the tile
 * size on screen changes.
 */

export type Point = { x: number; y: number }

/** A ledge to stand on. Solid on top, passed through from below. */
export type Ledge = { x: number; y: number; w: number }

export type Mote = { id: number; x: number; y: number; taken: boolean }
export type Thorn = { x: number; y: number; w: number }

export type Level = {
  /** How far the level runs, in tiles. */
  length: number
  ledges: Ledge[]
  motes: Mote[]
  thorns: Thorn[]
  start: Point
  /** Where the level is won. */
  goal: Point
  seed: number
}

/* ---- How it moves -------------------------------------------------------- */

export const GRAVITY = 62
export const FALL_CAP = 34
export const RUN = 10.5
export const RUN_ACCEL = 95
export const RUN_BRAKE = 70
export const AIR_ACCEL = 55
export const JUMP = 19.5
/** Letting go early cuts the jump short, which is what makes height a choice. */
export const JUMP_CUT = 0.42
export const DOUBLE_JUMP = 17
/** Still jumpable for a moment after walking off an edge. */
export const COYOTE = 0.1
/** A jump pressed just before landing still counts. */
export const BUFFER = 0.13
export const DASH = 24
export const DASH_TIME = 0.17
export const DASH_COOLDOWN = 0.55
/** Half-width and half-height of the body, in tiles. */
export const HALF_W = 0.3
export const HALF_H = 0.42

/** Deterministic random, so a seed always builds the same level (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const newSeed = () => Math.floor(Math.random() * 0xffffffff)

/**
 * How far and how high a single jump can carry you.
 *
 * Worked out from the physics rather than guessed, so the generator below can
 * never place a gap the player cannot clear: rise time is JUMP/GRAVITY, the
 * height reached is JUMP²/2g, and the distance is the run speed across the
 * whole hang time. Both are then cut back, because a level that is only just
 * possible on every jump is miserable to play.
 */
export const MAX_RISE = (JUMP * JUMP) / (2 * GRAVITY)
export const MAX_GAP = RUN * ((2 * JUMP) / GRAVITY)
const SAFE_RISE = MAX_RISE * 0.52
const SAFE_GAP = MAX_GAP * 0.46

/** The floor of the world: fall past this and the run is over. */
export const FLOOR = 19

export function generateLevel(seed: number, length = 230): Level {
  const random = rng(seed)
  const ledges: Ledge[] = []
  const motes: Mote[] = []
  const thorns: Thorn[] = []

  // Opening ground, wide and flat, so nobody dies before they have moved.
  let x = 0
  let y = 13
  ledges.push({ x: -4, y, w: 16 })
  x = 12

  let moteId = 0
  while (x < length) {
    const gap = 1.6 + random() * (SAFE_GAP - 1.6)
    // Rise is the limit that matters; dropping is free, so falls can be deeper.
    const climb = random() < 0.5
    const change = climb
      ? -(0.5 + random() * SAFE_RISE)
      : 0.5 + random() * (SAFE_RISE * 1.7)

    y = Math.max(4, Math.min(FLOOR - 2, y + change))
    const w = 3 + random() * 7

    ledges.push({ x: x + gap, y, w })

    // A mote over the gap, which is what pulls you into making the jump.
    if (random() < 0.72) {
      motes.push({ id: moteId++, x: x + gap * 0.5, y: y - 1.4 - random() * 1.6, taken: false })
    }
    // Thorns only on ledges long enough to land beside them.
    if (w > 5.5 && random() < 0.4) {
      thorns.push({ x: x + gap + w * 0.45, y, w: 1.2 })
    }

    x += gap + w
  }

  const last = ledges[ledges.length - 1]
  return {
    length: x,
    ledges,
    motes,
    thorns,
    start: { x: 2, y: 11 },
    goal: { x: last.x + last.w * 0.5, y: last.y - 1 },
    seed,
  }
}

/**
 * Is every ledge reachable from the one before it?
 *
 * Walked rather than trusted: the generator keeps inside the safe limits by
 * construction, but a change to those numbers that quietly makes a level
 * impossible would otherwise only show up as someone stuck halfway.
 */
export function playable(level: Level): { ok: boolean; worstGap: number; worstRise: number } {
  let worstGap = 0
  let worstRise = 0
  for (let i = 1; i < level.ledges.length; i++) {
    const from = level.ledges[i - 1]
    const to = level.ledges[i]
    const gap = to.x - (from.x + from.w)
    const rise = from.y - to.y
    worstGap = Math.max(worstGap, gap)
    worstRise = Math.max(worstRise, rise)
  }
  return { ok: worstGap <= MAX_GAP && worstRise <= MAX_RISE, worstGap, worstRise }
}

/** The ledge directly under a point, if the body would land on it. */
export function groundUnder(level: Level, x: number, y: number, fallen: number): Ledge | null {
  for (const ledge of level.ledges) {
    if (x + HALF_W < ledge.x || x - HALF_W > ledge.x + ledge.w) continue
    const top = ledge.y
    // Only catches a body crossing the surface downwards this frame, so you
    // drop through a ledge from below rather than bouncing off its underside.
    if (y + HALF_H >= top && y + HALF_H - fallen <= top + 0.001) return ledge
  }
  return null
}

/** Is the body overlapping this ledge's solid body at all? */
export function onLedge(level: Level, x: number, y: number): Ledge | null {
  for (const ledge of level.ledges) {
    if (x + HALF_W < ledge.x || x - HALF_W > ledge.x + ledge.w) continue
    if (Math.abs(y + HALF_H - ledge.y) < 0.08) return ledge
  }
  return null
}

export function touchingThorn(level: Level, x: number, y: number): boolean {
  for (const thorn of level.thorns) {
    if (x + HALF_W < thorn.x || x - HALF_W > thorn.x + thorn.w) continue
    if (Math.abs(y + HALF_H - thorn.y) < 0.5) return true
  }
  return false
}
