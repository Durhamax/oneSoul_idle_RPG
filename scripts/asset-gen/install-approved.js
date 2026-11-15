#!/usr/bin/env node
/**
 * Install approved icons into the game.
 *
 *   node scripts/asset-gen/install-approved.js [--dry-run] [--size 512] [--only id,id]
 *
 * For every entry in scripts/asset-gen/approved.json:
 *   - writes the approved image to its canonical game path (the ledger's targetPath,
 *     e.g. assets/icons/materials/small_game_meat.png), downscaled to --size (default 512;
 *     icons show at 48-96px, the 1024 master stays in scripts/asset-gen/approved/);
 *   - points the item's `icon:` field in its registry file at that path (replacing an
 *     emoji or an irregular old filename).
 * Old image files are left in place; the asset audit lists any that become unreferenced.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const PNG = require('./png.js');

const ROOT = path.resolve(__dirname, '..', '..');
const LEDGER = path.join(__dirname, 'approved.json');
const ITEM_REGISTRIES = [
  'src/data/items/production/equipment/equipment.js',
  'src/data/items/production/consumables/consumables.js',
  'src/data/items/production/materials/materials.js',
  'src/data/items/production/currencies/currencies.js',
];

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(`--${n}`); return i === -1 ? undefined : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true; };
const DRY = !!flag('dry-run');
const SIZE = parseInt(flag('size') || '512', 10);
const ONLY = flag('only') && flag('only') !== true ? new Set(String(flag('only')).split(',')) : null;

/** Box-filter downscale with premultiplied alpha (no halo around the outline). */
function downscale(img, size) {
  if (img.width === size && img.height === size) return img;
  const { width: W, height: H, data: s } = img;
  const out = Buffer.alloc(size * size * 4);
  const fx = W / size, fy = H / size;
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * fy), y1 = Math.max(y0 + 1, Math.floor((y + 1) * fy));
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * fx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * fx));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
        const i = (yy * W + xx) * 4, al = s[i + 3];
        r += s[i] * al; g += s[i + 1] * al; b += s[i + 2] * al; a += al; n++;
      }
      const o = (y * size + x) * 4;
      if (a > 0) { out[o] = Math.round(r / a); out[o + 1] = Math.round(g / a); out[o + 2] = Math.round(b / a); }
      out[o + 3] = Math.round(a / n);
    }
  }
  return { width: size, height: size, data: out };
}

/** Find the registry file + text block that defines item `id`, and its icon line. */
function locate(id) {
  for (const rel of ITEM_REGISTRIES) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const idx = text.search(new RegExp(`\\bid:\\s*['"]${id}['"]`));
    if (idx === -1) continue;
    // the item's block ends at the next "id:" (or end of file)
    const rest = text.slice(idx + 1);
    const next = rest.search(/\bid:\s*['"]/);
    const end = next === -1 ? text.length : idx + 1 + next;
    const block = text.slice(idx, end);
    const m = block.match(/(\bicon:\s*)(['"])(.*?)\2/);
    return { rel, file, text, idx, end, icon: m ? m[3] : null, iconMatch: m ? { at: idx + m.index, len: m[0].length, prefix: m[1], quote: m[2] } : null };
  }
  return null;
}

const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
const edits = {}; // file -> text
let installed = 0;
for (const [id, entry] of Object.entries(ledger)) {
  if (ONLY && !ONLY.has(id)) continue;
  const src = path.join(ROOT, entry.file);
  const dest = entry.targetPath;
  if (!fs.existsSync(src) || !dest) { console.log(`  ! ${id}: missing approved file or targetPath, skipped`); continue; }
  const loc = locate(id);
  const old = loc ? loc.icon : null;
  const action = !loc ? 'no registry entry (image only)' : !loc.iconMatch ? 'no icon field (image only)' : old === dest ? 'icon field already correct' : `icon '${old}' -> '${dest}'`;
  console.log(`${id.padEnd(18)} ${dest.padEnd(48)} ${action}`);
  if (DRY) continue;

  const img = downscale(PNG.decode(fs.readFileSync(src)), SIZE);
  fs.mkdirSync(path.dirname(path.join(ROOT, dest)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, dest), PNG.encode(img));
  installed++;

  if (loc && loc.iconMatch && old !== dest) {
    const text = edits[loc.file] ?? loc.text;
    // re-locate in the (possibly already edited) text so offsets stay valid
    const idx = text.search(new RegExp(`\\bid:\\s*['"]${id}['"]`));
    const rest = text.slice(idx + 1);
    const next = rest.search(/\bid:\s*['"]/);
    const end = next === -1 ? text.length : idx + 1 + next;
    const block = text.slice(idx, end).replace(/(\bicon:\s*)(['"])(.*?)\2/, `$1$2${dest}$2`);
    edits[loc.file] = text.slice(0, idx) + block + text.slice(end);
  }
}
for (const [file, text] of Object.entries(edits)) fs.writeFileSync(file, text);
console.log(DRY ? '\nDry run: nothing written.' : `\nInstalled ${installed} icon(s) at ${SIZE}px; updated ${Object.keys(edits).length} registry file(s).`);
// keep the asset handshake doc (docs/ASSET_STATUS.md) in step with what's installed
if (!DRY) require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'asset-status.js')], { stdio: 'inherit' });
