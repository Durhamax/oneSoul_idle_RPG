# One Soul — Regional Geography, Resources & Settlement

**Status:** Living document — v0.3 (framework + master table + 3 worked regions; Tier 3 is the first full combat-first vertical slice)
**Last updated:** 2026-11-09
**Companion to:** `WORLD_BIBLE.md` (theme/story), `MAP_POI.md` (narrative beats), and `RESOURCE_DESIGN.md` (the skill→resource web, naming conventions, fauna rules — **read that before naming any resource here**). This doc is the **physical world & economy layer** — what's *in* each region, why a civilization built what it built there, and how that becomes gathering nodes, combat missions, and recipes that fit the story.

---

## 1. The Expansion Engine — why the map looks colonized

A colony expands first for survival, then for advancement. On Aurora Vitae this split into **two engines**, and the map is the fossil record of their asymmetry:

- **Unity — sustainable subsistence.** The Covenant caps their footprint: expand only as far as you can live *with* the land. So Unity never sprawls, and over centuries is pushed to one fertile corner (**the Cradle**). Their builds read as villages — longhouses, terraced farms, communal stores, campfires. Low-impact, nature-integrated, no heavy industry.
- **Elaran — existential extraction.** Not greed: a believing elite consuming a world to arm against the threat (see `WORLD_BIBLE.md` §5). A labor mass stripping a continent for the materials to build a shield. So Elaran infrastructure radiates **outward from the LZ (Liora)** across the whole map — mines, mag-rail, refineries, power plants, the eastern industrial capital.

**Design rule:** every structure answers *what did this society need badly enough to build here?* Unity needs food, water, timber, shelter. Elarans need ore, energy, chemicals, and — at the end of the road — exotic Seed-matter. If a location can't answer that question, it's texture, not a settlement.

## 2. The Resource Gradient = the Tech Ladder = the Journey = the Descent

The line from the green Cradle to volcanic Infernus is **four things at once.** This is the spine of the whole economy and the reason it's thematically coherent:

| | Green West (T1–4) | Highlands/Ice (T5–6) | Elaria/Desert/Badlands (T7–9) | Infernus (T10) |
|---|---|---|---|---|
| **Resources** | wood, fish, game, herbs, grain, surface copper | coal/anthracite, metal ore, raw energy; rare/cryo minerals | chemicals, rare-earths, petro, solar; corrupted exotics | exotic Seed-matter, geothermal |
| **Material tier** | T1–2 (copper, wood, fiber, food) | T3 (iron, steel, carbon) | T4 (titanium, composites, chemicals) | T5 (exotic / "beyond human metrology") |
| **Weapon flavor** | tools, basic arms | **shock** / energy; cryo | explosive, petro-chem, advanced tech | Seed-derived / Asterion-tier |
| **Harvest style** | renewable, sustainable | industrial extraction begins | heavy/hazardous extraction | forbidden, lethal |
| **Moral read** | Covenant-compatible | the turn | Earth repeating | transgression complete |

**The payoff:** to get stronger, the player must dig **deeper into the extractive, Earth-repeating resource chain the Elarans built.** Every weapon tier is a step further from the Covenant. The gathering/crafting economy and the moral arc are the *same gradient*. Progression = transgression, at the level of what you pull from the ground.

## 3. Per-region method (how to fill a region) — **combat-first**

**Unity holds only the Cradle and a couple of adjacent tiers — small. The player is in Elaran territory very early (~Tier 3 on), so for most of the map the enemy is the main resource.** Reverse-engineer from combat, not geography.

For each region, define, in order:
1. **Combat profile** — the region's band, enemy type mix (armor/damage), encounter shapes, capability, and *then* combat level. (See `COMBAT_PROGRESSION.md` — calibrate against a fully-engaged build; and `RESOURCE_DESIGN.md` §6 for the loot/type loop.)
2. **Loot** — what those enemies drop, reverse-engineered: salvage components, munitions, field supply, their gear, rare/elite — scaled to the region's tier. The primary resource stream in Elaran land.
3. **Geography & climate** — the stage (landforms, water, weather, hazards).
4. **Gathered resources by skill** — Mining / Logging / Fishing / Hunting / Foraging / Thieving: what nodes fill the gaps loot doesn't (not every region has all six). Name per `RESOURCE_DESIGN.md` §3.
5. **Settlement & infrastructure** — what a society *built* here and why (Unity village vs. Elaran industry) → combat locations + flavor.
6. **Crafting outputs** — the recipes that belong here, including the **damage type this region unlocks** (to counter its enemies).
7. **Content hooks + theme** — specific missions, nodes, recipes, each tied to the story.

