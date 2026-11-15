"""3D blockout of Verduun South's Earthen Amphitheatre, used as an image-to-image start image.

    python scripts/asset-gen/blockout-verduun-south.py [--view terrace|ground|rim] [--size 640] [--fov 36] [--tag _v6]
      -> scripts/asset-gen/references/backgrounds/verduun_south_blockout_<view><tag>.png

Text prompts alone never produced the amphitheatre (the model drops the encircling wall and
renders a bare moor of stones), so this ray-marches the layout from the region brief
(worldRegions.js region_-3_-3) plus the user's art direction:
  - a 100-yard (~92 m) market floor paved with old stone pavers, overtaken by moss and rotten leaves,
  - an earthen ring three storeys high stepped into three terraces, tiers of doorways and windows
    dug into the inner faces, ground-level tunnels; everything grown over with moss and vines,
  - a Stonehenge-like ring of lintelled uprights plus an inner horseshoe of trilithons, mossy,
  - colossal old-growth trees growing out of the earthwork and the floor's edge, crowns overhead,
    with a forest mass beyond the rim.
Low sun with cast shadows (the crowns dapple the light). The diffusion pass paints the detail.
"""
import argparse, math, os
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("--view", default="terrace", choices=["ground", "rim", "terrace"])
ap.add_argument("--size", type=int, default=640)
ap.add_argument("--tag", default="")
ap.add_argument("--fov", type=float, default=None)
a = ap.parse_args()
N = a.size

RF, D, H = 46.0, 6.5, 5.5          # floor radius, terrace depth, storey height
BAT = 2.2                           # horizontal run of each sloped face
R_TOP = RF + 3 * D                  # inner edge of the rim top
R_OUT = R_TOP + 4.0                 # rim top width, then outer slope
SLOPE = 22.0
RS, SW, SDp, SH = 15.0, 2.3, 1.2, 4.2   # stone ring radius, upright width / depth / height
NS = 30
rng = np.random.default_rng(7)
missing = set(rng.choice(NS, 5, replace=False).tolist())   # fallen uprights
lgap = set(rng.choice(NS, 5, replace=False).tolist())      # missing lintel segments
TRI = [(-1.6 + i * 0.8, 6.0 if i in (1, 3) else 6.8) for i in range(5)]  # inner horseshoe angles / heights


def noise2(x, y, s):
    return (np.sin(x * 0.37 * s + 1.3) * np.cos(y * 0.29 * s + 0.7) + np.sin(x * 0.11 * s - y * 0.17 * s + 2.1)) * 0.5


def fbm(x, y):
    return noise2(x, y, 1.0) + 0.5 * noise2(x * 2.1 + 5, y * 2.3, 1.3) + 0.25 * noise2(x * 4.7, y * 4.1 + 3, 1.7)


def terrain(x, y):
    r = np.hypot(x, y)
    h = np.zeros_like(r)
    for k in range(3):   # battered earthen faces: each storey rises over BAT metres
        h = np.where(r >= RF + k * D, k * H + np.clip((r - RF - k * D) / BAT, 0, 1) * H, h)
    h = np.where(r >= R_OUT, np.maximum(0, 3 * H - (r - R_OUT) * 3 * H / SLOPE), h)
    crowns = np.abs(np.sin(x * 0.55) * np.sin(y * 0.55 + 1.1)) + np.abs(np.sin(x * 0.23 + y * 0.19))
    canopy = np.where(r > R_OUT + 4, 30 + 5 * noise2(x, y, 1.0) + 6 * crowns, 0)
    canopy = np.where(r > R_OUT + 4, np.minimum(canopy, (r - R_OUT - 4) * 6.0), 0)
    return np.maximum(h, canopy)


# ---- old-growth trees: (x, y, trunk radius, trunk height, crown radius) ----
TREES = []
for i in range(18):                       # around the rim
    ang = i / 18 * 2 * math.pi + rng.uniform(-0.12, 0.12)
    rr = R_TOP + rng.uniform(1.0, 3.5)
    TREES.append((rr * math.cos(ang), rr * math.sin(ang), rng.uniform(1.8, 2.8), rng.uniform(30, 40), rng.uniform(9, 13)))
for k, ang in [(0, 1.9), (1, 1.15), (2, 2.45), (1, 0.55), (0, 2.75), (2, 0.25)]:   # out of the terraces
    rr = RF + k * D + BAT + 1.6
    TREES.append((rr * math.cos(ang), rr * math.sin(ang), 1.5, 26 + 3 * k, 8.5))
