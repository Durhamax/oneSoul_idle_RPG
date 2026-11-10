# One Soul — Resource Design & Naming

**Status:** Living document — v0.3 (added the inorganic=familiar / organic=alien physics rule)
**Last updated:** 2026-11-09
**Governs:** all resource authoring in `REGIONS_GEOGRAPHY.md`, and the eventual cleanup of the item/node data (`src/data/items/`, `src/data/nodes/`). Read this before adding a resource to any region.

---

## 1. Grounding — what exists today

Live resource data lives in `src/data/items/production/materials/materials.js` and the node registry; `data/csv/items.csv` + `nodes.csv` are exports (treat as reference, possibly stale).

The data is currently in **two states:**

- **On-convention (the real direction):** `pinewood` ("an alien tree that resembles pine → pinewood"), `solfish` (Cradle Lake), `copperite ore`, `minnows`, `minty herb`, `small pelt`, `resin`. These match the intended grounded-alien style and are the **templates.**
- **Legacy placeholder fantasy (to migrate):** Dragon Scale, Phoenix Feather, World Tree Bark, Fairy Dust, Eternal Lotus, Neptune's Crown, Crown of Ages, generic Ruby/Sapphire/Emerald/Diamond, Trout/Salmon/Bass/Pike, etc. These clash with a hard-sci-fi alien-colonization setting and should be reskinned (see §5).

---

## 2. The skill → resource dependency web

Every crafting input must be gathered somewhere. This graph is load-bearing: it determines which regions *must* exist and why the player travels.

**Gatherers → raw outputs:**
| Skill | Raw outputs | Feeds |
|---|---|---|
| **Mining** | ore (→ alloys/metal), stone, coal (fuel), minerals, gems, rare-earths | Smithing, Mechanics, Chemistry, Electronics |
| **Logging** | wood (lumber/fuel), resin, bark-fiber | Smithing (fuel), Textiles (fiber), Mechanics (lumber) |
| **Fishing** | fish | Cooking |
| **Hunting** | meat, hide/leather, bone, pelt, fang, feather | Cooking, Textiles (leather), ammo (feather), Smithing (bone) |
| **Foraging** | herbs, mushrooms, flowers, berries, roots, plant-fiber | Cooking, Chemistry (herbs), Textiles (plant-fiber) |
| **Thieving** | scrap, wire, parts, circuits, keycards, valuables | Mechanics (parts), Electronics (circuits/wire) |

**Crafters → inputs they need → where those come from:**
| Crafter | Consumes | Sourced from |
|---|---|---|
| **Cooking** | fish, meat, plants, herbs | Fishing, Hunting, Foraging *(green west)* |
| **Textiles** | fiber, leather, thread | Foraging/Logging (fiber), Hunting (leather) *(green west)* |
| **Smithing** | ore, alloys, fuel | Mining + refining; coal/wood fuel |
| **Chemistry** | herbs, minerals, compounds | Foraging, Mining, chem-processing |
| **Mechanics** | metal, parts, fuel | refined ore, **Thieving/industry (parts)** |
| **Electronics** | circuits, batteries, rare-materials | **Thieving/salvage + Elaran industry + rare-earth mining + exotic** |
| **Engineering** | (enhances all) | — |

### The load-bearing consequence
**Cooking, Textiles, basic Smithing, and Chemistry run on Unity's green-west resources. Mechanics, Electronics, and all advanced crafting can only be fed from the industrial/extractive regions — which are Elaran.** So the crafting tree *itself* forces the player east into the enemy's world, and the deeper the recipe, the deeper the transgression. The dependency graph = the journey = the moral descent. (See `REGIONS_GEOGRAPHY.md` §2.)

**Early advanced inputs (circuits, parts, batteries) come from Thieving and salvage** before the player reaches Elaran industry — e.g. the **Kahelion Platform** (Tier 2) is the first salvage source. This is why Thieving matters early: it's the bridge to tech before you can mine/manufacture it.

---

