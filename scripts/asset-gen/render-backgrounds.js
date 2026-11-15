#!/usr/bin/env node
/**
 * Render region background candidates through local ComfyUI.
 *
 *   node scripts/asset-gen/render-backgrounds.js --round r1 [--only scoutreach,west_shoals]
 *        [--tracks cinematic,stylized] [--variants 3] [--seed 20000]
 *        [--from staged.png --denoise 0.5] [--steps 30] [--cfg 6] [--dry-run]
 *
 * Specs: scripts/asset-gen/specs/backgrounds.json (one per region: scene, mood, palette, avoid).
 * Format + style tracks: prompt-templates.json "backgrounds".
 * Output: assets/_staging/backgrounds/<stem>/<round>/<track>_v<n>.png + meta.json.
 * Nothing is installed: approved images go to the spec's targetPath by hand (or a later
 * install step), and the region's backgroundImage is pointed at it.
 * --from: image-to-image refinement of a chosen candidate (same prompt, lower denoise).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const h = require('../generate-assets.js');
const PNG = require('./png.js');
const OPS = require('./imageops.js');

const ROOT = path.resolve(__dirname, '..', '..');
const SPECS = path.join(__dirname, 'specs', 'backgrounds.json');
const OUT = path.join(ROOT, 'assets', '_staging', 'backgrounds');

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(`--${n}`); return i === -1 ? undefined : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true; };
const SCENE_KEY = (() => { const i = process.argv.indexOf('--scene'); return i === -1 ? 'scene' : process.argv[i + 1]; })(); // --scene <specKey>: alternate scene text (e.g. sceneInside)
const PALETTE = (() => { const i = process.argv.indexOf('--palette'); return i === -1 ? null : process.argv[i + 1]; })(); // --palette "text": mood/lighting override (mood variants)
const list = (v) => (v && v !== true ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : null);

function buildPrompt(bg, track, spec) {
  const positive = [
    `${track.lead} of ${spec[SCENE_KEY] || spec.scene}`,
    `${spec.mood} mood`,
    PALETTE || spec.palette,
    spec.extra,
    spec.composition || bg.composition, // a region may replace the shared composition (e.g. no leading-line path)
    track.style,
  ].filter(Boolean).join(', ');
  const negative = [bg.negative, track.negative, spec.avoid].filter(Boolean).join(', ');
  return { positive, negative };
}

async function uploadImage(file) {
  // flatten (LoadImage drops alpha) and upload into ComfyUI's input folder
  const img = OPS.flatten(PNG.decode(fs.readFileSync(file)));
  const form = new FormData();
  form.append('image', new Blob([PNG.encode(img)], { type: 'image/png' }), `bg_init_${path.basename(file)}`);
  form.append('subfolder', 'onesoul_init');
  form.append('overwrite', 'true');
  const res = await fetch(`${h.HOST}/upload/image`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
  const j = await res.json();
  return j.subfolder ? `${j.subfolder}/${j.name}` : j.name;
}

async function main() {
  const tpl = h.loadTemplates();
  const bg = tpl.backgrounds;
  if (!bg) throw new Error('prompt-templates.json has no "backgrounds" section.');
  const specs = JSON.parse(fs.readFileSync(SPECS, 'utf8'));
  const round = flag('round');
  if (!round || round === true) throw new Error('--round <tag> is required (e.g. r1).');
  const only = list(flag('only'));
  const tracks = list(flag('tracks')) || Object.keys(bg.tracks);
  const variants = parseInt(flag('variants') || '3', 10);
  const baseSeed = parseInt(flag('seed') || String(Math.floor(Math.random() * 1e6)), 10);
  const dry = !!flag('dry-run');

  const regions = Object.entries(specs).filter(([id, s]) => !id.startsWith('_') && (!only || only.includes(s.stem) || only.includes(id)));
  if (!regions.length) throw new Error('No regions matched --only.');

  const ckpts = dry ? [] : h.imageCheckpoints(await h.nodeOptions('CheckpointLoaderSimple', 'ckpt_name'));
  const ckpt = flag('ckpt') && flag('ckpt') !== true ? String(flag('ckpt')) : (ckpts.find((c) => c.toLowerCase().includes(tpl.preferredCheckpoint || 'sd_xl_base')) || ckpts[0]);
  const d = h.samplerDefaults(ckpt || 'sdxl');
  const settings = {
    size: bg.size || 1024,
    steps: parseInt(flag('steps') || String(d.steps + 2), 10),
    cfg: parseFloat(flag('cfg') || String(d.cfg)),
    sampler: flag('sampler') && flag('sampler') !== true ? String(flag('sampler')) : d.sampler,
    scheduler: flag('scheduler') && flag('scheduler') !== true ? String(flag('scheduler')) : d.scheduler,
  };
  const fromFile = flag('from') && flag('from') !== true ? path.resolve(String(flag('from'))) : null;
  const denoise = parseFloat(flag('denoise') || '0.5');
  const init = fromFile && !dry ? { image: await uploadImage(fromFile), denoise } : null;

  console.log(`Backgrounds round ${round}: ${regions.length} region(s) x ${tracks.length} track(s) x ${variants} variant(s), ckpt ${ckpt}, ${settings.size}px ${settings.steps} steps cfg ${settings.cfg}${init ? `, from ${path.relative(ROOT, fromFile)} @ ${denoise}` : ''}`);
  // --hires <staged.png,...>: detail pass on chosen candidates - upscale (default 1.5x), then a
  // light image-to-image pass with the region's prompt for its track; writes <name>_hires.png
  // next to each source. Regions/tracks come from the source's meta.json.
  const hires = list(flag('hires'));
  if (hires) {
    const scale = parseFloat(flag('scale') || '1.5');
    const hd = parseFloat(flag('hires-denoise') || '0.35');
    for (const rel of hires) {
      const file = path.resolve(rel);
      const meta = JSON.parse(fs.readFileSync(path.join(path.dirname(file), 'meta.json'), 'utf8'));
      const it = meta.items.find((x) => x.file === path.basename(file));
      if (!it) { console.log(`  ! ${rel}: not in meta.json`); continue; }
      const name = await uploadImage(file);
      const g = {
        1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: ckpt } },
        2: { class_type: 'CLIPTextEncode', inputs: { text: it.positive, clip: ['1', 1] } },
        3: { class_type: 'CLIPTextEncode', inputs: { text: it.negative, clip: ['1', 1] } },
        4: { class_type: 'LoadImage', inputs: { image: name } },
        5: { class_type: 'ImageScaleBy', inputs: { image: ['4', 0], upscale_method: 'lanczos', scale_by: scale } },
        6: { class_type: 'VAEEncodeTiled', inputs: { pixels: ['5', 0], vae: ['1', 2], tile_size: 512, overlap: 64, temporal_size: 64, temporal_overlap: 8 } },
        7: { class_type: 'KSampler', inputs: { model: ['1', 0], seed: it.seed, steps: 24, cfg: settings.cfg, sampler_name: settings.sampler, scheduler: settings.scheduler, positive: ['2', 0], negative: ['3', 0], latent_image: ['6', 0], denoise: hd } },
        8: { class_type: 'VAEDecodeTiled', inputs: { samples: ['7', 0], vae: ['1', 2], tile_size: 512, overlap: 64, temporal_size: 64, temporal_overlap: 8 } },
        11: { class_type: 'SaveImage', inputs: { images: ['8', 0], filename_prefix: `onesoul/backgrounds/hires_${path.basename(file, '.png')}` } },
      };
      const t0 = Date.now();
      const imgs = await h.render(g);
      const out = path.join(path.dirname(file), path.basename(file, '.png') + '_hires.png');
      fs.writeFileSync(out, await h.download(imgs[0]));
      meta.items.push({ ...it, file: path.basename(out), hiresOf: it.file, scale, hiresDenoise: hd });
      fs.writeFileSync(path.join(path.dirname(file), 'meta.json'), JSON.stringify(meta, null, 2));
      console.log(`  hires ${rel} x${scale} @${hd}  ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${path.relative(ROOT, out).split(path.sep).join('/')}`);
    }
    console.log('\nDone.');
    return;
  }

  for (const [id, spec] of regions) {
    const dir = path.join(OUT, spec.stem, round);
    const meta = { id, name: spec.name, round, checkpoint: ckpt, settings, from: fromFile ? path.relative(ROOT, fromFile).split(path.sep).join('/') : null, denoise: init ? denoise : null, items: [] };
    console.log(`\n[${spec.name}]`);
    for (const tk of tracks) {
      const track = bg.tracks[tk];
      if (!track) { console.log(`  ! unknown track ${tk}`); continue; }
      const { positive, negative } = buildPrompt(bg, track, spec);
      if (dry) { console.log(`  ${tk}\n  + ${positive}\n  - ${negative}`); continue; }
      fs.mkdirSync(dir, { recursive: true });
      for (let v = 1; v <= variants; v++) {
        const seed = baseSeed + v - 1;
        const t0 = Date.now();
        const graph = h.builtInGraph({ ckpt, positive, negative, seed, ...settings, prefix: `onesoul/backgrounds/${spec.stem}_${round}_${tk}_v${v}`, bgModel: null, style: null, outline: null, init });
        const imgs = await h.render(graph);
        const buf = await h.download(imgs[0]);
        const file = `${tk}_v${v}.png`;
        fs.writeFileSync(path.join(dir, file), buf);
        meta.items.push({ file, track: tk, seed, positive, negative });
        fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
        console.log(`  ${tk} v${v}  seed ${seed}  ${((Date.now() - t0) / 1000).toFixed(1)}s  -> ${path.relative(ROOT, path.join(dir, file)).split(path.sep).join('/')}`);
      }
    }
  }
  console.log('\nDone.');
}

main().catch((e) => { console.error(`\nError: ${e.message}`); process.exit(1); });
