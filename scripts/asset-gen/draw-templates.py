"""
Draw simple grey shape templates (blockouts) for families the model can't
compose from text alone. Each is a shaded grey shape on the flat light-grey
background, 1024x1024, used as a family base start image (image-to-image):
the template fixes shape/composition, the item spec's tint + wording supply
colour and identity. Our own drawings - no outside images involved.

  "<ComfyUI>/.venv/Scripts/python.exe" scripts/asset-gen/draw-templates.py
Writes scripts/asset-gen/references/families/<family>_drawn.png (never the
<family>_start.png that promote-base.js writes). Usage: draw-templates.py [family ...]
"""

import math
import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "references", "families")
S = 1024
BG = (205, 205, 205)


def shaded_ellipse(canvas, box, base=150, light=215, dark=95, light_dir=(-0.45, -0.55)):
    """Ellipse with a soft highlight toward the light and a darker rim (fake volume)."""
    x0, y0, x1, y1 = [int(v) for v in box]
    w, h = max(2, x1 - x0), max(2, y1 - y0)
    layer = Image.new("L", (w, h), 0)
    px = layer.load()
    cx, cy = w / 2, h / 2
    lx, ly = light_dir
    for y in range(h):
        for x in range(w):
            nx, ny = (x - cx) / cx, (y - cy) / cy
            r2 = nx * nx + ny * ny
            if r2 > 1:
                continue
            nz = math.sqrt(max(0.0, 1 - r2))
            d = max(0.0, -(nx * lx + ny * ly) * 0.8 + nz * 0.6)
            v = dark + (light - dark) * d
            v = v * 0.85 + base * 0.15
            px[x, y] = int(max(0, min(255, v)))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, w - 1, h - 1], fill=255)
    rgb = Image.merge("RGB", (layer, layer, layer))
    canvas.paste(rgb, (x0, y0), mask)


