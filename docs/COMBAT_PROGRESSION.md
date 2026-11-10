# One Soul — Combat Progression, Builds & Scaling

**Status:** Living document — v0.4 (perks progress through the campaign for scaling; a maxed all-creator grid is endgame, not required; combat is 1v1 sequential)
**Last updated:** 2026-11-09
**Governs:** enemy design and scaling across all 80 regions, the build/gear roadmap, and dungeon design. **Read this before assigning any enemy combat levels** (`RESOURCE_DESIGN.md` §6, `REGIONS_GEOGRAPHY.md` combat profile).

---

## 0. The core principle

**Design campaign enemies against a fully-built character *including a progressively-filled perk grid* — but not a maxed one.** The campaign (Cradle→Infernus) must be beatable on:

> equipment tier (T1→T5) + skill levels + attribute points + food/potion/ammo buffs (Cooking/Chemistry) + engineering tools & workstation tiers + tech-slot items + a **progress-appropriate perk grid** (tiles unlocked by level, filled with medals farmable by then)

**Perks are part of the power curve** — the player fills the grid as they level and farm medals, and the main path assumes it. What the campaign does **not** require is a **100%-full, all-creator-tier** grid; that's a near-asymptotic endgame grind (enormous medals + time) for over-powering content and optimal farming. So tune the main path against a *reasonably-progressed* grid, and reserve a maxed one for optional super-content.

**Capability scales alongside level** — more abilities, more armor-type diversity, and longer, more varied enemy *sequences* (one enemy at a time — see §3/§5) and phased elites. Early regions assume almost none of the stack is online; late regions assume a mature, well-but-not-maximally-perked build.

---

## 1. The power-scaling curve (early → region 80)

| Band | Regions | Player state (assumed) | Enemy design |
|---|---|---|---|
| **Foundation** | Cradle + early (T1–2) | starter gear, 1–2 skills, first perk tiles, few buffs | single **basic** enemies, Biological/Airborne, no abilities; teach the loop |
| **Specialization** | T3–6 | a build forming, mid gear, **filling perk tiles (mid-rarity)**, basic buffs, ammo-swapping | **armor-type diversity** (Plated, Droid), enemy **abilities** (shield wall, power strike, evasion), first elites; type-matching required |
| **Mastery** | T7–9 | mature build, high gear, **most perk tiles filled (higher-rarity)**, full buffs, tech slots | longer **mixed-type sequences**, **phased elites**, hazards; tuned for a progressed (not maxed) build |
| **Endgame** | T10 / final | fully kitted + Seed-tier gear + **near-full grid (not all-creator)** | **bosses** with phase transitions; demand an optimized build + consumables + tech |
| **Post-game** | optional super-content | pushing every tile to creator tier (huge medal/time grind) | over-tuned optional content; the min-max/farming chase |

**Rule:** calibrate each region's enemies against a *reference build* kitted *for that tier* — gear + skills + attributes + consumables + tech + a **progress-appropriate perk grid** (unlocked tiles, attainable-rarity medals), **not a maxed one**. Never against a naked character, or the curve breaks. **Endgame:** a 100%-all-creator grid is the near-asymptotic completion grind — tune *optional* super-content against it, never the main path.

---

## 2. The three build archetypes

All three must be **fully fleshed** — a complete pipeline of weapons, armor, consumables, perks, and tech at **every tier**. The crafting/item roadmap therefore delivers **three parallel gear lines per tier.** A build choice with no content is a fake choice.

### Light / Assassin *(Mirror's Edge, Assassin's Creed)*
- **Attributes:** Stealth (evasion), Mobility (attack speed), Perception (accuracy/crit).
- **Gear / damage:** light cloth & cloaks (Textiles), low weight; fast blades (Smithing), pistols/light arms (Mechanics); **pierce**, crit, high evasion.
- **Playstyle:** hit-and-run, high burst, assassinate single targets; low HP, low sustain.
- **Strong vs:** single high-value/elite targets (burst); **Insulated** (pierce); fast fights; **stealth/thieving-gated dungeons**.
- **Weak vs:** swarms/multi-enemy (no AoE, gets surrounded); **Plated/heavy** (low pen); attrition.
- **Skill synergy:** Thieving (major), Navigation.

### Medium / Soldier *(Call of Duty)*
- **Attributes:** balanced — Strength, Perception, some Health/Defense.
- **Gear / damage:** medium armor (mixed plate+cloth); ranged firearms — rifles/SMGs (Mechanics); **versatile ammo** (incendiary/cryo/shock/explosive rounds via Chemistry).
- **Playstyle:** adaptable, consistent at range; master of none.
- **Strong vs:** most situations moderately; **ammo-swapping** lets it counter many armor types on the fly.
- **Weak vs:** the extremes — less burst than Light, less tank/AoE than Heavy.
- **Skill synergy:** Mechanics, Chemistry (ammo), all-round.