**The no-dead-hex rule still applies:** every region offers a meaningful idle action on arrival (worst case, Navigation/discovery). See `WORLD_BIBLE.md` §0.
*(Worked regions 2 & 4 predate the combat-first method — they need a combat/loot pass.)*

---

## 4. Master table — all ten regions

| Tier | Region | Geography | Gathering (by skill) | What society built | Crafts / materials | Thematic role |
|---|---|---|---|---|---|---|
| **1** | The Cradle / Lower Woodlands | fertile impact crater, central rain-lake, half-ringed by ocean, woodland | Logging (soft/hardwood), Foraging (hyperfertile herbs/berries), Fishing (lake+coast), Hunting (abundant game), surface Mining (copper/stone) | **Unity** village & capital; terraced farms, communal stores, campfires; no industry | Cooking, basic Smithing (copper tools), Textiles (fiber/hide), herbal Chemistry · T1 | The Covenant made physical — sustainable abundance *(secretly the Beta Seed)* |
| **2** | Forests and Islands | dense coastal forest, archipelago, open sea, an offshore platform | Logging (hardwood), Fishing (deep-sea/shellfish), Hunting (island fauna), Foraging (coastal plants), island Mining | **Unity** fishing/logging communities (Kaluhea, Rava), isolated & self-reliant; **Kahelion Platform** = offshore extraction (pre-schism/Elaran) | Textiles, Mechanics (boats), Cooking (seafood), Smithing · T1–2 | Unity on the margins; the sea as lifeline; first glimpse of bigger tech |
| **3** | Gulf Palisades | sea-cliffs, a gulf, river mouth, lighthouse | Fishing (gulf, rich), cliff Mining (ore/stone), delta Foraging/farming, Thieving (port) | **Riveria (Varyx) Port City** — docks, markets, warehouses, Unity + Elaran-sympathizer mix; **Palisade** sea-cliff defenses; **Sea Light** lighthouse | Mechanics (ships/port machinery), Cooking, Chemistry (salt/sea) · T2 | The boundary — Unity's world meets the Elaran economy; mixed loyalties |
| **4** | Riverlands | rivers, fertile plains, fjords, floodplains below the highlands | Foraging/farming (grain, crops), Fishing (river), Logging, Hunting, river-bed Mining (clay/minerals) | the colony's **breadbasket** — farm towns, mills, granaries, irrigation, bridges, river transport; now Elaran-run; **Ravenfjord** port | Cooking (grain→rations at scale), Textiles (plant fiber), Chemistry (agri-chem) · T2–3 | Humanity's first expansion; the land that fed the colony now feeds the war |
| **5** | Highlands *(shock)* | mountains, electrical storms, high plateaus, the Ark ridge | Mining (anthracite/coal, metal ore, energy minerals), the Ark reactor (energy) | **the LZ (Liora monument)** + Elaran heavy industry: **Djuma** mine, **Mag Rail Center**, smelters, power | Smithing (iron/steel), Electronics (shock components), Mechanics · T3 · **shock weapons** | Origin and industry overlap; the industrial war economy begins |
| **6** | Icelands | glaciers, frozen peaks, tundra, extreme cold | Mining (rare/cryo minerals, ice), Hunting (arctic fauna/furs), sparse Foraging (lichen) | remote Elaran research/listening stations, cryo-extraction, isolated outposts | Chemistry (cryo rounds), Electronics (cryo-cooled parts), Textiles (heavy furs) · T3–4 · **cryo weapons** | The world at its most indifferent; the frontier before the east crossing |
| **7** | Elaran Urban Center (Elaria) | harbor, bay, urban sprawl, rivers | not raw extraction — **refining/manufacturing**; Thieving (urban), scavenging advanced components | the full modern city: Metropolis, Suburbs, Industrial District, **Nova Liora** naval base, Hydro Facility, Bay | Electronics (advanced), Mechanics (firearms/vehicles), Engineering (assembly), tech Textiles · T4 | The apex of the Earth-repeating society; the war machine's brain |
| **8** | Desert Lands | desert, dunes, salt flats, oil/mineral fields, solar expanse | Mining (rare-earths, salt, minerals), petro/chemical fields, solar energy, Thieving (caravans) | Elaran extraction ops, solar/petro facilities, **transit corridors** to Elaria, labor camps | Chemistry (petro-chem, explosives, fuel), Electronics (solar/rare-earth), Mechanics · T4 · **explosive weapons/ammo** | The war machine's logistics & energy; extraction at its most naked |
| **9** | Badlands | broken corrupted terrain, canyons, toxic zones, Seed-corruption creep | hazardous Mining (exotic/dangerous ores, corrupted matter) — **dangerous nodes** | Elaran forward extraction of exotic materials, hazmat ops, forward military bases | volatile Chemistry, early exotic-material processing · T4–5 | The ground corrupting; dread rising; the cost of chasing exotic power |
| **10** | Infernus | active volcanism, lava fields, geothermal, the Alpha crater | exotic **Seed-matter** (AV-S1), geothermal energy, rare volcanic minerals — extreme danger | the elite's most secret facility (**Heart of Infernus**) — Seed exploitation & reverse-engineering; **Site Alpha** | Engineering / exotic — **Seed-derived, Asterion-tier** weapons · T5 | The forbidden source; the ultimate transgression; the proof |