def shrimp():
    """C-curled shrimp in side view, built like a real shrimp rather than a chain of
    balls (which read as a caterpillar): one continuous tapered body along a C that
    opens to the left; a smooth carapace over the front third ending in a short
    rostrum, with the eye on its side; six overlapping abdominal plates; a large
    tail fan; short swimmerets on the belly (inside of the C); thin antennae sweeping
    back over the back (outside of the C). Shaded light along the back, dark at the belly."""
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)
    cx, cy, R = 525, 525, 245                       # larger: fill more of the frame
    a0, a1 = math.radians(135), math.radians(-125)   # head at upper left, clockwise to lower left
    N = 220

    def width(t):            # body thickness along the spine
        if t < 0.04:
            return 185 + (t / 0.04) * 65          # front of the carapace tapers to the rostrum
        if t < 0.32:
            return 250                             # carapace
        return 250 - (t - 0.32) / 0.68 * 150       # abdomen narrows toward the tail

    def at(t):
        a = a0 + (a1 - a0) * t
        p = (cx + R * math.cos(a), cy - R * math.sin(a))
        n = (math.cos(a), -math.sin(a))            # outward = the shrimp's back
        return a, p, n, width(t)

    plate_edges = [0.32 + k * (0.94 - 0.32) / 6 for k in range(7)]   # carapace end + 6 abdominal plates

    def plate_shade(t):
        if t < 0.32:
            return 0, 1.0
        for k in range(6):
            lo, hi = plate_edges[k], plate_edges[k + 1]
            if lo <= t < hi:
                f = (t - lo) / (hi - lo)
                return k + 1, (0.72 + 0.28 * min(1.0, f / 0.18))   # darker leading edge = overlap
        return 7, 1.0

    # tail fan first (body overlaps its root): five paddles spread around the travel direction
    a_end, p_end, n_end, w_end = at(1.0)
    travel = (math.sin(a_end), math.cos(a_end))   # direction of motion at the tail (clockwise)
    base_ang = math.atan2(-travel[1], travel[0])
    for k, spread in enumerate((-0.9, -0.45, 0.0, 0.45, 0.9)):
        ang = base_ang + spread
        L = 125 if k in (1, 2, 3) else 105
        tipx, tipy = p_end[0] + L * math.cos(ang), p_end[1] - L * math.sin(ang)
        px_, py_ = -math.sin(ang) * 26, -math.cos(ang) * 26
        shade = 150 if k % 2 else 172
        d.polygon([(p_end[0] + px_ * 0.3, p_end[1] + py_ * 0.3), (tipx + px_, tipy + py_), (tipx - px_, tipy - py_),
                   (p_end[0] - px_ * 0.3, p_end[1] - py_ * 0.3)], fill=(shade,) * 3, outline=(100, 100, 100))

    # legs on the belly side (inside of the C), drawn before the body
    for t in [0.10, 0.16, 0.22, 0.28]:            # thin walking legs under the carapace
        a, p, n, w = at(t)
        ix, iy = p[0] - n[0] * w * 0.45, p[1] - n[1] * w * 0.45
        d.line([(ix, iy), (ix - n[0] * 48 + n[1] * 10, iy - n[1] * 48 - n[0] * 10)], fill=(105, 105, 105), width=4)
    for k in range(5):                             # short swimmerets under the abdominal plates
        t = (plate_edges[k] + plate_edges[k + 1]) / 2
        a, p, n, w = at(t)
        ix, iy = p[0] - n[0] * w * 0.45, p[1] - n[1] * w * 0.45
        d.line([(ix, iy), (ix - n[0] * 30, iy - n[1] * 30)], fill=(110, 110, 110), width=5)

    # body: thin strips across the thickness, shaded belly (dark) -> back (light), per plate
    K = 10
    samples = [at(i / (N - 1)) for i in range(N)]
    for i in range(N - 1):
        t = i / (N - 1)
        _, pa, na, wa = samples[i]
        _, pb, nb, wb = samples[i + 1]
        plate, edge = plate_shade(t)
        band = 0 if plate == 0 else (8 if plate % 2 else -6)
        for k in range(K):
            f0, f1 = k / K - 0.5, (k + 1) / K - 0.5
            fm = (f0 + f1) / 2 + 0.5                  # 0 belly .. 1 back
            v = (95 + 120 * fm + band) * edge
            if plate == 0:
                v += 10                                # carapace slightly lighter, smooth
            v = int(max(40, min(235, v)))
            quad = [(pa[0] + na[0] * wa * f0, pa[1] + na[1] * wa * f0), (pa[0] + na[0] * wa * f1, pa[1] + na[1] * wa * f1),
                    (pb[0] + nb[0] * wb * f1, pb[1] + nb[1] * wb * f1), (pb[0] + nb[0] * wb * f0, pb[1] + nb[1] * wb * f0)]
            d.polygon(quad, fill=(v, v, v))

    # short pointed rostrum ahead of the carapace
    a, p, n, w = at(0.0)
    fwd = (-math.sin(a), -math.cos(a))             # direction away from the body at the head
    d.polygon([(p[0] + n[0] * w * 0.10, p[1] + n[1] * w * 0.10), (p[0] - n[0] * w * 0.12, p[1] - n[1] * w * 0.12),
               (p[0] + fwd[0] * 70 + n[0] * 12, p[1] + fwd[1] * 70 + n[1] * 12)], fill=(165, 165, 165), outline=(110, 110, 110))

    # eye on the side of the carapace
    a, p, n, w = at(0.07)
    ex, ey = p[0] + n[0] * w * 0.08, p[1] + n[1] * w * 0.08
    d.ellipse([ex - 13, ey - 13, ex + 13, ey + 13], fill=(28, 28, 28))
    d.ellipse([ex - 6, ey - 8, ex - 1, ey - 3], fill=(200, 200, 200))

    # two thin antennae sweeping back over the back (outside of the C)
    a, p, n, w = at(0.03)
    sx, sy = p[0] + n[0] * w * 0.3, p[1] + n[1] * w * 0.3
    for off in (0, 24):
        # short: arc back just over the top of the body (long ones ran toward the frame edge)
        _, pm, nm, wm = at(0.16)
        mx, my = pm[0] + nm[0] * (wm * 0.5 + 70 + off), pm[1] + nm[1] * (wm * 0.5 + 70 + off)
        _, pe, ne, we = at(0.36)
        qx, qy = pe[0] + ne[0] * (we * 0.5 + 45 + off), pe[1] + ne[1] * (we * 0.5 + 45 + off)
        d.line([(sx, sy), (mx, my), (qx, qy)], fill=(80, 80, 80), width=4, joint="curve")

    # Soften the shading strips into a smooth gradient: visible concentric strips made the
    # model render a translucent glass ribbon instead of a solid shell. Blur only the body
    # (not the background edge) by blurring then re-compositing inside the silhouette.
    body = img.copy().filter(ImageFilter.GaussianBlur(7))
    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    pts_out = [(at(i / 119)[1][0] + at(i / 119)[2][0] * at(i / 119)[3] * 0.42, at(i / 119)[1][1] + at(i / 119)[2][1] * at(i / 119)[3] * 0.42) for i in range(120)]
    pts_in = [(at(i / 119)[1][0] - at(i / 119)[2][0] * at(i / 119)[3] * 0.42, at(i / 119)[1][1] - at(i / 119)[2][1] * at(i / 119)[3] * 0.42) for i in range(120)]
    md.polygon(pts_out + pts_in[::-1], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(4))
    img.paste(body, (0, 0), mask)
    # re-draw plate overlap lines so the segments still read after smoothing
    for k in range(1, 7):
        a, p, n, w = at(plate_edges[k] if k < 7 else 0.94)
        d2 = ImageDraw.Draw(img)
        d2.line([(p[0] - n[0] * w * 0.42, p[1] - n[1] * w * 0.42), (p[0] + n[0] * w * 0.48, p[1] + n[1] * w * 0.48)], fill=(95, 95, 95), width=5)
    a, p, n, w = at(0.32)
    ImageDraw.Draw(img).line([(p[0] - n[0] * w * 0.42, p[1] - n[1] * w * 0.42), (p[0] + n[0] * w * 0.48, p[1] + n[1] * w * 0.48)], fill=(90, 90, 90), width=6)
    return img.filter(ImageFilter.GaussianBlur(1.2))


