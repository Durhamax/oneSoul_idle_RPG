#!/usr/bin/env node
/**
 * Promote an approved staged render to a family base.
 *
 *   node scripts/asset-gen/promote-base.js <staged.png> <family> [--denoise 0.6] [--keep-color]
 *   e.g. node scripts/asset-gen/promote-base.js assets/_staging/materials/clay__m8/v2.png mineral
 *
 * Finds the exact raw render (before the outline) in ComfyUI's output folder by
 * matching raw + outline == staged, then writes:
 *   references/families/<family>.png        the approved icon (preview)
 *   references/families/<family>_start.png  raw, flattened on grey, NEUTRAL GREY
 *                                            (shape only; each item's spec tint adds colour)
 * and records the base in prompt-templates.json "familyBases".
 * --keep-color keeps the colour start image (only for single-item families).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const PNG = require('./png.js');
const OPS = require('./imageops.js');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATES = path.join(__dirname, 'prompt-templates.json');
const FAMILIES = path.join(__dirname, 'references', 'families');
const COMFY_OUTPUT = process.env.COMFY_OUTPUT_DIR || 'C:/Users/durha/AppData/Local/Comfy-Desktop/ComfyUI-Shared/output';

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(`--${n}`); return i === -1 ? undefined : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true; };
const [stagedArg, family] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--denoise'));
if (!stagedArg || !family) {
  console.error('Usage: node scripts/asset-gen/promote-base.js <staged.png> <family> [--denoise N] [--keep-color]');
  process.exit(1);
}

const staged = path.resolve(stagedArg);
const metaPath = path.join(path.dirname(staged), 'meta.json');
if (!fs.existsSync(staged) || !fs.existsSync(metaPath)) throw new Error('Staged image or its meta.json not found.');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const vFile = path.basename(staged);                        // v2.png
const variant = meta.variants.find((x) => x.file === vFile);
const vNum = vFile.replace(/\D/g, '');
const stem = path.basename(path.dirname(staged)).replace(/__.*$/, ''); // clay__m8 -> clay
const tpl = JSON.parse(fs.readFileSync(TEMPLATES, 'utf8'));
const px = (meta.settings.outline && meta.settings.outline.px) || tpl.outline.px;
const rgb = ((h) => { const n = parseInt(String(h || '#1a1612').replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; })(meta.settings.outline && meta.settings.outline.color);

// Look for the raw render: ComfyUI saves "<prefix>_<counter>_.png" under onesoul/<folder>/.
const dir = path.join(COMFY_OUTPUT, 'onesoul', meta.folder);
const target = PNG.decode(fs.readFileSync(staged));
const candidates = fs.readdirSync(dir)
  .filter((f) => f.startsWith(`${stem}_v${vNum}_`) && /_\d+_\.png$/.test(f) && !f.includes('_det_'))
  .sort().reverse();
let match = null;
for (const f of candidates) {
  const raw = PNG.decode(fs.readFileSync(path.join(dir, f)));
  if (raw.width !== target.width) continue;
  const check = PNG.decode(PNG.encode(raw));
  OPS.outline(check, px, rgb);
  let diff = 0;
  for (let i = 0; i < check.data.length; i += 97) if (Math.abs(check.data[i] - target.data[i]) > 1) diff++;
  if (diff === 0) { match = { file: f, raw }; break; }
}
if (!match) throw new Error(`No raw render in ${dir} matches ${stagedArg} (it may have been cleaned up, or cleanup changed it).`);

fs.mkdirSync(FAMILIES, { recursive: true });
fs.copyFileSync(staged, path.join(FAMILIES, `${family}.png`));
const start = OPS.flatten(match.raw, [205, 205, 205]);
if (!flag('keep-color')) {
  const d = start.data;
  for (let i = 0; i < d.length; i += 4) { const l = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]); d[i] = d[i + 1] = d[i + 2] = l; }
}
fs.writeFileSync(path.join(FAMILIES, `${family}_start.png`), PNG.encode(start));

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
tpl.familyBases = tpl.familyBases || {};
tpl.familyBases[family] = {
  start: rel(path.join(FAMILIES, `${family}_start.png`)),
  preview: rel(path.join(FAMILIES, `${family}.png`)),
  denoise: flag('denoise') && flag('denoise') !== true ? parseFloat(flag('denoise')) : 0.6,
  approvedFrom: `${meta.id} ${rel(path.dirname(staged)).split('/').pop()} ${vFile} (seed ${variant ? variant.seed : '?'}), approved ${new Date().toISOString().slice(0, 10)}`,
};
fs.writeFileSync(TEMPLATES, JSON.stringify(tpl, null, 2) + '\n');
console.log(`${family}: base <- ${rel(staged)} (raw ${match.file}, exact match); start image ${flag('keep-color') ? 'in colour' : 'neutral grey'}; denoise ${tpl.familyBases[family].denoise}`);
