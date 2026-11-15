#!/usr/bin/env node
/**
 * Asset Generation Harness (local ComfyUI)
 * -----------------------------------------------------------------------------
 * Finds every item/enemy that has no real art yet, builds a prompt for each from
 * the registry data + scripts/asset-gen/prompt-templates.json, and renders
 * variants through a locally running ComfyUI (http://127.0.0.1:8188).
 *
 * Output goes to a REVIEW STAGING area, never straight into the game:
 *   assets/_staging/<folder>/<file_stem>/v1.png, v2.png, ...  + meta.json
 * meta.json records the prompt, seed, checkpoint, and the final target path,
 * so any variant is reproducible. Pick the winner and promote it yourself
 * (or with a future --promote step).
 *
 * Usage:
 *   node scripts/generate-assets.js --list                 # what's missing, no ComfyUI needed
 *   node scripts/generate-assets.js --dry-run              # print prompts, no ComfyUI needed
 *   node scripts/generate-assets.js --only mossShrimp      # render one asset
 *   node scripts/generate-assets.js --folder food --variants 2
 *   node scripts/generate-assets.js --limit 5
 *   node scripts/generate-assets.js --review               # rebuild assets/_staging/review.html
 *
 * Options:
 *   --only a,b,c        only these item/enemy ids
 *   --folder f          only one folder (materials, weapons, food, enemies, ...)
 *   --limit N           stop after N assets
 *   --variants N        renders per asset (default 4)
 *   --seed N            base seed (default: random); variant i uses seed+i
 *   --ckpt name         checkpoint (substring match; default: first installed)
 *   --steps/--cfg/--size/--sampler/--scheduler   override auto sampler defaults
 *   --bg-model name     background-removal model (default: first installed)
 *   --no-bg             skip background removal even if a model is installed
 *   --style-ref paths   IPAdapter style anchor: image files and/or folders, comma-separated
 *                       (default: scripts/asset-gen/style-anchor/ if it exists; rebuild it
 *                       with scripts/asset-gen/make-anchor.py)
 *   --style-weight N    how strongly the anchor steers the look (default 0.5; higher
 *                       values start copying the anchor's colours and materials)
 *   --style-type t      IPAdapter weight type (default "style transfer"; also
 *                       "strong style transfer", "style transfer precise", ...)
 *   --no-style          render without the style anchor
 *   --ipadapter / --clip-vision name   pick specific models (default: auto)
 *   --workflow file     use your own exported "Save (API Format)" JSON instead of
 *                       the built-in graph. Put the literal strings {{POSITIVE}} and
 *                       {{NEGATIVE}} in its text fields; seeds and SaveImage prefixes
 *                       are filled in automatically.
 *   --from image        image-to-image: start from this picture (e.g. an approved reference)
 *   --denoise N         with --from: how far it may change, 0-1 (default 0.45; ~0.35 subtle, ~0.6 loose)
 *   --no-base           don't start items from their family's approved base icon
 *   --tag name          write to <stem>__<name> in staging, so experiments don't overwrite
 *   --include-existing  also regenerate assets that already have art
 *   --include-approved  also regenerate items in scripts/asset-gen/approved.json
 *   --host url          ComfyUI address (default http://127.0.0.1:8188)
 *
 * Zero dependencies (Node 18+ for global fetch).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES_PATH = path.join(__dirname, 'asset-gen', 'prompt-templates.json');
const STAGING_DIR = path.join(ROOT, 'assets', '_staging');

const ITEM_REGISTRIES = [
  'src/data/items/production/equipment/equipment.js',
  'src/data/items/production/consumables/consumables.js',
  'src/data/items/production/materials/materials.js',
  'src/data/items/production/currencies/currencies.js',
];
const ENEMY_REGISTRY = 'src/data/enemies/production/enemies_production.js';

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    if (eq !== -1) {
      opts[a.slice(2, eq)] = a.slice(eq + 1);
    } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) {
      opts[a.slice(2)] = argv[++i];
    } else {
      opts[a.slice(2)] = true;
    }
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const HOST = (opts.host || 'http://127.0.0.1:8188').replace(/\/$/, '');
const VARIANTS = Math.max(1, parseInt(opts.variants || '4', 10));

// ---------------------------------------------------------------------------
// registry loading
// ---------------------------------------------------------------------------

function quietRequire(relPath) {
  const abs = path.join(ROOT, relPath);
  const saved = { log: console.log, warn: console.warn, error: console.error };
  console.log = console.warn = console.error = () => {};
  try {
    return require(abs);
  } catch (err) {
    Object.assign(console, saved);
    console.error(`  ! could not load ${relPath}: ${err.message}`);
    return null;
  } finally {
    Object.assign(console, saved);
  }
}

const toPosix = (p) => p.split(path.sep).join('/');
const fileExists = (rel) => !!rel && fs.existsSync(path.join(ROOT, rel));

/** greensmanTrainingBow -> greensman_training_bow (matches existing asset names) */
function snake(id) {
  return String(id)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function folderForItem(item) {
  if (item.category === 'material') return 'materials';
  if (item.category === 'currency') return 'currency';
  if (item.category === 'consumable') {
    return /tincture|salve|serum|potion|elixir|tonic/i.test(`${item.id} ${item.name}`) ? 'potions' : 'food';
  }
  const slot = String(item.slot || item.equipSlot || '').toLowerCase();
  return SLOT_FOLDERS[slot] || 'materials';
}

/**
 * Equipment slot -> prompt-rule key (a key in prompt-templates.json "folders").
 * Armor is modelled as individual body parts (head / chest / legs), each drawn
 * alone; gloves, boots and back are their own items. Several aliases map to
 * each key because the slot names are being reworked; the legacy single
 * 'armor' slot is treated as chest until those items are split.
 */
const SLOT_FOLDERS = {
  weapon: 'weapons', ammo: 'ammo', tool: 'tools', technology: 'technology',
  head: 'head', helmet: 'head', hat: 'head', hood: 'head',
  chest: 'chest', body: 'chest', torso: 'chest', armor: 'chest',
  legs: 'legs', leg: 'legs', pants: 'legs', greaves: 'legs',
  gloves: 'gloves', hands: 'gloves', gauntlets: 'gloves',
  boots: 'boots', feet: 'boots', shoes: 'boots',
  back: 'back', cape: 'back', cloak: 'back',
  neck: 'neck', amulet: 'neck', ring: 'ring',
};

/** Rule key -> asset directory under assets/icons (wearables share one folder). */
const FOLDER_DIRS = {
  head: 'armor', chest: 'armor', legs: 'armor', gloves: 'armor', boots: 'armor', back: 'armor',
  neck: 'jewelry', ring: 'jewelry',
};

function hasRealArt(iconValue) {
  return typeof iconValue === 'string' && iconValue.includes('assets/') && fileExists(iconValue);
}

function collectTargets() {
  const targets = [];
  const specs = loadSpecs();

  for (const relPath of ITEM_REGISTRIES) {
    const reg = quietRequire(relPath);
    if (!reg) continue;
    for (const [key, item] of Object.entries(reg)) {
      const id = item.id || key;
      const folder = folderForItem(item);
      targets.push({
        kind: 'item',
        id,
        name: item.name || id,
        description: item.description || '',
        subcategory: item.subcategory || '',
        tags: item.tags || [],
        spec: specs[id] || null,
        tier: item.tier,
        folder,
        stem: snake(id),
        targetPath: `assets/icons/${FOLDER_DIRS[folder] || folder}/${snake(id)}.png`,
        hasArt: hasRealArt(item.icon) || hasRealArt(item.iconPath),
      });
    }
  }

  const enemies = quietRequire(ENEMY_REGISTRY);
  if (enemies) {
    for (const [key, e] of Object.entries(enemies)) {
      const id = e.id || key;
      // EnemySelectionPanel falls back to assets/enemies/<id>.png, so match it.
      const targetPath = e.assetPath || `assets/enemies/${id}.png`;
      targets.push({
        kind: 'enemy',
        id,
        name: e.name || id,
        description: e.description || e.lore || '',
        subcategory: e.category || '',
        tags: e.tags || [],
        tier: e.tier,
        folder: 'enemies',
        stem: snake(id),
        targetPath,
        hasArt: fileExists(targetPath),
      });
    }
  }

  return targets;
}

// ---------------------------------------------------------------------------
// prompt building
// ---------------------------------------------------------------------------

/**
 * Per-item visual specs (scripts/asset-gen/specs/*.json): { itemId: { archetype, subject, cues } }.
 * archetype = which shape family's rules apply (e.g. 'ore', 'crustacean'); subject + cues = what to
 * draw and the 1-2 identity cues. Reviewed as text before rendering. Keys starting with _ are notes.
 */
function loadSpecs() {
  const dir = path.join(__dirname, 'asset-gen', 'specs');
  const specs = {};
  if (!fs.existsSync(dir)) return specs;
  for (const file of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    for (const [id, spec] of Object.entries(data)) if (!id.startsWith('_')) specs[id] = spec;
  }
  return specs;
}

function loadTemplates() {
  return JSON.parse(fs.readFileSync(TEMPLATES_PATH, 'utf8'));
}

/** First sentence of a description, minus gameplay clauses ("used for crafting..."). */
function visualDescription(desc) {
  if (!desc) return '';
  const first = (desc.match(/^[^.!?]*[.!?]?/) || [desc])[0];
  return first
    // Flavor after an em/en dash is lore, not looks ("... issued to Unity scouts
    // — light enough to never catch a branch as they slip through the dense
    // forest"), and it makes the model paint a scene.
    .replace(/\s+[—–]\s+.*$/, '')
    .replace(/\s+(used|essential|ideal|perfect|great|needed|required)\b.*$/i, '')
    // Habitat clauses make the model paint a scene ("hides among lake vegetation"
    // -> a shrimp on moss), so drop them: icons need the object alone.
    .replace(/,?\s+(that\s+|which\s+)?(hides|lives|dwells|grows|thrives|lurks|nests|swims)\b.*$/i, '')
    .replace(/\s+found\s+(in|on|near|among|along|under)\b.*$/i, '')
    .replace(/[.!?,;:\s]+$/, '')
    .trim();
}

function buildPrompt(t, tpl) {
  const override = tpl.overrides && tpl.overrides[t.id];
  const spec = t.spec;
  // The spec's archetype picks the shape family's rules (overrides the game subcategory).
  const sub = (spec && spec.archetype) || t.subcategory;
  const desc = visualDescription(t.description);
  // Spec (reviewed text) beats the older per-item override, which beats the game description.
  const subject = spec
    ? [spec.subject || t.name, spec.cues].filter(Boolean).join(', ')
    : override || (desc ? `${t.name}, ${desc}` : t.name);
  // itemHints add wording for things the model keeps getting wrong; they never replace the game text.
  const hint = tpl.itemHints && typeof tpl.itemHints[t.id] === "string" ? tpl.itemHints[t.id] : "";
  const fullSubject = hint ? `${subject}, ${hint}` : subject;

  // Subject first, framed by a short style lead ("stylized ... game icon of X"):
  // SDXL weights early tokens most, and Turbo models (low cfg) largely ignore
  // style words that only appear late in a long prompt.
  const lead = t.kind === 'enemy' ? tpl.enemyStyleLead : tpl.styleLead;
  const parts = [lead ? `${lead} of ${fullSubject}` : fullSubject];
  const faction = factionParts(t.faction || resolveFaction(t), tpl);
  const material = WEARABLE_FOLDERS.has(t.folder) ? materialParts(t.materials || resolveMaterials(t.tags, tpl), tpl) : null;

  if (t.kind === 'enemy') {
    if (/droid|drone|mech|robot|machine/i.test(t.subcategory)) parts.push('mechanical drone or robot');
    parts.push(tpl.folders.enemies);
    parts.push(faction.motif);
    parts.push(tpl.enemyStyle || tpl.style);
    // No tierMood for enemies: tier moods describe the player's hand-made gear,
    // not hostile tech (e.g. Elaran drones intruding on the Cradle).
    parts.push(faction.palette);
  } else {
    // Material right after the subject so "cloth tunic" vs "plate armor" is
    // decided early; then the slot's presentation rule (angle, hollow, etc.).
    if (material) parts.push(material.prompt);
    const type = typeRule(t.folder, tpl, sub);
    parts.push(type.rule);
    if ((tpl.organicSubcategories || []).includes(t.subcategory) && !(tpl.noOrganicHintArchetypes || []).includes(sub)) parts.push(tpl.organicHint);
    parts.push(faction.motif);
    parts.push(tpl.style);
    // A faction palette (e.g. Elaran black/gray/purple) replaces the warm tier
    // mood instead of fighting it.
    const mood = tpl.tierMood && (tpl.tierMood[String(t.tier)] ?? tpl.tierMood.default);
    parts.push(faction.palette || mood);
  }

  // Negatives only ever add to the shared negative: slot rules (no wearer),
  // material rules (a cloth tunic must not grow metal plates), faction rules.
  const folderNegative = t.kind === "enemy" ? (tpl.folderNegatives || {}).enemies : typeRule(t.folder, tpl, sub).negative;
  return {
    positive: parts.filter(Boolean).join(', '),
    negative: [tpl.negative, folderNegative, material && material.negative, faction.negative].filter(Boolean).join(', '),
  };
}

// ---------------------------------------------------------------------------
// material + faction rules (from item tags; see prompt-templates.json)
// ---------------------------------------------------------------------------

/**
 * Per-item-type rule: the type's presentation + its shared camera angle (from
 * "itemTypes" and "angles" in prompt-templates.json). Types not migrated yet
 * fall back to the older per-folder text ("folders" / "folderNegatives").
 */
function typeRule(key, tpl, sub) {
  const base = (tpl.itemTypes || {})[key];
  if (base && typeof base === "object") {
    // Optional per-subcategory rules (e.g. materials: wood / ore / fish) override the
    // type's presentation and angle; their avoid list adds to the type's.
    const st = sub && base.subtypes && base.subtypes[sub];
    const it = st ? { ...base, ...st, avoid: [base.avoid, st.avoid].filter(Boolean).join(", ") } : base;
    const angle = (tpl.angles || {})[it.angle] || {};
    return {
      rule: [it.presentation, angle.view].filter(Boolean).join(", "),
      negative: [it.avoid, angle.avoid].filter(Boolean).join(", "),
      angle: it.angle || null,
    };
  }
  return { rule: (tpl.folders || {})[key] || "", negative: (tpl.folderNegatives || {})[key] || "", angle: null };
}

const WEARABLE_FOLDERS = new Set(["head", "chest", "legs", "gloves", "boots", "back"]);

/** 'elaran' / 'unity' from tags, id or name; null if neither. */
function resolveFaction(t) {
  const hay = [...(t.tags || []), t.id, t.name].join(' ').toLowerCase();
  if (/elaran/.test(hay)) return 'elaran';
  if (/unity/.test(hay)) return 'unity';
  return null;
}

/** Item tags -> material classes via "materialTags" (linen -> cloth, steel -> plate, ...). */
function resolveMaterials(tags, tpl) {
  const map = tpl.materialTags || {};
  const out = new Set();
  for (const tag of tags || []) {
    const m = map[String(tag).toLowerCase()];
    if (m) out.add(m);
  }
  return [...out];
}

/**
 * Material classes -> prompt + negative. With plate present, only plate's
 * negatives apply (plate-over-cloth is valid); otherwise soft materials share
 * their "no metal plates" negatives.
 */
function materialParts(materials, tpl) {
  const M = tpl.materials || {};
  const list = (Array.isArray(materials) ? materials : [materials]).filter((m) => M[m]);
  if (!list.length) return { prompt: '', negative: '' };
  const prompt = list.map((m) => M[m].prompt).join(', ');
  const negs = list.includes('plate')
    ? [M.plate.negative]
    : list.map((m) => M[m].negative);
  const negative = [...new Set(negs.filter(Boolean).flatMap((n) => n.split(/,\s*/)))].join(', ');
  return { prompt, negative };
}

function factionParts(name, tpl) {
  const f = name && (tpl.factions || {})[name];
  return f
    ? { motif: f.motif || '', palette: f.palette || '', negative: f.negative || '' }
    : { motif: '', palette: '', negative: '' };
}

// ---------------------------------------------------------------------------
// ComfyUI client
// ---------------------------------------------------------------------------

async function comfy(pathname, init) {
  let res;
  try {
    res = await fetch(HOST + pathname, init);
  } catch (err) {
    throw new Error(`Cannot reach ComfyUI at ${HOST} (${err.cause?.code || err.message}). Is it running?`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`ComfyUI ${pathname} -> HTTP ${res.status}: ${body.slice(0, 800)}`);
  }
  return res;
}

const comfyJSON = async (p, init) => (await comfy(p, init)).json();

async function nodeOptions(nodeType, inputName) {
  const info = await comfyJSON(`/object_info/${nodeType}`);
  const spec = info?.[nodeType]?.input?.required?.[inputName];
  if (!spec) return [];
  if (Array.isArray(spec[0])) return spec[0]; // legacy combo
  return spec[1]?.options || []; // new-style COMBO
}

function samplerDefaults(ckpt) {
  const n = ckpt.toLowerCase();
  const isXL = /xl|sdxl|pony|illustrious|noob/.test(n);
  const isFast = /lightning|turbo|hyper|lcm/.test(n);
  return {
    size: isXL ? 1024 : 512,
    steps: isFast ? 6 : 28,
    cfg: isFast ? 2 : 6,
    sampler: isFast ? 'dpmpp_sde' : 'dpmpp_2m',
    scheduler: 'karras',
  };
}

/**
 * Add SAM 3 text-prompted detection to a graph: one mask output per
 * detection, saved as "<prefix>_det_<key>". Runs on the raw render (before
 * background removal). Returns { key: saveNodeId }.
 */
function addDetections(g, imageRef, detectorCkpt, detections, prefix, threshold) {
  if (!detectorCkpt || !detections || !detections.length) return {};
  g[90] = { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: detectorCkpt } };
  const saves = {};
  detections.forEach((d, i) => {
    const base = 100 + i * 4;
    g[base] = { class_type: 'CLIPTextEncode', inputs: { text: d.find, clip: ['90', 1] } };
    g[base + 1] = {
      class_type: 'SAM3_Detect',
      inputs: { model: ['90', 0], image: imageRef, threshold, refine_iterations: 2, individual_masks: false, conditioning: [String(base), 0] },
    };
    g[base + 2] = { class_type: 'MaskToImage', inputs: { mask: [String(base + 1), 0] } };
    g[base + 3] = { class_type: 'SaveImage', inputs: { images: [String(base + 2), 0], filename_prefix: `${prefix}_det_${d.key}` } };
    saves[d.key] = String(base + 3);
  });
  return saves;
}

