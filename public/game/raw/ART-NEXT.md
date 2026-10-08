# Second image brief — fixes, then the new world

This replaces nothing in `ART-PROMPTS.md`. That file made the first twelve
images. This one says which of those to keep, which to redo and why, and then
specifies everything the game needs next.

**How to work through this file:**

1. Generate **one image per reply**, in the order listed. Never more than one.
2. After each image, stop and wait for me to say "next". Do not continue on your
   own. I may ask you to redo one before moving on.
3. Use each prompt **exactly as written**. Do not shorten it, rewrite it, merge
   it with the previous one or "improve" the wording. Every prompt repeats the
   same style paragraph on purpose — that repetition is what keeps separately
   generated images looking like one world. It is not an error and must not be
   collapsed.
4. Each prompt says **square**, **landscape** or **portrait**. Use that shape.
5. Where a prompt asks for a **flat solid pure magenta #FF00FF background**, that
   is literal. Paint actual magenta pixels. Do **not** substitute transparency,
   and do **not** draw a checkerboard or any other "transparency" pattern — a
   script keys the magenta out afterwards, and a checkerboard breaks it.
6. **Nothing in the artwork may be magenta, pink or hot purple.** That colour is
   cut out of the final image. Anything painted in it is destroyed.

---

## What this game is, and what it is not

The first round of art drifted toward *Ori and the Will of the Wisps* — a white
forest spirit, a spirit tree, glowing woods. From here the game is its own
thing. Everything below is written to hold that line, so read this section
before generating anything.

**The inversion.** In Ori you travel through a beautiful living world. Here the
world has gone out, and it lights up *behind* you as you pass. You are not a
guest in a bright forest; you are the only lit thing in a dark one, and you
leave it brighter than you found it.

**You are not a spirit animal.** You are the **Wick** — a small lamp that
learned to walk. Body of pale glass and paper panels seamed with gold, a warm
flame burning visibly inside it, four thin dark legs, and two moth wings too
tattered to fly with. Cold shell, warm core. Insect and object, never mammal.
No fur, no paws, no tail, no big round cartoon eyes.

**There is no spirit tree.** The destination is a **wick-stone**: a standing
carved post with a bowl at its top, dead and cold until you kindle it. Lighting
one refuels you, fixes your progress, and wakes the colour in that stretch of
the world. The last one ends the level.

**Your light is a resource, not decoration.** The flame in your chest burns
down the whole time. Embers are fuel. When it runs low the world closes in
around you, and when it goes out, so do you.

**The dark is the enemy.** Not spikes, not thorns. **Gloom** — a living dark
that pools in the low ground, with a rippling pale edge and wisps lifting off
it. It drinks light. It is the one thing in this world that is not beautiful.

**Paint everything lit.** Every background, ledge and prop is painted in its
full kindled colour, as though a wick-stone nearby is already burning. The game
darkens and desaturates it in code for the unlit state and lifts it as you
kindle. Never paint a "dark version" of anything — one painting covers both,
and a second would only disagree with the first.

---

## Part 1 — the first twelve, judged

**Keep exactly as they are.** `sky`, `hills-far`, `fronds-near` (the darker of
the two foliage paintings), `ledge-top`, `ledge-body`. The ledge slab in
particular came back better than it was asked for — the moss, the rock and the
trailing vines together — and the game was changed to suit it.

**Redo — prompts 13 and 14 below.**

- **`forest-mid`** — the gaps between the trunks were painted with sky, mist and
  aurora instead of left flat magenta. That layer sits in front of `sky` and
  `hills-far`, so its painted sky covers both of them and two finished images
  are wasted behind it. The trunks are good. Only the gaps are wrong.

- **`thorn`** — painted gold. The collectible is also gold, the same size, lit
  the same way, and sits on the same platforms. The thing that hurts you must
  never look like the thing you collect. Replaced outright by gloom, below.

**Dropped, not redone.**

- **`goal`** (the glowing tree) — beautiful, and gone with the spirit tree. The
  wick-stone replaces it. Keep the file; it may come back as a landmark prop in
  a later biome.

