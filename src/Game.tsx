import { useEffect, useRef, useState } from 'react'
import {
  AIR_ACCEL,
  BUFFER,
  COYOTE,
  DASH,
  DASH_COOLDOWN,
  DASH_TIME,
  DOUBLE_JUMP,
  FALL_CAP,
  FLOOR,
  GRAVITY,
  HALF_H,
  JUMP,
  JUMP_CUT,
  RUN,
  RUN_ACCEL,
  RUN_BRAKE,
  generateLevel,
  groundUnder,
  rng,
  touchingThorn,
  type Level,
} from './level'
import { listen, read, rumble } from './input'

/**
 * The run itself: a canvas filling the window, and the loop that drives it.
 *
 * Depth is parallax — far hills, near forest, the play layer, and fronds across
 * the lens, each sliding at its own rate. Everything is drawn straight onto the
 * one canvas: compositing a full-screen offscreen layer every frame measured at
 * 26ms on its own during development, against a 16.7ms budget, and is the one
 * thing that will not fit without a GPU certainly behind it.
 *
 * The feel rests on three things that are invisible when present and awful when
 * missing: coyote time, a jump buffer, and a jump whose height follows how long
 * the button is held.
 */

/** Tiles across the window. A wide screen earns a wider view than a phone did. */
const VIEW = 26
const LIVES = 3
const TRAIL = 110
const SPARKS = 150

export type Outcome = { won: boolean; motes: number; reach: number; score: number }

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number }

const ART: Record<string, HTMLImageElement> = {}

function art(name: string): HTMLImageElement {
  let img = ART[name]
  if (!img) {
    img = new Image()
    img.src = `./game/${name}.webp`
    ART[name] = img
  }
  return img
}

const painted = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0

/**
 * The sky, covering the screen once and never repeating.
 *
 * The other layers tile, but the sky cannot: it holds a moon, and a tiled moon
 * comes out as a row of them. So it is scaled to cover and then panned within
 * whatever slack that leaves, clamped at both ends. The drift is slight, which
 * suits the furthest layer anyway — a sky is the one thing that should barely
 * move.
 */
function cover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  shiftX: number,
  w: number,
  h: number,
): void {
  // Over-scaled a little past the viewport, so there is slack to pan through.
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.18
  const width = img.naturalWidth * scale
  const height = img.naturalHeight * scale
  const slack = Math.max(0, width - w)
  const x = -slack / 2 - Math.max(-slack / 2, Math.min(slack / 2, shiftX))
  ctx.drawImage(img, x, h - height, width, height)
}

/**
 * A background band repeating across the screen, every other copy mirrored.
 *
 * Mirroring lets a painting that was never made to tile repeat without a seam:
 * the right edge of one copy is the right edge of the next, so they always meet
 * exactly. The cost is a symmetry you could spot if you stopped and stared,
 * which at the speed these move nobody does.
 */