function builtInGraph({ ckpt, positive, negative, seed, size, steps, cfg, sampler, scheduler, prefix, bgModel, style, outline, detector, detections, threshold = 0.5, init = null }) {
  const g = {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: ckpt } },
    2: { class_type: 'CLIPTextEncode', inputs: { text: positive, clip: ['1', 1] } },
    3: { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['1', 1] } },
    4: { class_type: 'EmptyLatentImage', inputs: { width: size, height: size, batch_size: 1 } },
    5: {
      class_type: 'KSampler',
      inputs: {
        model: ['1', 0], seed, steps, cfg, sampler_name: sampler, scheduler,
        positive: ['2', 0], negative: ['3', 0], latent_image: ['4', 0], denoise: init ? init.denoise : 1,
      },
    },
    6: { class_type: 'VAEDecode', inputs: { samples: ['5', 0], vae: ['1', 2] } },
  };
  if (init) {
    // Image-to-image: start from an existing picture instead of a blank latent;
    // denoise < 1 controls how far the render may drift from it.
    g[80] = { class_type: 'LoadImage', inputs: { image: init.image } };
    g[4] = { class_type: 'VAEEncode', inputs: { pixels: ['80', 0], vae: ['1', 2] } };
  }

  if (style) {
    // IPAdapter style anchor: the reference images steer the LOOK (shading,
    // palette, finish); 'style transfer' weight types avoid copying their shapes.
    g[20] = { class_type: 'IPAdapterModelLoader', inputs: { ipadapter_file: style.ipadapterFile } };
    g[21] = { class_type: 'CLIPVisionLoader', inputs: { clip_name: style.clipVision } };
    let batch = null;
    style.images.forEach((name, i) => {
      const id = String(30 + i * 2);
      g[id] = { class_type: 'LoadImage', inputs: { image: name } };
      if (!batch) batch = [id, 0];
      else {
        const b = String(31 + i * 2);
        g[b] = { class_type: 'ImageBatch', inputs: { image1: batch, image2: [id, 0] } };
        batch = [b, 0];
      }
    });
    g[22] = {
      class_type: 'IPAdapterAdvanced',
      inputs: {
        model: ['1', 0], ipadapter: ['20', 0], image: batch, clip_vision: ['21', 0],
        weight: style.weight, weight_type: style.weightType, combine_embeds: 'average',
        start_at: 0, end_at: 1, embeds_scaling: 'V only',
      },
    };
    g[5].inputs.model = ['22', 0];
  }

  let image = ['6', 0];
  if (bgModel) {
    g[7] = { class_type: 'LoadBackgroundRemovalModel', inputs: { bg_removal_name: bgModel } };
    g[8] = { class_type: 'RemoveBackground', inputs: { bg_removal_model: ['7', 0], image } };
    if (outline && outline.px > 0) {
      // Code-drawn outline: identical thickness/colour on every icon (an
      // AI-drawn outline varies image to image). Grow the foreground mask into
      // a band, fill the canvas with the outline colour, lay the item on top
      // with its ORIGINAL mask, then cut everything outside the grown mask.
      g[12] = { class_type: 'GrowMask', inputs: { mask: ['8', 0], expand: outline.px, tapered_corners: true } };
      g[13] = { class_type: 'EmptyImage', inputs: { width: size, height: size, batch_size: 1, color: outline.color } };
      g[14] = { class_type: 'ImageCompositeMasked', inputs: { destination: ['13', 0], source: image, x: 0, y: 0, resize_source: false, mask: ['8', 0] } };
      g[15] = { class_type: 'InvertMask', inputs: { mask: ['12', 0] } };
      g[16] = { class_type: 'JoinImageWithAlpha', inputs: { image: ['14', 0], alpha: ['15', 0] } };
      image = ['16', 0];
    } else {
      // RemoveBackground emits a FOREGROUND mask (1 = keep); JoinImageWithAlpha
      // computes alpha = 1 - mask, so invert first or the object goes transparent.
      g[9] = { class_type: 'InvertMask', inputs: { mask: ['8', 0] } };
      g[10] = { class_type: 'JoinImageWithAlpha', inputs: { image, alpha: ['9', 0] } };
      image = ['10', 0];
    }
  }
  g[11] = { class_type: 'SaveImage', inputs: { images: image, filename_prefix: prefix } };
  // Non-enumerable so the graph object stays a valid ComfyUI prompt.
  Object.defineProperty(g, '_detectionSaves', { value: addDetections(g, ['6', 0], detector, detections, prefix, threshold), enumerable: false });
  return g;
}

