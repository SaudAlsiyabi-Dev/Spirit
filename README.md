# Emberwake

You are the Wick: a small lamp that learned to walk, carrying a flame that is
going out. Along the way stand wick-stones, dead and cold. Kindling one refills
you, fixes where you come back to, and wakes the colour in that stretch of the
world. Light the last one and you are through.

The world has gone out, and it lights up behind you as you pass. Light is not
decoration here — it is the clock, the health and the score at once.

A Windows desktop game, built from a web build, so the game itself is a folder
of files with no server and no network.

## Playing it

You need [Node.js](https://nodejs.org) (any version from 20 on). Then:

```
git clone https://github.com/SaudAlsiyabi-Dev/Spirit.git
cd Spirit
npm install
npm run dev
```

That prints a `http://localhost:5180` link — open it and press Begin. Ctrl+C in
the terminal stops it.

`npm run dev` is the quickest way to play. Building an installer, below, is for
when you want it as a real application with its own window and icon.

## Frame rate

The simulation runs at a fixed sixty steps a second and draws once per step,
so the game plays identically on any machine and a 120Hz or 144Hz display does
not speed it up or change how a jump feels. On a display that cannot reach 60
the clock still keeps real time — it banks the shortfall and catches up, so the
run slows in its drawing rather than in its timing.

## Building the Windows app

Two routes. Both produce an installer; pick on how much you mind the size.

### Tauri — about 5–10 MB

Uses the WebView2 runtime that ships with Windows 10 and 11, so the app carries
only the game. Needs the Rust toolchain installed once:

1. Install Rust: https://rustup.rs
2. Install the Microsoft C++ Build Tools when rustup asks for them.
3. Then:

```
npm run app:dev      # run it in a real window while working
npm run app:build    # writes an installer to src-tauri/target/release/bundle
```

You will need an icon before `app:build` succeeds: put a square `.ico` at
`src-tauri/icons/icon.ico`.

### Electron — about 80–150 MB

Needs nothing but Node, which you already have. Ships a whole browser inside
the installer, which is where the size goes.

```
npm run exe          # writes an installer to release/
```

## The art

Four places are painted: the Hollow, the Drowned Steps, the Ashen Reach and the
Undergrove, each a sky, three parallax bands and its own ledges. A run picks one
from its seed. The Glasswood is written but held out of the rotation until its
sky, far and near bands exist.

`ART-NEXT.md` is the current brief — the file to upload to ChatGPT.
`ART-PROMPTS.md` was the first one, and `ART-ASSETS.md` has the workflow and the
troubleshooting.

Anything not yet painted is drawn as vector art instead, so the game runs
complete at every stage.

```
pip install pillow numpy
python3 scripts/key-assets.py
```

That keys the magenta backdrop out of whatever is in `public/game/raw/`, crops,
resizes and compresses it into `public/game/`. It takes a folder as an argument
if the art is somewhere else. The generator names its own files, so `ALIASES` in
that script maps each slot to the name the painting actually arrived under
rather than renaming fifty files by hand.

## Controls

| | Keyboard | Gamepad |
| --- | --- | --- |
| Move | A D or arrows | Stick or d-pad |
| Jump | Space — twice, the second is a wingbeat | A — twice |
| Flare | Shift | X or a trigger |
| Kindle | walk into a wick-stone | |
| Pause | Esc | Start |
| Fullscreen | F11 | |

## How it is put together

- `src/level.ts` — the world and the physics numbers. No drawing, so a level can
  be checked on its own, which matters because a generated level that cannot be
  finished does not look any different from one that can.
- `src/input.ts` — keyboard and gamepad folded into one shape. Pads are polled
  because the browser fires no events for them.
- `src/Game.tsx` — the loop and everything drawn.
- `src/App.tsx` — title, pause and the end of a run.

Two things worth knowing before changing the drawing:

**Never composite a full-screen offscreen canvas per frame.** An earlier version
did, and it measured 26ms a frame on its own against a 16.7ms budget, with
everything else together coming to 0.4ms. Gradients and fills straight onto the
target are cheap; copying a layer the size of the window is not.

**Character poses must share a frame, a scale and a ground line.** A sprite is
drawn at a fixed height, so a pose that fills less of its own frame comes out
larger on screen. Three poses framed by eye arrived at 0.64, 0.67 and 0.71 of
their frames — an eleven percent jump in the creature every time it started
running. `normalise_pose()` in the keying script is what holds them together.

**A jump clears 6.6 tiles across and 3.07 up.** Those come from the physics in
`level.ts` rather than from taste, and the level generator stays inside roughly
half of them. Change gravity or jump strength and the limits move with them, but
`playable()` is what proves a level is still finishable.