## 3. Naming conventions

Three registers. **The register tracks the gradient** — familiar names in the green/early regions, alien names as you near Infernus. The player feels the world get stranger through its vocabulary.

### The physics rule: inorganic = familiar, organic = alien
The universe shares **one periodic table** — elements and **metals are real and recognizable** (copper, iron, tin…), which is exactly why the grounded names work. What differs on Aurora Vitae is **compounds and organic life**, formed under this world's conditions. So split by chemistry:
- **Inorganic** (metals, ores, minerals, stone, salt) → **Register A** grounded names (real elements, lightly renamed: `copperite`).
- **Organic & novel compounds** (flora, fauna, biologicals, exotic compounds) → lean **Register B** alien — *recognizable metals, alien organisms.*

### Register A — Grounded analogue *(the default; most resources)*
Humans name an alien thing after the nearest Earth match. Patterns:
- **Wood (Logging):** `[tree]wood` — **pinewood** ✓ (alien tree resembling pine). Future: oakwood, ashwood, ironwood (dense/hard), palewood.
- **Ore/metal (Mining):** `[element]ite` or a lightly-altered Earth name — **copperite** ✓. Future: ferrite (iron-like), tinnite; keep plain grounded names like coal, stone, salt.
- **Fish (Fishing):** `[prefix/trait]fish` / Earth fish names — **solfish** ✓, **minnows** ✓. Future: reeffish, silverfin, pike-analogue.
- **Herbs/plants (Foraging):** `[trait] [Earth-plant]` — **minty herb** ✓. Future: emberroot, frostleaf, bitterbark.
- **Fauna/hunting:** descriptive, small-game-first — **small pelt** ✓, bone, feather, fang.
- **Byproducts:** **resin** ✓ (logging), clay, flint, fiber.

*Rule of thumb: if a human colonist would point at it and say "that's basically a ___," name it after the ___.*

### Register B — Alien-distinct *(the wonder layer; rarer)*
Completely alien things with no clean Earth match — colorful bioluminescent flowers, weird small creatures, strange minerals. Invented or weird-descriptive names. These are the **wonder/rare resources**, often tied to a unique biome or the Seed's influence (the Cradle's hyperfertile flora is Seed-touched). Use sparingly so they stay special; concentrate them in distinctive biomes.

### Register C — Exotic / Seed-derived *(endgame; Infernus)*
Truly alien, "beyond human metrology" materials with no Earth analogue — designations rather than names (AV-S1 derivatives, codenames). The top of the gradient; the player's ultimate (transgressive) crafting inputs. *(Reskin the existing "Prismatic Shard — crystallized energy" into this family — a Seed fragment.)*

---

## 4. Fauna & flora rules

- **Small game dominant.** Most hunting is small, often colorful or weird creatures — traps, snares, small predators — yielding **small pelts, bone, feather, fang, small meat.** This is the baseline.
- **Few big game.** A handful of larger animals exist as **special, higher-tier hunts** (rarer, region-specific apex creatures, mission/event-flavored). Big-game yields are the premium hunting materials.
- **Colorful, alien flora.** Foraging leans into vivid, strange plants and flowers — a key "wonder" and mood vector, and a chemistry/cooking input source.
- **Thematic note:** a world light on megafauna reads subtly *alien*, and can quietly tie to the Seed-terraforming / the ecosystem's relative youth. Worth keeping consistent — don't litter the map with Earth-style big beasts.

---

## 5. Legacy cleanup — DELETE

The weird-named legacy items are **not in the game and never will be — delete them**, don't reskin. This includes Dragon Scale, Phoenix Feather, World Tree Bark, Fairy Dust, Eternal Lotus, Neptune's Crown, Crown of Ages, generic Ruby/Sapphire/Emerald/Diamond, Trout/Salmon/Bass/Pike, and the rest of the fantasy filler. We build the resource set **fresh** from the conventions above and the combat-driven loot method below.

