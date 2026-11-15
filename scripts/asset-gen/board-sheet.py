"""
Render a style board (see scripts/style-board.js) into one PNG contact sheet:
rows = styles, columns = subjects; each cell on a checkerboard plus a 48px
in-game tile. Handy for sharing a round without a web server.

  "<ComfyUI>/.venv/Scripts/python.exe" scripts/asset-gen/board-sheet.py scripts/asset-gen/boards/round2.json
Writes assets/_staging/boards/<name>/<name>_sheet.png
"""

import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CELL, LABEL_W, PAD = 200, 230, 8


def checker(size, c=14):
    im = Image.new("RGB", (size, size), (205, 205, 205))
    d = ImageDraw.Draw(im)
    for y in range(0, size, c):
        for x in range(0, size, c):
            if (x // c + y // c) % 2:
                d.rectangle([x, y, x + c - 1, y + c - 1], fill=(165, 165, 165))
    return im


def squared(im):
    bb = im.getchannel("A").point(lambda a: 255 if a > 20 else 0).getbbox()
    if bb:
        im = im.crop(bb)
    s = max(im.size)
    out = Image.new("RGBA", (s, s))
    out.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    return out


def font(name, size):
    try:
        return ImageFont.truetype(name, size)
    except OSError:
        return ImageFont.load_default()


def main():
    board_path = sys.argv[1]
    board = json.load(open(board_path, encoding="utf-8"))
    root = os.path.join(ROOT, "assets", "_staging", "boards", board["name"])
    f_label, f_code = font("arial.ttf", 17), font("arialbd.ttf", 26)
    variants = max(1, int(board.get("variants", 1)))
    col_w = variants * (CELL + 64 + PAD) + PAD
    styles, subjects = board["styles"], board["subjects"]
    sheet = Image.new("RGB", (LABEL_W + len(subjects) * col_w + PAD, 40 + len(styles) * (CELL + PAD) + PAD), (32, 34, 40))
    d = ImageDraw.Draw(sheet)
    for j, s in enumerate(subjects):
        d.text((LABEL_W + j * col_w + 50, 10), s["label"], fill=(255, 215, 120), font=f_label)
    for i, st in enumerate(styles):
        y = 40 + i * (CELL + PAD)
        d.text((12, y + CELL // 2 - 34), st["code"], fill=(255, 215, 120), font=f_code)
        # wrap the label onto two lines if long
        words, lines, cur = st["label"].split(), [], ""
        for w in words:
            if len(cur) + len(w) > 20:
                lines.append(cur.strip())
                cur = ""
            cur += w + " "
        lines.append(cur.strip())
        for k, line in enumerate(lines[:3]):
            d.text((12, y + CELL // 2 + k * 20), line, fill=(235, 235, 235), font=f_label)
        for j, s in enumerate(subjects):
          for v in range(1, variants + 1):
            p = os.path.join(root, f"{st['code']}_{st['id']}", f"{s['id']}_v{v}.png")
            if not os.path.exists(p):
                continue
            im = squared(Image.open(p).convert("RGBA"))
            x = LABEL_W + j * col_w + (v - 1) * (CELL + 64 + PAD)
            bg = checker(CELL)
            r = im.resize((CELL - 10, CELL - 10), Image.LANCZOS)
            bg.paste(r, (5, 5), r)
            sheet.paste(bg, (x, y))
            tile = Image.new("RGB", (58, 58), (22, 24, 29))
            ImageDraw.Draw(tile).rectangle([0, 0, 57, 57], outline=(110, 190, 115), width=2)
            t = im.resize((48, 48), Image.LANCZOS)
            tile.paste(t, (5, 5), t)
            sheet.paste(tile, (x + CELL + 6, y + CELL - 58))
    out = os.path.join(root, f"{board['name']}_sheet.png")
    sheet.save(out)
    print(out)


if __name__ == "__main__":
    main()
