# Asset Status — the art handshake

> **Generated file — do not hand-edit.** Regenerate with `node scripts/asset-gen/asset-status.js` (install-approved.js does this automatically). Sources of truth: `scripts/asset-gen/approved.json` (item icons), `assets/_staging/backgrounds/notes.json` → `approved` (region backgrounds), `scripts/asset-gen/specs/*.json`, `assets/_staging/`, and the game registries.

## Rules for every chat

1. **Approved & installed** = final art, approved by the user and wired into the game. Expect it in-game. **Do not regenerate, replace, rename or move it** (or change the registry `icon` / `backgroundImage` pointing at it) without the user asking.
2. **In progress** = being generated or reviewed in the asset pipeline (`scripts/asset-gen/`, renders under `assets/_staging/`). Don't install staged renders or approve anything on the user's behalf — only the user approves. New content can use its emoji or placeholder until approval.
3. **Legacy art** = an older image the game uses that has not gone through the pipeline. It works and is expected in-game, but will be replaced; don't build on its style.
4. **Not started** = no art yet (emoji, missing file, or biome-default background). Free to spec. When adding art for one of these, add its spec to `scripts/asset-gen/specs/` so it shows up here as in progress.
5. **Adding new items/regions:** an emoji `icon` (or `backgroundImage: null`) is the expected placeholder — they appear under *Not started* automatically. Don't point at image paths that don't exist yet.
6. How approval works: the user approves a specific render → `approve.js` records it in `approved.json` → `install-approved.js` downscales it into `assets/icons/...` and updates the registry `icon`. Backgrounds: approved render → 1024² JPG at the spec's `targetPath` → region `backgroundImage`. Art direction and pipeline details live in `assets/_staging/` review pages and `scripts/asset-gen/` script headers.

## Summary

| Asset type | Approved & installed | In progress | Legacy art | Not started |
|---|---|---|---|---|
| Item icons | 17 | 10 | 8 | 54 |
| Region backgrounds | 3 | 2 | 1 | 1 |
| Enemy art | 0 | 0 | 0 | 7 |
| Node art | 0 | 0 | 0 | 19 |

## Item icons

### Approved & installed
| Item | id | Registry | File |
|---|---|---|---|
| Solfish | `solfish` | materials | `assets/icons/materials/solfish.png` |
| Minnows | `minnows` | materials | `assets/icons/materials/minnows.png` |
| Moss Shrimp | `mossShrimp` | materials | `assets/icons/materials/moss_shrimp.png` |
| Small Game Meat | `smallGameMeat` | materials | `assets/icons/materials/small_game_meat.png` |
| Small Pelts | `smallPelts` | materials | `assets/icons/materials/small_pelts.png` |
| Feathers | `feathers` | materials | `assets/icons/materials/feathers.png` |
| Minty Herb | `mintyHerb` | materials | `assets/icons/materials/minty_herb.png` |
| Common Mushrooms | `commonMushrooms` | materials | `assets/icons/materials/common_mushrooms.png` |
| Plant Fibers | `plantFibers` | materials | `assets/icons/materials/plant_fibers.png` |
| Auroran Tuber | `auroranTuber` | materials | `assets/icons/materials/auroran_tuber.png` |
| Pinewood | `pinewood` | materials | `assets/icons/materials/pinewood.png` |
| Riverwillow | `riverwillow` | materials | `assets/icons/materials/riverwillow.png` |
| Resin | `resin` | materials | `assets/icons/materials/resin.png` |
| Clay | `clay` | materials | `assets/icons/materials/clay.png` |
| Flint | `flint` | materials | `assets/icons/materials/flint.png` |
| Copperite Ore | `copperiteOre` | materials | `assets/icons/materials/copperite_ore.png` |
| Gold Flakes | `goldFlakes` | materials | `assets/icons/materials/gold_flakes.png` |

### In progress
| Item | id | Registry | Current in-game icon | Pipeline |
|---|---|---|---|---|
| Meadow Greens | `meadowGreens` | materials | 🥬 | specced in specs/materials.json |
| Daypetal Bloom | `daypetalBloom` | materials | 🌸 | specced in specs/materials.json |
| Copper Wire | `copperWire` | materials | 🔌 | specced in specs/materials.json |
| Salvaged Sensor | `salvagedSensor` | materials | 📟 | specced in specs/materials.json |
| Minty Tincture | `mintyTincture` | consumables | 🧪 | 3 staged round(s) in assets/_staging/potions/ |
| Unity Scout Hood | `unityScoutHood` | equipment | `assets/icons/armor/Unity_scout_set.png` | 9 staged round(s) in assets/_staging/head/ |
| Unity Scout Jacket | `unityScoutJacket` | equipment | `assets/icons/armor/Unity_scout_set.png` | 2 staged round(s) in assets/_staging/chest/ |
| Unity Scout Leggings | `unityScoutLeggings` | equipment | `assets/icons/armor/Unity_scout_set.png` | 2 staged round(s) in assets/_staging/legs/ |

**Staged, no registry entry yet** (art being designed ahead of the item):

| Staged as | Category | Rounds |
|---|---|---|
| `unity_scout_vest` | chest | 1 |
| `unity_scout_helm` | head | 1 |

