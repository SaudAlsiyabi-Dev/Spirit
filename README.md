# Glow

A side-on run through a glowing forest. Windows desktop app, built from a web
build — so the game itself is a folder of files with no server and no network.

## Running it while working on it

```
npm install
npm run dev          # opens on http://localhost:5180
```

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

Twelve painted assets, four of them done. `ART-PROMPTS.md` is the file to upload
to ChatGPT; `ART-ASSETS.md` is the one for you, with the workflow and the
troubleshooting.

Anything not yet painted is drawn as vector art instead, so the game runs
complete at every stage.

```
pip install pillow numpy
python3 scripts/key-assets.py
```

That keys the magenta backdrop out of whatever is in `public/game/raw/`, crops,
resizes and compresses it into `public/game/`.

## Controls

| | Keyboard | Gamepad |
| --- | --- | --- |
| Move | A D or arrows | Stick or d-pad |
| Jump | Space — twice in the air | A — twice in the air |
| Dash | Shift | X or a trigger |
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

**A jump clears 6.6 tiles across and 3.07 up.** Those come from the physics in
`level.ts` rather than from taste, and the level generator stays inside roughly
half of them. Change gravity or jump strength and the limits move with them, but
`playable()` is what proves a level is still finishable.