---

## 5. Worked region — Tier 4: Riverlands *(content-hook exemplar)*

*The classic "where a colony spreads first": water + arable land, just downhill from the LZ. Humanity's breadbasket — and so the first thing the Elarans seized and industrialized. For a Unity player this is lost homeland turned into the enemy's farm.*

**Geography & climate:** broad rivers braiding through fertile plains and floodplains, cut by fjords on the coast (Ravenfjord). Temperate, wet, green. Seasonal floods leave rich silt. Below the Highlands — everything drains down from the LZ.

**Resources by gathering skill:**
- **Foraging / farming:** grain fields, root crops, floodplain herbs (the agricultural core).
- **Fishing:** river fish, migratory runs, fjord shellfish.
- **Logging:** riverine hardwood groves, windbreak timber.
- **Hunting:** floodplain game, waterfowl, fur in the fjords.
- **Mining:** river-bed clay, gravel, alluvial minerals (placer copper/tin washed down from the Highlands).

**Settlement & infrastructure (→ combat locations):** farm towns, **grain mills**, **granary depots**, **irrigation control stations**, river **bridges/crossings**, and the **Ravenfjord** fishing-logging port. Under Elaran control these are *requisition infrastructure* — the land worked at industrial intensity to feed the war economy (and overworked, a quiet echo of Earth).

**Crafting outputs (→ recipes that belong here):**
- **Cooking:** milled grain → bread/rations/field meals (healing + buffs at scale). The region's signature.
- **Textiles:** plant fiber → cloth/basic light armor.
- **Chemistry:** fertilizers & agri-chem → precursors for later explosives/compounds.
- **Smithing (support):** river clay → crucibles/molds; alluvial copper/tin → bronze tools. · **T2–3 materials.**

**Content hooks (combat / skilling / recipe), each tied to theme:**

- **Combat — "The Requisition Line":** Elaran enforcers are stripping a farm town's granary. The player can intervene (defend the farmers / raid the depot). *Theme: the enemy grinding the breadbasket; the player's first look at the mass's labor being spent.* Reward: grain, agri-chem, a recipe unlock.
- **Combat — "The Crossing":** an occupied river bridge, a logistics chokepoint toward the Highlands. An ambush/assault mission. *Theme: the land cut up by the war machine.*
- **Combat — "Mill Garrison":** a grand mill repurposed as an Elaran strongpoint; elite enforcer. *Theme: industry weaponizing agriculture.*
- **Skilling — the floodplain:** farming/foraging nodes (grain, herbs), river fishing, riverbank clay (mining), hardwood groves (logging), floodplain game (hunting). A full gathering spread — the self-sufficient breadbasket. **`[SIDE]` / `[FALSE]`-adjacent:** an *abandoned Unity farmstead*, overgrown — a quiet homecoming beat (this was ours), with a clue cache in the ruins.
- **Thieving — granary depots:** steal Elaran grain stores / requisition manifests (ties into the Highlands logistics clue).
- **Recipe payoff:** this is where **large-batch Cooking** comes online — the region that teaches the player to sustain long expeditions, exactly as its farms once sustained the colony.

