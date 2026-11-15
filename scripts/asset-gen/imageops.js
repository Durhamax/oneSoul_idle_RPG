/**
 * Pixel operations for the asset pipeline's post-processing, on the RGBA
 * images from png.js ({ width, height, data: Uint8Array RGBA }).
 *
 * Masks are Uint8Array(width*height), 0..255.
 * Everything is plain JS so the generator stays dependency-free.
 */

'use strict';

/** Mask from a ComfyUI MaskToImage render (white = detected). */
function maskFromImage(img, threshold = 127) {
  const n = img.width * img.height;
  const m = new Uint8Array(n);
  for (let i = 0; i < n; i++) m[i] = img.data[i * 4] > threshold ? 255 : 0;
  return m;
}

/** Mask from an image's alpha channel. */
function alphaMask(img, threshold = 100) {
  const n = img.width * img.height;
  const m = new Uint8Array(n);
  for (let i = 0; i < n; i++) m[i] = img.data[i * 4 + 3] > threshold ? 255 : 0;
  return m;
}

/** Fraction of pixels set in a mask. */
function area(mask) {
  let c = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] > 127) c++;
  return c / mask.length;
}

/** Top row index containing any set pixel, or -1. */
function topRow(mask, width) {
  for (let i = 0; i < mask.length; i++) if (mask[i] > 127) return Math.floor(i / width);
  return -1;
}

/**
 * Grow a mask by r pixels, alternating square and cross steps so the result is
 * a rounded (octagonal) expansion rather than a boxy one.
 */
function dilate(mask, width, height, r) {
  let src = mask;
  for (let step = 0; step < r; step++) {
    const dst = new Uint8Array(src.length);
    const square = step % 2 === 0;
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const i = row + x;
        let v = src[i];
        if (v < 255) {
          const l = x > 0 ? src[i - 1] : 0;
          const rt = x < width - 1 ? src[i + 1] : 0;
          const u = y > 0 ? src[i - width] : 0;
          const d = y < height - 1 ? src[i + width] : 0;
          v = Math.max(v, l, rt, u, d);
          if (square && v < 255) {
            if (y > 0) {
              if (x > 0) v = Math.max(v, src[i - width - 1]);
              if (x < width - 1) v = Math.max(v, src[i - width + 1]);
            }
            if (y < height - 1) {
              if (x > 0) v = Math.max(v, src[i + width - 1]);
              if (x < width - 1) v = Math.max(v, src[i + width + 1]);
            }
          }
        }
        dst[i] = v;
      }
    }
    src = dst;
  }
  return src;
}

/** Separable box blur (radius r), used to feather mask edges. */
function blur(mask, width, height, r) {
  if (r <= 0) return mask;
  const tmp = new Float32Array(mask.length);
  const out = new Uint8Array(mask.length);
  const win = 2 * r + 1;
  for (let y = 0; y < height; y++) {
    let sum = 0;
    const row = y * width;
    for (let x = -r; x <= r; x++) sum += mask[row + Math.min(width - 1, Math.max(0, x))];
    for (let x = 0; x < width; x++) {
      tmp[row + x] = sum / win;
      sum += mask[row + Math.min(width - 1, x + r + 1)] - mask[row + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) sum += tmp[Math.min(height - 1, Math.max(0, y)) * width + x];
    for (let y = 0; y < height; y++) {
      out[y * width + x] = Math.round(sum / win);
      sum += tmp[Math.min(height - 1, y + r + 1) * width + x] - tmp[Math.max(0, y - r) * width + x];
    }
  }
  return out;
}

/**
 * Fill a masked region with a dark vertical gradient (darker at the top), e.g.
 * turning a face inside a hood into an empty shadowed opening. Alpha untouched.
 */
function fillVoid(img, mask, { top = [14, 11, 8], bottom = [42, 37, 32] } = {}) {
  const { width, height, data } = img;
  let y0 = height, y1 = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] > 0) {
      const y = Math.floor(i / width);
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (y0 > y1) return img;
  const span = Math.max(1, y1 - y0);
  for (let i = 0; i < mask.length; i++) {
    const m = mask[i] / 255;
    if (m <= 0) continue;
    const t = Math.min(1, Math.max(0, (Math.floor(i / width) - y0) / span));
    const o = i * 4;
    for (let c = 0; c < 3; c++) {
      const col = top[c] + (bottom[c] - top[c]) * t;
      data[o + c] = Math.round(data[o + c] * (1 - m) + col * m);
    }
  }
  return img;
}

