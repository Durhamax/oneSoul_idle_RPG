#!/usr/bin/env node
/**
 * Record an approved icon in the approvals ledger.
 *
 *   node scripts/asset-gen/approve.js <staged.png> [--note "text"]
 *   e.g. node scripts/asset-gen/approve.js assets/_staging/materials/solfish__f5/v2.png
 *
 * Copies the image to scripts/asset-gen/approved/<file_stem>.png and records it in
 * scripts/asset-gen/approved.json (item id, source, seed, date). The generator skips
 * approved items in batch runs (use --include-approved, or name them in --only, to redo).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const LEDGER = path.join(__dirname, 'approved.json');
const DIR = path.join(__dirname, 'approved');

const args = process.argv.slice(2);
const noteIdx = args.indexOf('--note');
const note = noteIdx !== -1 ? args[noteIdx + 1] : undefined;
const staged = args.find((a, i) => !a.startsWith('--') && !(noteIdx !== -1 && i === noteIdx + 1));
if (!staged) { console.error('Usage: node scripts/asset-gen/approve.js <staged.png> [--note "text"]'); process.exit(1); }

const abs = path.resolve(staged);
const metaPath = path.join(path.dirname(abs), 'meta.json');
if (!fs.existsSync(abs) || !fs.existsSync(metaPath)) throw new Error('Staged image or its meta.json not found.');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const variant = (meta.variants || []).find((v) => v.file === path.basename(abs)) || {};
const stem = path.basename(meta.targetPath || `${meta.id}.png`, '.png');

fs.mkdirSync(DIR, { recursive: true });
const dest = path.join(DIR, `${stem}.png`);
fs.copyFileSync(abs, dest);

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : {};
ledger[meta.id] = {
  file: rel(dest),
  targetPath: meta.targetPath,
  from: rel(abs),
  seed: variant.seed ?? null,
  checkpoint: meta.checkpoint,
  approved: new Date().toISOString().slice(0, 10),
  ...(note ? { note } : {}),
};
fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n');
console.log(`approved ${meta.id} -> ${rel(dest)} (from ${rel(abs)}, seed ${variant.seed ?? '?'})`);