**Named-POI candidate:** Ravenfjord (26) is already the region's story anchor (last clearly-human waypoint before the heights). Mills / granaries / the crossing are strong texture-hex or `[SIDE]`-mission candidates (hexes 25, 27–30).

---

## 6. Worked region — Tier 2: Forests and Islands

*Unity's maritime half: the refugees who didn't fit in the Cradle's crater clung to the coast and the islands, protected by water the way the Cradle is protected by its walls. The sea is their highway and their larder. It's also where the player first learns to work the water — a literacy that pays off much later, at the sea-crossing to Elaria.*

**Geography & climate:** a rugged western seaboard — dense temperate rainforest giving onto a scattered archipelago. Cold, rich currents; fog and tides; sheltered coves and open channels. Islands as natural fortresses. Old-growth hardwood above the tideline; teeming life below. The **Kahelion Platform** stands offshore in deeper water.

**Resources by gathering skill:**
- **Fishing:** the richest in the game so far — deep-sea runs, shellfish, kelp beds. The sea larder.
- **Logging:** old-growth coastal **hardwood** (best timber tier yet — shipbuilding grade).
- **Hunting:** fur seals, seabirds, forest game on the larger islands (small pelts, fat, feathers).
- **Foraging:** intertidal plants, kelp, rainforest berries & mushrooms.
- **Mining:** limited — coastal tin, surface ore, salt pans. (Not mining country; that waits for the Highlands.)
- **Thieving:** little to take from Unity kin — but salvage from wrecks and the Kahelion Platform.

**Settlement & infrastructure (→ combat locations):** scattered, self-reliant Unity communities — **Kaluhea (11)**, an island refuge and hub (docks, drying racks, longhouses, relative safety); **Rava (12)**, a smaller community living net-to-hand off the sea. Boatyards, drydocks, fish-smoking houses, net-lofts, timber mills, signal towers. Mostly **Unity-held**, but pressed from the water by Elaran survey vessels and coastal raiders. **Kahelion Platform (13)** is the outlier — a large offshore structure in contested water.

**Crafting outputs (→ recipes that belong here):**
- **Mechanics — boats.** Where **watercraft come online**: hardwood + fittings → vessels that let the player range the archipelago (and, much later, cross the sea). The region's signature unlock. Also harpoons, fishing gear.
- **Cooking — preserved seafood:** smoked/dried fish & shellfish → long-keeping **expedition rations** (sustained buffs for ranging far from home).
- **Textiles:** sailcloth, nets, and seal/game **fur & leather** → cold-weather gear and light armor.
- **Smithing:** coastal tin/bronze → tools, hooks, boat fittings, harpoon heads. · **T1–2 materials.**

**Content hooks (combat / skilling / recipe), each tied to theme:**

- **Combat — "Raiders off Rava":** Elaran coastal raiders / a survey vessel strike a Unity fishing community. Defend the village / drive off the boats. *Theme: even Unity's sea-margin isn't safe; the encroachment reaches the water.* Reward: pelts, salvage, a recipe unlock.
- **Combat — "The Channel":** a sea-lane ambush between islands; a naval-flavored fight once the player has a boat.
- **Skilling — the archipelago:** the game's richest fishing, old-growth logging (best wood tier), seal/game hunting (pelts), intertidal foraging, light island mining. A self-sufficient maritime spread — every island offers the sea or the forest (no dead hexes).
- **The Kahelion Platform — "a glimpse of bigger tech" (`[MAIN]`/`[SIDE]`):** a **pre-schism** human offshore installation — built when the colony was still unified and more advanced, for deep-sea resource/energy — now a contested derelict the Elarans want to reactivate and Unity has kept dark. Clearing it yields a **first taste of salvaged advanced components** (early Mechanics/Electronics materials — the tech ascent begins) and a **human-history clue** (what unified humanity could build before the schism tore it apart — feeds the Liora/timeline thread). It foreshadows the industrial world ahead and quietly asks: *this is what we were, together.*
- **Recipe payoff — the boat:** the traversal unlock that opens the archipelago now and the sea-crossing later. Tier 2 is where the player first becomes literate in the water.