- **Keep (on-convention templates):** pinewood, copperite, solfish, minnows, minty herb, small pelt, resin.
- **"Prismatic Shard"** may be repurposed as a Seed/exotic fragment (Register C), or deleted — author's call.

## 6. Combat-driven resources — reverse-engineering loot

**Method:** don't start from "what grows here" — start from **"who do you fight here, and what should they drop?"**, then fill the gaps with gathering. Unity holds only the Cradle + a couple of adjacent tiers (small); the player is in Elaran territory very early, so for most of the game **the enemy is the main resource.**

### The Elaran enemy is the primary source of advanced components
Unity's green west can't produce circuits, parts, or batteries (§2). The player gets them two ways — both in Elaran territory, both making in-world sense:
1. **Plunder (Thieving / combat loot):** take manufactured components — wiring, circuitry, parts, batteries, ammo, med-stims — off Elaran soldiers, drones, and installations. Fast, combat/stealth-driven.
2. **Produce (Mine → Smith → Electronics):** mine ore in Elaran territory → smith into wire/sheet/casing → electronics into circuits/batteries. Slower, player-made.

Both paths live in Elaran regions; the player chooses **plunder vs. production** — a real build fork (thieving-heavy vs. crafting-heavy).

### Loot streams per Elaran encounter (scale to the region's combat tier)
- **Salvage components** — scrap, wiring, circuitry, parts, batteries *(the tech-input bridge)*.
- **Munitions** — ammo, explosives, cells *(feeds Chemistry/Mechanics)*.
- **Field supply** — med-stims, rations *(consumables)*.
- **Their gear** — the enemy's own weapons/armor *(equip or salvage for materials)*.
- **Rare/elite** — elite tokens, blueprints *(workstation upgrades)*, weapon fragments.

### Scaling & the type loop (the self-reinforcing economy)
Enemies carry **armor types**; the player needs the **damage type** that counters them, which the region's crafting unlocks provide:

> gather/loot → craft the region's weapon type → it counters the region's enemies → their loot yields the next tier's components → craft deeper.

Counter map (type-effectiveness): **Incendiary > Biological** (infantry) · **Cryo > Airborne** (drones/aircraft) · **Explosive > Plated** (armor/vehicles) · **Shock > Droid** (mechs/automatons) · **Pierce > Insulated** (EW/tech troops).

A region's **enemy armor mix** pairs with the **damage type it (or the prior region) unlocks** — the region arms you for its own threat. Examples:
- **Highlands (shock) ↔ Droid** (Elaran mining mechs/automatons). ✓
- **Icelands (cryo) ↔ Airborne** (recon aircraft/drones over the ice).
- **Desert (explosive) ↔ Plated** (heavy armor/vehicles in the open).
- **Early tiers ↔ Biological** infantry + **Airborne** survey drones (the Scoutreach breach) — countered by starting pierce/incendiary.

**Combat level scales per region** (existing enemies span combat lvl ~1 Scout → ~25 Elite Commander); each region sets its enemy tier, and loot/materials scale with it. **Before setting enemy levels, see `COMBAT_PROGRESSION.md`** — enemies are calibrated against a fully-engaged build (gear + skills + attributes + perks + buffs + tech), and loot must feed all three build lines (light/medium/heavy).

---

## 7. How this feeds region work

When authoring a region in `REGIONS_GEOGRAPHY.md`:
1. **Start from combat (§6):** who does the player fight here (enemy types, armor, scaled combat level), and what do they drop? For most of the map the enemy is the main resource.
2. Cover the **gatherers present** to fill the gaps loot doesn't (not every region has all six — Highlands are mining country, the archipelago is fishing/logging).
3. Make sure, across the whole map, **every crafter's inputs are supplied** (§2) — advanced inputs come from Elaran loot/industry and force the eastern journey.
4. **Name** with the register matching the region's gradient position (§3) — grounded in the green west, alien toward Infernus.
5. Respect the **fauna rules** (§4) and the **damage-type/enemy pairing** (§6).