- **`mote`** — becomes the ember, below. The gold orb wrapped in leaves reads as
  a plant, and this is fire. It was also painted with a wide soft halo, and the
  game already draws its own glow around it, so the two stacked up and it came
  out the size of a moon on screen.

- **`spirit-idle` / `spirit-run` / `spirit-jump`** — superseded by the Wick.

### A rule the three character poses broke, which the new ones must not

The three poses were each framed to fill their own picture: the standing one
upright in a tall frame, the running one stretched right across a wide one. The
game crops every sprite to its content and then draws it at a **fixed height**,
so a pose whose creature is short and wide gets blown up to match one that is
tall and narrow. The character would have changed size every time it started
running.

So, for every pose of every creature:

- **Same square canvas, every pose.**
- **Same creature scale in all of them** — if the body is a third of the frame
  tall in one, it is a third of the frame tall in all of them.
- **Feet on a common baseline**, about 85% of the way down the frame, in every
  pose including the airborne ones. An airborne pose lifts the *legs*, not the
  whole creature up the canvas.
- **Facing right**, always. The game mirrors it to face left.
- **Leave the margins magenta** — do not crop in close on the creature. The
  empty space is what keeps the poses aligned with each other.

---

## Part 2 — the Wick, and what the world does to it

### 13. forest-mid — landscape *(redo)*

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: a row of enormous ancient tree trunks seen from the side, running the
full width of the frame, their bark deep blue-green and traced with faint
glowing moss. The trunks are cut off by the top edge of the frame — no canopy,
no branches, no treetops. Between and behind the trunks there is **nothing at
all**: every gap between one trunk and the next is a flat solid field of pure
magenta #FF00FF, with no sky, no stars, no mist, no fog, no aurora, no distant
hills and no light haze painted into it. The gaps must be flat magenta from the
top edge of the frame to the bottom.

### 14. gloom — landscape

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: a horizontal pool of living darkness lying along the bottom of the
frame, like black liquid, running the full width. Its surface is a slow ripple
catching a thin sickly pale-green rim of light along the very top edge, and a
few wisps of dark vapour curl upward off it and fade out. The body of it is an
absolute void black that reads as a hole rather than as a shadow. Nothing warm,
nothing gold, nothing inviting. The top two thirds of the frame are a flat
solid background of pure magenta #FF00FF.

### 15. wick-reference — square

*This one is the character sheet. Everything after it has to match it, so take
the time, and I will upload it alongside the pose prompts.*

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: a small creature that is half insect and half lantern, standing in
profile facing right, seen from the side. Its body is a hanging-lantern shape
built from pale blue-white glass and paper panels, the seams between the panels
drawn in thin gold, and a single warm orange flame burns clearly visible inside
its chest, lighting the panels from within. Its head is small, smooth and
featureless apart from two dark almond eyes and a pair of fine feathered
antennae. It stands on four slender dark jointed legs. Two moth wings rise from
its back, grey-blue and finely veined, with pale crescent markings, and their
trailing edges are torn and ragged. It is not furry, it has no tail, no paws
and no large round cartoon eyes. Cold pale shell, single warm light inside. The
creature stands on a common ground line about 85% of the way down the frame and
occupies roughly the middle third of the frame. All remaining space is a flat
solid background of pure magenta #FF00FF.

### 16. wick-idle — square

*Match the uploaded character sheet exactly: same body, same panels, same wings,
same proportions, same colours. Change only the pose. Same canvas, same creature
scale, feet on the same line.*

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: the lantern-moth creature standing still in profile facing right, all
four legs on the ground, wings folded back and slightly drooping, head level,
the flame inside its chest burning low and steady. At rest, waiting. It stands
on a common ground line about 85% of the way down the frame and occupies roughly
the middle third of the frame. All remaining space is a flat solid background of
pure magenta #FF00FF.

### 17. wick-run — square

