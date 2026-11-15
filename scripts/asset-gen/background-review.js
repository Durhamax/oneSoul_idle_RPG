#!/usr/bin/env node
/**
 * Build the background review page: assets/_staging/backgrounds.html
 *
 *   node scripts/asset-gen/background-review.js
 *
 * Reads every assets/_staging/backgrounds/<stem>/<round>/meta.json plus
 * assets/_staging/backgrounds/notes.json:
 *   { "summary": "...", "rounds": { "r1": "what changed / what I saw" },
 *     "regions": { "<stem>": "notes" }, "picks": { "<stem>": ["r3/cinematic_v2.png", ...] } }
 * Per region: top picks first, then every round (newest first) with its notes and prompts.
 * Click any image for an in-game preview: phone + desktop frames using the game's own
 * background CSS (cover / center, blur + brightness) under mock translucent UI panels.
 * Open via the review server: http://localhost:8091/assets/_staging/backgrounds.html
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const STAGE = path.join(ROOT, 'assets', '_staging');
const DIR = path.join(STAGE, 'backgrounds');
const SPECS = JSON.parse(fs.readFileSync(path.join(__dirname, 'specs', 'backgrounds.json'), 'utf8'));
const notes = fs.existsSync(path.join(DIR, 'notes.json')) ? JSON.parse(fs.readFileSync(path.join(DIR, 'notes.json'), 'utf8')) : {};
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const roundNum = (r) => parseInt(String(r).replace(/\D/g, ''), 10) || 0;

const regions = Object.entries(SPECS).filter(([id]) => !id.startsWith('_')).map(([id, s]) => {
  const rdir = path.join(DIR, s.stem);
  const rounds = fs.existsSync(rdir)
    ? fs.readdirSync(rdir).filter((r) => fs.existsSync(path.join(rdir, r, 'meta.json')))
      .map((r) => JSON.parse(fs.readFileSync(path.join(rdir, r, 'meta.json'), 'utf8')))
      .sort((a, b) => roundNum(b.round) - roundNum(a.round))
    : [];
  return { id, spec: s, rounds };
});

const total = regions.reduce((n, r) => n + r.rounds.reduce((m, x) => m + x.items.length, 0), 0);
const src = (stem, round, file) => `backgrounds/${stem}/${round}/${file}`;

function card(stem, round, it, big) {
  const s = src(stem, round, it.file);
  return `<figure class="${big ? 'big' : ''}"><img loading="lazy" src="${s}" data-src="${s}" data-label="${esc(`${stem} ${round} ${it.file}`)}" onclick="preview(this)">
  <figcaption><b>${esc(round)}</b> ${esc(it.file.replace('.png', ''))} <span class="seed">seed ${it.seed}</span></figcaption></figure>`;
}

const body = regions.map(({ id, spec, rounds }) => {
  const picks = (notes.picks && notes.picks[spec.stem]) || [];
  const pickCards = picks.map((p) => {
    const [round, file] = p.split('/');
    const r = rounds.find((x) => x.round === round);
    const it = r && r.items.find((i) => i.file === file);
    return it ? card(spec.stem, round, it, true) : '';
  }).join('');
  const roundBlocks = rounds.map((r, i) => `<details ${i === 0 && !picks.length ? 'open' : ''}><summary>Round ${esc(r.round)} - ${r.items.length} image(s)${r.from ? ` - refined from ${esc(r.from)} @ ${r.denoise}` : ''}${notes.rounds && notes.rounds[r.round] ? ` - <i>${esc(notes.rounds[r.round]).slice(0, 140)}</i>` : ''}</summary>
    ${notes.rounds && notes.rounds[r.round] ? `<p class="note">${esc(notes.rounds[r.round])}</p>` : ''}
    <div class="grid">${r.items.map((it) => card(spec.stem, r.round, it)).join('')}</div>
    <details class="prompts"><summary>prompts</summary>${[...new Set(r.items.map((it) => `<p><b>${esc(it.track)}</b><br>+ ${esc(it.positive)}<br>- ${esc(it.negative)}</p>`))].join('')}</details>
  </details>`).join('');
  return `<section id="${esc(spec.stem)}"><h2>${esc(spec.name)} <small>${esc(id)} &rarr; ${esc(spec.targetPath)}</small></h2>
  <p class="scene">${esc(spec.scene)}<br><i>${esc(spec.mood)} &middot; ${esc(spec.palette)}</i></p>
  ${notes.regions && notes.regions[spec.stem] ? `<p class="note">${esc(notes.regions[spec.stem])}</p>` : ''}
  ${notes.approved && notes.approved[spec.stem] ? `<h3 class="ok">Approved &amp; installed &rarr; ${esc(spec.targetPath)}</h3><div class="grid picks">${(() => { const [round, file] = notes.approved[spec.stem].split('/'); const r = rounds.find((x) => x.round === round); const it = r && r.items.find((i) => i.file === file); return it ? card(spec.stem, round, it, true) : ''; })()}</div>` : ''}
  ${pickCards ? `<h3>${notes.approved && notes.approved[spec.stem] ? 'Earlier picks' : 'My picks for review'}</h3><div class="grid picks">${pickCards}</div>` : ''}
  <h3>All rounds</h3>${roundBlocks || '<p>No renders yet.</p>'}</section>`;
}).join('\n');

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>One Soul - background candidates</title>
<style>
body{background:#14151c;color:#d8d8e0;font:14px/1.45 system-ui,sans-serif;margin:0;padding:20px 28px}
h1{margin:0 0 6px}h2{margin:34px 0 4px;border-top:1px solid #333;padding-top:18px}h2 small{font-weight:400;color:#889;font-size:12px}
h3{margin:14px 0 6px;color:#aab}h3.ok{color:#8c6}.scene{color:#99a;max-width:1100px}.note{background:#1e2030;border-left:3px solid #7a6;padding:8px 12px;max-width:1100px;white-space:pre-wrap}
nav a{color:#9bd;margin-right:14px}.grid{display:flex;flex-wrap:wrap;gap:10px}
figure{margin:0;width:220px}figure.big{width:330px}figure img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;cursor:zoom-in;display:block;border:2px solid transparent}
figure img:hover{border-color:#7a6}figcaption{font-size:12px;color:#aab;margin-top:3px}.seed{color:#667}
details{margin:6px 0}summary{cursor:pointer;color:#bbc}.prompts p{font-size:11px;color:#889;max-width:1100px}
#pv{position:fixed;inset:0;background:rgba(8,9,14,.97);display:none;align-items:flex-start;justify-content:center;gap:24px;z-index:9;flex-wrap:wrap;padding:20px;overflow:auto}
#pv.on{display:flex}.frame{position:relative;overflow:hidden;border-radius:14px;border:2px solid #444;flex:none}
.frame .bg{position:absolute;inset:-10px;background-size:cover;background-position:center}
.phone{height:min(650px,78vh);aspect-ratio:375/812}.desk{width:min(800px,92vw);aspect-ratio:16/9}.raw{width:min(450px,90vw);aspect-ratio:1;background-size:cover}
.panel{position:absolute;background:rgba(20,22,32,.72);border:1px solid rgba(255,255,255,.08);border-radius:10px;backdrop-filter:blur(2px)}
#pv .lbl{position:absolute;top:8px;left:50%;transform:translateX(-50%);color:#fff;font-size:12px;background:#0009;padding:2px 8px;border-radius:6px}
#pv .ctrl{width:100%;text-align:center;color:#ccd}
</style></head><body>
<h1>Region background candidates</h1>
<p>${total} renders across ${regions.length} regions. Nothing here is approved or installed - pick favourites and I'll refine / install them.
Click any image for an in-game preview (the game shows backgrounds with <code>background-size: cover</code>, a 2-5px blur and translucent panels on top).</p>
${notes.summary ? `<p class="note">${esc(notes.summary)}</p>` : ''}
<h3>Reference: the Cradle's current background (format only - not used as a style input)</h3>
<div class="grid"><figure><img src="../backgrounds/regions/region_the_scar_01.png" data-src="../backgrounds/regions/region_the_scar_01.png" data-label="The Cradle - current" onclick="preview(this)"><figcaption>The Cradle (current, 1024x1024)</figcaption></figure></div>
<nav>${regions.map(({ spec }) => `<a href="#${esc(spec.stem)}">${esc(spec.name)}</a>`).join('')}</nav>
${body}
<div id="pv" onclick="if(event.target.id==='pv')this.classList.remove('on')">
 <div class="ctrl">blur <input id="blur" type="range" min="0" max="6" value="3" oninput="apply()"> <span id="bv">3px</span> &nbsp; panels <input id="pan" type="checkbox" checked onchange="apply()"> &nbsp; <span id="pl"></span> &nbsp; (click outside to close)</div>
 <div class="frame phone"><div class="bg"></div><span class="lbl">phone</span>
  <div class="panel" style="left:14px;right:14px;top:60px;height:150px"></div><div class="panel" style="left:14px;right:14px;top:225px;height:210px"></div><div class="panel" style="left:0;right:0;bottom:0;height:64px;border-radius:0"></div></div>
 <div class="frame desk"><div class="bg"></div><span class="lbl">desktop</span>
  <div class="panel" style="left:40px;top:50px;width:230px;height:330px"></div><div class="panel" style="left:290px;top:50px;width:240px;height:220px"></div><div class="panel" style="left:300px;right:300px;bottom:0;height:50px;border-radius:10px 10px 0 0"></div></div>
 <div class="frame raw"><span class="lbl">full image</span></div>
</div>
<script>
let cur='';
function preview(el){cur=el.dataset.src;document.getElementById('pl').textContent=el.dataset.label;document.querySelector('.raw').style.backgroundImage="url('"+cur+"')";apply();document.getElementById('pv').classList.add('on')}
function apply(){const b=document.getElementById('blur').value;document.getElementById('bv').textContent=b+'px';
 document.querySelectorAll('#pv .bg').forEach(e=>{e.style.backgroundImage="url('"+cur+"')";e.style.filter='blur('+b+'px) brightness(0.95)'});
 document.querySelectorAll('#pv .panel').forEach(e=>e.style.display=document.getElementById('pan').checked?'':'none')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('pv').classList.remove('on')});
</script></body></html>`;

fs.writeFileSync(path.join(STAGE, 'backgrounds.html'), html);
console.log(`Review page: assets/_staging/backgrounds.html (${total} renders, ${regions.length} regions)`);
