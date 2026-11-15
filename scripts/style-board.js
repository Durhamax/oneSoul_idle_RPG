#!/usr/bin/env node
/**
 * Style Board renderer (local ComfyUI)
 * -----------------------------------------------------------------------------
 * Renders every style x every subject from a board JSON (see
 * scripts/asset-gen/boards/round1.json) with the SAME seed per cell, so the only
 * thing that changes across a row is the subject and across a column is the
 * style. Used to converge on the house style by branching: pick favourites by
 * code, write the next round's board around them, repeat.
 *
 * Output: assets/_staging/boards/<name>/<CODE>_<style>/<subject>_v<n>.png
 *         assets/_staging/boards/<name>/board.html   (open in a browser)
 *         assets/_staging/boards/<name>/results.json (prompts + seeds per cell)
 *
 * Usage:
 *   node scripts/style-board.js scripts/asset-gen/boards/round1.json
 *   node scripts/style-board.js <board.json> --only A,C        # just these style codes/ids
 *   node scripts/style-board.js <board.json> --subjects oak_logs
 *   node scripts/style-board.js <board.json> --redo            # re-render existing cells
 *   node scripts/style-board.js <board.json> --html            # rebuild board.html only
 *
 * Existing cells are skipped, so an interrupted run resumes where it stopped.
 * No style anchor is applied: boards exist to FIND the style.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const h = require('./generate-assets.js');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const next = args[i + 1];
  return next !== undefined && !next.startsWith('--') ? next : true;
};
const boardFile = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && ['only', 'subjects', 'ckpt'].includes(args[i - 1].slice(2))));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const toPosix = (p) => p.split(path.sep).join('/');

function loadBoard(file) {
  const board = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  for (const k of ['name', 'subjects', 'styles']) if (!board[k]) throw new Error(`Board is missing "${k}".`);
  board.variants = Math.max(1, parseInt(board.variants || 1, 10));
  board.seed = parseInt(board.seed ?? 1000, 10);
  return board;
}

let templatesCache = null;

/**
 * A subject with "slot" (e.g. "chest", "head") pulls that slot's drawing rule
 * and negatives from scripts/asset-gen/prompt-templates.json, so boards test
 * the exact rules the asset generator uses rather than a hand-copied version.
 */
function slotRule(subject) {
  if (!subject.slot) return { rule: '', negative: '' };
  templatesCache = templatesCache || h.loadTemplates();
  const key = h.folderForItem({ category: 'equipment', slot: subject.slot });
  // Same per-type rule (presentation + shared camera angle) the generator uses.
  const { rule, negative } = h.typeRule(key, templatesCache, subject.subcategory);
  if (!rule) throw new Error(`No drawing rule for slot "${subject.slot}" (key "${key}") in prompt-templates.json`);
  return { rule, negative };
}

function cellPrompt(board, style, subject) {
  const slot = slotRule(subject);
  templatesCache = templatesCache || h.loadTemplates();
  // Same material + faction rules the asset generator uses ("material": "cloth"
  // or ["cloth","leather"]; "faction": "unity" | "elaran").
  const material = subject.material ? h.materialParts(subject.material, templatesCache) : { prompt: '', negative: '' };
  const faction = h.factionParts(subject.faction, templatesCache);
  const parts = [
    `${style.lead} of ${subject.prompt}`,
    material.prompt,
    slot.rule,
    faction.motif,
    style.prompt,
    subject.extra,
    style.framing || board.framing,
    // a faction palette replaces the board's general palette rather than mixing
    faction.palette || (style.palette ?? board.palette),
  ];
  return {
    positive: parts.filter(Boolean).join(', '),
    negative: [board.negative, style.negative, subject.negative, slot.negative, material.negative, faction.negative].filter(Boolean).join(', '),
  };
}

const styleDir = (style) => `${style.code}_${style.id}`;
const cellFile = (subject, v) => `${subject.id}_v${v}.png`;

