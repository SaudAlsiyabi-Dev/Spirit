# Art assets for Glow

Twelve images. Each one has a prompt below you can paste straight into ChatGPT
with nothing added.

Written for ChatGPT specifically — its three picture shapes, its unreliable
transparency — but only two things here are ChatGPT-shaped, so if you switch
tools later see "Using something else" at the bottom. Nothing is wasted.

---

## How this works

ChatGPT will not reliably give you a real transparent background. So **every
cut-out asset is generated on flat magenta**, and `scripts/key-assets.py` removes
it. That script is written and tested: on a soft-edged glowing subject it leaves
zero tinted pixels and no halo. You do not have to think about it.

**One rule this depends on: nothing in the artwork may be magenta or hot pink.**
That is the key colour. Every prompt below already says so. It is why the thorns
are amber rather than the pink you might expect.

ChatGPT only makes three shapes — square, landscape, portrait. Each asset below
says which to ask for. Don't fight it for other sizes; the script crops and
resizes.

### The three steps

1. Generate each image and save it as `public/game/raw/<name>.png` — the exact
   name in each heading. A `.jpg` is fine too.
2. `pip install pillow numpy`
3. `python3 scripts/key-assets.py`

It keys out the magenta, crops the one asset that needs it, resizes everything,
and writes finished files to `public/game/`. Run it as often as you like — it
never touches your originals, so regenerating one image and re-running is safe.

**You don't need the full set to see something.** The game draws anything
missing as the vector art it uses now, so do them one at a time and run the
script whenever you want to look.

### Don't make a particle image

The old list had one. The code generates it — a soft radial glow is a few lines
of maths and comes out cleaner than a painted one, and it gets tinted a dozen
different colours at runtime.

---

## The style block

Every prompt below already contains this. It is repeated in full each time on
purpose: each generation is independent and remembers nothing of the last. If
you edit it, edit it everywhere, or the layers won't look like one world.

> Lush painterly game art in the style of a hand-painted 2D platformer.
> Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
> with warm gold and soft mint-green light accents. Strong atmospheric depth,
> volumetric haze, glowing rim light. Rich but desaturated darks, luminous
> highlights. No outlines, no cel shading, no text, no watermark, no UI.
> Absolutely no magenta, pink or hot purple anywhere in the image.

---

## 1. Backgrounds — the four parallax bands

These slide past at different speeds, which is what makes a flat canvas look
deep. Furthest first.

### `sky.png` — ask for **landscape**
No magenta needed on this one; it's a solid backdrop.

> Lush painterly game art in the style of a hand-painted 2D platformer.
> Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
> with warm gold and soft mint-green light accents. Strong atmospheric depth,
> volumetric haze, glowing rim light. Rich but desaturated darks, luminous
> highlights. No outlines, no cel shading, no text, no watermark, no UI.
> Absolutely no magenta, pink or hot purple anywhere in the image.
> Subject: an empty night sky over a forest valley, seen from within the valley.
> A large pale moon in the upper right with soft bloom around it, faint stars, a
> low wash of green aurora on the horizon, drifting mist. The bottom third fades
> into dark haze containing nothing. Wide panoramic composition, completely
> empty of trees, ground, creatures and foreground objects.

### `hills-far.png` — ask for **landscape**

> [paste the style block]
> Subject: a distant mountain ridge in silhouette seen through heavy blue night
> haze, very low contrast, almost dissolving into the air. Soft rounded peaks,
> no detail, no trees. The ridge occupies only the bottom 40% of the frame.
> Everything above the ridge line is a flat solid background of pure magenta
> #FF00FF. No sky, no stars, no gradient in the magenta — flat pure magenta.

### `forest-mid.png` — ask for **landscape**

> [paste the style block]
> Subject: a band of tall slender night-forest trees in silhouette seen from the
> side, trunks rising out of the top of the frame, with a few drooping branches
> and hanging vines. Dark blue-teal, backlit by a faint mint-green glow seeping
> between the trunks. The trees occupy the lower two thirds of the frame.
> Everything not tree is a flat solid background of pure magenta #FF00FF. No
> ground, no sky — flat pure magenta behind and above everything.

### `fronds-near.png` — ask for **landscape**

> [paste the style block]
> Subject: large out-of-focus foreground fern fronds and broad leaves in very
> dark near-black teal, heavily blurred as though inches from the lens, with a
> few tiny glowing green spore lights caught among them. They hang down from the
> top edge and rise from the bottom edge, leaving the entire middle of the frame
> empty. The empty middle and all other empty space is a flat solid background
> of pure magenta #FF00FF.

---

## 2. Terrain

### `ledge-body.png` — ask for **square**
No magenta needed; this one is solid rock edge to edge. If ChatGPT can make the
left and right edges match so it repeats seamlessly, lovely — but it is not
required, the code blends the joins.

> [paste the style block]
> Subject: a seamless repeating texture of damp dark rock and packed earth, the
> cross-section of a cliff face seen from the side. Deep blue-black stone with
> faint mineral veins catching a trace of teal light and a few scattered roots.
> Even lighting across the whole image with no single light source. No top edge,
> no grass, no sky, no horizon — rock filling the entire frame.

### `ledge-top.png` — ask for **landscape**
This is the most important image in the set: the glowing line along every
platform, the thing your eye follows. The script crops the middle band out, so
compose it with the glow running across the centre.

