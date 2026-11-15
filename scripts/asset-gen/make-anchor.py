"""
Build the IPAdapter style-anchor set for scripts/generate-assets.js.

Takes transparent images and writes square, flat-light-grey-backed
copies to scripts/asset-gen/style-anchor/. Why:
  * ComfyUI's LoadImage drops alpha, so whatever RGB hides under transparent
    pixels (often black) would pollute the style signal.
  * IPAdapter center-crops to a square, so wide/tall icons would lose edges.
The grey matches the "plain flat light grey background" the prompts ask for.

Run with any Python that has Pillow, e.g. ComfyUI's bundled one:
  "<ComfyUI>/.venv/Scripts/python.exe" scripts/asset-gen/make-anchor.py [icon.png ...]
Pass the images to anchor on (normally your picked style-board renders). To change
the house style later, re-run it with different picks.
"""

import os
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "style-anchor")
SIZE = 1024
FILL = 0.80  # object occupies at most 80% of the canvas
BG = (205, 205, 205)

# No default set on purpose: the current in-game art is being replaced, so it
# must not seed the new style. Pass the style-board renders you picked, e.g.
#   make-anchor.py assets/_staging/boards/round2/C2/moss_shrimp.png ...
# Keep the picks palette-DIVERSE: IPAdapter treats palette and texture as part of
# "style", so an all-brown set made every new icon terracotta (a potion bottle
# full of cracked clay) in testing.
DEFAULT_ANCHORS = []


def prepare(src_path):
    im = Image.open(src_path).convert("RGBA")
    bbox = im.getchannel("A").point(lambda a: 255 if a > 20 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    scale = (SIZE * FILL) / max(im.size)
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    canvas = Image.new("RGB", (SIZE, SIZE), BG)
    canvas.paste(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2), im)
    return canvas


def main():
    sources = sys.argv[1:] or DEFAULT_ANCHORS
    if not sources:
        sys.exit("Pass the images to anchor on (e.g. your picked style-board renders). No default set exists.")
    os.makedirs(OUT_DIR, exist_ok=True)
    for old in os.listdir(OUT_DIR):
        if old.lower().endswith(".png"):
            os.remove(os.path.join(OUT_DIR, old))
    for rel in sources:
        src = rel if os.path.isabs(rel) else os.path.join(ROOT, rel)
        name = os.path.splitext(os.path.basename(src))[0].replace(" ", "_").replace("-", "_").lower() + ".png"
        prepare(src).save(os.path.join(OUT_DIR, name), optimize=True)
        print(f"  {rel} -> scripts/asset-gen/style-anchor/{name}")
    print(f"{len(sources)} anchor image(s) written.")


if __name__ == "__main__":
    main()
