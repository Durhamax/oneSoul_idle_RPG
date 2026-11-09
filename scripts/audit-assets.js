#!/usr/bin/env node
/**
 * Asset Gap Audit
 * -----------------------------------------------------------------------------
 * Answers "what art is the game missing?" without touching any pixels.
 *
 * Two complementary passes:
 *   1. REFERENCE SCAN  - greps all source/data for `assets/....<ext>` string
 *                        literals and diffs them against files on disk.
 *                        -> broken refs (missing), orphaned files, bad filenames.
 *   2. REGISTRY COVERAGE - loads the production item + enemy registries and
 *                        classifies each entry as having real art vs. an emoji
 *                        fallback. -> coverage % per category.
 *
 * Usage:
 *   node scripts/audit-assets.js            # human-readable report
 *   node scripts/audit-assets.js --json     # write manifest to scripts/asset-audit.json
 *   node scripts/audit-assets.js --json -   # print manifest JSON to stdout
 *
 * Exit code is 0 always (report tool). Add --strict to exit 1 when broken
 * references exist (useful for CI / pre-commit).
 *
 * Zero dependencies (Node built-ins only).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');

const IMAGE_EXT = /\.(png|jpe?g|webp|svg|gif)$/i;
// Matches string literals like assets/icons/materials/common mushroom.png
const ASSET_REF = /assets\/[A-Za-z0-9_\-./ ]+?\.(?:png|jpe?g|webp|svg|gif)/gi;

// Directories to scan for references (relative to ROOT). Scans .js/.html/.json/.csv.
const SCAN_DIRS = ['src', 'data', 'styles'];
const SCAN_ROOT_FILES = ['index.html', 'saveSystem.js', 'server.js'];
const SCAN_EXT = /\.(js|html|json|csv|css)$/i;

// Leaf production registries that are safe to require() (pure data, CJS-guarded).
const ITEM_REGISTRIES = [
  ['equipment', 'src/data/items/production/equipment/equipment.js'],
  ['consumables', 'src/data/items/production/consumables/consumables.js'],
  ['materials', 'src/data/items/production/materials/materials.js'],
  ['currencies', 'src/data/items/production/currencies/currencies.js'],
];
const ENEMY_REGISTRY = 'src/data/enemies/production/enemies_production.js';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const WANT_JSON = args.includes('--json');
const JSON_STDOUT = WANT_JSON && args.includes('-');
const STRICT = args.includes('--strict');

const toPosix = (p) => p.split(path.sep).join('/');
const relFromRoot = (abs) => toPosix(path.relative(ROOT, abs));

/**
 * Remove comments so commented-out/suggested asset paths aren't counted as
 * live references. Handles block comments, HTML comments, and `//` line
 * comments (while preserving `://` in URLs).
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '') // /* ... */
    .replace(/<!--[\s\S]*?-->/g, '') // <!-- ... -->
    .replace(/(?<!:)\/\/.*$/gm, ''); // // line comments, but not https://
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function tryRequire(relPath) {
  const abs = path.join(ROOT, relPath);
  // Silence side-effectful top-level logging (e.g. registry-not-available warnings)
  // emitted when a data module is loaded outside the browser.
  const saved = { log: console.log, warn: console.warn, error: console.error };
  console.log = console.warn = console.error = () => {};
  try {
    delete require.cache[require.resolve(abs)];
    return require(abs);
  } catch (err) {
    Object.assign(console, saved);
    console.error(`  ! could not load ${relPath}: ${err.message}`);
    return null;
  } finally {
    Object.assign(console, saved);
  }
}

/** Minimal CSV row count + id set (no quoted-comma handling needed for id column). */
function readCsvIds(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return { count: 0, ids: new Set() };
  const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { count: 0, ids: new Set() };
  const header = lines[0].split(',');
  const idCol = header.indexOf('id');
  const ids = new Set();
  for (let i = 1; i < lines.length; i++) {
    if (idCol >= 0) {
      const id = (lines[i].split(',')[idCol] || '').trim();
      if (id) ids.add(id);
    }
  }
  return { count: lines.length - 1, ids };
}

/** Classify an icon/asset field value. */
function classifyIcon(value, diskSet) {
  if (typeof value !== 'string' || value.trim() === '') return 'none';
  if (!value.includes('assets/')) return 'emoji'; // emoji or plain string fallback
  const norm = value.trim().toLowerCase();
  return diskSet.has(norm) ? 'png' : 'png-missing';
}

function pct(n, d) {
  if (!d) return '  -  ';
  return `${String(Math.round((n / d) * 100)).padStart(3)}%`;
}