/** Make masked pixels transparent (alpha *= 1 - mask). */
function erase(img, mask) {
  const { data } = img;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] > 0) data[i * 4 + 3] = Math.round(data[i * 4 + 3] * (1 - mask[i] / 255));
  }
  return img;
}

/** Make every row from y downward transparent (e.g. a straight ankle cut). */
function cutBelow(img, y) {
  const { width, height, data } = img;
  for (let row = Math.max(0, y); row < height; row++) {
    for (let x = 0; x < width; x++) data[(row * width + x) * 4 + 3] = 0;
  }
  return img;
}

/**
 * Outline: grow the alpha silhouette by px and composite a solid colour band
 * underneath the image. Identical on every icon; drawn after cleanup so it
 * wraps the final edge.
 */
function outline(img, px, [r, g, b] = [26, 22, 18]) {
  if (!px) return img;
  const { width, height, data } = img;
  const band = dilate(alphaMask(img), width, height, px);
  for (let i = 0; i < band.length; i++) {
    if (!band[i]) continue;
    const o = i * 4;
    const as = data[o + 3] / 255; // item over outline (outline alpha = 1 inside band)
    data[o] = Math.round(data[o] * as + r * (1 - as));
    data[o + 1] = Math.round(data[o + 1] * as + g * (1 - as));
    data[o + 2] = Math.round(data[o + 2] * as + b * (1 - as));
    data[o + 3] = 255;
  }
  return img;
}

/** Flatten onto a solid colour (opaque copy), e.g. before detection. */
function flatten(img, [r, g, b] = [205, 205, 205]) {
  const { width, height, data } = img;
  const out = new Uint8Array(data.length);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    const a = data[o + 3] / 255;
    out[o] = Math.round(data[o] * a + r * (1 - a));
    out[o + 1] = Math.round(data[o + 1] * a + g * (1 - a));
    out[o + 2] = Math.round(data[o + 2] * a + b * (1 - a));
    out[o + 3] = 255;
  }
  return { width, height, data: out };
}

/**
 * Sizes of separate shapes (4-connected islands) in a mask, as fractions of the
 * image, largest first. Used to reject renders with more than one object
 * (two hoods, a front/side/back sheet).
 */
function islands(mask, width, height, minArea = 0) {
  const seen = new Uint8Array(mask.length);
  const stack = new Int32Array(mask.length);
  const sizes = [];
  for (let start = 0; start < mask.length; start++) {
    if (seen[start] || mask[start] <= 127) continue;
    let top = 0;
    let count = 0;
    stack[top++] = start;
    seen[start] = 1;
    while (top) {
      const i = stack[--top];
      count++;
      const x = i % width;
      const n = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i - width, i + width];
      for (const j of n) {
        if (j >= 0 && j < mask.length && !seen[j] && mask[j] > 127) {
          seen[j] = 1;
          stack[top++] = j;
        }
      }
    }
    const frac = count / mask.length;
    if (frac >= minArea) sizes.push(frac);
  }
  return sizes.sort((a, b) => b - a);
}

/**
 * Fraction of masked pixels that look like skin (classic RGB skin rule). Lets the
 * quality gate tell a real face/hand (skin-toned) from an empty dark opening
 * that a detector labels "face" only because of its shape.
 */
function skinFraction(img, mask) {
  const { data } = img;
  let total = 0, skin = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] <= 127) continue;
    total++;
    const o = i * 4;
    const r = data[o], g = data[o + 1], b = data[o + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (r > 95 && g > 40 && b > 20 && mx - mn > 15 && Math.abs(r - g) > 15 && r > g && r > b) skin++;
  }
  return total ? skin / total : 0;
}

/** Shrink a mask by r pixels (inverse of dilate). */
function erode(mask, width, height, r) {
  const inv = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) inv[i] = mask[i] > 127 ? 0 : 255;
  const grown = dilate(inv, width, height, r);
  const out = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) out[i] = grown[i] > 127 ? 0 : 255;
  return out;
}

/**
 * Luminance stats inside a mask: mean brightness and "structure" (mean absolute
 * Laplacian = local light/dark detail). An empty dark opening is smooth (low
 * structure); a face - even one in deep shadow - has eyes/nose/mouth detail.
 */