TREES += [(-17.0, -40.0, 2.6, 34, 12), (5.5, -38.0, 2.2, 30, 10)]   # framing the near edges of the view
TB = [(tx, ty, tr, th, cr, float(terrain(np.array([tx]), np.array([ty]))[0])) for tx, ty, tr, th, cr in TREES]


def trees(x, y, z):
    """material code: 0 none, 7 trunk, 8 leaves"""
    m = np.zeros(x.shape, np.int8)
    for tx, ty, tr, th, cr, gz in TB:
        dxy = np.hypot(x - tx, y - ty)
        zr = z - gz
        rad = tr * (1 + 1.4 * np.exp(-np.clip(zr, 0, None) / 1.6))          # buttress flare
        trunk = (dxy < rad) & (zr < th) & (zr > -2)
        cz = gz + th
        cd = np.sqrt((x - tx) ** 2 + (y - ty) ** 2 + ((z - cz) * 1.5) ** 2)
        leaf = cd < cr * (0.85 + 0.15 * np.sin(x * 0.9 + z * 0.7) * np.cos(y * 0.8))
        m = np.where(trunk, 7, np.where((m == 0) & leaf, 8, m))
    return m


def stones(x, y, z):
    """material code: 0 none, 1 upright, 2 lintel, 3 trilithon"""
    r = np.hypot(x, y)
    th = np.arctan2(y, x)
    k = np.round(th / (2 * np.pi / NS)).astype(int) % NS
    tk = r * (th - k * 2 * np.pi / NS)
    tk = (tk + np.pi * r) % (2 * np.pi * r) - np.pi * r
    u = r - RS
    inring = np.abs(u) < SDp / 2
    keep = ~np.isin(k, list(missing))
    up = inring & keep & (np.abs(tk) < SW / 2) & (z < SH)
    gap = np.isin(k, list(lgap))
    lin = inring & ~gap & (z >= SH) & (z < SH + 0.95)
    m = np.where(up, 1, np.where(lin, 2, 0))
    for ang, ht in TRI:   # horseshoe opening toward -y (the camera side)
        cx, cy = 8.5 * math.cos(ang + math.pi / 2), 8.5 * math.sin(ang + math.pi / 2)
        tx, ty = -math.sin(ang + math.pi / 2), math.cos(ang + math.pi / 2)
        lx = (x - cx) * tx + (y - cy) * ty
        ly = (x - cx) * math.cos(ang + math.pi / 2) + (y - cy) * math.sin(ang + math.pi / 2)
        legs = ((np.abs(lx - 1.3) < 0.8) | (np.abs(lx + 1.3) < 0.8)) & (np.abs(ly) < 0.7) & (z < ht)
        top = (np.abs(lx) < 2.3) & (np.abs(ly) < 0.75) & (z >= ht) & (z < ht + 1.0)
        m = np.where((m == 0) & (legs | top), 3, m)
    return m


def solid(x, y, z):
    return (z <= terrain(x, y)) | (stones(x, y, z) > 0) | (trees(x, y, z) > 0)


views = {
    "ground": dict(pos=(-6, -40, 1.7), look=(4, 40, 9.0), fov=48),
    "terrace": dict(pos=(-6, -(RF + D + 3.5), 2 * H + 1.7), look=(2, 40, 4.0), fov=38),
    "rim": dict(pos=(0, -(R_TOP + 1.0), 3 * H + 1.7), look=(0, 8, 0.0), fov=56),
}[a.view]
P = np.array(views["pos"], float)
L = np.array(views["look"], float)
f = (L - P) / np.linalg.norm(L - P)
rt = np.cross(f, [0, 0, 1.0]); rt /= np.linalg.norm(rt)
up = np.cross(rt, f)
th = math.tan(math.radians(a.fov or views["fov"]) / 2)
j, i = np.mgrid[0:N, 0:N]
sx = (i + 0.5) / N * 2 - 1
sy = 1 - (j + 0.5) / N * 2
dirs = f[None, None] + sx[..., None] * th * rt + sy[..., None] * th * up
dirs /= np.linalg.norm(dirs, axis=-1, keepdims=True)
dx, dy, dz = (dirs[..., k].ravel() for k in range(3))