function bar(n, d, width = 20) {
  if (!d) return '';
  const filled = Math.round((n / d) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ---------------------------------------------------------------------------
// 1. files on disk
// ---------------------------------------------------------------------------

const diskFiles = walk(ASSETS_DIR)
  .filter((f) => IMAGE_EXT.test(f))
  .map(relFromRoot);
const diskSet = new Set(diskFiles.map((f) => f.toLowerCase()));

// ---------------------------------------------------------------------------
// 2. referenced asset paths
// ---------------------------------------------------------------------------

const scanFiles = [];
for (const d of SCAN_DIRS) walk(path.join(ROOT, d), scanFiles);
for (const f of SCAN_ROOT_FILES) {
  const abs = path.join(ROOT, f);
  if (fs.existsSync(abs)) scanFiles.push(abs);
}

/** Map<normalizedRefPath, Set<sourceFile>> */
const refs = new Map();
for (const file of scanFiles) {
  if (!SCAN_EXT.test(file)) continue;
  let text;
  try {
    text = stripComments(fs.readFileSync(file, 'utf8'));
  } catch {
    continue;
  }
  const matches = text.match(ASSET_REF);
  if (!matches) continue;
  for (const m of matches) {
    const norm = m.trim().toLowerCase();
    if (!refs.has(norm)) refs.set(norm, new Set());
    refs.get(norm).add(relFromRoot(file));
  }
}

const referencedSet = new Set(refs.keys());

// broken references: referenced in code but no file on disk
const missing = [...refs.keys()]
  .filter((r) => !diskSet.has(r))
  .sort();

// orphans: on disk but never referenced
const orphans = diskFiles
  .filter((f) => !referencedSet.has(f.toLowerCase()))
  .sort();

// filename hygiene: spaces or uppercase letters in the path
const hygiene = diskFiles
  .filter((f) => /\s/.test(f) || /[A-Z]/.test(path.basename(f)))
  .sort();

// ---------------------------------------------------------------------------
// 3. registry coverage
// ---------------------------------------------------------------------------

/** category -> { total, png, pngMissing, emoji } and list of gaps */
const itemCoverage = {};
const itemGaps = []; // entries with no real art

for (const [label, relPath] of ITEM_REGISTRIES) {
  const reg = tryRequire(relPath);
  if (!reg) continue;
  for (const [key, item] of Object.entries(reg)) {
    const cat = item.category || item.type || label;
    const c = (itemCoverage[cat] = itemCoverage[cat] || {
      total: 0,
      png: 0,
      pngMissing: 0,
      emoji: 0,
    });
    c.total++;
    const kind = classifyIcon(item.icon, diskSet);
    if (kind === 'png') c.png++;
    else if (kind === 'png-missing') {
      c.pngMissing++;
      itemGaps.push({ id: item.id || key, name: item.name, category: cat, reason: 'png-missing', ref: item.icon });
    } else {
      c.emoji++;
      itemGaps.push({ id: item.id || key, name: item.name, category: cat, reason: kind, ref: item.icon || null });
    }
  }
}

// enemies: icon (emoji) + assetPath (png)
const enemyReg = tryRequire(ENEMY_REGISTRY);
const enemyCoverage = { total: 0, png: 0, pngMissing: 0, none: 0 };
const enemyGaps = [];
if (enemyReg) {
  for (const [key, e] of Object.entries(enemyReg)) {
    enemyCoverage.total++;
    const kind = classifyIcon(e.assetPath, diskSet);
    if (kind === 'png') enemyCoverage.png++;
    else if (kind === 'png-missing') {
      enemyCoverage.pngMissing++;
      enemyGaps.push({ id: e.id || key, name: e.name, reason: 'png-missing', ref: e.assetPath });
    } else {
      enemyCoverage.none++;
      enemyGaps.push({ id: e.id || key, name: e.name, reason: 'no-assetPath', ref: e.assetPath || null });
    }
  }
}

// ---------------------------------------------------------------------------
// 4. catalog (CSV) vs production registry coverage
// ---------------------------------------------------------------------------

const registryItemIds = new Set();
for (const [, relPath] of ITEM_REGISTRIES) {
  const reg = tryRequire(relPath);
  if (!reg) continue;
  for (const [key, item] of Object.entries(reg)) registryItemIds.add((item.id || key));
}

const itemCatalog = readCsvIds('data/csv/items.csv');
const enemyCatalog = readCsvIds('data/csv/enemies.csv');

// Items in the CSV catalog that aren't in any production JS registry at all
// (so they have no icon field to audit yet).
const catalogOnlyItems = [...itemCatalog.ids].filter((id) => !registryItemIds.has(id)).sort();

// ---------------------------------------------------------------------------
// output
// ---------------------------------------------------------------------------

if (WANT_JSON) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    disk: { count: diskFiles.length, files: diskFiles },
    references: { count: refs.size },
    missing,
    orphans,
    hygiene,
    itemCoverage,
    itemGaps,
    enemyCoverage,
    enemyGaps,
    catalog: {
      itemsCsv: itemCatalog.count,
      itemsInRegistry: registryItemIds.size,
      itemsCatalogOnly: catalogOnlyItems.length,
      catalogOnlyItemIds: catalogOnlyItems,
      enemiesCsv: enemyCatalog.count,
      enemiesInRegistry: enemyCoverage.total,
    },
  };
  const out = JSON.stringify(manifest, null, 2);
  if (JSON_STDOUT) {
    process.stdout.write(out + '\n');
  } else {
    const dest = path.join(__dirname, 'asset-audit.json');
    fs.writeFileSync(dest, out);
    console.log(`Manifest written to ${relFromRoot(dest)}`);
  }
  if (STRICT && missing.length) process.exit(1);
  return;
}

