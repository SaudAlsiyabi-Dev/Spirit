"""
Turns the generated art in public/game/ into what the game can use.

    pip install pillow
    python3 scripts/key-assets.py [folder of raw art]

ChatGPT will not reliably give you a real alpha channel, so the sprites are
generated on flat magenta and keyed out here. It also only produces three
picture shapes, so a couple of assets are generated oversized and cropped down
to the strip the game actually wants.

Run it as often as you like: it reads from public/game/raw/ and writes to
public/game/, so the originals are never touched and re-running after
regenerating one file is safe.
"""
import os
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("Missing a dependency. Run: pip install pillow numpy")

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Reads from public/game/raw by default, or from a folder given on the command
# line — so a batch of newly generated art can be pointed at where it landed
# rather than copied in first.
RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "public", "game", "raw")
OUT = os.path.join(HERE, "public", "game")

# name -> (key the background out?, crop as (top, bottom) or (top, bottom, left, right)
#          in 0..1, final width)
PLAN = {
    # ---- The Hollow, a bioluminescent night forest -----------------------
    "sky":              (False, None,                     2560),
    "hills-far":        (True,  None,                     2560),
    "forest-mid":       (True,  None,                     2560),
    "fronds-near":      (True,  None,                     2560),
    "ledge-top":        (True,  (0.17, 0.92, 0.10, 0.90), 1024),
    "ledge-body":       (False, None,                     1024),

    # ---- The Drowned Steps, a flooded ruin -------------------------------
    "drowned-sky":      (False, None,                     2560),
    "drowned-far":      (True,  None,                     2560),
    "drowned-mid":      (True,  None,                     2560),
    "drowned-near":     (True,  None,                     2560),
    "drowned-top":      (True,  (0.12, 0.62, 0.06, 0.94), 1024),
    "drowned-body":     (False, None,                     1024),

    # ---- The Ashen Reach, a forest that burned ---------------------------
    "ash-sky":          (False, None,                     2560),
    "ash-far":          (True,  None,                     2560),
    "ash-mid":          (True,  None,                     2560),
    "ash-near":         (True,  None,                     2560),
    "ash-body":         (False, None,                     1024),

    # ---- The Glasswood, a forest turned to crystal -----------------------
    "glass-mid":        (True,  None,                     2560),
    "glass-top":        (True,  (0.22, 0.88, 0.06, 0.94), 1024),
    "glass-body":       (False, None,                     1024),

    # ---- The Undergrove, a cavern lit by what grows in it ----------------
    "under-sky":        (False, None,                     2560),
    "under-far":        (True,  None,                     2560),
    "under-mid":        (True,  None,                     2560),
    "under-near":       (True,  None,                     2560),
    "under-top":        (True,  (0.22, 0.90, 0.06, 0.94), 1024),
    "under-body":       (False, None,                     1024),

    # ---- The Wick, and what the world does to it -------------------------
    "wick-idle":        (True,  None,                     768),
    "wick-run":         (True,  None,                     768),
    "wick-leap":        (True,  None,                     768),
    "ember":            (True,  None,                     384),
    "gloom":            (True,  (0.42, 1.00),             1024),
    "wick-stone-dark":  (True,  None,                     768),
    "wick-stone-lit":   (True,  None,                     768),
}

# What each slot is actually called in the folder the art arrived in.
#
# The generator names its own files, and renaming fifty of them by hand is both
# dull and a place to make a silent mistake. Mapping them here instead keeps the
# original folder exactly as it was delivered, so it stays obvious which
# painting is which when one needs regenerating.
ALIASES = {
    "forest-mid":      "ChatGPT Image Oct 8, 2026, 12_45_36 PM",
    "fronds-near":     "Enchanted Bioluminescent Forest Clearing",
    "ledge-top":       "Bioluminescent Mossy Cliff Ledge",
    "ledge-body":      "Mossy Moonlit Stone Wall",

    "drowned-sky":     "Misty Ruins Beneath Stormlight",
    "drowned-far":     "Ruined Arches Over Neon Waters",
    "drowned-mid":     "Floating Ruins in a Magenta Sky",
    "drowned-near":    "Ruined Ivy Gate on Magenta Ground",
    "drowned-top":     "Moss-Covered Ruined Stone Platform",
    "drowned-body":    "Wet Mossy Ruined Stone Wall Texture",

    "ash-sky":         "Ashstorm Over Ruined Volcanic Realms",
    "ash-far":         "Charred Ruins Against Magenta Skies",
    "ash-mid":         "Charred Ruins Framing Magenta Space",
    "ash-near":        "Charred Wasteland Framing Magenta Void",
    "ash-body":        "Charred Volcanic Wood with Molten Fissures",

    "glass-mid":       "Magenta Sky Crystal Ruins",
    "glass-top":       "Magenta-Backdrop Ancient Crystal Platform",
    "glass-body":      "Glowing Crystal Cliff with Vines",

    "under-sky":       "Bioluminescent Mushroom Cavern Ceiling",
    "under-far":       "Bioluminescent Mushroom Cavern Valley",
    "under-mid":       "Bioluminescent Mushroom Forest on Magenta",
    "under-near":      "Enchanted Mushroom Cave Border",
    "under-top":       "Bioluminescent Mushroom Forest Ledge",
    "under-body":      "Bioluminescent Fungal Rootwall Texture",

    "wick-idle":       "Glowing Steampunk Lantern Moth",
    "wick-run":        "Steampunk Lantern Moth in Motion",
    "wick-leap":       "Steampunk Moth Lantern in Flight",
    "ember":           "Golden Flame Spirit on Magenta",
    "gloom":           "Shadow Slime Smoke Hazard",
    "wick-stone-dark": "Moss-Covered Fantasy Stone Shrine",
    "wick-stone-lit":  "Enchanted Flame Stone Altar",
}

