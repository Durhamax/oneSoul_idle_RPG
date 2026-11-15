#!/usr/bin/env node
/**
 * Asset handshake: writes docs/ASSET_STATUS.md - which art is approved and in the game,
 * which is in progress in the generation pipeline, and which has not been started.
 *
 *   node scripts/asset-gen/asset-status.js [--stdout]
 *
 * Generated from the sources of truth, never hand-edited:
 *   - scripts/asset-gen/approved.json                 approved item icons (approve.js / install-approved.js)
 *   - assets/_staging/backgrounds/notes.json          "approved" map for region backgrounds
 *   - scripts/asset-gen/specs/*.json                  what is specced for generation
 *   - assets/_staging/<category>/<stem>__<round>/     what has staged renders
 *   - src/data/** registries                          what the game currently references
 * install-approved.js re-runs this after installing; run it by hand after anything else
 * changes status (e.g. installing a background).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => !!p && fs.existsSync(path.join(ROOT, p));
const json = (p, d) => (exists(p) ? JSON.parse(read(p)) : d);
const snake = (id) => id.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z])([A-Z][a-z])/g, '$1_$2').toLowerCase();
const isFile = (icon) => !!icon && /\.(png|jpe?g|webp|svg|gif)$/i.test(icon);

const ITEM_REGISTRIES = {
  materials: 'src/data/items/production/materials/materials.js',
  consumables: 'src/data/items/production/consumables/consumables.js',
  equipment: 'src/data/items/production/equipment/equipment.js',
  currencies: 'src/data/items/production/currencies/currencies.js',
};
const OTHER_REGISTRIES = {
  enemies: ['src/data/enemies/production/enemies_production.js', 'src/data/enemies/production/basicEnemies.js'],
  nodes: ['src/data/nodes/production/nodes.js'],
};

/** Every `id: '...'` block in a registry file with its name + icon. */
function entries(file) {
  if (!exists(file)) return [];
  const text = read(file);
  const out = [];
  const re = /\bid:\s*['"]([^'"]+)['"]/g;
  const hits = [...text.matchAll(re)];
  hits.forEach((m, i) => {
    const block = text.slice(m.index, i + 1 < hits.length ? hits[i + 1].index : text.length);
    const name = (block.match(/\bname:\s*(['"])(.*?)\1/) || [])[2];
    const icon = (block.match(/\bicon:\s*(['"])(.*?)\1/) || [])[2];
    if (name) out.push({ id: m[1], name, icon: icon || null });
  });
  return out;
}

/** Staged renders: assets/_staging/<category>/<stem>__<round>/ -> Map stem -> [category/round...] */
function staged() {
  const map = new Map();
  const S = path.join(ROOT, 'assets', '_staging');
  if (!fs.existsSync(S)) return map;
  for (const cat of fs.readdirSync(S)) {
    const cdir = path.join(S, cat);
    if (!fs.statSync(cdir).isDirectory() || cat === 'backgrounds' || cat === 'boards') continue;
    for (const d of fs.readdirSync(cdir)) {
      if (!fs.statSync(path.join(cdir, d)).isDirectory()) continue;
      const stem = d.split('__')[0];
      if (!map.has(stem)) map.set(stem, []);
      map.get(stem).push(`${cat}/${d}`);
    }
  }
  return map;
}

// ---- item icons ----------------------------------------------------------
const ledger = json('scripts/asset-gen/approved.json', {});
const specs = {};
for (const f of fs.existsSync(path.join(__dirname, 'specs')) ? fs.readdirSync(path.join(__dirname, 'specs')) : []) {
  if (f === 'backgrounds.json' || !f.endsWith('.json')) continue;
  for (const [id, s] of Object.entries(json(`scripts/asset-gen/specs/${f}`, {}))) if (!id.startsWith('_')) specs[id] = { ...s, specFile: f };
}
const stage = staged();

const items = { approved: [], progress: [], legacy: [], none: [] };
const seen = new Set();
for (const [cat, file] of Object.entries(ITEM_REGISTRIES)) {
  for (const e of entries(file)) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    const a = ledger[e.id];
    const st = stage.get(snake(e.id));
    const row = { ...e, cat };
    if (a && e.icon === a.targetPath && exists(a.targetPath)) items.approved.push({ ...row, path: a.targetPath });
    else if (a) items.progress.push({ ...row, note: `approved, not yet installed (run install-approved.js) -> ${a.targetPath}` });
    else if (specs[e.id] || st) items.progress.push({ ...row, note: [specs[e.id] ? `specced in specs/${specs[e.id].specFile}` : '', st ? `${st.length} staged round(s) in assets/_staging/${st[0].split('/')[0]}/` : ''].filter(Boolean).join('; ') });
    else if (isFile(e.icon) && exists(e.icon)) items.legacy.push({ ...row, path: e.icon });
    else items.none.push({ ...row, note: isFile(e.icon) ? `missing file ${e.icon}` : e.icon ? `emoji ${e.icon}` : 'no icon' });
  }
}
// specced / staged things with no registry entry yet (e.g. armor pieces still being designed)
const known = new Set([...seen].map(snake));
const orphanStaged = [...stage.entries()].filter(([stem]) => ![...known].some((k) => stem === k || stem.startsWith(`${k}_`))).map(([stem, r]) => ({ stem, cat: r[0].split('/')[0], rounds: r.length }));

// ---- region backgrounds --------------------------------------------------
const regionsText = read('src/data/regions/worldRegions.js');
const bgSpecs = json('scripts/asset-gen/specs/backgrounds.json', {});
const bgNotes = json('assets/_staging/backgrounds/notes.json', {});
const bgApproved = bgNotes.approved || {};
const regions = [];
const rre = /^\s*["'](region_[-\d_]+)["']\s*:\s*\{/gm;
const rhits = [...regionsText.matchAll(rre)];
rhits.forEach((m, i) => {
  const block = regionsText.slice(m.index, i + 1 < rhits.length ? rhits[i + 1].index : regionsText.length);
  const name = (block.match(/\bname:\s*(['"])(.*?)\1/) || [])[2] || m[1];
  const bg = (block.match(/\bbackgroundImage:\s*(['"])(.*?)\1/) || [])[2] || null;
  regions.push({ id: m[1], name, bg });
});
const bgs = { approved: [], progress: [], legacy: [], none: [] };
for (const r of regions) {
  const s = bgSpecs[r.id];
  const appr = s && bgApproved[s.stem];
  const rounds = s && fs.existsSync(path.join(ROOT, 'assets/_staging/backgrounds', s.stem)) ? fs.readdirSync(path.join(ROOT, 'assets/_staging/backgrounds', s.stem)).length : 0;
  if (appr && r.bg === s.targetPath && exists(r.bg)) bgs.approved.push({ ...r, path: r.bg });
  else if (appr) bgs.progress.push({ ...r, note: `approved (${appr}), not yet installed -> ${s.targetPath}` });
  else if (s) bgs.progress.push({ ...r, note: `specced; ${rounds} staged round(s) under review` });
  else if (r.bg && exists(r.bg)) bgs.legacy.push({ ...r, path: r.bg });
  else bgs.none.push({ ...r, note: r.bg ? `missing file ${r.bg}` : 'biome default' });
}

// ---- enemies / nodes -----------------------------------------------------
const other = {};
for (const [k, files] of Object.entries(OTHER_REGISTRIES)) {
  const list = files.flatMap(entries);
  other[k] = { art: list.filter((e) => isFile(e.icon) && exists(e.icon)), none: list.filter((e) => !(isFile(e.icon) && exists(e.icon))) };
}

// ---- write ---------------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|');
const table = (rows, cols) => (rows.length ? [`| ${cols.map((c) => c[0]).join(' | ')} |`, `|${cols.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${cols.map((c) => esc(c[1](r))).join(' | ')} |`)].join('\n') : '_None._');
const code = (s) => (s ? `\`${s}\`` : '');

const md = `# Asset Status — the art handshake

> **Generated file — do not hand-edit.** Regenerate with \`node scripts/asset-gen/asset-status.js\` (install-approved.js does this automatically). Sources of truth: \`scripts/asset-gen/approved.json\` (item icons), \`assets/_staging/backgrounds/notes.json\` → \`approved\` (region backgrounds), \`scripts/asset-gen/specs/*.json\`, \`assets/_staging/\`, and the game registries.

## Rules for every chat

1. **Approved & installed** = final art, approved by the user and wired into the game. Expect it in-game. **Do not regenerate, replace, rename or move it** (or change the registry \`icon\` / \`backgroundImage\` pointing at it) without the user asking.
2. **In progress** = being generated or reviewed in the asset pipeline (\`scripts/asset-gen/\`, renders under \`assets/_staging/\`). Don't install staged renders or approve anything on the user's behalf — only the user approves. New content can use its emoji or placeholder until approval.
3. **Legacy art** = an older image the game uses that has not gone through the pipeline. It works and is expected in-game, but will be replaced; don't build on its style.
4. **Not started** = no art yet (emoji, missing file, or biome-default background). Free to spec. When adding art for one of these, add its spec to \`scripts/asset-gen/specs/\` so it shows up here as in progress.
5. **Adding new items/regions:** an emoji \`icon\` (or \`backgroundImage: null\`) is the expected placeholder — they appear under *Not started* automatically. Don't point at image paths that don't exist yet.
6. How approval works: the user approves a specific render → \`approve.js\` records it in \`approved.json\` → \`install-approved.js\` downscales it into \`assets/icons/...\` and updates the registry \`icon\`. Backgrounds: approved render → 1024² JPG at the spec's \`targetPath\` → region \`backgroundImage\`. Art direction and pipeline details live in \`assets/_staging/\` review pages and \`scripts/asset-gen/\` script headers.

## Summary

| Asset type | Approved & installed | In progress | Legacy art | Not started |
|---|---|---|---|---|
| Item icons | ${items.approved.length} | ${items.progress.length + orphanStaged.length} | ${items.legacy.length} | ${items.none.length} |
| Region backgrounds | ${bgs.approved.length} | ${bgs.progress.length} | ${bgs.legacy.length} | ${bgs.none.length} |
| Enemy art | 0 | 0 | ${other.enemies.art.length} | ${other.enemies.none.length} |
| Node art | 0 | 0 | ${other.nodes.art.length} | ${other.nodes.none.length} |

## Item icons

### Approved & installed
${table(items.approved, [['Item', (r) => r.name], ['id', (r) => code(r.id)], ['Registry', (r) => r.cat], ['File', (r) => code(r.path)]])}

### In progress
${table(items.progress, [['Item', (r) => r.name], ['id', (r) => code(r.id)], ['Registry', (r) => r.cat], ['Current in-game icon', (r) => (isFile(r.icon) ? code(r.icon) : r.icon || '—')], ['Pipeline', (r) => r.note]])}

${orphanStaged.length ? `**Staged, no registry entry yet** (art being designed ahead of the item):\n\n${table(orphanStaged, [['Staged as', (r) => code(r.stem)], ['Category', (r) => r.cat], ['Rounds', (r) => r.rounds]])}\n` : ''}
### Legacy art (in game, not pipeline-approved)
${table(items.legacy, [['Item', (r) => r.name], ['id', (r) => code(r.id)], ['Registry', (r) => r.cat], ['File', (r) => code(r.path)]])}

### Not started
${['materials', 'consumables', 'equipment', 'currencies'].map((cat) => {
  const rows = items.none.filter((r) => r.cat === cat);
  return rows.length ? `**${cat}** (${rows.length}): ${rows.map((r) => `${r.name} ${code(r.id)}`).join(', ')}` : '';
}).filter(Boolean).join('\n\n') || '_None._'}

## Region backgrounds

### Approved & installed
${table(bgs.approved, [['Region', (r) => r.name], ['id', (r) => code(r.id)], ['File', (r) => code(r.path)]])}

### In progress
${table(bgs.progress, [['Region', (r) => r.name], ['id', (r) => code(r.id)], ['Pipeline', (r) => r.note]])}

Review page: \`node scripts/asset-gen/background-review.js\` → \`assets/_staging/backgrounds.html\`.

### Legacy art
${table(bgs.legacy, [['Region', (r) => r.name], ['id', (r) => code(r.id)], ['File', (r) => code(r.path)]])}

### Not started (biome default)
${bgs.none.length ? bgs.none.map((r) => `${r.name} ${code(r.id)}`).join(', ') : '_None._'}

## Enemies and resource nodes

No pipeline art yet — all use emoji icons unless listed as legacy art.

${other.enemies.art.length ? `**Enemy legacy art:** ${other.enemies.art.map((e) => `${e.name} ${code(e.icon)}`).join(', ')}\n\n` : ''}**Enemies, not started** (${other.enemies.none.length}): ${other.enemies.none.map((e) => e.name).join(', ') || '—'}

${other.nodes.art.length ? `**Node legacy art:** ${other.nodes.art.map((e) => `${e.name} ${code(e.icon)}`).join(', ')}\n\n` : ''}**Nodes, not started** (${other.nodes.none.length}): ${other.nodes.none.map((e) => e.name).join(', ') || '—'}
`;

if (process.argv.includes('--stdout')) process.stdout.write(md);
else {
  fs.writeFileSync(path.join(ROOT, 'docs', 'ASSET_STATUS.md'), md);
  console.log(`docs/ASSET_STATUS.md: icons ${items.approved.length} approved / ${items.progress.length + orphanStaged.length} in progress / ${items.legacy.length} legacy / ${items.none.length} not started; backgrounds ${bgs.approved.length} / ${bgs.progress.length} / ${bgs.legacy.length} / ${bgs.none.length}`);
}
