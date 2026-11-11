# One Soul — Region Builds (per-hex, implementation-ready)

**Status:** Living document — v0.1
**Last updated:** 2026-11-10
**Companion to:** `MAP_POI.md` (beat roles), `REGIONS_GEOGRAPHY.md` (economy), `RESOURCE_DESIGN.md` (naming/loot method), `COMBAT_PROGRESSION.md` (power curve), `CAMPAIGN_ARC.md` (spine), `WORLD_BIBLE.md` (lore). **Maps to the data schema in `REGION_TEMPLATE.js`.**

This is the **detailed buildout** — one full spec per hex (region), built with the combat-first method (`RESOURCE_DESIGN.md` §7) and the content-spread rule (`SYSTEMS_OVERVIEW.md`). We author one region at a time; every 5 regions we take a holistic pass.

> **Two standing mechanics (author into every region):**
> 1. **Component-assembly rewards** — signature items are *assembled* from sub-components dropped/found across different encounters, skills, and sites — not handed over whole. Completing one forces engagement with multiple systems.
> 2. **Early-seeded campaign-arc rewards** — plant the first pieces of a few signature, campaign-long rewards early; pay them off across acts. See **Appendix A** for the running tracker.

---

## Region 1 — The Cradle · Hex 1 · `[MAIN]` · Hub / Anomaly-Seed (dormant)

*The tutorial sanctuary. The one region with no combat — the garden before the war. Everything here is calm, golden, and quietly, subliminally wrong.*

### 1. Identity & data (`REGION_TEMPLATE.js`)
| Field | Value |
|---|---|
| `name` | **The Cradle** *(replaces deprecated "The Scar" in the template example)* |
| `biome` | `plains` (lake-woodland variant — heavy forest + central lake) |
| `tier` | 1 · `difficultyRating` **Easy** |
| `hexCoords` | per map (hex 1) |
| `navigationRequirement` | 1 · `complication` 1.0 |
| `levelGate` | `{ navigation: 1 }` — the start; nothing gates it |
| `recommendedLevel` | character 1 / combat 1 / navigation 1 |
| `features.safeZone` | **true** (cannot be attacked here) |
| `features.fastTravel` | **true** (home anchor) |
| `features.settlement` | `cradle_hall` (the Unity settlement) |
| `features.dungeon` | null |
| `requiredMissionToLeave` | `tutorial_elder` (must learn the basics before leaving) |
| `environmentalEffects` | movementSpeed 1.0 · **discoveryChanceModifier +5** (gentle onboarding) · resourceYield 1.0 · **no hazards** |
| `resourceBonuses` | wood ×1.1, fish ×1.2 (the lake), ore ×1.0 |

### 2. Mood & visual direction *(the hook)*
Over-saturated gold-green; impossibly lush; sunbeams through dense canopy; the glassy central lake. The art should read as **paradise with a faint uncanny edge** — too fertile, too still. This is the Beta Seed bleeding into the world, unseen (`WORLD_BIBLE.md` §3). Dynamic touches: drifting pollen motes, light shafts, gentle water shimmer. The player should *feel* safe and subtly unsettled at once — we're planting the late-game gut-punch that home was the thing the enemy hunted.

### 3. Combat — **none** (safe zone), but the war is teased
No enemies spawn in the Cradle. The **first enemy (Elaran survey drone) appears at Hex 2, Scoutreach** — the player can *see* something crossing the far tree-line (a silhouette, a distant drone light) but cannot engage until they leave. This makes the first step out of the garden a deliberate, weighted choice. *(Combat-first method resumes at Region 2.)*