function regionStats(img, mask) {
  const { width, height, data } = img;
  const lum = (i) => 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  let n = 0, sumL = 0, sumLap = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (mask[i] <= 127) continue;
      const c = lum(i);
      const lap = 4 * c - lum(i - 1) - lum(i + 1) - lum(i - width) - lum(i + width);
      sumL += c;
      sumLap += Math.abs(lap);
      n++;
    }
  }
  return n ? { mean: sumL / n, structure: sumLap / n, pixels: n } : { mean: 0, structure: 0, pixels: 0 };
}

/** Fraction of border pixels (outer frame of the image) that are opaque. */
function borderTouch(img, threshold = 100) {
  const { width, height, data } = img;
  let n = 0, hit = 0;
  const check = (x, y) => { n++; if (data[(y * width + x) * 4 + 3] > threshold) hit++; };
  for (let x = 0; x < width; x++) { check(x, 0); check(x, height - 1); }
  for (let y = 1; y < height - 1; y++) { check(0, y); check(width - 1, y); }
  return hit / n;
}

/**
 * Gradient-map a (grey) image by luminance: black -> deep shade of the tint,
 * mid -> the tint, white -> pale cream. Gives a family base the item's colour
 * while keeping its light/shade (shape). Alpha untouched.
 */
function tintByLuminance(img, [tr, tg, tb], { light = [242, 234, 216], pivot = 0.55 } = {}) {
  const { data } = img;
  const dark = [tr * 0.25, tg * 0.25, tb * 0.25];
  for (let i = 0; i < data.length; i += 4) {
    const l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    let c;
    // pivot: luminance where the tint is pure; lower pivot = more of the lighter tones go cream
    if (l < pivot) { const k = l / pivot; c = [dark[0] + (tr - dark[0]) * k, dark[1] + (tg - dark[1]) * k, dark[2] + (tb - dark[2]) * k]; }
    else { const k = (l - pivot) / (1 - pivot); c = [tr + (light[0] - tr) * k, tg + (light[1] - tg) * k, tb + (light[2] - tb) * k]; }
    data[i] = Math.round(c[0]); data[i + 1] = Math.round(c[1]); data[i + 2] = Math.round(c[2]);
  }
  return img;
}

/**
 * Lighten the lower part of each separate object (e.g. each fish's belly) toward a
 * pale colour. Objects = pixels that differ from the flat background; each connected
 * object gets a ramp over the bottom "frac" (fraction) of its own height, strongest at the bottom.
 */
function lightenLowerParts(img, { bg = [205, 205, 205], frac = 0.45, amount = 0.6, color = [236, 230, 212] } = {}) {
  const { width, height, data } = img;
  const n = width * height;
  const obj = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (Math.abs(data[o] - bg[0]) + Math.abs(data[o + 1] - bg[1]) + Math.abs(data[o + 2] - bg[2]) > 18) obj[i] = 1;
  }
  const label = new Int32Array(n).fill(-1);
  const stack = new Int32Array(n);
  const boxes = [];
  for (let s = 0; s < n; s++) {
    if (!obj[s] || label[s] !== -1) continue;
    const id = boxes.length; let top = 0; let y0 = height, y1 = 0, count = 0;
    stack[top++] = s; label[s] = id;
    while (top) {
      const i = stack[--top]; count++;
      const y = Math.floor(i / width), x = i % width;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const j of [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i - width, i + width]) {
        if (j >= 0 && j < n && obj[j] && label[j] === -1) { label[j] = id; stack[top++] = j; }
      }
    }
    boxes.push({ y0, y1, count });
  }
  for (let i = 0; i < n; i++) {
    const id = label[i]; if (id < 0) continue;
    const b = boxes[id]; if (b.count < n * 0.002) continue;
    const h = Math.max(1, b.y1 - b.y0), rel = (Math.floor(i / width) - b.y0) / h;
    const start = 1 - frac; if (rel <= start) continue;
    const k = amount * Math.min(1, (rel - start) / frac) ** 0.8;
    const o = i * 4;
    for (let c = 0; c < 3; c++) data[o + c] = Math.round(data[o + c] * (1 - k) + color[c] * k);
  }
  return img;
}

module.exports = { lightenLowerParts, tintByLuminance, borderTouch, erode, regionStats, skinFraction, maskFromImage, alphaMask, area, topRow, dilate, blur, fillVoid, erase, cutBelow, outline, flatten, islands };