function writeBoardHtml(board, outDir) {
  const head = board.subjects.map((s) => `<th>${esc(s.label)}</th>`).join('');
  const rows = board.styles.map((st) => {
    const cells = board.subjects.map((sub) => {
      const imgs = [];
      for (let v = 1; v <= board.variants; v++) {
        const rel = `${styleDir(st)}/${cellFile(sub, v)}`;
        if (!fs.existsSync(path.join(outDir, rel))) { imgs.push('<div class="missing">not rendered</div>'); continue; }
        imgs.push(`<div class="cell"><div class="big checker"><img src="${esc(rel)}" alt=""></div>
          <div class="tiles"><span class="tile t96"><img src="${esc(rel)}" alt=""></span><span class="tile t48"><img src="${esc(rel)}" alt=""></span></div></div>`);
      }
      return `<td>${imgs.join('')}</td>`;
    }).join('');
    return `<tr><th class="style"><span class="code">${esc(st.code)}</span>${esc(st.label)}<small>${esc(st.prompt)}</small></th>${cells}</tr>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(board.title || board.name)}</title><style>
body{background:#1e2026;color:#ddd;font:14px system-ui,sans-serif;margin:16px}
h1{font-size:18px;margin:0 0 4px} p{color:#aaa;margin:0 0 12px}
table{border-collapse:separate;border-spacing:8px} th{font-weight:600;text-align:left;vertical-align:middle}
thead th{text-align:center;color:#ffd77a}
th.style{width:190px;background:#272a31;border-radius:8px;padding:10px}
th.style small{display:block;color:#999;font-weight:normal;margin-top:6px;font-size:12px}
.code{display:inline-block;background:#ffd77a;color:#1e2026;border-radius:4px;padding:1px 7px;margin-right:8px;font-weight:700}
td{background:#272a31;border-radius:8px;padding:8px;vertical-align:top}
.cell+.cell{margin-top:8px}
.big{width:200px;height:200px;display:flex;align-items:center;justify-content:center}
.big img{max-width:100%;max-height:100%}
.checker{background:conic-gradient(#999 25%,#ccc 0 50%,#999 0 75%,#ccc 0) 0 0/20px 20px}
.tiles{display:flex;gap:8px;align-items:center;margin-top:6px}
.tile{display:inline-flex;align-items:center;justify-content:center;background:#16181d;border:2px solid #6fbf73;border-radius:6px;padding:3px}
.t96 img{width:96px;height:96px;object-fit:contain}.t48 img{width:48px;height:48px;object-fit:contain}
.missing{width:200px;height:200px;display:flex;align-items:center;justify-content:center;color:#666;border:1px dashed #444;border-radius:6px}
</style></head><body>
<h1>${esc(board.title || board.name)}</h1>
<p>Same seed in every cell. Pick favourites by their letter. Big = checkerboard (transparency), tiles = in-game 96px / 48px.</p>
<table><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const out = path.join(outDir, 'board.html');
  fs.writeFileSync(out, html);
  return out;
}

async function main() {
  if (!boardFile) throw new Error('Usage: node scripts/style-board.js <board.json> [--only A,C] [--subjects id] [--redo] [--html]');
  const board = loadBoard(boardFile);
  const outDir = path.join(ROOT, 'assets', '_staging', 'boards', board.name);
  fs.mkdirSync(outDir, { recursive: true });

  if (flag('html')) {
    console.log(`Board page: ${toPosix(path.relative(ROOT, writeBoardHtml(board, outDir)))}`);
    return;
  }

  const pick = (list, f, keys) => {
    const want = flag(f);
    if (!want || want === true) return list;
    const set = new Set(String(want).split(',').map((s) => s.trim().toLowerCase()));
    return list.filter((x) => keys.some((k) => set.has(String(x[k]).toLowerCase())));
  };
  const styles = pick(board.styles, 'only', ['code', 'id']);
  const subjects = pick(board.subjects, 'subjects', ['id']);

  const ckpts = await h.nodeOptions('CheckpointLoaderSimple', 'ckpt_name');
  if (!ckpts.length) throw new Error('No checkpoints installed in ComfyUI.');
  // --ckpt wins; otherwise a board may name its checkpoint (substring match).
  const want = flag('ckpt') || board.checkpoint || h.loadTemplates().preferredCheckpoint;
  // Only image models (the SAM detector shares the checkpoints folder).
  const imageCkpts = h.imageCheckpoints(ckpts);
  const ckpt = want && want !== true ? imageCkpts.find((c) => c.toLowerCase().includes(String(want).toLowerCase())) : imageCkpts[0];
  if (!ckpt) throw new Error(`Image checkpoint "${want}" not found. Installed: ${imageCkpts.join(', ')}`);
  const bgModels = flag('no-bg') ? [] : await h.nodeOptions('LoadBackgroundRemovalModel', 'bg_removal_name');
  const bgModel = bgModels[0] || null;
  // Board-level then style-level "settings" (steps, cfg, sampler, scheduler, size)
  // override the checkpoint defaults, e.g. to compare guidance strengths.
  const settings = { ...h.samplerDefaults(ckpt), ...(board.settings || {}) };
  // Same code-drawn outline as the asset generator (needs the background-removal mask).
  const outline = bgModel ? h.resolveOutline(h.loadTemplates(), { noOutline: !!flag('no-outline'), px: flag('outline-px') }) : null;

  const resultsPath = path.join(outDir, 'results.json');
  const results = fs.existsSync(resultsPath) ? JSON.parse(fs.readFileSync(resultsPath, 'utf8')) : { board: board.name, cells: {} };

  const total = styles.length * subjects.length * board.variants;
  console.log(`\nBoard "${board.name}": ${styles.length} style(s) x ${subjects.length} subject(s) x ${board.variants} = ${total} cell(s)`);
  console.log(`Checkpoint ${ckpt} | ${settings.size}px ${settings.steps} steps cfg ${settings.cfg} | background ${bgModel ? 'removed' : 'kept'} | outline ${outline ? outline.px + 'px ' + outline.hex : 'none'} | no style anchor\n`);

  let n = 0;
  let rendered = 0;
  const failures = [];
  // ETA uses the median of recent cell times, so one stall (e.g. the laptop
  // sleeping mid-run) cannot inflate it to hundreds of minutes.
  const recent = [];
  for (const style of styles) {
    fs.mkdirSync(path.join(outDir, styleDir(style)), { recursive: true });
    for (const subject of subjects) {
      const { positive, negative } = cellPrompt(board, style, subject);
      for (let v = 1; v <= board.variants; v++) {
        n++;
        const rel = `${styleDir(style)}/${cellFile(subject, v)}`;
        const dest = path.join(outDir, rel);
        if (fs.existsSync(dest) && !flag('redo')) { console.log(`[${n}/${total}] ${rel}  (exists, skipped)`); continue; }
        const seed = board.seed + v - 1;
        const t0 = Date.now();
        try {
          const graph = h.builtInGraph({
            ckpt, positive, negative, seed, bgModel, outline: null, style: null, ...settings, ...(style.settings || {}),
            prefix: `onesoul/boards/${board.name}/${style.code}_${subject.id}_v${v}`,
          });
          const images = await h.render(graph);
          // Same post-processed outline as the generator (drawn last, identical on every icon).
          const raw = await h.download(images[images.length - 1]);
          fs.writeFileSync(dest, outline ? h.finishImage({ imageBuf: raw, tpl: h.loadTemplates(), outline }).buffer : raw);
          results.cells[rel] = { style: style.code, subject: subject.id, seed, positive, negative, checkpoint: ckpt, settings: { ...settings, ...(style.settings || {}) } };
          fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
          rendered++;
          recent.push(Date.now() - t0);
          if (recent.length > 7) recent.shift();
          const sorted = [...recent].sort((a, b) => a - b);
          const avg = sorted[Math.floor(sorted.length / 2)];
          const left = Math.round(((total - n) * avg) / 60000);
          console.log(`[${n}/${total}] ${rel}  ${((Date.now() - t0) / 1000).toFixed(1)}s  (~${left} min left)`);
        } catch (err) {
          console.log(`[${n}/${total}] ${rel}  FAILED: ${err.message}`);
          failures.push(`${rel}: ${err.message}`);
          if (/Cannot reach ComfyUI|rejected the graph/.test(err.message)) throw err;
        }
      }
    }
  }

  const page = writeBoardHtml(board, outDir);
  console.log(`\nBoard page: ${toPosix(path.relative(ROOT, page))}`);
  if (failures.length) {
    console.log(`${failures.length} failure(s):`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`\nError: ${err.message}\n`);
  process.exit(1);
});