function band(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  shiftX: number,
  bottom: number,
  height: number,
  w: number,
): void {
  const width = img.naturalWidth * (height / img.naturalHeight)
  const span = width * 2
  let x = -(((shiftX % span) + span) % span)
  while (x < w) {
    ctx.drawImage(img, x, bottom - height, width, height)
    ctx.save()
    ctx.translate(x + width * 2, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(img, 0, bottom - height, width, height)
    ctx.restore()
    x += span
  }
}

export default function Game({
  seed,
  paused,
  onEnd,
}: {
  seed: number
  paused: boolean
  onEnd: (outcome: Outcome) => void
}) {
  const [motes, setMotes] = useState(0)
  const [lives, setLives] = useState(LIVES)
  const [reach, setReach] = useState(0)

  const canvas = useRef<HTMLCanvasElement | null>(null)
  const pausedRef = useRef(paused)
  const onEndRef = useRef(onEnd)
  useEffect(() => {
    pausedRef.current = paused
    onEndRef.current = onEnd
  })

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d', { alpha: false })
    if (!ctx) return

    let stopped = false
    let frame = 0
    let last = 0

    const level: Level = generateLevel(seed)
    const scenery = makeScenery(seed, level.length)

    let px = level.start.x
    let py = level.start.y
    let vx = 0
    let vy = 0
    let facing = 1
    let grounded = false
    let coyote = 0
    let buffered = 0
    let jumpsLeft = 2
    let wasJump = false
    let holding = false
    let dashing = 0
    let dashReady = 0
    let life = LIVES
    let collected = 0
    let checkpoint = { x: level.start.x, y: level.start.y }
    let dead = 0
    let over = false
    let best = 0
    let shake = 0

    const camera = { x: level.start.x, y: level.start.y }
    const trail: Particle[] = []
    const sparks: Particle[] = []

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      el!.width = Math.max(1, Math.round(el!.clientWidth * dpr))
      el!.height = Math.max(1, Math.round(el!.clientHeight * dpr))
    }

    function burst(x: number, y: number, n: number, hue: number, speed: number, life: number) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * speed * (0.4 + Math.random()),
          vy: Math.sin(a) * speed * (0.4 + Math.random()),
          life,
          max: life,
          hue,
        })
      }
    }

    function die() {
      if (dead > 0 || over) return
      life -= 1
      setLives(life)
      dead = 0.8
      shake = 1
      rumble(0.7, 180)
      burst(px, py, 30, 32, 7, 0.6)
      if (life <= 0) {
        over = true
        onEndRef.current({
          won: false,
          motes: collected,
          reach: Math.round((Math.min(best, level.length) / level.length) * 100),
          score: score(collected, best, false),
        })
      }
    }

    function step(dt: number) {
      if (over) return
      const input = read()

      if (dead > 0) {
        dead -= dt
      if (dead <= 0) {
          px = checkpoint.x
          py = checkpoint.y - 1
          vx = 0
          vy = 0
          dashing = 0
          camera.x = px
          camera.y = py
        }
        return
      }

      // Edge-detected: holding the button must not pump the jump.
      if (input.jump && !wasJump) buffered = BUFFER
      wasJump = input.jump
      holding = input.jump

      if (input.dash && dashReady <= 0 && dashing <= 0) {
        dashing = DASH_TIME
        dashReady = DASH_COOLDOWN
        vy = 0
        rumble(0.3, 70)
        for (let i = 0; i < 16; i++) {
          sparks.push({
            x: px,
            y: py,
            vx: -facing * (2 + Math.random() * 7),
            vy: (Math.random() - 0.5) * 5,
            life: 0.35,
            max: 0.35,
            hue: 190,
          })
        }
      }

      coyote = Math.max(0, coyote - dt)
      buffered = Math.max(0, buffered - dt)
      dashReady = Math.max(0, dashReady - dt)
      shake = Math.max(0, shake - dt * 3)

      const want = input.move
      if (Math.abs(want) > 0.1) facing = Math.sign(want)

      if (dashing > 0) {
        dashing -= dt
        vx = facing * DASH
        vy = 0
      } else {
        const rate = Math.abs(want) < 0.1 ? RUN_BRAKE : grounded ? RUN_ACCEL : AIR_ACCEL
        vx += (want * RUN - vx) * Math.min(1, (rate / RUN) * dt)
        if (Math.abs(want) < 0.1 && Math.abs(vx) < 0.05) vx = 0
        vy = Math.min(FALL_CAP, vy + GRAVITY * dt)
        if (!holding && vy < 0) vy += GRAVITY * JUMP_CUT * dt
      }

      if (buffered > 0 && (grounded || coyote > 0 || jumpsLeft > 0)) {
        const first = grounded || coyote > 0
        vy = -(first ? JUMP : DOUBLE_JUMP)
        if (!first) jumpsLeft -= 1
        buffered = 0
        coyote = 0
        grounded = false
        rumble(0.2, 50)
        burst(px, py + HALF_H, first ? 10 : 16, first ? 150 : 275, 3.5, 0.3)
      }

      const fell = vy * dt
      px += vx * dt
      py += fell

      const wasAir = !grounded
      const ledge = vy >= 0 ? groundUnder(level, px, py, fell) : null
      if (ledge) {
        py = ledge.y - HALF_H
        if (wasAir && vy > 6) burst(px, py + HALF_H, 10, 120, 4, 0.3)
        vy = 0
        grounded = true
        coyote = COYOTE
        jumpsLeft = 1
        checkpoint = { x: Math.max(ledge.x + 1, Math.min(px, ledge.x + ledge.w - 1)), y: ledge.y }
      } else {
        if (grounded) coyote = COYOTE
        grounded = false
      }

      if (px < 0) {
        px = 0
        vx = 0
      }

      if (py > FLOOR + 3 || touchingThorn(level, px, py)) die()

      for (const mote of level.motes) {
        if (mote.taken) continue
        if (Math.hypot(mote.x - px, mote.y - py) > 0.9) continue
        mote.taken = true
        collected += 1
        setMotes(collected)
        rumble(0.25, 60)
        burst(mote.x, mote.y, 14, 48, 4.5, 0.45)
      }

      if (!over && px >= level.goal.x) {
        over = true
        onEndRef.current({
          won: true,
          motes: collected,
          reach: 100,
          score: score(collected, level.length, true),
        })
      }

      best = Math.max(best, px)
      setReach(Math.round((Math.min(best, level.length) / level.length) * 100))

      if (Math.hypot(vx, vy) > 2 && trail.length < TRAIL) {
        trail.push({
          x: px - facing * 0.1,
          y: py,
          vx: -vx * 0.08,
          vy: -vy * 0.04,
          life: 0.4,
          max: 0.4,
          hue: dashing > 0 ? 190 : 165,
        })
      }

      for (const pool of [trail, sparks]) {
        for (let i = pool.length - 1; i >= 0; i--) {
          const p = pool[i]
          p.life -= dt
          if (p.life <= 0) {
            pool.splice(i, 1)
            continue
          }
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.vy += GRAVITY * 0.22 * dt
          p.vx *= 1 - 1.6 * dt
        }
      }
      if (sparks.length > SPARKS) sparks.splice(0, sparks.length - SPARKS)

      camera.x += (px + facing * 2.8 - camera.x) * Math.min(1, 5 * dt)
      camera.y += (py - 0.6 - camera.y) * Math.min(1, 3.4 * dt)
    }

    function draw(now: number) {
      const w = el!.width
      const h = el!.height
      if (!w) return
      const tile = w / VIEW
      const quake = shake > 0 ? shake * shake * 8 : 0
      const ox = w / 2 - camera.x * tile + (Math.random() - 0.5) * quake
      const oy = h * 0.56 - camera.y * tile + (Math.random() - 0.5) * quake

      const skyArt = art('sky')
      if (painted(skyArt)) {
        cover(ctx!, skyArt, camera.x * tile * 0.06, w, h)
      } else {
        const sky = ctx!.createLinearGradient(0, 0, 0, h)
        sky.addColorStop(0, '#0a1020')
        sky.addColorStop(0.45, '#11283c')
        sky.addColorStop(1, '#0d1b24')
        ctx!.fillStyle = sky
        ctx!.fillRect(0, 0, w, h)
      }

      const farArt = art('hills-far')
      if (painted(farArt)) {
        band(ctx!, farArt, camera.x * tile * 0.16, h * 0.92 + camera.y * tile * 0.04, h * 0.72, w)
      } else {
        hills(ctx!, scenery.far, camera.x, tile, w, h, 0.16, '#102236', oy)
      }

      const midArt = art('forest-mid')
      if (painted(midArt)) {
        band(ctx!, midArt, camera.x * tile * 0.34, h * 1.06 + camera.y * tile * 0.08, h * 1.45, w)
      } else {
        hills(ctx!, scenery.near, camera.x, tile, w, h, 0.34, '#0c1b2b', oy)
        trees(ctx!, scenery.trees, ox, oy, tile, w, 0.62, 'rgba(8, 20, 28, 0.95)')
      }

      const leftTile = camera.x - VIEW / 2 - 2
      const rightTile = camera.x + VIEW / 2 + 2

      for (const ledge of level.ledges) {
        if (ledge.x + ledge.w < leftTile || ledge.x > rightTile) continue
        const x = ox + ledge.x * tile
        const y = oy + ledge.y * tile
        const lw = ledge.w * tile

        const body = art('ledge-body')
        if (painted(body)) {
          const size = tile * 2
          ctx!.save()
          ctx!.beginPath()
          ctx!.rect(x, y, lw, h)
          ctx!.clip()
          for (let tx = x; tx < x + lw; tx += size) {
            for (let ty = y; ty < h; ty += size) ctx!.drawImage(body, tx, ty, size, size)
          }
          /*
           * Sunk into silhouette below the lip. A ledge can stand many tiles
           * tall, and carrying a lit rock texture all the way down turns it
           * into a wall that hides the forest the whole scene is built on. The
           * light comes from the moss along the top, so only the top has any
           * business being lit.
           */
          const sink = ctx!.createLinearGradient(0, y, 0, y + tile * 3)
          sink.addColorStop(0, 'rgba(6, 13, 20, 0)')
          sink.addColorStop(1, 'rgba(6, 13, 20, 1)')
          ctx!.fillStyle = sink
          ctx!.fillRect(x, y, lw, h - y)
          ctx!.restore()
        } else {
          ctx!.fillStyle = '#060d14'
          ctx!.fillRect(x, y, lw, h)
        }

        const lip = art('ledge-top')
        if (painted(lip)) {
          /*
           * The lip is a whole slab edge — moss on top, rock beneath it, vines
           * trailing off the underside — not a thin strip, so it hangs well
           * below the platform line. The surface the player stands on sits a
           * little way down the picture rather than at its top, hence the
           * offset: line up the moss, not the bounding box.
           *
           * Copies alternate mirrored, as the background bands do, because the
           * two cut edges of a crop never meet but an edge always meets itself.
           */
          const lipH = tile * 2.6
          const lipW = lipH * (lip.naturalWidth / lip.naturalHeight)
          const top = y - lipH * 0.14
          ctx!.save()
          ctx!.beginPath()
          ctx!.rect(x - 1, y - lipH * 0.4, lw + 2, lipH * 1.6)
          ctx!.clip()
          for (let tx = x; tx < x + lw; tx += lipW * 2) {
            ctx!.drawImage(lip, tx, top, lipW, lipH)
            ctx!.save()
            ctx!.translate(tx + lipW * 2, 0)
            ctx!.scale(-1, 1)
            ctx!.drawImage(lip, 0, top, lipW, lipH)
            ctx!.restore()
          }
          ctx!.restore()
        } else {
          const grad = ctx!.createLinearGradient(0, y - tile * 0.18, 0, y + tile * 0.5)
          grad.addColorStop(0, 'rgba(120, 255, 205, 0.85)')
          grad.addColorStop(0.35, 'rgba(46, 160, 140, 0.5)')
          grad.addColorStop(1, 'rgba(10, 40, 45, 0)')
          ctx!.fillStyle = grad
          ctx!.fillRect(x, y - tile * 0.18, lw, tile * 0.7)
        }
      }

      for (const thorn of level.thorns) {
        if (thorn.x + thorn.w < leftTile || thorn.x > rightTile) continue
        const x = ox + thorn.x * tile
        const y = oy + thorn.y * tile
        const img = art('thorn')
        if (painted(img)) {
          const tw = thorn.w * tile * 1.1
          const th = tw * (img.naturalHeight / img.naturalWidth)
          ctx!.drawImage(img, x, y - th, tw, th)
        } else {
          glow(ctx!, x + (thorn.w * tile) / 2, y, tile * 0.9, '255, 160, 60', 0.34)
          ctx!.fillStyle = '#ffb347'
          for (let i = 0; i < 3; i++) {
            const sx = x + (thorn.w * tile * (i + 0.5)) / 3
            ctx!.beginPath()
            ctx!.moveTo(sx - tile * 0.12, y)
            ctx!.lineTo(sx, y - tile * 0.5)
            ctx!.lineTo(sx + tile * 0.12, y)
            ctx!.closePath()
            ctx!.fill()
          }
        }
      }

      for (const mote of level.motes) {
        if (mote.taken) continue
        if (mote.x < leftTile || mote.x > rightTile) continue
        const x = ox + mote.x * tile
        const y = oy + (mote.y + Math.sin(now / 520 + mote.id) * 0.12) * tile
        const img = art('mote')
        glow(ctx!, x, y, tile * 1.2, '255, 214, 120', 0.55)
        if (painted(img)) {
          const s = tile * 0.8
          ctx!.drawImage(img, x - s / 2, y - s / 2, s, s)
        } else {
          ctx!.fillStyle = '#fff2c8'
          ctx!.beginPath()
          ctx!.arc(x, y, tile * 0.13, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      if (level.goal.x > leftTile - 6 && level.goal.x < rightTile + 6) {
        const x = ox + level.goal.x * tile
        const y = oy + level.goal.y * tile
        const img = art('goal')
        glow(ctx!, x, y, tile * 4 * (1 + Math.sin(now / 600) * 0.05), '150, 255, 230', 0.4)
        if (painted(img)) {
          const gh = tile * 7
          const gw = gh * (img.naturalWidth / img.naturalHeight)
          ctx!.drawImage(img, x - gw / 2, y + tile * 0.6 - gh, gw, gh)
        } else {
          ctx!.strokeStyle = 'rgba(190, 255, 240, 0.9)'
          ctx!.lineWidth = tile * 0.06
          ctx!.beginPath()
          ctx!.arc(x, y, tile * 0.7, 0, Math.PI * 2)
          ctx!.stroke()
        }
      }

      ctx!.globalCompositeOperation = 'lighter'
      for (const pool of [trail, sparks]) {
        for (const p of pool) {
          const t = p.life / p.max
          ctx!.fillStyle = `hsla(${p.hue}, 95%, 72%, ${t * 0.7})`
          ctx!.beginPath()
          ctx!.arc(ox + p.x * tile, oy + p.y * tile, tile * 0.1 * t + tile * 0.02, 0, Math.PI * 2)
          ctx!.fill()
        }
      }
      ctx!.globalCompositeOperation = 'source-over'

      if (dead <= 0) {
        const x = ox + px * tile
        const y = oy + py * tile
        const stretch = Math.max(-0.3, Math.min(0.3, vy / 46))
        glow(ctx!, x, y, tile * 2.4, '160, 255, 230', 0.45)

        const moving = Math.abs(vx) > 1.5
        const pose = art(!grounded ? 'spirit-jump' : moving ? 'spirit-run' : 'spirit-idle')
        if (painted(pose)) {
          const ph = tile * 1.5 * (1 + stretch)
          const pw = ph * (pose.naturalWidth / pose.naturalHeight) * (1 - stretch)
          ctx!.save()
          ctx!.translate(x, y)
          ctx!.scale(facing, 1)
          ctx!.drawImage(pose, -pw / 2, -ph * 0.58, pw, ph)
          ctx!.restore()
        } else {
          ctx!.fillStyle = '#eafff8'
          ctx!.beginPath()
          ctx!.ellipse(x, y, tile * 0.3 * (1 - stretch), tile * 0.36 * (1 + stretch), 0, 0, Math.PI * 2)
          ctx!.fill()
          ctx!.fillStyle = 'rgba(20, 60, 60, 0.9)'
          for (const side of [-0.34, 0.34]) {
            ctx!.beginPath()
            ctx!.arc(x + facing * tile * 0.08 + side * tile * 0.16, y - tile * 0.05, tile * 0.05, 0, Math.PI * 2)
            ctx!.fill()
          }
        }
      }

      const frondArt = art('fronds-near')
      if (painted(frondArt)) {
        ctx!.save()
        ctx!.globalAlpha = 0.92
        band(ctx!, frondArt, camera.x * tile * 1.5, h * 1.06, h * 0.4, w)
        ctx!.restore()
      } else {
        trees(ctx!, scenery.fronds, ox, oy, tile, w, 1.5, 'rgba(3, 9, 14, 0.92)')
      }

      const vign = ctx!.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.95)
      vign.addColorStop(0, 'rgba(0,0,0,0)')
      vign.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx!.fillStyle = vign
      ctx!.fillRect(0, 0, w, h)
    }

    function loop(now: number) {
      if (stopped) return
      const dt = Math.min(0.033, last ? (now - last) / 1000 : 0)
      last = now
      // Paused still draws, so the scene sits behind the menu rather than
      // freezing to black, but nothing moves on.
      if (!pausedRef.current) step(dt)
      draw(now)
      frame = requestAnimationFrame(loop)
    }

    const unlisten = listen()
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()
    frame = requestAnimationFrame(loop)

    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      unlisten()
    }
  }, [seed])

  return (
    <>
      <canvas ref={canvas} className="board" />
      <div className="hud">
        <span className="reach">{reach}%</span>
        <span className="motes">{motes} ✦</span>
        <span className="lives">
          {'♥'.repeat(Math.max(0, lives))}
          <span className="spent">{'♥'.repeat(Math.max(0, LIVES - lives))}</span>
        </span>
      </div>
    </>
  )
}