M = dx.size
t = np.full(M, 0.3)
hit = np.zeros(M, bool)
mat = np.zeros(M, int)      # 0 sky 1 ground 2 terrace face 3 forest mass 4 upright 5 lintel 6 trilithon 7 trunk 8 leaves
tprev = np.zeros(M)
active = np.ones(M, bool)
for step in range(700):
    idx = np.nonzero(active)[0]
    if idx.size == 0:
        break
    tt = t[idx]
    x, y, z = P[0] + dx[idx] * tt, P[1] + dy[idx] * tt, P[2] + dz[idx] * tt
    st = stones(x, y, z)
    tr = trees(x, y, z)
    below = z <= terrain(x, y)
    h_ = below | (st > 0) | (tr > 0)
    done = idx[h_]
    hit[done] = True
    mat[done] = np.where(tr[h_] > 0, tr[h_], np.where(st[h_] == 1, 4, np.where(st[h_] == 2, 5, np.where(st[h_] == 3, 6, -1))))
    tprev[idx[~h_]] = tt[~h_]
    far = tt > 420
    active[idx[h_ | far]] = False
    t[idx[~h_]] = tt[~h_] + 0.04 + 0.006 * tt[~h_]

# refine object hits by bisection (crisp edges, no shadow acne)
ob = hit & (mat >= 4)
lo, hi = tprev[ob].copy(), t[ob].copy()
for _ in range(10):
    mid = (lo + hi) / 2
    xx, yy, zz = P[0] + dx[ob] * mid, P[1] + dy[ob] * mid, P[2] + dz[ob] * mid
    b = (stones(xx, yy, zz) > 0) | (trees(xx, yy, zz) > 0)
    hi = np.where(b, mid, hi); lo = np.where(b, lo, mid)
t[ob] = hi
# refine terrain hits and classify ground / face / forest mass
ter = hit & (mat == -1)
lo, hi = tprev[ter].copy(), t[ter].copy()
tdx, tdy, tdz = dx[ter], dy[ter], dz[ter]
for _ in range(10):
    mid = (lo + hi) / 2
    b = P[2] + tdz * mid <= terrain(P[0] + tdx * mid, P[1] + tdy * mid)
    hi = np.where(b, mid, hi); lo = np.where(b, lo, mid)
t[ter] = hi
r = np.hypot(P[0] + tdx * hi, P[1] + tdy * hi)
rr = r - RF
wall = (rr >= -0.05) & (rr < 3 * D) & ((rr % D) < BAT + 0.05)
can = (r > R_OUT + 6) & ~wall
mat[ter] = np.where(wall, 2, np.where(can, 3, 1))

X, Y, Z = P[0] + dx * t, P[1] + dy * t, P[2] + dz * t
R_ = np.hypot(X, Y)
TH = np.arctan2(Y, X)
sun = np.array([-0.80, -0.25, 0.42]); sun /= np.linalg.norm(sun)   # low golden sun from the left
MOSS = np.array([0.30, 0.42, 0.14])
MOSS_D = np.array([0.18, 0.28, 0.10])
LEAF_LITTER = np.array([0.42, 0.28, 0.14])
col = np.zeros((M, 3))
skyv = np.clip(dz * 3 + 0.3, 0, 1)[:, None]
col[:] = (1 - skyv) * np.array([0.96, 0.88, 0.66]) + skyv * np.array([0.60, 0.72, 0.84])

# ground: the paved market floor (r < RF) / mossy terrace tops and rim
g = mat == 1
gx, gy = X[g], Y[g]
floor = R_[g] < RF
row = np.floor(gy / 1.1)
cx_ = (gx + (row % 2) * 0.7) / 1.4                     # running-bond paver courses
fu, fv = cx_ - np.floor(cx_), gy / 1.1 - row
grout = (np.minimum(fu, 1 - fu) < 0.06) | (np.minimum(fv, 1 - fv) < 0.07)
pid = np.sin(np.floor(cx_) * 12.99 + row * 78.23) * 43758.5 % 1.0
paver = np.array([0.50, 0.48, 0.42]) + (pid[:, None] - 0.5) * 0.14
mossy = fbm(gx * 0.35, gy * 0.35) + 0.4 * pid > 0.15
litter = fbm(gx * 0.6 + 9, gy * 0.6 - 4) > 0.55
cf = np.where(grout[:, None], MOSS_D, paver)
cf = np.where(mossy[:, None], MOSS + 0.05 * noise2(gx * 3, gy * 3, 1.0)[:, None], cf)
cf = np.where(litter[:, None], LEAF_LITTER + 0.08 * noise2(gx * 5, gy * 5, 1.3)[:, None], cf)
ct = MOSS_D + 0.08 * fbm(gx * 0.8, gy * 0.8)[:, None] + np.where((fbm(gx * 0.5 + 2, gy * 0.5) > 0.6)[:, None], LEAF_LITTER - MOSS_D, 0) * 0.6
col[g] = np.where(floor[:, None], cf, ct)