> [paste the style block]
> Subject: a horizontal band of glowing moss and small luminous plants growing
> along the top edge of a rock ledge, seen from the side, running the full width
> of the frame across the exact middle. Vivid mint-green and cyan
> bioluminescence, brightest at the lip and fading downward into darkness, with
> tiny glowing flowers and curled shoots. The top third and bottom third of the
> frame are a flat solid background of pure magenta #FF00FF.

---

## 3. The character

**Three poses, not an animation.** Ask for the idle one first, then **upload it
back to ChatGPT** and ask for the other two — it accepts images as reference and
that is the best consistency you will get from any of these tools. The code does
the leaning, squashing, stretching and the light trail; you only need three
clean poses.

All three: ask for **square**, facing **right**.

### `spirit-idle.png`

> [paste the style block]
> Subject: a small luminous forest spirit, one character centred in frame, facing
> right in profile, standing calmly. Cat-sized, with a pale glowing white-mint
> body, large dark gentle eyes, long ears or fronds trailing back from its head,
> and a wispy tail of light. It gives off a soft glow. Full body, nothing cut
> off. No ground, no shadow, no scenery. The entire background is a flat solid
> pure magenta #FF00FF.

### `spirit-run.png`

> [paste the style block]
> Subject: the same small luminous forest spirit — pale glowing white-mint body,
> large dark gentle eyes, long trailing ears, wispy tail of light — centred in
> frame, facing right in profile, mid-stride at a full run. Leaning forward into
> the run, ears and tail streaming backward, legs extended. Full body, nothing
> cut off. No ground, no shadow, no motion blur streaks, no scenery. The entire
> background is a flat solid pure magenta #FF00FF.

### `spirit-jump.png`

> [paste the style block]
> Subject: the same small luminous forest spirit — pale glowing white-mint body,
> large dark gentle eyes, long trailing ears, wispy tail of light — centred in
> frame, facing right in profile, at the top of a leap. Body stretched upward and
> arched, limbs tucked, ears and tail swept up behind it. Full body, nothing cut
> off. No ground, no shadow, no scenery. The entire background is a flat solid
> pure magenta #FF00FF.

---

## 4. Props

### `mote.png` — ask for **square**
The thing you collect.

> [paste the style block]
> Subject: a single floating seed of golden light centred in the frame, like a
> glowing dandelion seed or a tiny warm spirit flame. Brilliant warm gold-white
> core with soft fronds of light radiating outward and a gentle halo. Nothing
> else in the frame. The entire background is a flat solid pure magenta #FF00FF.

### `thorn.png` — ask for **landscape**
The hazard. Amber rather than pink **because pink is the key colour** — a magenta
thorn would be cut out along with the background.

> [paste the style block]
> Subject: a low cluster of sharp crystalline thorns growing upward from a narrow
> base, seen from the side, three to five needle-sharp spikes of varying height
> across the width of the frame. Burning amber and deep orange crystal with a hot
> golden inner glow, clearly dangerous. The bottom edge is where they meet the
> ground. No ground, no soil, no scenery. All space around the thorns is a flat
> solid pure magenta #FF00FF.

### `goal.png` — ask for **portrait**
The end of the level.

> [paste the style block]
> Subject: a tall ancient spirit tree glowing from within, its trunk split by a
> doorway of pure warm light, roots curling outward at the base. Radiant mint and
> gold bloom pours out of the opening and motes of light rise from it.
> Awe-inspiring and welcoming, the destination at the end of a journey. Centred,
> full height, nothing cut off. No ground line, no scenery. The entire background
> is a flat solid pure magenta #FF00FF.

---

## If a prompt misbehaves

- **It made a checkerboard instead of magenta.** It has tried to draw
  "transparent". Reply: "Fill the entire background with flat solid magenta
  #FF00FF. Do not draw a checkerboard or transparency pattern."
- **The magenta leaked into the subject.** Reply: "Keep magenta strictly in the
  background. Nothing in the subject may be pink or magenta."
- **It cropped the character's ears or tail.** Reply: "Zoom out. The whole
  creature must fit inside the frame with space around it."
- **The three spirits look like different creatures.** Upload the idle image and
  say "the same creature as this image, in this pose instead".
- **Anything else** — send me what you got and I'll rewrite the prompt. Don't
  spend an hour fighting one image.

---

## Using something else

Only two things in this document are ChatGPT-specific: the three fixed picture
shapes, and generating on magenta instead of transparency. Everything else — the
asset list, the style block, the subjects — carries over unchanged.

- **A tool with real transparent PNG export** (Recraft, Adobe Firefly, Stable
  Diffusion with LayerDiffuse): drop the magenta sentence from each prompt and
  ask for a transparent background. The script passes already-transparent images
  through untouched, so the rest of the pipeline is the same.
- **A tool that takes any aspect ratio** (Midjourney `--ar 21:9`): ask for the
  four background bands at 21:9 and `ledge-top.png` at 32:10 as a strip. Better
  results than cropping a landscape image, and the script copes with either.
- **Video-first platforms** (Higgsfield and similar) are built for cinematic
  motion and photoreal stills. That's a different job from flat painterly game
  art with cut-outs — I'd not start there for this.