def slab(img, cx, cy, rx, ry, thick, seed, top=180, side=120):
    """A flat lumpy slab: irregular rounded top face + darker extruded side."""
    rnd = random.Random(seed)
    pts = []
    for i in range(16):
        a = 2 * math.pi * i / 16
        k = 1 + rnd.uniform(-0.13, 0.13)
        pts.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    side_layer = Image.new("L", (S, S), 0)
    sd = ImageDraw.Draw(side_layer)
    for t in range(thick):
        sd.polygon([(x, y + t) for x, y in pts], fill=255)
    top_mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(top_mask).polygon(pts, fill=255)
    top_mask = top_mask.filter(ImageFilter.GaussianBlur(4))
    side_layer = side_layer.filter(ImageFilter.GaussianBlur(4))
    img.paste((side, side, side), (0, 0), side_layer)
    # top face with a soft highlight toward the upper left
    grad = Image.new("L", (S, S), 0)
    gd = ImageDraw.Draw(grad)
    for r in range(int(max(rx, ry) * 1.3), 0, -8):
        v = int(top - 25 + 50 * (1 - r / (max(rx, ry) * 1.3)))
        gd.ellipse([cx - rx * 0.35 - r, cy - ry * 0.35 - r * ry / rx, cx - rx * 0.35 + r, cy - ry * 0.35 + r * ry / rx], fill=v)
    img.paste(Image.merge("RGB", (grad, grad, grad)), (0, 0), top_mask)
    # a couple of soft dents
    dd = ImageDraw.Draw(img)
    for _ in range(2):
        ex, ey = cx + rnd.uniform(-rx * 0.4, rx * 0.4), cy + rnd.uniform(-ry * 0.3, ry * 0.3)
        dd.ellipse([ex - 22, ey - 10, ex + 22, ey + 10], fill=(top - 35,) * 3)


def clay():
    img = Image.new("RGB", (S, S), BG)
    slab(img, 430, 600, 230, 120, 70, seed=3)
    slab(img, 610, 560, 210, 110, 64, seed=7)
    slab(img, 520, 450, 190, 100, 58, seed=11, top=190)
    return img.filter(ImageFilter.GaussianBlur(1.5))