const line = '─'.repeat(68);
console.log('\n' + line);
console.log('  ONESOUL ASSET GAP AUDIT');
console.log(line);
console.log(`  Files on disk:        ${diskFiles.length}`);
console.log(`  Distinct references:  ${refs.size}`);
console.log(`  Broken references:    ${missing.length}`);
console.log(`  Orphaned files:       ${orphans.length}`);
console.log(`  Filename issues:      ${hygiene.length}`);

// --- catalog scope ---
console.log('\n' + line);
console.log('  CATALOG SCOPE (true demand vs. what registries declare)');
console.log(line);
console.log(`  Items in items.csv:        ${itemCatalog.count}`);
console.log(`  Items in production JS:    ${registryItemIds.size}`);
console.log(`  Catalog-only (no JS yet):  ${catalogOnlyItems.length}   <- no icon field exists to audit`);
console.log(`  Enemies in enemies.csv:    ${enemyCatalog.count}`);
console.log(`  Enemies in production JS:  ${enemyCoverage.total}`);
console.log(`\n  Note: the coverage tables below only measure items/enemies that`);
console.log(`  exist in the production JS registries. True art demand is larger.`);

// --- item coverage table ---
console.log('\n' + line);
console.log('  ITEM ART COVERAGE (production JS registries only)');
console.log(line);
console.log(
  '  ' +
    'category'.padEnd(16) +
    'png'.padStart(5) +
    'miss'.padStart(6) +
    'emoji'.padStart(7) +
    'total'.padStart(7) +
    '  coverage'
);
const cats = Object.keys(itemCoverage).sort();
let tTotal = 0, tPng = 0;
for (const cat of cats) {
  const c = itemCoverage[cat];
  tTotal += c.total; tPng += c.png;
  console.log(
    '  ' +
      cat.padEnd(16) +
      String(c.png).padStart(5) +
      String(c.pngMissing).padStart(6) +
      String(c.emoji).padStart(7) +
      String(c.total).padStart(7) +
      `  ${pct(c.png, c.total)} ${bar(c.png, c.total)}`
  );
}
console.log('  ' + '─'.repeat(64));
console.log(
  '  ' + 'TOTAL'.padEnd(16) + String(tPng).padStart(5) + ''.padStart(13) +
  String(tTotal).padStart(7) + `  ${pct(tPng, tTotal)} ${bar(tPng, tTotal)}`
);

// --- enemy coverage ---
console.log('\n' + line);
console.log('  ENEMY ART COVERAGE (assetPath PNG)');
console.log(line);
console.log(
  `  png: ${enemyCoverage.png}   missing-file: ${enemyCoverage.pngMissing}   ` +
  `no-assetPath: ${enemyCoverage.none}   total: ${enemyCoverage.total}   ` +
  `${pct(enemyCoverage.png, enemyCoverage.total)} ${bar(enemyCoverage.png, enemyCoverage.total)}`
);

// --- broken references (most actionable) ---
if (missing.length) {
  console.log('\n' + line);
  console.log(`  BROKEN REFERENCES (${missing.length}) — referenced but not on disk`);
  console.log(line);
  for (const m of missing) {
    const where = [...refs.get(m)].slice(0, 2).join(', ');
    const more = refs.get(m).size > 2 ? ` (+${refs.get(m).size - 2})` : '';
    console.log(`  ✗ ${m}`);
    console.log(`      used in: ${where}${more}`);
  }
}

// --- filename hygiene ---
if (hygiene.length) {
  console.log('\n' + line);
  console.log(`  FILENAME ISSUES (${hygiene.length}) — spaces or uppercase`);
  console.log(line);
  for (const f of hygiene) console.log(`  ⚠ ${f}`);
}

// --- orphans ---
if (orphans.length) {
  console.log('\n' + line);
  console.log(`  ORPHANED FILES (${orphans.length}) — on disk, never referenced`);
  console.log(line);
  for (const o of orphans) console.log(`  ? ${o}`);
}

console.log('\n' + line);
console.log(`  Run with --json to emit a manifest (scripts/asset-audit.json).`);
console.log(line + '\n');

if (STRICT && missing.length) process.exit(1);