function score(motes: number, reached: number, finished: boolean): number {
  return motes * 10 + Math.round(reached / 4) + (finished ? 150 : 0)
}

function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rgb: string,
  strength: number,
) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
  grad.addColorStop(0, `rgba(${rgb}, ${strength})`)
  grad.addColorStop(0.5, `rgba(${rgb}, ${strength * 0.35})`)
  grad.addColorStop(1, `rgba(${rgb}, 0)`)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = grad
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  ctx.restore()
}

type Scenery = {
  far: number[]
  near: number[]
  trees: { x: number; h: number; lean: number }[]
  fronds: { x: number; h: number; lean: number }[]
}

/** The fallback scenery, for anything not yet painted. Built once from the seed. */
function makeScenery(seed: number, length: number): Scenery {
  const random = rng(seed ^ 0x9e3779b9)
  const ridge = (points: number, amp: number, base: number) =>
    Array.from({ length: points }, (_, i) => {
      const t = i / points
      return base + Math.sin(t * 9) * amp + Math.sin(t * 23 + seed * 0.001) * amp * 0.4
    })
  return {
    far: ridge(160, 2.2, 8),
    near: ridge(160, 3.1, 11),
    trees: Array.from({ length: Math.ceil(length / 3) }, (_, i) => ({
      x: i * 3 + random() * 2,
      h: 4 + random() * 5,
      lean: (random() - 0.5) * 0.5,
    })),
    fronds: Array.from({ length: Math.ceil(length / 9) }, (_, i) => ({
      x: i * 9 + random() * 4,
      h: 5 + random() * 4,
      lean: (random() - 0.5) * 0.9,
    })),
  }
}