*Match the uploaded character sheet exactly. Same canvas, same creature scale,
feet on the same line.*

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: the lantern-moth creature running hard in profile facing right, body
pitched forward, front legs reaching and back legs driving, wings swept back by
its own speed, antennae streaming behind it, the flame inside its chest pulled
long and bright by the motion. Its feet stay on a common ground line about 85%
of the way down the frame and it occupies roughly the middle third of the frame —
do not stretch it across the width. All remaining space is a flat solid
background of pure magenta #FF00FF.

### 18. wick-leap — square

*Match the uploaded character sheet exactly. Same canvas, same creature scale.
The legs come up; the creature does not move up the canvas.*

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: the lantern-moth creature at the top of a leap in profile facing right,
legs tucked up under its body, both wings thrown wide open and downward in a
single hard beat, torn trailing edges catching the light, the flame inside its
chest flaring bright with the effort. Its body sits at the same height and the
same size as in the standing pose, with only the legs lifted. It occupies
roughly the middle third of the frame. All remaining space is a flat solid
background of pure magenta #FF00FF.

### 19. ember — square

*Small and tight. The game draws its own halo around this, so a painted glow
here lands on top of that one and the result is the size of a moon.*

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: a single small teardrop of fire, pointed at the top and round at the
bottom, burning deep orange at its heart and pale gold at its edge, with two or
three tiny sparks lifting off it. No leaves, no plants, no crystal, no casing —
only the flame. It is small and sharply defined, filling no more than a quarter
of the frame, with a tight edge and no soft outer glow painted around it. All
remaining space is a flat solid background of pure magenta #FF00FF.

### 20. wick-stone-dark — portrait

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: a tall standing stone post, like a carved milestone, seen from the
side and planted upright on the ground. It is weathered blue-grey granite,
narrower at the top than the bottom, its faces cut with shallow spiral grooves,
and it is crowned with a wide shallow stone bowl. The bowl is empty, cold and
full of old ash. Nothing about it is lit: no flame, no glow, no warm colour
anywhere, only dead stone catching a faint cold rim of moonlight down one edge.
A little dark moss grows at its base. The post stands on a ground line at the
very bottom of the frame and occupies the middle of it. All remaining space is a
flat solid background of pure magenta #FF00FF.

### 21. wick-stone-lit — portrait

*Same stone, same carving, same size, same position in the frame as the previous
image — I will upload it. Only the fire is added.*

Lush painterly game art in the style of a hand-painted 2D platformer.
Bioluminescent night forest. Deep teal, midnight blue and indigo base palette
with warm gold and soft mint-green light accents. Strong atmospheric depth,
volumetric haze, glowing rim light. Rich but desaturated darks, luminous
highlights. No outlines, no cel shading, no text, no watermark, no UI.
Absolutely no magenta, pink or hot purple anywhere in the artwork.
Subject: the same tall carved standing stone with its shallow bowl, now alight.
A tall steady flame burns in the bowl, deep orange at its base and pale gold at
its tip, throwing warm light down the stone so the spiral grooves catch it and
the moss at the base glows green. Sparks lift from the flame and fade out. The
stone itself is unchanged in shape, size and position. The post stands on a
ground line at the very bottom of the frame and occupies the middle of it. All
remaining space is a flat solid background of pure magenta #FF00FF.

---

## Part 3 — the other places

Each biome is four background bands plus its own ledges — the same slots as the
night forest, repainted. Generate a biome's four bands together so they agree
with each other.

The three style words that change per biome are the palette, the weather and
what the trunks are made of. Everything else in the style paragraph stays
identical, because that is what keeps all six places feeling like one game.

**Band rules, which hold for every biome:**

- **sky** — landscape. The furthest layer. Paint the whole frame; no magenta at
  all in this one. One moon or light source at most, and keep it away from the
  left and right edges.
- **far** — landscape. Distant silhouettes along the bottom two thirds. The top
  third is flat magenta.
- **mid** — landscape. Near silhouettes cut off by the top edge. **Every gap
  between them is flat magenta, floor to ceiling.** This is the band that was
  got wrong the first time.
- **near** — landscape. Big out-of-focus foreground shapes hanging from the top
  edge and rising from the bottom, heavily blurred, very dark. The whole middle
  of the frame is flat magenta.