### Legacy art (in game, not pipeline-approved)
| Item | id | Registry | File |
|---|---|---|---|
| Greensman Training Bow | `greensmanTrainingBow` | equipment | `assets/icons/weapons/greensman_training_bow.png` |
| Flinthead Arrows | `flintheadArrows` | equipment | `assets/icons/ammo/flinthead_arrows.png` |
| Cane Rod | `caneRod` | equipment | `assets/icons/tools/cane-rod.png` |
| Hunting Blade | `huntingBlade` | equipment | `assets/icons/tools/hunting blade.png` |
| Light Pickaxe | `lightPickaxe` | equipment | `assets/icons/tools/light-pickaxe.png` |
| Lockpick | `lockpick` | equipment | `assets/icons/tools/lockpick.png` |
| Utility Hatchet | `utilityHatchet` | equipment | `assets/icons/tools/utility-hatchet.png` |
| Woven Basket | `wovenBasket` | equipment | `assets/icons/tools/woven-basket.png` |

### Not started
**materials** (25): Bog Niter `bogNiter`, Bog Sulfur `bogSulfur`, Charcoal `charcoal`, Peat Moss `peatMoss`, Bog Myrtle `bogMyrtle`, Ranger Pelt `rangerPelt`, Scrap Alloy `scrapAlloy`, Salvaged Wiring `salvagedWiring`, Drone Parts `droneParts`, Power Cell `powerCell`, Drone Data Core `droneDataCore`, 6mm Casing `sixMmCasing`, Gun Propellant `gunPropellant`, Verduun Hardwood `verduunHardwood`, Verduun Fernshoot `verduunFernshoot`, Corroded Plating `corrodedPlating`, Sea Salt `seaSalt`, Saltstone `saltstone`, Kelp Frond `kelpFrond`, Saltherb `saltherb`, Shellfish `shellfish`, Driftwood `driftwood`, Battered Elaran Plate `elaranIssuePlate`, Salvaged Elaran Sidearm `elaran6mmDefender`, Spent 6mm Rounds `elaran6mmRounds`

**consumables** (5): Solfish Bake `solfishBake`, Small Game Stew `smallGameStew`, Daypetal Salve `daypetalSalve`, Coastal Shellfish Boil `shellfishBoil`, Salt-Cured Rations `saltCuredRations`

**equipment** (20): Sidekick 22 `sidekick22`, Frontier Marksman Rifle `frontierMarksmanRifle`, Unity Blade `unityBlade`, Copperite Rounds `copperiteRounds`, Scrap Field Scanner `fieldScanner`, Waxed Wader Hood `waxedWaderHood`, Waxed Wader Coat `waxedWaderCoat`, Waxed Wader Leggings `waxedWaderLeggings`, Harvester's Hood `harvestersHood`, Harvester's Vest `harvestersVest`, Harvester's Leggings `harvestersLeggings`, Angler's Vest `anglersVest`, Angler's Waders `anglersWaders`, Forager's Hood `foragersHood`, Trapper's Gloves `trappersGloves`, 6mm Defender `sixMmDefender`, 6mm Rounds `sixMmRounds`, Salvaged Plate Carrier `elaranPlateChest`, Ranger Hood `rangerHood`, Ranger Coat `rangerCoat`

**currencies** (4): Gold `gold`, Medal `medals`, Tome `tomes`, Gem `gems`

## Region backgrounds

### Approved & installed
| Region | id | File |
|---|---|---|
| Scoutreach | `region_-2_-3` | `assets/backgrounds/regions/region_scoutreach_01.jpg` |
| Verduun West | `region_-4_-3` | `assets/backgrounds/regions/region_verduun_west_01.jpg` |
| The West Shoals | `region_-4_-4` | `assets/backgrounds/regions/region_west_shoals_01.jpg` |

### In progress
| Region | id | Pipeline |
|---|---|---|
| Verduun South | `region_-3_-3` | specced; 27 staged round(s) under review |
| Verduun North | `region_-3_-2` | specced; 10 staged round(s) under review |

Review page: `node scripts/asset-gen/background-review.js` → `assets/_staging/backgrounds.html`.

### Legacy art
| Region | id | File |
|---|---|---|
| The Cradle | `region_-3_-4` | `assets/backgrounds/regions/region_the_scar_01.png` |

### Not started (biome default)
Peaceful Meadows `region_-2_-4`

## Enemies and resource nodes

No pipeline art yet — all use emoji icons unless listed as legacy art.

**Enemies, not started** (7): Elaran Survey Drone, Elaran Surveyor, Elaran Recon Grunt, Verduun Boar, Verduun Prowler, Bunker Sentinel, Shoal Raider

**Nodes, not started** (19): Lake Shallows, Meadow Game Trail, Fallen Timber, Lakeside Forest, Riverbed, Meadow Herb Patch, Scoutreach Peat Bog, Bog Mosses, Scoutreach Game Trail, Elaran Supply Cache, Disabled Survey Drone, Verduun Old-Growth, Verduun Forest Floor, Verduun Thickets, Overgrown Trenches, Tidal Shoals, Kelp Beds, Salt Pans, Driftwood Line