/**
 * Code-drawn outline settings from prompt-templates.json "outline"
 * ({ enabled, px, color }), with --no-outline / --outline-px overrides.
 * Returns { px, color (int), hex } or null when off.
 */
function resolveOutline(tpl, { noOutline = false, px } = {}) {
  if (noOutline) return null;
  const o = tpl.outline || {};
  if (o.enabled === false && (px === undefined || px === true)) return null;
  const width = parseInt(px !== undefined && px !== true ? px : o.px || 0, 10);
  if (!width) return null;
  const hex = String(o.color || '#1a1612').replace('#', '');
  return { px: width, color: parseInt(hex, 16), hex: '#' + hex };
}

/** Fill a user-exported API workflow: {{POSITIVE}}/{{NEGATIVE}}, seeds, save prefix. */
function fillCustomGraph(template, { positive, negative, seed, prefix }) {
  const g = JSON.parse(JSON.stringify(template));
  let sawPositive = false;
  for (const node of Object.values(g)) {
    const inputs = node.inputs || {};
    for (const [k, v] of Object.entries(inputs)) {
      if (typeof v !== 'string') continue;
      if (v.includes('{{POSITIVE}}')) { inputs[k] = v.replace('{{POSITIVE}}', positive); sawPositive = true; }
      else if (v.includes('{{NEGATIVE}}')) inputs[k] = v.replace('{{NEGATIVE}}', negative);
    }
    if ('seed' in inputs && typeof inputs.seed === 'number') inputs.seed = seed;
    if ('noise_seed' in inputs && typeof inputs.noise_seed === 'number') inputs.noise_seed = seed;
    if (node.class_type === 'SaveImage') inputs.filename_prefix = prefix;
  }
  if (!sawPositive) throw new Error('Custom workflow has no {{POSITIVE}} placeholder in any text field.');
  return g;
}