TRIM = {"ember"}

# Poses of the one creature, held to a common size and a common ground line.
POSES = {"wick-idle", "wick-run", "wick-leap"}
# The fraction of the frame the creature fills, and where its feet sit.
POSE_HEIGHT = 0.68
POSE_BASE = 0.88


def normalise_pose(img):
    """
    Puts a pose at the same scale and the same ground line as its siblings.

    The game draws a sprite at a fixed height, so the creature's size on screen
    is decided by how much of its own frame that pose happens to fill. Three
    poses framed by eye came back filling 0.64, 0.67 and 0.71 of their frames,
    which is an eleven percent jump in the creature's size every time it starts
    running. Rescaling each one so the body is the same fraction of the frame,
    and sliding it so the feet land on one line, is the difference between a
    character that moves and a character that also inflates.
    """
    alpha = np.asarray(img)[..., 3]
    rows = np.where(alpha.max(axis=1) > 40)[0]
    cols = np.where(alpha.max(axis=0) > 40)[0]
    if not len(rows) or not len(cols):
        return img

    top, bottom = int(rows[0]), int(rows[-1])
    left, right = int(cols[0]), int(cols[-1])
    body = img.crop((left, top, right + 1, bottom + 1))

    scale = (POSE_HEIGHT * img.height) / body.height
    body = resize_rgba(body, max(1, round(body.width * scale)))

    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(body, (round((img.width - body.width) / 2),
                     round(POSE_BASE * img.height - body.height)))
    return out


def key_magenta(img, cutoff=50):
    """
    Removes a flat magenta backdrop and the colour it bled into the edges.

    Magenta is chosen because nothing in this art is magenta, so "how magenta is
    this pixel" reads cleanly as "how much of this pixel is backdrop". Alpha
    comes from that, and then the leftover pink is pulled back out of every
    pixel — including the ones that end up fully transparent.

    Despilling the invisible pixels looks pointless and is not: resizing blends
    colour without looking at alpha, so magenta sitting in a transparent pixel
    bleeds straight into its half-transparent neighbours, and every sprite comes
    out wearing a pink halo.

    The cutoff was measured rather than picked. Pure magenta scores 255 against
    it, so there is plenty of room for a backdrop that is not quite the colour it
    was asked for, and tightening it further only starts eating the subject.
    """
    rgba = np.asarray(img.convert("RGBA"), dtype=np.float32)
    r, g, b, a = rgba[..., 0], rgba[..., 1], rgba[..., 2], rgba[..., 3]

    # Magenta is red and blue high with green low; the green dip is the signal.
    backdrop = np.clip(np.minimum(r, b) - g, 0, None)
    strength = np.clip(backdrop / cutoff, 0, 1)

    rgba[..., 0] = r - (r - g) * strength
    rgba[..., 2] = b - (b - g) * strength
    rgba[..., 3] = a * (1 - strength)
    return Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA")


def despill_edge(img):
    """
    Takes the last of the key colour out of the soft edge.

    Unpremultiplying divides by alpha, so at the faint outer edge of a sprite any
    rounding left over is multiplied up into a saturated colour. The strength is
    tied to how transparent the pixel is: the solid interior is never touched,
    so genuinely violet artwork keeps its colour, while the fringe — which is
    the only place the backdrop can still be hiding — is cleaned out entirely.
    """
    rgba = np.asarray(img.convert("RGBA"), dtype=np.float32)
    alpha = rgba[..., 3:4] / 255.0
    lean = np.clip(np.minimum(rgba[..., 0:1], rgba[..., 2:3]) - rgba[..., 1:2], 0, None)
    strength = 1.0 - alpha
    rgba[..., 0:1] -= lean * strength
    rgba[..., 2:3] -= lean * strength
    return Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA")