def gold_heap():
    img = Image.new("RGB", (S, S), BG)
    rnd = random.Random(42)
    cx, base_y, W, H = 512, 700, 520, 330
    flakes = []
    for _ in range(170):
        # sample inside a dome: wider at the bottom, peak in the middle
        u = rnd.uniform(-1, 1)
        top = base_y - H * (1 - u * u)
        x = cx + u * W / 2
        y = rnd.uniform(top, base_y)
        flakes.append((y, x, rnd.uniform(22, 44), rnd.uniform(0, math.pi)))
    flakes.sort()  # back (higher up) to front
    d = ImageDraw.Draw(img)
    for y, x, r, a in flakes:
        n = rnd.choice((4, 5))
        pts = [(x + r * math.cos(a + 2 * math.pi * k / n) * rnd.uniform(0.7, 1.1),
                y + r * 0.6 * math.sin(a + 2 * math.pi * k / n) * rnd.uniform(0.7, 1.1)) for k in range(n)]
        shade = int(120 + 110 * (1 - (y - (base_y - H)) / H) * rnd.uniform(0.6, 1.0))
        d.polygon(pts, fill=(shade, shade, shade), outline=(max(0, shade - 60),) * 3)
        if rnd.random() < 0.3:  # glints
            d.line([pts[0], pts[1]], fill=(240, 240, 240), width=3)
    return img.filter(ImageFilter.GaussianBlur(1.0))


def blob_pts(cx, cy, rx, ry, seed, n=20, jitter=0.1):
    rnd = random.Random(seed)
    return [(cx + rx * (1 + rnd.uniform(-jitter, jitter)) * math.cos(2 * math.pi * i / n),
             cy + ry * (1 + rnd.uniform(-jitter, jitter)) * math.sin(2 * math.pi * i / n)) for i in range(n)]


def radial_fill(img, mask, cx, cy, r, inner, outer):
    """Fill mask with a radial gradient inner->outer colour centred on (cx, cy)."""
    grad = Image.new("RGB", (S, S), outer)
    gd = ImageDraw.Draw(grad)
    for k in range(int(r), 0, -6):
        t = k / r
        col = tuple(int(inner[i] + (outer[i] - inner[i]) * t) for i in range(3))
        gd.ellipse([cx - k, cy - k, cx + k, cy + k], fill=col)
    img.paste(grad, (0, 0), mask)


def resin_glob():
    """Colour blockout: one lumpy amber glob with a short drip, darker core, highlight."""
    img = Image.new("RGB", (S, S), BG)
    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.polygon(blob_pts(500, 520, 250, 195, seed=5, jitter=0.12), fill=255)
    md.ellipse([560, 560, 700, 720], fill=255)                                # lobe
    md.polygon([(610, 650), (680, 650), (665, 790), (628, 790)], fill=255)  # drip
    md.ellipse([618, 760, 676, 822], fill=255)                                # drip bead
    mask = mask.filter(ImageFilter.GaussianBlur(10)).point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(2))
    radial_fill(img, mask, 470, 480, 380, (255, 205, 90), (150, 72, 12))
    core = Image.new("L", (S, S), 0)
    ImageDraw.Draw(core).polygon(blob_pts(520, 560, 120, 85, seed=9, jitter=0.15), fill=150)
    img.paste((120, 52, 8), (0, 0), core.filter(ImageFilter.GaussianBlur(30)))
    hl = Image.new("L", (S, S), 0)
    ImageDraw.Draw(hl).ellipse([380, 400, 470, 450], fill=230)
    img.paste((255, 246, 214), (0, 0), hl.filter(ImageFilter.GaussianBlur(12)))
    return img.filter(ImageFilter.GaussianBlur(1.5))