### 4. Gathering — Register A, the green west *(wired content)*
The Cradle teaches **five of the six gathering skills** across six nodes already in `materials.js`: Mining, Logging, Fishing, Hunting, Foraging. **Only Thieving is deferred** (it needs Elarans — it first appears at R2, Scoutreach). The gathered material set is clean and on-convention and is unchanged; the crafting build-out adds only **crafted outputs** (food, serums, the Copper Wire intermediate, and the first technology) plus the drone-salvaged Sensor. Every gathered material below feeds at least one recipe (or is a flagged forward hook).
| Skill | Node (wired) | Materials (real) | Feeds |
|---|---|---|---|
| **Mining** | Riverbed | `clay`, `flint`, `copperiteOre`, `goldFlakes` | `clay` → container for stews + chemistry; `flint` → arrows/tools; `copperiteOre` → Copper Wire → Electronics/Technology; `goldFlakes` → *reserved* |
| **Logging** | Lakeside Forest | `pinewood`, `riverwillow`, `resin` | Mechanics (the bow), Smithing fuel, Tailoring fiber, Chemistry binder (`resin`) |
| **Fishing** | Lake Shallows | `solfish`, `minnows`, `mossShrimp` | `solfish` → Cooking; `minnows` → equippable fishing **bait** (ammo slot); `mossShrimp` → *reserved* |
| **Hunting** | Meadow Game Trail | `smallGameMeat`, `smallPelts`, `feathers` | Cooking (stew), Tailoring (pelts), fletching (feathers → arrows) |
| **Foraging** | Fallen Timber + Meadow Herb Patch | `mintyHerb`, `commonMushrooms`, `plantFibers`, `auroranTuber`, `meadowGreens`, `daypetalBloom` | Cooking, Chemistry (serums), Tailoring |

**Reserved ingredients (deferred by design):** `mossShrimp` (Lake Shallows) and `auroranTuber` (Fallen Timber) are **held for a multi-region Boil recipe** that unlocks a few regions out, once shellfish (mussels/clams) are discoverable. `goldFlakes` (Riverbed, low drop weight) is a **rare reserved for a later-tier use**. These are intentionally *not* consumed by any R1 recipe — they are forward hooks, not dead ends.

*(Note: `copperiteOre` is gatherable here, so Mining is live, but the **forge/Smithing is not taught in the Cradle tutorial** — the tutorial teaches **Cooking** (mission 104) and **Mechanics** (mission 106, the Greensman Training Bow). Fauna stays small-game-first per `RESOURCE_DESIGN.md` §4 — a world light on megafauna reads subtly alien.)*

### 5. Crafting — the starter stations
`discoverableCraftingStations`: **campfire** (Cooking — cook solfish/small meat into first consumables), **tanning rack / sewing kit** (Textiles — small pelt → leather → basic apparel), **whittling bench** (basic tools from pinewood). **No forge, no electronics** — the player has no ore and no circuits yet; those unlock east, which is the whole point (`RESOURCE_DESIGN.md` §2 — the crafting tree forces the journey). First craftables: basic rations, a pinewood tool, a simple leather garment — enough to survive the first steps out.

### 6. Sites (from the taxonomy, `CAMPAIGN_ARC.md` §2)
- **Cradle Hall (settlement/`characters`)** — Unity's communal hall; where the **Covenant** is taught and the **Elder** gives the tutorial. Houses the **Ark relic / Elara monument** (see clues).
- **The Freshwater Lake (geographic POI/landmark)** — the trapped-rainwater lake at the crater's heart; fishing + the "half ocean, half land" crater identity. `discoverableLocations` one-time landmark with a fishing-XP reward.
- **Greenfield commons (resource site)** — the gathering fields/woods; node density high, safe.