function hills(
  ctx: CanvasRenderingContext2D,
  profile: number[],
  cameraX: number,
  tile: number,
  w: number,
  h: number,
  rate: number,
  fill: string,
  oy: number,
) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(0, h)
  const steps = 56
  for (let i = 0; i <= steps; i++) {
    const at = (cameraX * rate + (i / steps) * (w / tile)) * 1.4
    const idx = ((Math.floor(at) % profile.length) + profile.length) % profile.length
    const nxt = (idx + 1) % profile.length
    const blend = at - Math.floor(at)
    ctx.lineTo((i / steps) * w, oy + (profile[idx] * (1 - blend) + profile[nxt] * blend) * tile)
  }
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fill()
}

function trees(
  ctx: CanvasRenderingContext2D,
  list: { x: number; h: number; lean: number }[],
  ox: number,
  oy: number,
  tile: number,
  w: number,
  rate: number,
  fill: string,
) {
  ctx.fillStyle = fill
  for (const tree of list) {
    const x = ox * rate + tree.x * tile * rate
    if (x < -tile * 3 || x > w + tile * 3) continue
    const base = oy + 14 * tile
    ctx.beginPath()
    ctx.moveTo(x - tile * 0.26, base)
    ctx.quadraticCurveTo(x + tree.lean * tile * 1.2, base - tree.h * tile * 0.6, x + tree.lean * tile * 2.4, base - tree.h * tile)
    ctx.quadraticCurveTo(x + tree.lean * tile * 1.2, base - tree.h * tile * 0.6, x + tile * 0.26, base)
    ctx.closePath()
    ctx.fill()
  }
}