- **ledge-top** — landscape. A slab edge seen from the side: the growth on top,
  the material beneath it, and something trailing off the underside. Rounded
  ends are fine; they get cropped off.
- **ledge-body** — square. A seamless repeating texture of the material, evenly
  lit, no top edge and no horizon.

### Biome 2 — the Drowned Steps

*Palette: cold slate grey, drowned green, pale silver. Weather: still water,
rising mist, slow drips. Material: wet carved stone.*

Flooded terraces of a ruin that has been underwater for a very long time.
Broken columns standing in black mirror-still water, stone stairs descending
into it, reeds and pale water-lilies growing between the slabs, and the whole
place lit by a cold silver glow from under the surface. Ledges are wet carved
stone with pale weed on top and water running off the underside.

### Biome 3 — the Ashen Reach

*Palette: charcoal black, bone white, dull ember orange. Weather: falling ash,
still air, heat shimmer. Material: burnt wood.*

A forest that burned a long time ago and never grew back. Black branchless
trunks, white ash lying thick on every surface and drifting down through the
air, the ground cracked and glowing dull orange in the fissures. The only
warmth in the world is underfoot and it is not friendly. Ledges are charred
timber with ash banked on top and embers glowing in the cracks beneath.

### Biome 4 — the Glasswood

*Palette: clear ice blue, violet, prism white. Weather: utterly still, hard
light. Material: petrified crystal.*

A forest turned to glass. Every trunk and branch is clear faceted crystal that
splits the light into thin coloured bands across the ground, and the air is so
still that the broken shards hang where they fell. Beautiful and completely
silent. Ledges are fractured crystal with frost on top and icicles beneath.

### Biome 5 — the Undergrove

*Palette: deep violet, spore gold, wet black. Weather: drifting spores, dripping
water. Material: fungal flesh and damp earth.*

A cavern under the forest, lit entirely by what grows in it. Mushrooms the size
of trees with gills glowing gold underneath, hanging roots pushing down through
the cave roof, pale fungal shelves climbing the walls, spores drifting in the
dark like slow snow. No sky at all — the `sky` band here is the cave ceiling.
Ledges are packed earth bound with roots, shelf fungus growing along the top and
rootlets trailing beneath.

### Biome 6 — the Spire

*Palette: storm blue, brass, lightning white. Weather: high wind, torn cloud,
distant lightning. Material: weathered brass and masonry.*

A ruined lighthouse climbing out of the cloud layer, and the last wick-stone is
at the top of it. Open sky and torn cloud below rather than above, brass
machinery half-fallen out of the walls, broken stairs spiralling up the outside.
The one place in the game where you can see how far you have come. Ledges are
masonry and brass plate with wind-bent grass on top and loose cable swinging
beneath.

---

## Part 4 — props, when the biomes are done

Lowest priority, and worth having once the places exist. All square, all on flat
magenta, all small and tightly framed.

- **shade** — a drifting hazard: a ragged hole in the air with a thin pale rim
  and nothing inside it.
- **ember-vein** — a cluster of three or four embers on a stem, the larger pickup.
- **wind-bloom** — a pale flower that puffs open and throws you upward.
- **anchor-root** — a hooked root the Wick can swing from.
- **ash-moth** — harmless ambient wildlife, drifting in groups.
- **shardlight** — a hovering crystal that lights a short stretch when struck.

---

## What the code still needs, once these land

Not art, but it belongs in the same list, because none of the above shows up
without it:

- The lamp as a resource: a flame that burns down, embers that refill it, a
  light radius that shrinks as it empties, and death when it reaches zero.
- Wick-stones placed through the level: kindling one refuels, checkpoints, and
  lifts the darkening on that stretch of world. The last one ends the level.
- Gloom replacing the thorn hazard — a pooled band in the low ground rather
  than a spike on a platform.
- The unlit/kindled treatment in code, so every painting can be made once, lit.
- Per-biome asset sets, so a level can name its palette and load its own bands.