**Named POIs:** Kaluhea (11, hub/refuge), Rava (12, the community under threat), Makilo/Kahelion Platform (13, the bigger-tech beat). Texture hexes 8–10, 14–15 = outer islands, logging camps, fishing stations.

---

## 7. Worked region — Tier 3: Gulf Palisades *(full combat-first vertical slice)*

*The boundary. The player's first real contact with the Elaran world as a living society — a working port where Unity kin live compromised under Elaran-sympathizer rule, trading with the enemy. The Covenant feels small here. And this is where the player picks up the gun — the first big transgression.*

*Resource names below are proposed (grounded register — this is still early/coastal); rename freely. See `RESOURCE_DESIGN.md` §3.*

### 1. Combat profile *(band: Specialization — the on-ramp)*
Arriving from the Foundation band (T1–2 scouts & drones), the player meets organized Elaran presence for the first time.
- **Enemy mix:** Elaran-sympathizer **militia & port security** (Biological infantry, the bulk) · **harbor patrol drones** (Airborne) · the **first light-armored security** at the cliff batteries (introductory Plated). **Mini-boss:** the **Port Captain** (elite, Biological, 1 ability — a riot-shield damage-reduction).
- **Encounter shapes:** single fights (one enemy at a time), plus the game's **first short sequence** — a few enemies in a row with a checkpoint — as a taste of the dungeon format (full version in §8). One **installation assault** at a Palisade battery.
- **Capability (first appearances):** enemy **abilities** begin (the Captain's shield); **armor diversity** begins (light Plated).
- **Design note — friction before the answer:** Airborne drones (want Cryo) and light Plated (want Explosive) appear *before* those elemental weapons exist. The player feels the type system bite and *anticipates* the later unlocks — drones are countered here only by firearm accuracy, plate only by focused fire. Intentional demand-seeding.
- **Combat level:** ~4–9 (Soldier-tier), Port Captain ~10 — calibrated against a player with a forming build + a few perks + basic buffs (`COMBAT_PROGRESSION.md` §1).
- **Build pros/cons here:** **Light** bursts the Port Captain and flies through the warehouse's stealth/thieving checkpoints, but has the thinnest sustain over the dungeon sequence; **Medium** comes of age (firearms unlock — accuracy vs drones, versatility across the mixed sequence); **Heavy** out-sustains the long sequence and shrugs off the plated battery guards, but clears slowly and lumbers against the drones.

### 2. Loot *(reverse-engineered, scaled to the band)*
- **Salvage components:** wire scraps, basic circuitry, mechanical parts, scrap metal — *the first real tech bridge.*
- **Munitions:** ammo & casings, basic explosive charges.
- **Field supply:** med-stims, rations.
- **Their gear:** Elaran pistols/light rifles, security light-plate, riot shields.
- **Rare/elite:** Port Captain → elite token + a **firearm blueprint** (first workstation upgrade/schematic).

### 3. Geography & climate
Sea-cliffs (the palisades) walling a sheltered **gulf**; a river mouth where the **Riveria Headwaters** delta meets the sea; a lighthouse headland (**Sea Light**). Temperate, salt-wind, tide and fog. Rich water, defensible cliffs, fertile delta.

### 4. Gathered resources by skill
- **Fishing:** the gulf is rich — *gulfbass, tidemussels, kelp*, solfish (continues). The region's signature gather.
- **Thieving — the standout:** the **port** brings urban theft online — pilfer dock crates, warehouses, Elaran merchants: components, coin, **keycards**, cargo manifests.
- **Mining:** sea-cliff stone, coastal ore — copperite (continues), *tinnite*, *saltstone* (salt pans), *chalkstone*.
- **Foraging:** delta & shore plants — *saltherb*, kelp, delta reed (fiber); **alien-distinct:** *glassbloom*, a translucent coastal flower (Register B — chemistry input).
- **Hunting:** coastal/cliff fauna — seabird feathers, shore-game small pelts; **rare big-game:** a *ridgeback*, a larger shore predator.
- **Logging:** light — pinewood (continues), driftwood.

### 5. Settlement & infrastructure *(→ combat locations)*
- **Varyx — Riveria Port City (20):** docks, warehouses, markets — a real working port, Unity minority under an Elaran-sympathizer majority. The first *city*; the hub and the theft/dungeon site.
- **Palisade South / North (17, 18):** sea-cliff gun emplacements / coastal defense — the installation-assault combat.
- **Sea Light / South Point (16):** lighthouse & signal station (also an Elaran monitoring post).
- **Riveria Headwaters (22):** the delta's water-control & agriculture — contested.

### 6. Crafting outputs *(the recipes that belong here)*
- **Mechanics — FIRST FIREARMS.** Pistols and light rifles come online, built from **looted/produced Elaran parts** — the Soldier build's foundation, and the player's first step off the Covenant's path. Boats continue.
- **Chemistry — ammo:** bullets from casings + propellant; basic explosive charges; salt-chemistry.
- **Cooking:** gulf-seafood meals & preserved rations (sustained buffs).
- **Textiles:** sailcloth, fisher's gear, light armor.
- **Smithing:** coastal ore → tools, light blades, early iron. · **T2 materials.**
- **Damage type:** still the conventional (pierce/incendiary) era — the marquee unlock is **firearms + ammo variety**, not an element. (Elements begin at the Highlands.)

### 7. Content hooks + theme
- **Combat — "Dock Security"** (clear port security; Biological); **"Harbor Patrol"** (Airborne drones over the gulf — accuracy check); **"Palisade Battery"** (assault a cliff emplacement; first light Plated + installation); **"The Port Captain"** (region mini-boss at Varyx; first ability-user).
- **Skilling:** rich gulf fishing, cliff mining, delta foraging, and **port Thieving** (the coming-of-age for theft).
- **Recipe payoff:** the **firearms unlock** and ammo crafting — the Soldier build's birth.
- **Theme:** the boundary. The player watches their own people living under, and trading with, the enemy — mixed loyalties, the Covenant dwarfed by a humming Elaran economy — and arms themselves with a gun to go on. First contact with the enemy as *a society*, not just soldiers.

### 8. Dungeon — "The Varyx Warehouse Run" *(the region's multi-enemy encounter)*
The first full dungeon: a farmable **sequence** of fights and checkpoints through the Riveria customs/warehouse complex, ending in a boss (the **Dock Master**). Melvor-style sequence + skill/tech-gated checkpoints; attributes set farm speed (`COMBAT_PROGRESSION.md` §5).

**Sequence (illustrative):** dock guards → **[cargo door]** → warehouse security → **[manifest terminal]** → smugglers → **[vault]** → **boss: the Dock Master.**

| Checkpoint | Pass gate (skill / tech) | Efficiency (attribute) |
|---|---|---|
| Cargo door / barrier | Thieving *or* breach | **Strength** — force speed |
| Manifest terminal | hacking tech *or* Intellect | **Intellect** — crack speed |
| Dock patrols | **Stealth** (or fight) | **Stealth** — bypass speed |
| Trapped crates / cache | **Perception** | **Perception** — detect & avoid |

- **Rewards:** the loot streams (§2) at volume, coin, firearm blueprints — plus a **clue:** Elaran cargo manifests showing the war build-up routing inland (early breadcrumb toward the Highlands/Elaria mystery).

---

## 8. To do

- Work the remaining regions with the §3 combat-first method (priority: the connective tiers **6, 8, 9**; then layer combat/resources onto the already-narrated 1, 5, 7, 10).
- Give **Tiers 2 & 4** a combat/loot pass (they predate the combat-first method).
- Map each region's **weapon/material unlock** precisely against the item/node registries (the master table gives the intent; the data files give the specifics).
- Decide **Unity vs. Elaran control per hex** (who holds what) — drives whether a hex is a safe gather zone, a contested mission, or a hostile installation.
- Cross-check every settlement against the *"what did they need badly enough to build here?"* rule.