// ---------------------------------------------------------------------------
// style anchor (IPAdapter)
// ---------------------------------------------------------------------------

const DEFAULT_ANCHOR_DIR = path.join(__dirname, 'asset-gen', 'style-anchor');

/** Resolve --style-ref (files and/or folders, comma-separated) or the default anchor folder. */
function styleRefFiles() {
  const explicit = opts['style-ref'] !== undefined && opts['style-ref'] !== true;
  const src = explicit ? String(opts['style-ref']) : fs.existsSync(DEFAULT_ANCHOR_DIR) ? DEFAULT_ANCHOR_DIR : null;
  const files = [];
  if (src) {
    for (const part of src.split(',').map((s) => s.trim()).filter(Boolean)) {
      const abs = path.resolve(part);
      if (!fs.existsSync(abs)) throw new Error(`Style reference not found: ${part}`);
      if (fs.statSync(abs).isDirectory()) {
        for (const f of fs.readdirSync(abs).sort()) if (/\.(png|jpe?g|webp)$/i.test(f)) files.push(path.join(abs, f));
      } else {
        files.push(abs);
      }
    }
  }
  return { files, explicit };
}

async function uploadImage(file) {
  const form = new FormData();
  form.append('image', new Blob([fs.readFileSync(file)]), path.basename(file));
  form.append('subfolder', 'onesoul_style');
  form.append('type', 'input');
  form.append('overwrite', 'true');
  const j = await comfyJSON('/upload/image', { method: 'POST', body: form });
  return j.subfolder ? `${j.subfolder}/${j.name}` : j.name;
}

function pickModel(list, want, label, prefer) {
  if (!list.length) throw new Error(`No ${label} models installed in ComfyUI.`);
  if (want) {
    const hit = list.find((x) => x === want) || list.find((x) => x.toLowerCase().includes(String(want).toLowerCase()));
    if (!hit) throw new Error(`${label} "${want}" not found. Installed: ${list.join(', ')}`);
    return hit;
  }
  for (const re of prefer) {
    const hit = list.find((x) => re.test(x));
    if (hit) return hit;
  }
  return list[0];
}

/**
 * Returns the style settings for builtInGraph, or null. With the default anchor
 * folder, a missing IPAdapter install only warns (renders still work, just
 * unanchored); an explicit --style-ref makes it an error.
 */
async function resolveStyle() {
  const { files, explicit } = styleRefFiles();
  if (!files.length) {
    if (explicit) throw new Error('--style-ref matched no images.');
    return null;
  }
  const info = await comfyJSON('/object_info/IPAdapterModelLoader').catch(() => ({}));
  if (!info || !info.IPAdapterModelLoader) {
    const msg = 'IPAdapter node is not loaded in ComfyUI (install ComfyUI_IPAdapter_plus, then restart ComfyUI).';
    if (explicit) throw new Error(msg);
    console.warn(`  ! ${msg}\n    Continuing WITHOUT the style anchor.`);
    return null;
  }
  const ipadapterFile = pickModel(await nodeOptions('IPAdapterModelLoader', 'ipadapter_file'), opts.ipadapter, 'IPAdapter', [/plus_sdxl_vit-h/i, /sdxl/i]);
  const clipVision = pickModel(await nodeOptions('CLIPVisionLoader', 'clip_name'), opts['clip-vision'], 'CLIP vision', [/vit-h/i]);
  const images = [];
  for (const f of files) images.push(await uploadImage(f));
  return {
    ipadapterFile,
    clipVision,
    images,
    refs: files.map((f) => toPosix(path.relative(ROOT, f))),
    weight: parseFloat(opts['style-weight'] || '0.5'),
    weightType: opts['style-type'] || 'style transfer',
  };
}

/** All images from a finished render, flattened (last one is the final output). */
async function render(graph) {
  const outputs = await renderOutputs(graph);
  return Object.values(outputs).flatMap((o) => o.images || []);
}

/** Run a graph and return ComfyUI's per-node outputs: { nodeId: { images: [...] } }. */
async function renderOutputs(graph) {
  const clientId = crypto.randomUUID();
  const { prompt_id: promptId, node_errors: nodeErrors } = await comfyJSON('/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: graph, client_id: clientId }),
  });
  if (nodeErrors && Object.keys(nodeErrors).length) {
    throw new Error(`ComfyUI rejected the graph: ${JSON.stringify(nodeErrors).slice(0, 800)}`);
  }

  const started = Date.now();
  const TIMEOUT_MS = 15 * 60 * 1000;
  for (;;) {
    await new Promise((r) => setTimeout(r, 1000));
    const hist = await comfyJSON(`/history/${promptId}`);
    const entry = hist[promptId];
    if (entry) {
      const status = entry.status || {};
      if (status.status_str === 'error') {
        const msg = (status.messages || []).find((m) => m[0] === 'execution_error');
        throw new Error(`Render failed: ${msg ? msg[1].exception_message : 'unknown error'}`);
      }
      const images = Object.values(entry.outputs || {}).flatMap((o) => o.images || []);
      if (images.length && status.completed !== false) return entry.outputs;
      if (status.completed) throw new Error('Render completed but produced no images.');
    }
    if (Date.now() - started > TIMEOUT_MS) throw new Error('Timed out waiting for ComfyUI.');
  }
}