# terrace faces: earth under moss, curtains of vines, doorways, windows, tunnels
w = mat == 2
if w.any():
    rw, tw, zw = R_[w], TH[w], Z[w]
    tier = np.clip(np.floor((rw - RF) / D + 0.02), 0, 2)
    zf = zw - tier * H
    s = tw * (RF + tier * D)
    earth = np.array([0.40, 0.31, 0.20]) + 0.05 * noise2(s * 3, zf * 3, 2.0)[:, None]
    mossf = fbm(s * 0.6, zf * 0.9) > -0.2
    c = np.where(mossf[:, None], MOSS + 0.06 * noise2(s * 4, zf * 4, 1.1)[:, None], earth)
    sp = 10.0
    di = np.floor((s + 1000 * sp + tier * 3.7) / sp)
    hsh = np.sin(di * 12.9898 + tier * 78.233) * 43758.5453 % 1.0
    ls = (s + 1000 * sp + tier * 3.7) % sp - sp / 2 - (hsh - 0.5) * 3.0
    gone = hsh < 0.22
    arch = lambda hw, hh: (np.abs(ls) < hw) & (zf < hh - hw + np.sqrt(np.clip(1 - (ls / hw) ** 2, 0, 1)) * hw) & (zf > 0.05)
    frame = arch(1.9, 4.3) & ~arch(1.45, 3.85) & ~gone
    door = arch(1.45, 3.85) & ~gone
    win = (np.abs(np.abs(ls) - 3.6) < 0.55) & (zf > 2.0) & (zf < 3.1) & ~gone
    c = np.where(frame[:, None], np.array([0.40, 0.40, 0.34]), c)
    tun = math.pi / 2 * RF
    tunnel = (tier == 0) & (np.abs(s - tun) < 2.6) & (zf < 3.4 + np.sqrt(np.clip(1 - ((s - tun) / 2.6) ** 2, 0, 1)) * 1.2)
    dark = door | win | tunnel
    c = np.where(dark[:, None], np.array([0.04, 0.035, 0.03]), c)
    vine_len = (np.sin(np.floor(s * 1.7) * 7.31) * 9137.1 % 1.0) * H * 0.9
    vines = ((s * 1.7) % 1.0 < 0.55) & (zf > H - vine_len) & (np.sin(np.floor(s * 1.7) * 3.7) > -0.2)
    c = np.where(vines[:, None], MOSS_D + 0.05 * noise2(s * 6, zf * 6, 1.0)[:, None], c)   # vines hang over doors too
    col[w] = c

cn = mat == 3
col[cn] = np.array([0.15, 0.24, 0.12]) + 0.07 * noise2(X[cn] * 3, Y[cn] * 3 + Z[cn], 2.3)[:, None]
# stones: grey, moss creeping up from the base and over the lintel tops
for m_, base in ((4, [0.52, 0.52, 0.48]), (5, [0.48, 0.48, 0.45]), (6, [0.55, 0.54, 0.50])):
    s_ = mat == m_
    shade = np.clip(0.8 + 0.2 * np.sin(TH[s_] * 3 + Z[s_] * 0.4), 0.5, 1.0)[:, None]
    c = np.array(base) * shade + 0.05 * noise2(X[s_] * 6, Z[s_] * 6, 1.3)[:, None]
    mz = fbm(X[s_] * 1.3 + Z[s_], Y[s_] * 1.3 - Z[s_] * 0.7)
    mossy = (mz > 0.35 + 0.18 * Z[s_] - 0.6) | ((m_ == 5) & (mz > -0.1)) | (Z[s_] < 0.8 + 0.6 * mz)
    col[s_] = np.where(mossy[:, None], MOSS + 0.05 * noise2(X[s_] * 5, Z[s_] * 5, 1.0)[:, None], c)
tk = mat == 7   # bark with moss on the shaded side
bark = np.array([0.30, 0.25, 0.20]) + 0.05 * np.sin(Z[tk] * 0.3 + TH[tk] * 40)[:, None]
col[tk] = np.where((noise2(X[tk] * 2, Z[tk] * 0.7, 1.0) > -0.1)[:, None], MOSS_D + 0.04, bark)
lv = mat == 8
col[lv] = np.array([0.16, 0.30, 0.10]) + 0.08 * fbm(X[lv] * 0.7 + Z[lv], Y[lv] * 0.7)[:, None]