### Heavy / Explosive *(Gears of War)*
- **Attributes:** Health (HP), Strength (damage), Defense (DR), Intellect (heavy tech slots).
- **Gear / damage:** heavy plate (Smithing), high weight/defense/HP; heavy weapons & launchers (Mechanics), explosives (Chemistry); **explosive/AoE**, slow attack speed.
- **Playstyle:** tank, soak, clear groups; slow, low evasion/mobility.
- **Strong vs:** **swarms/multi-enemy** (AoE); **Plated** (explosive); attrition.
- **Weak vs:** fast evasive single targets (can't hit); **Airborne** (slow); mobility checks.
- **Skill synergy:** Smithing, Mechanics (heavy gear), Engineering (tech).

> **Hybrids** are valid — these are poles, not classes. The attribute/gear systems let players blend (e.g. medium-light skirmisher). Enemies/encounters should reward specialization *and* leave room for hybrids to cope.

---

## 3. Encounters are 1v1 — depth is the sequence

**Combat resolves one enemy at a time (Melvor-style): fight an enemy, then the next. There are no simultaneous multi-enemy fights.** Depth comes from three places:
- **(a) Per-enemy type matchup** — your damage type vs its armor type.
- **(b) The sequence** — a dungeon strings *varied* enemy armor types together (plus checkpoints), testing versatility and sustain over length.
- **(c) The checkpoints** — skill/tech pass-gates with attribute-driven efficiency (see §5).

**Per-enemy matchup** (which build answers which armor type):

| Enemy armor | Countered by | Build edge |
|---|---|---|
| **Biological** (infantry) | Incendiary | all; starting era |
| **Airborne** (drones/aircraft) | Cryo | Medium/Light (accuracy); **Heavy weak** |
| **Plated** (armor/vehicles) | Explosive | **Heavy**; Light weak (pierce bounces) |
| **Droid** (mechs) | Shock | Medium/Heavy; precision helps |
| **Insulated** (EW/tech) | Pierce | **Light** (pierce shreds) |

**The sequence principle:** because a dungeon mixes enemy armor types *in a row*, a single-damage specialist hits a wall mid-sequence — **versatility** (Medium's ammo-swap), **consumables**, or type-prep carries you through. And long sequences test **sustain**, not AoE. This is the core source of combat depth and replay.

**Build sustain / clear-speed across a sequence:**
- **Light** — fastest per-kill (burst), **thinnest sustain** over a long sequence; dominates stealth/thieving checkpoints.
- **Medium** — best **versatility** across varied sequences (ammo-swap); balanced sustain.
- **Heavy** — best **durability/sustain** for long sequences, strong vs Plated; **slowest clears** (an efficiency cost), weak vs Airborne, poor at stealth checkpoints.

*(The combat engine already supports enemy abilities, enrage, and phase transitions — the knobs for capability scaling.)*

### Damage-type rollout & integration *(where each type enters, how it's strengthened, why it isn't forced)*

The five damage types are **not all available at the start.** Each is *discovered* at a deliberate tier — roughly when the armor type it counters becomes a staple enemy — then **strengthened** through Engineering, and the enemy armor it answers **keeps recurring in later tiers** so the type stays relevant instead of being a one-region gimmick.

| Damage type | Discovered | Counters (armor) | Why there | Strengthened by (Engineering family) |
|---|---|---|---|---|
| **Pierce** | **T1** — starter (Greensman Training Bow, Mechanics) | Insulated (tech/EW) | the generalist opener you already hold | ballistics / precision |
| **Incendiary** | **T2** (Chemistry) | Biological (infantry) | as organized Elaran infantry becomes the staple foe | organic chemistry / thermal |
| **Shock** | **T5** (industrial Highlands, EM/Energy) | Droid (mechs) | as Droid/mech enemies populate the factory tiers | electronics / computation |
| **Cryo** | **T6** (Icelands, Cryogenics) | Airborne (drones/aircraft) | anti-air discovered — pointedly — in the ice; answers the drones that have harassed since T1 | cryogenics / aerospace countermeasures |
| **Explosive** | **T8** (Desert, Ordnance) | Plated (armor/vehicles) | brings **heavy builds** online as Plated heavies dominate the fire hemisphere (Plated is *teased* at T4, *answered* here) | ballistics / demolitions / ordnance |

**Three rules this encodes:**
1. **Discovery points are authored, not incidental.** A region that *introduces* a damage type is a deliberate beat (new recipe line, new enemy pressure that motivates it). Track each in `REGION_BUILDS.md` as the tier is built, and in the Anchor Map (`CAMPAIGN_ARC.md` §1a).
2. **Armor types recur upward.** Once an armor type is introduced it is **never retired** — later tiers (esp. T7+ Elaria/Desert/Badlands/Infernus) mix all five in a single sequence (§3), so every discovered damage type keeps paying off and the counter map stays live end-game.
3. **Discovery ≠ obligation.** Unlocking a type gives the player the *option*, not a mandate. A build that goes a different way — a different Engineering branch, an attribute-leaning path, or a Light/Medium/Heavy archetype — can still clear those enemies the hard way; the counter is the **efficient** answer, not the **only** one. Engineering strengthening is what turns a discovered type from "usable" into "a build you commit to" (ties to the fields→builds model in `ENGINEERING_DESIGN.md`).

---

## 4. Enemy capability progression (beyond level)

Scale these *in addition to* raw stats, roughly by band (§1):
- **Armor-type diversity:** Biological/Airborne early → + Plated, Droid, Insulated later (forces damage-type answers → see `RESOURCE_DESIGN.md` §6 loop).
- **Abilities:** none → single ability (evasion, shield wall, power strike) → multi-ability → phased.
- **Sequence length & type variety:** single fights → short sequences → long dungeons with varied enemy armor types + checkpoints + boss (one enemy at a time throughout — no simultaneous groups).
- **Elites & bosses:** none → occasional elite → elite packs → phase-transition bosses.
- **Hazards/environment:** none → terrain/heat/lava (survival attributes matter) toward Infernus.

---

## 5. Dungeons = the multi-enemy encounter (a sequence, not a swarm)

A **dungeon** is the game's "multi-enemy encounter": a farmable **sequence** of enemy fights and **checkpoints**, ending in a **boss** — the Melvor-dungeon analog, with skill/tech-gated checkpoints added. A core content unit per region.

**Structure:** `fight → checkpoint → fight → checkpoint → … → boss` (one enemy at a time throughout).

**Checkpoints have two layers:**
- **Pass gate (binary)** — a required **skill level and/or technology** to get through at all. Without it you're blocked, or forced onto a harder/longer path (e.g. fight extra guards instead of hacking past). This is what makes dungeons **gate progression**: you can't farm one until you've leveled the right skill or built the right tech.
- **Efficiency (continuous)** — an **attribute** that scales how fast/cheap the action resolves. The **farming-speed lever** once you can pass: higher attribute = faster idle clears and better yield.

| Checkpoint | Pass gate (skill / tech) | Efficiency (attribute) |
|---|---|---|
| Door / barrier | breaching tech *or* Thieving | **Strength** — force speed |
| Digital lock / terminal | hacking tech *or* Intellect | **Intellect** — crack speed |
| Patrols / alarms | **Stealth** *or* cloaking tech | **Stealth** — bypass speed |
| Traps / weak points / caches | **Perception** | **Perception** — detect & avoid |
| Traversal / hazards | **Mobility** *or* grapple tech | **Mobility / Navigation** — route speed |
| Sealed vault | Thieving **+** tech | relevant attribute — yield |

**Design:**
- Each dungeon is a fixed/semi-fixed sequence themed to the world (Verduun bunker, Varyx warehouse, Elaria facility, Heart of Infernus).
- The **enemy sequence mixes armor types** (the §3 versatility/sustain test); the **checkpoints** gate on skills/tech and scale on attributes.
- This is how **attributes (efficiency) earn an identity distinct from skills/tech (pass gates)** — and how gathering/crafting skills gain combat-adjacent purpose.
- Prime **farming loops** for the loot streams in `RESOURCE_DESIGN.md` §6.

---

## 6. What to do before assigning enemy combat levels

1. Pick the region's **band** (§1) → set the assumed player stack.
2. Define the region's **enemy type mix** (armor/damage) and pair it to the **damage type the region unlocks** (`RESOURCE_DESIGN.md` §6 loop).
3. Choose **encounter shapes** (single / swarm / mixed) to create build pros/cons (§3), including at least one encounter that tests each build.
4. Set **capability** (abilities, group size, elites) by band (§4) — not just level.
5. Ensure the region's gear/consumable unlocks feed **all three build lines** (§2), or specialization has no content here.
6. Seed **dungeon(s)** (§5) with multi-attribute routes as the region's farming loop.
7. *Then* set numeric combat levels, calibrated to the reference build for that tier.