async function download(img) {
  const q = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder || '', type: img.type || 'output' });
  const res = await comfy(`/view?${q}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// post-processing: cleanup (remove body parts) + outline, and the quality gate
// ---------------------------------------------------------------------------

const PNG = require('./asset-gen/png.js');
const OPS = require('./asset-gen/imageops.js');

const hexToRgb = (hex) => {
  const n = parseInt(String(hex || '#1a1612').replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Checkpoints that can generate images (excludes detector/segmentation models). */
function imageCheckpoints(ckpts) {
  return ckpts.filter((c) => !/(^|[^a-z])(sam\d|sam_|segment|birefnet)/i.test(c));
}

/** The cleanup detector checkpoint (cleanup.detector substring), or null. */
function resolveDetector(ckpts, tpl, disabled = false) {
  const want = (tpl.cleanup || {}).detector;
  if (disabled || !want) return null;
  return ckpts.find((c) => c.toLowerCase().includes(String(want).toLowerCase())) || null;
}

/**
 * Is a detected region really a body part? True if skin-toned (lit skin) OR it has
 * face-like light/dark structure (a face in deep shadow has 0% 'skin' but still
 * shows eyes/nose/mouth detail; an empty dark opening is smooth). Measured inside
 * the mask shrunk by 12px so the hood/collar rim doesn't count.
 */
function looksLikeBodyPart(img, mask, cfg) {
  const skin = OPS.skinFraction(img, mask);
  const inner = OPS.erode(mask, img.width, img.height, 12);
  const { structure } = OPS.regionStats(img, inner);
  const yes = skin >= (cfg.minSkin ?? 0.15) || structure >= (cfg.minStructure ?? 0.8);
  return { yes, skin: +skin.toFixed(2), structure: +structure.toFixed(2) };
}

/** Cleanup detections to request for an item type (from cleanup.rules). */
function cleanupDetections(folder, tpl) {
  const rules = ((tpl.cleanup || {}).rules || {})[folder] || [];
  return rules.map((r, i) => ({ key: `r${i}`, find: r.find, rule: r }));
}

/**
 * Apply an item type's cleanup rules using its detection masks, then draw the
 * outline (last, so it wraps the cleaned edge). Detections bigger than the
 * rule's maxArea are ignored as implausible (e.g. a "foot" mask covering a
 * whole leg) and left for the quality gate.
 * @returns {{ buffer: Buffer, applied: object[], skipped: object[] }}
 */
function finishImage({ imageBuf, masks = {}, detections = [], tpl, outline }) {
  const img = PNG.decode(imageBuf);
  const { width, height } = img;
  const cfg = tpl.cleanup || {};
  const applied = [];
  const skipped = [];
  for (const d of detections) {
    const buf = masks[d.key];
    if (!buf) continue;
    const m = OPS.maskFromImage(PNG.decode(buf));
    const a = OPS.area(m);
    if (a === 0) continue;
    const info = { find: d.find, action: d.rule.action, area: +a.toFixed(4) };
    if (d.rule.maxArea && a > d.rule.maxArea) { skipped.push({ ...info, reason: `larger than maxArea ${d.rule.maxArea}` }); continue; }
    // requireSkin: only act on real skin. Lets a cloth faceguard or an already-empty
    // opening survive even when the detector calls its shape a "face".
    if (d.rule.requireSkin) {
      const bp = looksLikeBodyPart(img, m, cfg);
      if (!bp.yes) { skipped.push({ ...info, reason: `not a body part (skin ${Math.round(bp.skin * 100)}%, structure ${bp.structure})` }); continue; }
      info.skin = bp.skin; info.structure = bp.structure;
    }
    if (d.rule.action === 'void') {
      OPS.fillVoid(img, OPS.blur(OPS.dilate(m, width, height, cfg.voidGrow ?? 14), width, height, 3));
    } else if (d.rule.action === 'erase') {
      OPS.erase(img, OPS.dilate(m, width, height, 10));
    } else if (d.rule.action === 'cutBelow') {
      OPS.cutBelow(img, OPS.topRow(m, width) - (cfg.cutMargin ?? 14));
    } else {
      skipped.push({ ...info, reason: 'unknown action' });
      continue;
    }
    applied.push(info);
  }
  // Count separate objects BEFORE the outline (the outline joins touching objects).
  const shapes = OPS.islands(OPS.alphaMask(img), width, height, cfg.minIslandArea ?? 0.01);
  if (outline && outline.px) OPS.outline(img, outline.px, hexToRgb(outline.hex));
  return { buffer: PNG.encode(img), applied, skipped, shapes };
}

/** Upload an in-memory PNG to ComfyUI's input folder; returns the LoadImage name. */
async function uploadBuffer(buf, name, subfolder = 'onesoul_check') {
  const form = new FormData();
  form.append('image', new Blob([buf]), name);
  form.append('subfolder', subfolder);
  form.append('type', 'input');
  form.append('overwrite', 'true');
  const j = await comfyJSON('/upload/image', { method: 'POST', body: form });
  return j.subfolder ? `${j.subfolder}/${j.name}` : j.name;
}

/**
 * Quality gate: look for things this item type must never show (cleanup.verify)
 * on the FINISHED icon (flattened on grey, since LoadImage drops alpha and the
 * pixels under transparency still hold the erased body part).
 * @returns {{ passed: boolean, hits: {find:string, area:number}[] }}
 */
async function verifyImage(buffer, folder, tpl, detector, label, shapesBeforeOutline = null, singleObject = true) {
  const cfg = tpl.cleanup || {};
  // Entries: "text" or { find, requireSkin } (requireSkin: only skin-toned detections count).
  const entries = ((cfg.verify || {})[folder] || []).map((e) => (typeof e === 'string' ? { find: e } : e));
  const finds = entries.map((e) => e.find);
  const decoded = PNG.decode(buffer);
  const hits = [];
  // Multiple separate objects (two hoods, a front/side/back sheet) - pixel count, no AI.
  const minIsland = cfg.minIslandArea ?? 0.01;
  const shapes = shapesBeforeOutline || OPS.islands(OPS.alphaMask(decoded), decoded.width, decoded.height, minIsland);
  if (singleObject && shapes.length > 1) hits.push({ find: 'multiple objects', area: +shapes[1].toFixed(4), count: shapes.length });
  // The whole item must be visible: reject objects that run off the frame (e.g. a woodpile filling the canvas).
  const edge = OPS.borderTouch(decoded);
  if (edge > (cfg.maxBorderTouch ?? 0.02)) hits.push({ find: 'cut off at frame edge', area: +edge.toFixed(4) });
  if (!detector || !finds.length) return { passed: hits.length === 0, hits, checked: ['multiple objects'] };
  const flat = PNG.encode(OPS.flatten(decoded));
  const name = await uploadBuffer(flat, `${label}.png`);
  const g = { 1: { class_type: 'LoadImage', inputs: { image: name } } };
  const saves = addDetections(g, ['1', 0], detector, finds.map((find, i) => ({ key: `v${i}`, find })), `onesoul/_check/${label}`, cfg.threshold ?? 0.5);
  const outputs = await renderOutputs(g);
  for (const [i, find] of finds.entries()) {
    const img = (outputs[saves[`v${i}`]] || {}).images?.[0];
    if (!img) continue;
    const m = OPS.maskFromImage(PNG.decode(await download(img)));
    const a = OPS.area(m);
    if (a <= (cfg.rejectArea ?? 0.002)) continue;
    if (entries[i].requireSkin) {
      const bp = looksLikeBodyPart(OPS.flatten(decoded), m, cfg);
      if (!bp.yes) continue; // dark/smooth region the detector only shape-matched
      hits.push({ find, area: +a.toFixed(4), skin: bp.skin, structure: bp.structure });
    } else {
      hits.push({ find, area: +a.toFixed(4) });
    }
  }
  return { passed: hits.length === 0, hits, checked: ['multiple objects', ...finds] };
}

// ---------------------------------------------------------------------------
// review page
// ---------------------------------------------------------------------------

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * Rebuild assets/_staging/review.html from every meta.json in staging: each
 * variant on a checkerboard (so transparency is visible) and at real in-game
 * tile sizes, with its prompt and seed. Open it in any browser.
 */
function writeReviewPage() {
  if (!fs.existsSync(STAGING_DIR)) return null;
  const metas = [];
  for (const folder of fs.readdirSync(STAGING_DIR, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    for (const asset of fs.readdirSync(path.join(STAGING_DIR, folder.name), { withFileTypes: true })) {
      const metaPath = path.join(STAGING_DIR, folder.name, asset.name, 'meta.json');
      if (!asset.isDirectory() || !fs.existsSync(metaPath)) continue;
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        meta._dir = `${folder.name}/${asset.name}`;
        meta._mtime = fs.statSync(metaPath).mtimeMs;
        metas.push(meta);
      } catch { /* skip unreadable meta */ }
    }
  }
  metas.sort((a, b) => b._mtime - a._mtime); // newest first

  const cards = metas.map((m) => {
    const variants = (m.variants || []).map((v) => {
      const src = `${m._dir}/${v.file}`;
      return `<figure>
        <div class="big checker"><img src="${esc(src)}" alt=""></div>
        <div class="tiles"><span class="tile t96"><img src="${esc(src)}" alt=""></span><span class="tile t48"><img src="${esc(src)}" alt=""></span></div>
        <figcaption>${esc(v.file)} &middot; seed ${esc(v.seed)}${v.attempts > 1 ? ` &middot; ${v.attempts} tries` : ""}${v.cleanup && v.cleanup.applied && v.cleanup.applied.length ? `<br>fixed: ${esc(v.cleanup.applied.map((a) => a.find + " &rarr; " + a.action).join(", "))}` : ""}${v.tries && v.tries.length > 1 ? `<br>all tries: ${v.tries.map((tr) => `<a href="${esc(m._dir + '/' + tr.file)}">${esc(tr.file.replace('tries/', ''))}</a>${tr.passed ? ' &#10003;' : ''}`).join(' ')}` : ''}${v.qa ? (v.qa.passed ? "<br><span class=ok>gate: pass</span>" : `<br><span class=bad>FLAGGED: ${esc(v.qa.hits.map((x) => x.find + " " + (x.area * 100).toFixed(1) + "%").join(", "))}</span>`) : ""}</figcaption>
      </figure>`;
    }).join('');
    return `<section>
      <h2>${esc(m.name)}${m.tag ? ` <small>[${esc(m.tag)}]</small>` : ''} <small>${esc(m.id)} &rarr; ${esc(m.targetPath)}</small></h2>
      <div class="row">${variants || '<p>No successful variants.</p>'}</div>
      <details><summary>prompt</summary><p><b>+</b> ${esc(m.positive)}</p><p><b>&minus;</b> ${esc(m.negative)}</p>
      <p>${esc(m.checkpoint)} &middot; ${esc(JSON.stringify(m.settings))}</p></details>
    </section>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Asset review</title><style>
body{background:#1e2026;color:#ddd;font:14px system-ui,sans-serif;margin:20px}
h1{font-size:18px} h2{font-size:15px;margin:0 0 8px} small{color:#888;font-weight:normal}
section{background:#272a31;border-radius:8px;padding:12px;margin-bottom:16px}
.row{display:flex;flex-wrap:wrap;gap:14px} figure{margin:0}
.big{width:256px;height:256px;display:flex;align-items:center;justify-content:center}
.big img{max-width:100%;max-height:100%}
.checker{background:conic-gradient(#999 25%,#ccc 0 50%,#999 0 75%,#ccc 0) 0 0/24px 24px}
.tiles{display:flex;gap:10px;align-items:center;margin-top:8px}
.tile{display:inline-flex;align-items:center;justify-content:center;background:#16181d;border:2px solid #6fbf73;border-radius:6px;padding:4px}
.t96 img{width:96px;height:96px;object-fit:contain} .t48 img{width:48px;height:48px;object-fit:contain}
figcaption{color:#999;font-size:12px;margin-top:4px;max-width:256px} .ok{color:#7fd37f} .bad{color:#ff7b72;font-weight:600} details{margin-top:8px;color:#aaa} details p{margin:4px 0}
</style></head><body><h1>Generated asset review (${metas.length} asset${metas.length === 1 ? '' : 's'}, newest first)</h1>
<p>Big = checkerboard (transparency check). Tiles = actual in-game sizes (96px / 48px). Judge at 48px.</p>
${cards || '<p>Nothing generated yet.</p>'}</body></html>`;

  const out = path.join(STAGING_DIR, 'review.html');
  fs.writeFileSync(out, html);
  return out;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function selectTargets(all) {
  let list = all;
  if (!opts['include-existing']) list = list.filter((t) => !t.hasArt);
  // Approved items (scripts/asset-gen/approved.json) are skipped in batch runs; --only or
  // --include-approved still allows redoing them.
  const ledgerPath = path.join(__dirname, 'asset-gen', 'approved.json');
  const approved = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : {};
  if (!opts['include-approved']) list = list.filter((t) => !approved[t.id]);
  if (opts.only) {
    const ids = new Set(String(opts.only).split(',').map((s) => s.trim()));
    list = all.filter((t) => ids.has(t.id)); // --only also allows regenerating existing art
    const missing = [...ids].filter((id) => !list.some((t) => t.id === id));
    if (missing.length) console.warn(`  ! unknown id(s): ${missing.join(', ')}`);
  }
  if (opts.folder) list = list.filter((t) => t.folder === opts.folder);
  if (opts.limit) list = list.slice(0, parseInt(opts.limit, 10));
  return list;
}

async function main() {
  const tpl = loadTemplates();
  const all = collectTargets();
  const targets = selectTargets(all);

  if (opts.review) {
    const review = writeReviewPage();
    console.log(review ? `Review page written: ${toPosix(path.relative(ROOT, review))}` : 'Nothing in staging yet.');
    return;
  }

  if (opts.list) {
    const byFolder = {};
    for (const t of all) {
      const f = (byFolder[t.folder] = byFolder[t.folder] || { total: 0, missing: [] });
      f.total++;
      if (!t.hasArt) f.missing.push(t.id);
    }
    console.log('\nfolder        art/total   missing');
    for (const [f, v] of Object.entries(byFolder).sort()) {
      console.log(`${f.padEnd(13)} ${String(v.total - v.missing.length).padStart(3)}/${String(v.total).padEnd(6)} ${v.missing.join(', ')}`);
    }
    console.log(`\n${targets.length} asset(s) selected for generation.\n`);
    return;
  }

  if (!targets.length) {
    console.log('Nothing to generate (everything selected already has art). Use --include-existing or --only.');
    return;
  }

  if (opts['dry-run']) {
    for (const t of targets) {
      const p = buildPrompt(t, tpl);
      console.log(`\n[${t.folder}] ${t.id}  ->  ${t.targetPath}`);
      console.log(`  + ${p.positive}`);
      // Show only what this item adds beyond the shared negative, to keep output short.
      const extra = p.negative.slice((tpl.negative || '').length).replace(/^,\s*/, '');
      if (extra) console.log(`  - (plus shared negative) ${extra}`);
    }
    console.log(`\n  - (shared negative) ${tpl.negative}`);
    console.log(`\n${targets.length} prompt(s). Dry run: nothing sent to ComfyUI.\n`);
    return;
  }

  // --- resolve models -------------------------------------------------------
  const ckpts = await nodeOptions('CheckpointLoaderSimple', 'ckpt_name');
  if (!ckpts.length) {
    throw new Error(
      'No checkpoints installed in ComfyUI. Download one (e.g. an SDXL Lightning/Turbo model) into\n' +
      '  ComfyUI-Shared/models/checkpoints, then refresh ComfyUI and re-run.'
    );
  }
  // Non-image checkpoints (SAM detector etc.) share the folder; never render with them.
  const imageCkpts = imageCheckpoints(ckpts);
  // Default: the template's preferredCheckpoint if installed, else the first image model.
  const preferred = tpl.preferredCheckpoint && imageCkpts.find((c) => c.toLowerCase().includes(String(tpl.preferredCheckpoint).toLowerCase()));
  let ckpt = preferred || imageCkpts[0];
  if (opts.ckpt) {
    ckpt = imageCkpts.find((c) => c === opts.ckpt) || imageCkpts.find((c) => c.toLowerCase().includes(String(opts.ckpt).toLowerCase()));
    if (!ckpt) throw new Error(`Image checkpoint "${opts.ckpt}" not found. Installed: ${imageCkpts.join(', ')}`);
  }
  if (!ckpt) throw new Error('No image-generation checkpoint installed (only detector models found).');
  const detector = resolveDetector(ckpts, tpl, !!opts['no-cleanup']);

  let bgModel = null;
  if (!opts['no-bg']) {
    const bgModels = await nodeOptions('LoadBackgroundRemovalModel', 'bg_removal_name');
    bgModel = opts['bg-model'] ? bgModels.find((m) => m.includes(opts['bg-model'])) : bgModels[0];
    if (opts['bg-model'] && !bgModel) throw new Error(`Background model "${opts['bg-model']}" not found. Installed: ${bgModels.join(', ') || 'none'}`);
  }

  const d = samplerDefaults(ckpt);
  const settings = {
    size: parseInt(opts.size || d.size, 10),
    steps: parseInt(opts.steps || d.steps, 10),
    cfg: parseFloat(opts.cfg || d.cfg),
    sampler: opts.sampler || d.sampler,
    scheduler: opts.scheduler || d.scheduler,
  };
  const customWorkflow = opts.workflow ? JSON.parse(fs.readFileSync(path.resolve(opts.workflow), 'utf8')) : null;
  const baseSeed = opts.seed !== undefined ? parseInt(opts.seed, 10) : Math.floor(Math.random() * 2 ** 31);
  const style = !customWorkflow && !opts['no-style'] ? await resolveStyle() : null;
  // --from <image>: image-to-image start (transparent images are flattened on grey first,
  // because LoadImage drops alpha). --denoise sets how far it may change (default 0.45).
  let init = null;
  if (opts.from && opts.from !== true && !customWorkflow) {
    const fromPath = path.resolve(String(opts.from));
    if (!fs.existsSync(fromPath)) throw new Error(`--from image not found: ${opts.from}`);
    const flat = PNG.encode(OPS.flatten(PNG.decode(fs.readFileSync(fromPath))));
    init = { image: await uploadBuffer(flat, path.basename(fromPath), 'onesoul_init'), denoise: Math.min(1, Math.max(0.05, parseFloat(opts.denoise || '0.45'))), source: toPosix(path.relative(ROOT, fromPath)) };
  }
  const outline = !customWorkflow ? resolveOutline(tpl, { noOutline: !!opts['no-outline'], px: opts['outline-px'] }) : null;
  if (outline && !bgModel) console.warn('  ! Outline needs background removal (the cutout mask); no background model, so no outline.');

  console.log(`\nComfyUI:     ${HOST}`);
  console.log(`Checkpoint:  ${ckpt}`);
  console.log(`Graph:       ${customWorkflow ? opts.workflow : 'built-in txt2img'}`);
  if (!customWorkflow) {
    console.log(`Sampler:     ${settings.size}px, ${settings.steps} steps, cfg ${settings.cfg}, ${settings.sampler}/${settings.scheduler}`);
    console.log(`Background:  ${bgModel ? `removed with ${bgModel}` : 'kept (no background-removal model installed, or --no-bg)'}`);
    console.log(`Outline:     ${outline && bgModel ? `${outline.px}px ${outline.hex} (drawn in post-processing)` : 'none'}`);
    if (init) console.log(`Start image: ${init.source} (denoise ${init.denoise})`);
    else if (!opts['no-base']) console.log(`Family bases: ${Object.keys(tpl.familyBases || {}).filter((k) => !k.startsWith('_')).join(', ') || 'none'} (items of those archetypes start from their base)`);
    const cu = tpl.cleanup || {};
    console.log(`Cleanup:     ${detector && bgModel ? `${detector}; quality gate rejects + re-renders up to ${cu.maxAttempts ?? 3}x` : opts['no-cleanup'] ? 'off (--no-cleanup)' : 'off (no detector installed)'}`);
    console.log(
      `Style:       ${style
        ? `anchored to ${style.refs.length} image(s) (${style.weightType} @ ${style.weight}) via ${style.ipadapterFile}`
        : 'no anchor (prompt only)'}`
    );
  }
  console.log(`Assets:      ${targets.length} x ${VARIANTS} variant(s), base seed ${baseSeed}\n`);

  // Family bases: an item whose archetype has an approved base starts from it (image-to-image),
  // unless --from gave an explicit start image or --no-base is set. Uploaded once per family.
  const baseCache = {};
  async function startFor(t) {
    if (customWorkflow) return null;
    if (init) return init;
    if (opts['no-base']) return null;
    const arche = (t.spec && t.spec.archetype) || t.subcategory;
    const fb = (tpl.familyBases || {})[arche];
    if (!fb || !fb.start) return null;
    const denoise = opts.denoise && opts.denoise !== true ? Math.min(1, Math.max(0.05, parseFloat(opts.denoise))) : fb.denoise ?? 0.6;
    // spec.tint: colour the grey base by luminance so the item's colour comes through
    // (img2img keeps the start image's colour, grey or not). One upload per tinted item.
    const tint = t.spec && t.spec.tint;
    if (tint) {
      const img = OPS.flatten(PNG.decode(fs.readFileSync(path.resolve(ROOT, fb.start))));
      // spec.lightBelly: lighten each object's lower part (e.g. fish bellies) on the GREY image,
      // before tinting - the tint recolours the background too, which would hide the objects.
      // Lighter bellies then map to pale cream in the tint.
      if (t.spec.lightBelly) OPS.lightenLowerParts(img, { amount: typeof t.spec.lightBelly === 'number' ? t.spec.lightBelly : 0.6, color: [250, 250, 250] });
      OPS.tintByLuminance(img, hexToRgb(tint), { pivot: t.spec.tintPivot ?? 0.55 }); // spec.tintPivot: lower = lighter highlights (e.g. pale bellies)
      return { image: await uploadBuffer(PNG.encode(img), `family_${arche}_${t.stem}.png`, 'onesoul_init'), denoise, source: fb.start, family: arche, tint };
    }
    if (!baseCache[arche]) {
      const flat = PNG.encode(OPS.flatten(PNG.decode(fs.readFileSync(path.resolve(ROOT, fb.start)))));
      baseCache[arche] = { image: await uploadBuffer(flat, `family_${arche}.png`, 'onesoul_init'), denoise: opts.denoise && opts.denoise !== true ? Math.min(1, Math.max(0.05, parseFloat(opts.denoise))) : fb.denoise ?? 0.6, source: fb.start, family: arche };
    }
    return baseCache[arche];
  }

  // --- render ---------------------------------------------------------------
  let done = 0;
  const failures = [];
  for (const t of targets) {
    const { positive, negative } = buildPrompt(t, tpl);
    // --tag keeps experiments side by side (moss_shrimp__w05) instead of overwriting.
    const tag = opts.tag && opts.tag !== true ? String(opts.tag).replace(/[^\w.-]/g, '_') : '';
    const outDir = path.join(STAGING_DIR, t.folder, tag ? `${t.stem}__${tag}` : t.stem);
    fs.mkdirSync(outDir, { recursive: true });
    const meta = {
      id: t.id, name: t.name, kind: t.kind, folder: t.folder, tag: tag || null,
      targetPath: t.targetPath, checkpoint: ckpt,
      settings: customWorkflow
        ? { workflow: opts.workflow }
        : {
          ...settings,
          bgModel,
          init: init ? { from: init.source, denoise: init.denoise } : null,
          outline: outline && bgModel ? { px: outline.px, color: outline.hex } : null,
          style: style
            ? { refs: style.refs, weight: style.weight, weightType: style.weightType, ipadapter: style.ipadapterFile, clipVision: style.clipVision }
            : null,
        },
      positive, negative, variants: [],
    };

    console.log(`[${++done}/${targets.length}] ${t.id}`);
    // Cleanup + quality gate only make sense with a cutout (background removal).
    const tInit = await startFor(t);
    if (tInit) meta.settings.init = { from: tInit.source, denoise: tInit.denoise, family: tInit.family || null, tint: tInit.tint || null };
    if (tInit && tInit.family) console.log(`    (from ${tInit.family} family base${tInit.tint ? ` tinted ${tInit.tint}` : ''}, denoise ${tInit.denoise})`);
    const cleanupOn = !customWorkflow && !!detector && !!bgModel;
    const detections = cleanupOn ? cleanupDetections(t.folder, tpl) : [];
    const so = (tpl.cleanup || {}).singleObject || {};
    const singleObject = (so.types || []).includes(t.folder) && !(so.exceptSubtypes || []).includes(t.subcategory);
    // The gate always runs on cutouts: the frame-edge check applies to every item (a cut-off
    // icon is never acceptable); single-object and body-part checks only where configured.
    const gateOn = !customWorkflow && !!bgModel;
    const maxAttempts = gateOn ? Math.max(1, (tpl.cleanup || {}).maxAttempts ?? 3) : 1;
    let stopAll = false;

    for (let v = 1; v <= VARIANTS && !stopAll; v++) {
      let best = null; // { buffer, seed, attempt, cleanup, qa, score }
      const tries = []; // every attempt is kept in tries/ so a rejected image you like isn't lost
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Re-renders use seeds far from the other variants' seeds.
        const seed = baseSeed + v - 1 + (attempt - 1) * 1000;
        const prefix = `onesoul/${t.folder}/${t.stem}_v${v}`;
        const t0 = Date.now();
        try {
          let buffer;
          let cleanup = null;
          if (customWorkflow) {
            const images = await render(fillCustomGraph(customWorkflow, { positive, negative, seed, prefix }));
            buffer = await download(images[images.length - 1]);
          } else {
            // Outline is drawn in post-processing (after cleanup), not in the graph.
            const graph = builtInGraph({ ckpt, positive, negative, seed, prefix, bgModel, style, outline: null, detector: cleanupOn ? detector : null, detections, threshold: (tpl.cleanup || {}).threshold ?? 0.5, init: tInit, ...settings });
            const outputs = await renderOutputs(graph);
            const mainImg = (outputs['11'] || {}).images?.[0];
            if (!mainImg) throw new Error('Render produced no item image.');
            const masks = {};
            for (const [key, nodeId] of Object.entries(graph._detectionSaves || {})) {
              const m = (outputs[nodeId] || {}).images?.[0];
              if (m) masks[key] = await download(m);
            }
            const finished = finishImage({ imageBuf: await download(mainImg), masks, detections, tpl, outline: bgModel ? outline : null });
            buffer = finished.buffer;
            cleanup = { applied: finished.applied, skipped: finished.skipped, shapes: finished.shapes };
          }

          const qa = gateOn ? await verifyImage(buffer, t.folder, tpl, cleanupOn ? detector : null, `${t.stem}_v${v}_a${attempt}`, cleanup && cleanup.shapes, singleObject) : null;
          const score = qa ? qa.hits.reduce((s, x) => s + x.area, 0) : 0;
          const secs = ((Date.now() - t0) / 1000).toFixed(1);
          const fixes = cleanup && cleanup.applied.length ? `  fixed: ${cleanup.applied.map((a) => `${a.find}->${a.action}`).join(', ')}` : '';
          const gate = qa ? (qa.passed ? '  gate: PASS' : `  gate: FAIL (${qa.hits.map((x) => `${x.find} ${(x.area * 100).toFixed(1)}%`).join(', ')})`) : '';
          console.log(`    v${v}${maxAttempts > 1 ? ` try ${attempt}` : ''}  seed ${seed}  ${secs}s${fixes}${gate}`);
          if (maxAttempts > 1) {
            const tryFile = `tries/v${v}_try${attempt}.png`;
            fs.mkdirSync(path.join(outDir, 'tries'), { recursive: true });
            fs.writeFileSync(path.join(outDir, tryFile), buffer);
            tries.push({ file: tryFile, seed, passed: qa ? qa.passed : null, hits: qa ? qa.hits : [] });
          }
          if (!best || score < best.score) best = { buffer, seed, attempt, cleanup, qa, score };
          if (!qa || qa.passed) break;
        } catch (err) {
          console.log(`    v${v}  FAILED: ${err.message}`);
          failures.push(`${t.id} v${v}: ${err.message}`);
          if (/Cannot reach ComfyUI|rejected the graph/.test(err.message)) { stopAll = true; break; }
        }
      }
      if (best) {
        const file = `v${v}.png`;
        fs.writeFileSync(path.join(outDir, file), best.buffer);
        meta.variants.push({
          file, seed: best.seed, attempts: best.attempt, tries,
          cleanup: best.cleanup,
          qa: best.qa ? { passed: best.qa.passed, hits: best.qa.hits, checked: best.qa.checked } : null,
        });
        const flag = best.qa && !best.qa.passed ? '  ** FLAGGED: failed the quality gate on every attempt (kept the best) **' : '';
        console.log(`    -> ${toPosix(path.relative(ROOT, path.join(outDir, file)))}${flag}`);
      }
    }
    fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 2));
  }

  const review = writeReviewPage();
  console.log(`\nDone. Review page: ${review ? toPosix(path.relative(ROOT, review)) : '(none)'}  (open it in a browser)`);
  if (failures.length) {
    console.log(`${failures.length} failure(s):`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`\nError: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = {
  builtInGraph, fillCustomGraph, buildPrompt, collectTargets, loadTemplates, visualDescription, snake, folderForItem,
  resolveFaction, resolveMaterials, materialParts, factionParts, typeRule, resolveOutline,
  renderOutputs, finishImage, verifyImage, looksLikeBodyPart, loadSpecs, imageCheckpoints, resolveDetector, cleanupDetections,
  render, download, nodeOptions, samplerDefaults, comfyJSON, HOST,
};