# lighting: normals per material, cast shadows (terrain, stones, trees) toward the sun
nrm = np.zeros((M, 3)); nrm[:, 2] = 1.0
cosT, sinT = np.cos(TH), np.sin(TH)
wm = mat == 2
nrm[wm] = np.stack([-cosT[wm] * H, -sinT[wm] * H, np.full(wm.sum(), BAT)], 1)
sm = (mat == 4) | (mat == 5)
uu = R_[sm] - RS
kk = np.round(TH[sm] / (2 * np.pi / NS))
tang = R_[sm] * (TH[sm] - kk * 2 * np.pi / NS)
radial = np.abs(np.abs(uu) - SDp / 2) < np.abs(np.abs(tang) - SW / 2)
ns = np.where(radial[:, None], np.sign(uu)[:, None] * np.stack([cosT[sm], sinT[sm], 0 * uu], 1),
              np.sign(tang)[:, None] * np.stack([-sinT[sm], cosT[sm], 0 * uu], 1))
ns[(mat[sm] == 5) & (Z[sm] > SH + 0.8)] = [0, 0, 1]
nrm[sm] = ns
tm = mat == 6
nrm[tm] = np.stack([-dx[tm], -dy[tm], 0 * dx[tm]], 1)
for m_ in (7, 8):   # nearest tree axis / crown centre
    q = np.nonzero(mat == m_)[0]
    if q.size == 0:
        continue
    best = np.full(q.size, 1e9); nv = np.zeros((q.size, 3))
    for tx, ty, tr, th_, cr, gz in TB:
        if m_ == 7:
            v = np.stack([X[q] - tx, Y[q] - ty, 0 * X[q]], 1); dd = np.hypot(v[:, 0], v[:, 1]) - tr
        else:
            v = np.stack([X[q] - tx, Y[q] - ty, (Z[q] - gz - th_) * 1.5], 1); dd = np.linalg.norm(v, axis=1) - cr
        better = np.abs(dd) < best
        best = np.where(better, np.abs(dd), best); nv[better] = v[better]
    if m_ == 8:
        nv += np.stack([noise2(X[q] * 2, Z[q] * 2, 1.0), noise2(Y[q] * 2, Z[q] * 2, 1.3), 0 * X[q]], 1) * np.linalg.norm(nv, axis=1, keepdims=True) * 0.5
    nrm[q] = nv
nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9
lam = np.clip(nrm @ sun, 0, 1)
shadow = np.zeros(M)
sidx = np.nonzero(hit & (lam > 0) & (mat != 3))[0]
ox = X[sidx] + nrm[sidx, 0] * 0.3 + sun[0] * 0.1
oy = Y[sidx] + nrm[sidx, 1] * 0.3 + sun[1] * 0.1
oz = Z[sidx] + nrm[sidx, 2] * 0.3 + sun[2] * 0.1
ts = np.full(sidx.size, 0.2); act = np.ones(sidx.size, bool)
for _ in range(260):
    ia = np.nonzero(act)[0]
    if ia.size == 0:
        break
    q = ts[ia]
    xx, yy, zz = ox[ia] + sun[0] * q, oy[ia] + sun[1] * q, oz[ia] + sun[2] * q
    blk = solid(xx, yy, zz)
    shadow[sidx[ia[blk]]] = 1
    act[ia[blk | (q > 160) | (zz > 60)]] = False
    ts[ia] = q + 0.08 + 0.02 * q
sunlit = (lam * (1 - shadow))[:, None]
light = np.array([0.36, 0.42, 0.48]) + sunlit * np.array([0.95, 0.80, 0.52]) * 1.1
col = np.where(hit[:, None] & (mat != 3)[:, None], col * light * 1.15, col)
# distance haze (lighter on the wall so the terraces read)
haze = np.clip(1 - np.exp(-np.where(hit, t, 1e9) / 420), 0, 0.6)[:, None] * np.where(mat == 3, 1.3, 0.8)[:, None]
col = np.where(hit[:, None], col * (1 - haze) + haze * np.array([0.90, 0.86, 0.70]), col)

img = col.reshape(N, N, 3)
sky = ~hit.reshape(N, N)
m8 = np.random.default_rng(3).normal(0, 1, (N // 10, N // 10)).astype(np.float32)
mott = np.asarray(Image.fromarray(m8, mode="F").resize((N, N), Image.BICUBIC))[..., None]
img = img + np.where(sky[..., None], 0.01, 0.03) * mott + np.random.default_rng(4).normal(0, 0.012, img.shape) * (~sky[..., None])
img = (np.clip(img, 0, 1) * 255).astype(np.uint8)
out = os.path.join(os.path.dirname(__file__), "references", "backgrounds", f"verduun_south_blockout_{a.view}{a.tag}.png")
Image.fromarray(img).resize((1024, 1024), Image.LANCZOS).save(out)
print(out)