### 7. Missions
- `tutorial_elder` *(exists)* — the Elder teaches movement, gathering, crafting, navigation; **required to leave.** Theme delivery: the Covenant, Unity's pacifism, "we endure, we do not fight."
- `tutorial_gather_resources` *(exists)* — gather first pinewood/herbs/fish; unlocks the first crafts.
- **`tutorial_navigation` *(new, recommended)*** — teach the **Navigation skill** explicitly (the game's novel mechanic): spend endurance → discovery rolls → reveal the exit path to Hex 2. Ends on the drone-silhouette beat.

### 8. Narrative beats & clues
- **The Covenant taught (theme: flawed founding).** The player is steeped in Unity's founding creed *before* they ever learn it has a fatal gap (no provision for an external threat — `CAMPAIGN_ARC.md` §3.5). Dramatic irony seeded on turn one.
- **Elara's monument — THE BOOKEND PLANT (`[MAIN]` clue).** The Hall displays the Ark relic and a **curated, degrading log of Elara** — the founder dismissed as a cautionary madwoman. The player can read it *now*; it reads as founding myth. This is the first clue, deliberately unreadable-as-true. It pays off at **Liora (Hex 31)** with her *real* walls and finally on the **return to the Cradle** (`MAP_POI.md` Hex 31, Hex 1 notes). **The player who ignores it misses nothing mechanically — and everything thematically.**
- **The subliminal wrongness (theme: second-world fragility).** Nothing states it, but the over-fertility is the Beta Seed. A `[FALSE]`-calm texture: the world is *too* good here. Re-reads as significant only after the twist.

### 9. Rewards — and the first seeded campaign item
- **Discovery rewards:** lake landmark (navigation + fishing XP, starter rations); monument read (navigation XP + a lore unlock; **no stat reward** — this is the "asking why" path, rewarded in understanding, consistent with the campaign thesis).
- **Elara's monument — narrative only.** Reading the curated log is a **lore unlock** (the bookend plant, §8) — **no stat reward, no item.** The story payoff rides the missions and the later re-reads at Liora / the Cradle. *(The combat amulet is decoupled from this — see Appendix A; its first component drops at R2.)*

### 10. Content-coverage check *(the spread rule)*
| System | Touched here? |
|---|---|
| Navigation | ✅ taught (novel mechanic, first exit path) |
| Gathering | ✅ Logging, Foraging, Fishing, Hunting (4/6; Mining/Thieving deferred by design) |
| Crafting | ✅ Cooking, Textiles, basic tools (Smithing/Mechanics/Electronics deferred by design) |
| Combat | ⛔ none (safe zone) — **teased** (first drone silhouette) |
| Currency | ✅ gold (first); medals deferred to combat (Region 2) |
| Perks | ⛔ deferred — perk tutorial is at Hex 2 with first combat |
| Items/rarity/loadout | ✅ first equip (leather garment, pinewood tool); seeds the assembly amulet |
| Missions | ✅ 2 existing + 1 new (navigation) |
| Narrative/themes | ✅ Covenant, flawed-founding, second-world fragility, the Elara bookend |

**Design note:** The Cradle deliberately withholds combat, mining, thieving, forging, electronics, perks, and medals — every one is a *first-reveal* owned by a later region, so leaving home = the world opening up. Scarcity here is intentional onboarding, not a coverage gap.

---

## Region 2 — Scoutreach · Hex 2 · `[MAIN]` · Installation + Guide Crossing

*The garden breached. The first combat region — built combat-first (`RESOURCE_DESIGN.md` §7): who you fight → what they drop → gathering fills the gaps → crafts → clues. Everything the Cradle withheld begins here.*

### 1. Identity & data (`REGION_TEMPLATE.js`)
| Field | Value |
|---|---|
| `name` | **Scoutreach** |
| `biome` | `plains`→`forest` edge (the Cradle's tree-line border; the breach) |
| `tier` | 1 · `difficultyRating` **Easy** |
| `navigationRequirement` | 1 · `complication` 1.1 |
| `levelGate` | `{ navigation: 1, combat: 0 }` — you arrive *without* combat skill and earn your first levels here |
| `recommendedLevel` | character 1–2 / combat 1 / navigation 1 |
| `features.safeZone` | **false** — first contestable ground |
| `features.fastTravel` | false |
| `features.settlement` | null (a wild breach, not a home) |
| `features.dungeon` | null (first *Installation* beat, not yet a dungeon-sequence) |
| `requiredMissionToLeave` | `tutorial_combat` (must survive first combat + roll first perk before pressing on) |
| `environmentalEffects` | movementSpeed 1.0 · discoveryChanceModifier 0 · resourceYield 1.0 · no hazards |

### 2. Mood & visual direction
**Machines in the garden.** Same golden Cradle palette, violated — drone-lights strobing through the pollen haze, scorched undergrowth, a downed drone smoking in the ferns. The uncanny calm of R1 curdles into *wrongness made literal.* The player alone notices the drones aren't raiding — they're **surveying**, sweeping the ground for something. *"What are they looking for?"* is the region's question. (Per canon: they're triangulating a signature match to Site Beta — the Cradle's own Seed — though neither they nor the player know it's underfoot. `WORLD_BIBLE.md` §3.)

### 3. Combat — FIRST BLOOD *(the design spine for this region)*
Two enemies, chosen to **teach the damage-type ↔ armor-type system** (`COMBAT_PROGRESSION.md`, `RESOURCE_DESIGN.md` §6):

| Enemy | Armor type | Combat lvl | Role |
|---|---|---|---|
| **Elaran Recon Trooper** | **Biological** | 1 | The clean first kill — low HP, so your starting **Pierce** bow drops it even though Pierce isn't its counter. Its *true* counter (**Incendiary**) is discovered at **Tier 2** — so returning later, infantry *melt*: the first real payoff of the type system. The drones' human handlers; seeds infantry for Verduun (Hex 5–7). |
| **Survey Drone** | **Airborne** | 2–3 | The signature enemy. **Off-counter on purpose:** starting Pierce only *chips* it — teaches *"these I can't cleanly answer yet."* The satisfying counter (**Cryo**) is an aspirational unlock far east (Icelands, T6). Low HP so it's winnable, but it makes the type system **felt**, not just stated. |

> **Design intent:** at the breach you own **only Pierce** — so one enemy is **winnable now** (the low-HP trooper) and one is **resistant** (the drone). The type system is *felt before you own a single counter*; both proper counters are aspirational unlocks east — **Incendiary** for the trooper (Tier 2), **Cryo** for the drone (Icelands, T6). The drone is the hook that makes those unlocks pay off.

**Weapon & armor premise (theme → mechanic).** Unity refused to arm *against people* — but they still **hunt small game**, so the player already owns a **basic Unity hunting weapon** (Pierce — bow/sling/spear, from R1 Hunting). The divergence isn't *getting* a weapon; it's **turning a hunting weapon on a person for the first time.** That's the real line crossed at Scoutreach. From there, upgrades come two ways: **craft** (the Makeshift Carbine, §6) or **plunder** a basic Elaran sidearm.

**Armor — the player learns to craft equippable defense here.** Unity wears hide/cloth for weather, not war. Scoutreach teaches **Tailoring armor** (`skills_production.js`: Tailoring → chest/back/gloves/boots from R1 leather/fiber) — the player's first crafted **equippable armor pieces.** Canon (`ENGINEERING_DESIGN.md` §6): **modern armor = Tailoring assembling plating + cloth** (plate-carrier style, not metal suits). With no ore yet, R2 teaches **cloth/light armor** only; plated armor arrives once Smithing feeds plating (needs Mining), and shields (Electronics) need tech — so armor, like weapons, visibly deepens as you travel. This closes the "does the player know how to make armor?" gap: **yes — armor crafting is a R2 tutorial.**

### 4. Loot streams (reverse-engineered from the enemies — `RESOURCE_DESIGN.md` §6)
Scaled to combat lvl 1–3. **This is the tech-input bridge** — the green-west can't make circuits, so plunder provides them before the player can mine/manufacture (`RESOURCE_DESIGN.md` §2).
- **Salvage components** — `scrap`, `wiring`, `basic circuitry`, `drone parts` *(first tech inputs → future Mechanics/Electronics)*.
- **Munitions** — `cells`, basic `ammo` *(first Chemistry/Mechanics feedstock)*.
- **Field supply** — `med-stim (minor)`, `rations` *(first looted consumables)*.
- **Their gear** — a basic **Elaran sidearm** (Pierce) — the player's first *proper* weapon drop.
- **Rare/elite** — **drone survey-data core** (the clue, see §8) + first **elite token**; rare **drone optic lens** (amulet component — §9).
- **Medals** — **first medals drop here** (`currencies_production.js`): war-trophies off defeated Elarans → the **perk-roll currency.** Higher-tier kills (the drone > the trooper) yield more per unit time.

### 5. Gathering & skills unlocked here
**Gathering — the node model in action (resource bleed).** Scoutreach shares the Cradle's tree-line, so R1's green archetypes **continue here unchanged** (`RESOURCE_DESIGN.md` §8.2 — resources bleed across borders; **no new items**): **Lakeside Forest** (logging), **Meadow Game Trail** (hunting), **Fallen Timber + Meadow Herb Patch** (foraging), and **Riverbed** (mining — Mining was introduced in R1 and simply carries over). The crater's **Lake Shallows does *not* bleed** (unique closed-basin node, §8.2) — open-water fishing proper waits for the Gulf/archipelago. Scoutreach adds **no new natural archetype**; its gathering identity is **Thieving** (below). New natural archetypes (River Run, Stone Bluff, Thorny Thicket…) enter later regions with the matching geography.

- **★ Thieving — introduced.** Pilfer a **forward supply cache** and strip **disabled drones** for `scrap/wire/parts/circuitry` without a stand-up fight. The **plunder path's** first appearance and the early bridge to tech (`RESOURCE_DESIGN.md` §6). Rewards Stealth/Perception attributes.
- **Combat — introduced.** First combat levels; auto-battle loop taught; **auto-consumption** of looted med-stims/rations demonstrated.
- **★ Perks — tutorial.** First **medals** → roll the first tile on the **7×7 grid** (`saveSystem.js`). Teach: more medals rolled at once = higher quality potential; tougher enemies = more medals/time. First small combat perk slotted.
- **★ Engineering — introduced (light).** Thieving the data cache / drone core yields the player's **first tomes** (`ENGINEERING_DESIGN.md` §7 — tomes = *stolen Elaran knowledge*). This **unlocks the Engineering skill** and a one-step tutorial: spend **1 tome** to research a **tier-0 concept** (e.g., *Basic Optics* or *Circuit Components*, `definitions.js › engineeringFields`, engLevel 1) → it **unlocks one recipe** → craft the **first tech component** → slot it in **Tech slot 1** (0 INT; `loadoutContainer.js`). One field, one node, one tech item — the build system *demonstrated*, not dumped. The full 16-field tree blooms later as tomes/materials scale east.

### 6. Crafting — first assembly
Still **no forge/electronics** (no ore, no workstation yet) — but Scoutreach teaches **component-assembly** at a mundane level, as the on-ramp to the mechanic:
- **★ The Makeshift Carbine *(first assembled item)*** — combine a **Cradle pinewood haft (R1 Logging)** + **plundered drone `wiring`/`parts` (R2 combat/thieving)** → the player's first real **Pierce** weapon. Teaches "signature items are *assembled from parts gathered across encounters/skills*," cheaply, before the grand version (the amulet). Reinforces the theme: *your arsenal is built from the enemy's remains.*
- **Tailoring armor (the equippable-defense tutorial)** — craft the first **leather/cloth armor pieces** (chest/gloves/boots) from R1 hides/fiber at the tanning rack / sewing kit. The player now knows how to make *both* a weapon and armor.
- **First tech assembly** — the Engineering tutorial's tier-0 recipe produces the **first tech-slot component** (Engineering → assemble → Tech slot 1). Tiny stat, big concept: *research → recipe → tech → loadout.*
- Cooking (from R1) continues; looted `med-stims` can be **improved** at the campfire once Chemistry unlocks later.

### 7. Sites (taxonomy — `CAMPAIGN_ARC.md` §2)
- **The Breach (military/installation):** the drones' incursion line — first combat ground; the downed drone.
- **Forward Supply Cache (critical infrastructure, small):** the Thieving target.
- **The Crossing (characters):** where the guide is met — see §8.

### 8. Narrative beats & clues
- **Guide — FIRST crossing (`[MAIN]` character beat).** The **Elaran outcast**, met in the wild *past* the breach. A grudging transaction: he glances at the drone survey-data core, mutters *"hunting ghost-signals again,"* and trades a **survival tip** (a one-time recipe hint or a small navigation boon) for the player pressing on. **The dynamic is set: you need him, you hate it.** (His strongest beats land later at Liora, Hex 31.)
- **Clue — the first breadcrumb (`[MAIN]`).** The **drone survey-data core** shows the drones sweeping Unity's land for a **signature matching reference AV-S1 (Infernus / Site Alpha)** — triangulating toward an unseen source. Meaningless to the player now; in hindsight it's the invasion's true cause — *they're hunting the Cradle's own Seed (Site Beta), and the player is standing on it.* First breadcrumb toward the fire pole.
- **Theme — divergence begins.** Taking up the enemy's weapons is the first on-screen crack in the Unity way; the Elder's "we endure, we do not fight" from R1 is already being broken.

### 9. Rewards — second seeded assembly component
- **Discovery/mission rewards:** first medals + gold; `tutorial_combat` and `tutorial_thieving` completions.
- **First tomes (non-quest):** pilfered from the Elaran **data cache** and the **drone core** via Thieving — establishing tomes-as-stolen-knowledge as a *standing* source, not a quest reward (`ENGINEERING_DESIGN.md` §7). This is the template every Elaran-held region reuses.
- **One Soul Amulet — first component (the Drone Optic Lens).** A rare drop from the Survey Drone (fittingly — the thing that *sees*): a **Perception / accuracy** combat bonus and the first piece of the **optional end-game combat amulet** (Melvor *Fury of the Elemental Zodiac* style, **Appendix A**). **No story load** — a power/completionist chase, not the campaign spine (the campaign rides the missions). First taste of the component-assembly mechanic on a purely combat item.

### 10. Content-coverage check *(the spread rule)*
| System | Touched here? |
|---|---|
| Combat | ✅ **introduced** — 2 enemies, type-system taught (Biological clean-counter + Airborne aspiration) |
| Currency | ✅ **medals** (perk-roll) + **tomes** (engineering/knowledge, via Thieving) + gold |
| Perks | ✅ **tutorial** — first 7×7 roll with medals |
| Thieving | ✅ **introduced** — plunder/tech-bridge **and** first tome source |
| Engineering | ✅ **introduced (light)** — unlock skill, research 1 tier-0 concept, unlock 1 recipe |
| Tech slots | ✅ **introduced** — first tech component assembled → Tech slot 1 (0 INT) |
| Items/loadout/rarity | ✅ starting Unity hunting weapon → first upgrade (plunder / Makeshift Carbine); **first crafted armor** (Tailoring); first tech item |
| Crafting | ✅ **armor (Tailoring)** + **component-assembly** (Makeshift Carbine) + **tech assembly**; Cooking continues |
| Navigation | ✅ continues (reach the Riveria/Verduun exits) |
| Gathering | ◑ **resource bleed** — R1 green archetypes continue (incl. **Mining/Riverbed**, introduced in R1); no new natural node. Gathering identity here = **Thieving** (§8.2) |
| Missions | ✅ `tutorial_combat`, `tutorial_thieving` (+ `tutorial_engineering`) |
| Narrative/themes | ✅ guide dynamic, AV-S1 breadcrumb, Unity-divergence, invasion-driver, tomes=stolen-knowledge |
| Assembly/campaign reward | ✅ amulet component #1 (Drone Optic Lens) + first assembled weapon |

**Design note:** Scoutreach is the true "systems opening" — Combat, Medals, Perks, Thieving, plunder-loot, **tomes/Engineering, the first tech slot, the first crafted armor**, the first weapon upgrade, and the assembly mechanic, all at trivial stakes. It carries heavy *first-reveal* load by design; later regions deepen rather than re-introduce. **Pacing watch:** this is a lot — if playtests feel overloaded, the Engineering/tech intro can slide to R3 (Greythorn) without hurting the arc.

---

## Appendix A — Seeded campaign rewards & assembly components *(running tracker)*

Reviewed at each 5-region checkpoint. Candidates for early-designed, campaign-long payoffs.

### The One Soul Amulet — *optional end-game combat collectible*
Model: Melvor's **Fury of the Elemental Zodiac** — a strong combat neck item **assembled from components that drop off notable/elite fights across the tiers.** A power + completionist chase, **NOT** the story spine (the campaign rides the missions — `CAMPAIGN_ARC.md`). **Decoupled from Elara's monument** (that's a pure narrative beat now).
- **Components:** ~one per tier, dropped by that tier's signature/elite enemy; each adds a **combat** stat (optionally a small skilling bonus). No lore load.
- **Assembly:** collect the set → assemble the finished amulet (end-game combat neck slot). Partial sets may give scaling partial bonuses *(TBD)*.
- **Not campaign-gated:** like the perk grid — strong but optional; the chase is its own long game.
- **Status:** design-level; first component lands at **R2** (first combat). All below are proposals, detailed per tier as regions are built.

| Tier | Component *(proposed)* | Source (signature/elite enemy) | Combat bonus |
|---|---|---|---|
| T1 | Drone Optic Lens | Survey Drone (Scoutreach) | Perception / accuracy |
| T2 | — | *(small tier — may skip)* | — |
| T3 | Dock Master's token | Varyx dungeon boss | offense |
| T4 | Apex trophy | big-game hunt | defense / HP |
| T5 | Mech core | Highlands Droid elite | shock affinity |
| T6 | Cryo cell | Icelands recon elite | cryo affinity / anti-air |
| T7 | Capital insignia | Elaria elite | mixed offense |
| T8 | Heavy charge | Desert Plated elite | explosive affinity |
| T9 | Corrupted shard | Badlands exotic elite | exotic affinity |
| T10 | **Seed Fragment (keystone)** | Site Alpha | **completes the set** |

*~8–9 components across the journey, assembled at the end. Combat-focused; no narrative weight.*

### Other assembled items *(region-level, not the amulet)*
Teaching the assembly mechanic at mundane scale, so the amulet reads as the grand version.
| Item | Region | Components | Result |
|---|---|---|---|
| Makeshift Carbine | R2 | Cradle pinewood haft (R1 Logging) + plundered drone wiring/parts (R2 combat/thieving) | First proper **Pierce** weapon — "your arsenal is built from the enemy's remains" |
