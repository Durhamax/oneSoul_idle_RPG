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

---

## 8. Nodes — the gathering model & archetype library

### 8.1 The node model (as coded, `nodeSchema.js`)
A node is **not a hex** — it's a reusable **archetype** with:
- a **weighted `resourceTable`** (one roll per harvest, each entry min/max yield) + a separate **rare-drop table** — so every node yields a *cluster* of related resources, never a single drop (R1's Riverbed → clay · flint · copperiteOre · *goldFlakes*);
- **`baseHealth` / `minHealth` / `maxHealth`** = harvests before it depletes and respawns;
- **exploration raises a node's health** (`upgradeChance` / `upgradeAmount`): the more instances of an archetype you discover and explore, the higher that archetype's health climbs — **discovering more Riverbeds literally makes Riverbeds yield longer before respawn**, rewarding exploration;
- **`category` + `biomes`** = where the archetype is allowed to appear;
- **`progressionPath` / `nextTier`** = the same archetype scaling up a tier (copper vein → iron vein).

### 8.2 Placement rules
1. **Nodes attach to geographic features, not tiles.** A river that crosses 4 hexes is the **same fishing node in all 4**. A mountain range, a forest belt, a salt flat — one feature, one archetype, replicated across every tile it touches.
2. **Resources bleed across borders.** A region **inherits its neighbors' resources** and **adds its own** — the gradient in §3 / `REGIONS_GEOGRAPHY.md`. R1's pinewood, copperiteOre, small game, etc. stay available in adjacent tiers; new regions layer new archetypes on top. Regions are **not** resource-siloed.
3. **Unique nodes are the exception.** The Cradle is a crater, so **Lake Shallows is a closed-basin, endemic node** (solfish · minnows · mossShrimp) — it does **not** propagate outward, and neighboring river/coastal fish don't reach in. Flag unique nodes explicitly; everything else is a shared archetype.

### 8.3 Generalized node-archetype library *(the shared vocabulary)*
`[E]` = already wired in R1 (`nodes.js`). Order within a cluster shows the weighted spread (common → *rare*).

**⛏️ Mining** — rock / soil / alluvial features
| Archetype | Found along | Cluster |
|---|---|---|
| **Riverbed** `[E]` | any river/stream (shared across its tiles) | clay · flint · copperiteOre · *goldFlakes* |
| **Stone Bluff** | hills, cliffs, outcrops | fieldstone · flint · slate · *limestone* |
| **Ore Seam** | mountain exposures | copperiteOre · tinstone · ironstone · *coal* |
| **Scree Slope** | mountain base / talus | gravel · quartz · rough garnet · *gem chips* |
| **Clay Pit** | wetland / mudbank | clay · sand · peat · *ochre* |
| **Salt Pan** *(arid, later)* | evaporite flats | rock salt · gypsum · soda ash · *borax* |
| **Niter Caliche** *(desert — explosive supply)* | arid soil/caves | niter (saltpeter) · nitrate salts |

**🪓 Logging** — forest belts
| Archetype | Found along | Cluster |
|---|---|---|
| **Lakeside Forest** `[E]` | lake/river edge | pinewood · riverwillow · resin |
| **Pinewood Stand** | upland conifer | pinewood · pine resin · pitch · *seed cones* |
| **Hardwood Grove** | temperate broadleaf | hardwood · bark fiber · *hard sap* |
| **Deadfall** | mature forest | deadwood · tinder · bracket fungus · bark fiber |
| **Riverwillow Thicket** | riverbank | willow withes · reed · soft bast fiber |
| **Frostpine Stand** *(icelands)* | cold conifer | frostpine · cold-sap · resin |

**🎣 Fishing** — water features
| Archetype | Found along | Cluster |
|---|---|---|
| **Lake Shallows** `[E]` **UNIQUE** | the Cradle crater only | solfish · minnows · mossShrimp *(endemic — does not spread)* |
| **River Run** | any river (shared across its tiles) | silverdarter · river mussel · *freshwater eel* |
| **Stagnant Pond** | lowland backwater | mudsucker · pond snail · algae mat · *leech (chem)* |
| **Reed Shallows** | marsh edge | marsh fish · roe · crayfish · *reed (→forage)* |
| **Tidal Flat** *(coast)* | shoreline | shellfish · shorecrab · kelp · *coastal roe* |
| **Glacial Tarn** *(icelands)* | ice-melt pools | coldfish · ice shrimp |

**🏹 Hunting** — land / brush features
| Archetype | Found along | Cluster |
|---|---|---|
| **Meadow Game Trail** `[E]` | open grassland | smallGameMeat · smallPelts · feathers |
| **Thorny Thicket** | scrub / brushland | bristlehare meat · small pelt · sinew · *thornberries (→forage)* |
| **Burrow Warren** | den fields | burrower meat · pelt · bone · *fat* |
| **Fowl Marsh** | wetland edge | fowl meat · feathers · down · *eggs* |
| **Grazing Flat** *(big game, mid)* | herd plains | big-game meat · large hide · horn · *tallow* |
| **Predator Range** *(later)* | upland / badlands | tough hide · fang · claw · *rare pelt* |

**🌿 Foraging** — ground / plant features
| Archetype | Found along | Cluster |
|---|---|---|
| **Fallen Timber** `[E]` | forest floor | mintyHerb · commonMushrooms · plantFibers · auroranTuber |
| **Meadow Herb Patch** `[E]` | meadow | meadowGreens · daypetalBloom |
| **Mushroom Hollow** | shaded rot | edible caps · toxic caps (chem) · spores · *loam* |
| **Berry Bramble** | hedgerow / scrub | berries · thornberries · bramble fiber |
| **Wetland Verge** | fen / bog | cattail root · bog myrtle · peat moss · *reed* |
| **Tuber Bed** | rich soil | tubers · *starchroot* · *groundnut* |

**🗝️ Thieving** — Elaran/urban (introduced R2; no nodes in the Cradle)
| Archetype | Found along | Cluster |
|---|---|---|
| **Supply Cache** | depots, dead-drops | rations · scrap · credits · *data-chit (tome)* |
| **Patrol Pocket** | guarded routes | credits · keycard · ammo · *intel* |
| **Field Depot** | container yards | parts · circuits · fuel · *schematic frag* |
| **Data Terminal** | comms nodes | **data-core (tomes)** · cipher · schematic |

### 8.4 Refine → craft spine
Every gathering output feeds **at least two** crafting skills (no dead-end nodes). Which skill owns each chain, with the **now** use and *later* hook:

| Raw (from nodes) | Refine step (skill) | Items — **now** / *later* |
|---|---|---|
| **ore** (copperite, tin, iron) | smelt → ingots (**Smithing**); bronze = copper+tin | tools, arrowheads, **plating** / *steel weapons, jewelry* |
| **clay / sand / salt** | fire → brick/crucible; sand+soda → glass (**Smithing/Chem**) | furnace & crucible infra, vials / *lenses (→Electronics), preservation* |
| **flint** | knap (**Mechanics**) | arrowheads, strikers / *gun flints, tools* |
| **wood** (pine/hard/willow) | saw → lumber/staves (**Mechanics**) | bow staves, hafts / *gun stocks* |
| **resin / pitch / sap** | render (**Chemistry**) | waterproofing, torches / *sealants, construction/tech adhesive* |
| **fiber / bast / sinew** | ret → cordage → cloth (**Tailoring**) | rope, bowstrings, garments / *armor cloth layer* |
| **pelts / hide** + tannin bark | tan → leather (**Tailoring**) | straps, light armor / *leather + plating = modern armor* |
| **fish / meat / greens / fat** | cook / preserve (**Cooking**) | rations, stews (buffs) / *expedition rations, tallow→lubricant* |
| **herbs / mushrooms / roots / berries** | extract (**Chemistry**) | tinctures, antidotes, stimulants, dyes / *serums, poison coatings* |
| **scrap / circuits / parts** (thieving/salvage) | assemble (**Electronics/Mechanics/Engineering**) | flashlights, sensors / ***tech-slot components*** |

Two spines matter most: **ore → plating (Smithing) + fiber/leather → cloth (Tailoring) → Tailoring assembles modern armor** (the armor-crafting loop, canon), and **scrap/circuits → Engineering tech components** (into the build system, `ENGINEERING_DESIGN.md`).

### 8.5 The lean-recipe rule
**No filler reagents, no multiplicative material webs.** A recipe ingredient earns its slot only if **sourcing it is a real decision** (a supply line the player has to establish). We do **not** tax the player with glue/binding/thread-type micro-ingredients. *Arrows = shaft + head + fletching (feathers) — no adhesive.* Keep inputs few and meaningful; combinatorial ingredient trees are the complexity we're avoiding.

### 8.6 Damage-type supply lines & collection hazards
Each damage type has **one signature supply line** — a single signature material from a single node archetype — gated by **geology + engineering** (`ENGINEERING_DESIGN.md` §5a): the material exists only in the matching late region, and it stays inert until the Engineering field unlocks processing (gather-vs-use).

| Damage type | Signature material | Node archetype | Harvest physics |
|---|---|---|---|
| **Incendiary** | flammable pitch/naphtha → sulfur | Tar/Oil Seep → Sulfur Fumarole | skim a petroleum seep; scrape vent-crust sulfur |
| **Shock** | conductive / piezo core | Piezo Crystal Pocket / Graphite Seam | piezo crystals output voltage under stress; stored in capacitor banks → arc |
| **Cryo** | cryo working-fluid | Gas-Hydrate Bed / Frost-Nitre Pan | clathrate ice releases pressurized gas; Joule–Thomson expansion cools; endothermic salts absorb heat |
| **Explosive** | oxidizer (niter + sulfur) | Niter Caliche / Nitrate Flat | nitrates survive only in arid soil — scrape/leach the flats |
| **Exotic/Seed** | Register-C exotic | Seed-Exotic Vein | requires late-tier Engineering containment |

**Protective-gear gates** — the harvest permit for a hazardous node. Each set is **craftable from *earlier* harvests**, so the loop self-gates (harvest → craft the gear → reach the next hazard tier):

| Hazard | Node examples | Gear | Made by |
|---|---|---|---|
| Extreme cold | Gas-Hydrate Bed, Glacial Tarn | thermal / insulated cold suit | Tailoring + Cryogenics |
| Charge / high-voltage | Piezo Pocket, conductive seams | dielectric (insulated) gear | Tailoring + Electronics |
| Toxins / spores | poisonous flora, Mushroom Hollow | respirator + sealed gloves / antitoxin | Tailoring + Chemistry |
| Heat / fumes | Sulfur Fumarole, Tar Seep | heat-resistant gear + respirator | Tailoring + Chemistry |
| Volatile oxidizer | Niter Caliche | blast-safe handling / containers | Mechanics / Engineering |