def pelt():
    """Colour blockout: a rounded brown fur hide with one corner folded back (tan leather)."""
    img = Image.new("RGB", (S, S), BG)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).polygon(blob_pts(500, 530, 330, 230, seed=21, n=14, jitter=0.16), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(14)).point(lambda v: 255 if v > 128 else 0)
    # fur tufts around the rim: short pointed wedges pushing outward, so the edge reads furry
    rnd = random.Random(4)
    tufts = Image.new("L", (S, S), 0)
    td = ImageDraw.Draw(tufts)
    cx, cy = 500, 530
    for i in range(70):
        a = 2 * math.pi * i / 70 + rnd.uniform(-0.03, 0.03)
        r = 0
        while r < 600 and mask.getpixel((int(cx + r * math.cos(a)), int(cy + r * 0.7 * math.sin(a)))) > 128:
            r += 4
        ex, ey = cx + r * math.cos(a), cy + r * 0.7 * math.sin(a)
        L, w = rnd.uniform(26, 48), 0.07
        td.polygon([(cx + (r - 30) * math.cos(a - w), cy + (r - 30) * 0.7 * math.sin(a - w)),
                    (ex + L * math.cos(a), ey + L * math.sin(a)),
                    (cx + (r - 30) * math.cos(a + w), cy + (r - 30) * 0.7 * math.sin(a + w))], fill=255)
    mask = ImageChops.lighter(mask, tufts)
    radial_fill(img, mask, 430, 450, 480, (170, 112, 64), (92, 56, 30))
    d = ImageDraw.Draw(img)
    for _ in range(26):                                    # a few big fur clumps
        x, y = rnd.uniform(240, 760), rnd.uniform(360, 700)
        if mask.getpixel((int(x), int(y))) < 200:
            continue
        r = rnd.uniform(34, 60)
        d.chord([x - r, y - r * 0.6, x + r, y + r * 0.6], 200, 340, fill=(190, 132, 80))
    fold = [(640, 560), (800, 610), (700, 740)]            # folded-back corner, leather side
    sh = Image.new("L", (S, S), 0)
    ImageDraw.Draw(sh).polygon([(p[0] + 10, p[1] + 14) for p in fold], fill=150)
    img.paste((60, 36, 20), (0, 0), sh.filter(ImageFilter.GaussianBlur(10)))
    fm = Image.new("L", (S, S), 0)
    ImageDraw.Draw(fm).polygon(fold, fill=255)
    radial_fill(img, fm.filter(ImageFilter.GaussianBlur(3)), 690, 600, 200, (232, 200, 150), (190, 150, 100))
    return img.filter(ImageFilter.GaussianBlur(1.5))


def tuber(base=(120, 84, 150), light=(190, 160, 215), dark=(62, 40, 82)):
    """Colour blockout: a potato/ginger-like tuber lying flat - plump body + stubby knobs."""
    img = Image.new("RGB", (S, S), BG)
    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.polygon(blob_pts(500, 560, 270, 150, seed=13, jitter=0.08), fill=255)       # main body
    md.ellipse([640, 400, 800, 540], fill=255)                                      # knob up-right
    md.ellipse([230, 430, 360, 545], fill=255)                                      # knob left
    md.ellipse([700, 590, 830, 690], fill=255)                                      # knob right
    mask = mask.filter(ImageFilter.GaussianBlur(16)).point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(2))
    radial_fill(img, mask, 450, 470, 440, light, dark)
    d = ImageDraw.Draw(img)
    rnd = random.Random(8)
    for _ in range(9):                                                              # small eyes
        x, y = rnd.uniform(300, 760), rnd.uniform(480, 650)
        if mask.getpixel((int(x), int(y))) > 200:
            d.ellipse([x - 9, y - 6, x + 9, y + 6], fill=dark)
    for k in range(3):                                                              # faint ring marks
        x = 380 + k * 120
        d.arc([x - 40, 430, x + 40, 690], 250, 290, fill=dark, width=5)
    return img.filter(ImageFilter.GaussianBlur(1.5))


def main():
    import sys
    os.makedirs(OUT, exist_ok=True)
    wanted = set(sys.argv[1:])
    for name, fn in (("crustacean", shrimp), ("mineral", clay), ("precious", gold_heap),
                     ("extract", resin_glob), ("hide", pelt), ("root", tuber)):
        if wanted and name not in wanted:
            continue
        # Always *_drawn.png, never *_start.png: re-running must not overwrite a base
        # that was promoted from an approved render with promote-base.js.
        path = os.path.join(OUT, f"{name}_drawn.png")
        fn().save(path)
        print("wrote", path)


if __name__ == "__main__":
    main()