def pad_edges(img, passes=10):
    """
    Spreads the colour of visible pixels outward into the transparent ones.

    Nobody ever sees those pixels, so this looks pointless twice over — but a
    lossy encoder does not know they are invisible. It compresses colour and
    alpha separately, is free to put anything it likes where nothing shows, and
    then bleeds that invention back across the edge when the image is decoded.
    Filling the void with the colour already at the edge leaves it nothing to
    invent, and the halo never appears. Game engines call this an alpha bleed.
    """
    rgba = np.asarray(img.convert("RGBA"), dtype=np.float32)
    rgb = rgba[..., :3]
    known = rgba[..., 3] > 0

    for _ in range(passes):
        if known.all():
            break
        total = np.zeros_like(rgb)
        count = np.zeros(known.shape, dtype=np.float32)
        for shift in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            near = np.roll(known, shift, axis=(0, 1))
            total += np.roll(rgb, shift, axis=(0, 1)) * near[..., None]
            count += near
        fill = (count > 0) & ~known
        rgb[fill] = total[fill] / count[fill][..., None]
        known |= fill

    rgba[..., :3] = rgb
    return Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA")


def resize_rgba(img, width):
    """
    Resizes with the alpha premultiplied, then puts it back.

    Scaling an image whose colour and alpha are stored separately mixes the
    colour of invisible pixels into visible ones. Premultiplying first is what
    keeps a soft edge soft instead of fringed.
    """
    height = max(1, round(img.height * width / img.width))
    rgba = np.asarray(img, dtype=np.float32) / 255.0
    alpha = rgba[..., 3:4]
    rgba[..., :3] *= alpha
    small = Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), "RGBA").resize(
        (width, height), Image.LANCZOS
    )
    out = np.asarray(small, dtype=np.float32) / 255.0
    alpha_out = out[..., 3:4]
    # A premultiplied channel can never exceed its own alpha, but LANCZOS rings
    # past the values it was given and each channel is clamped on its own, which
    # breaks that. Left alone, dividing by a small alpha turns the overshoot
    # into a saturated fringe — the exact pink halo this whole function exists
    # to avoid.
    out[..., :3] = np.minimum(out[..., :3], alpha_out)
    # Dividing by an almost-zero alpha amplifies whatever rounding is left into
    # a saturated colour, and LANCZOS overshoots at a hard edge, so those two
    # together paint bright fringes onto pixels nobody can see. Below a
    # thousandth of visible the colour is simply dropped.
    faint = alpha_out < (8 / 255)
    out[..., :3] = np.where(faint, 0, np.clip(out[..., :3] / np.clip(alpha_out, 1e-4, None), 0, 1))
    out[..., 3:4] = np.where(faint, 0, alpha_out)
    return Image.fromarray((out * 255).astype(np.uint8), "RGBA")


def trim(img):
    """Crops away fully transparent borders, so sprites sit tight in their box."""
    box = img.getbbox()
    return img.crop(box) if box else img


def main():
    if not os.path.isdir(RAW):
        os.makedirs(RAW, exist_ok=True)
        sys.exit(f"Put the generated files in {RAW} and run this again.")

    done, missing = [], []
    for name, (needs_key, band, width) in PLAN.items():
        src = None
        for stem in (name, ALIASES.get(name, name)):
            for ext in (".png", ".jpg", ".jpeg", ".webp"):
                candidate = os.path.join(RAW, stem + ext)
                if os.path.exists(candidate):
                    src = candidate
                    break
            if src:
                break
        if not src:
            missing.append(name)
            continue

        img = Image.open(src).convert("RGBA")

        if band:
            top = int(img.height * band[0])
            bottom = int(img.height * band[1])
            left = int(img.width * band[2]) if len(band) > 2 else 0
            right = int(img.width * band[3]) if len(band) > 3 else img.width
            img = img.crop((left, top, right, bottom))

        if needs_key:
            img = key_magenta(img)
            if name in TRIM:
                img = trim(img)
            if name in POSES:
                img = normalise_pose(img)

        if img.width > width:
            img = resize_rgba(img, width)
        if needs_key:
            img = despill_edge(img)
            img = pad_edges(img)

        # WebP rather than PNG: these are painted images, and PNG stores them
        # losslessly at several times the size for no visible gain. The alpha is
        # kept lossless even so, because that is the one channel where an
        # artefact shows up as a halo rather than as noise. Quality is high
        # because this is a desktop game shipped as one download, not a page
        # someone waits for.
        out = os.path.join(OUT, name + ".webp")
        img.save(out, "WEBP", quality=92, method=6, alpha_quality=100)
        done.append(f"  {name:12} -> {img.width}x{img.height}  {os.path.getsize(out) // 1024} kB")

    if done:
        print("written:")
        print("\n".join(done))
    if missing:
        print("\nstill waiting for: " + ", ".join(sorted(missing)))
        print(f"(drop them in {RAW} as .png or .jpg — the game runs fine without them)")

    total = sum(
        os.path.getsize(os.path.join(OUT, f))
        for f in os.listdir(OUT)
        if f.endswith(".webp")
    )
    print(f"\ntotal shipped art: {total // 1024} kB")


if __name__ == "__main__":
    main()
