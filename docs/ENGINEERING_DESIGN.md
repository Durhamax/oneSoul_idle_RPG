# One Soul — Engineering & the Build System

**Status:** Living document — v0.1
**Last updated:** 2026-11-10
**Companion to:** `SYSTEMS_OVERVIEW.md`, `RESOURCE_DESIGN.md`, `COMBAT_PROGRESSION.md`, `REGION_BUILDS.md`.
**Grounded in code:** `src/core/definitions.js` (`engineeringFields` — the tree), `src/systems/engineeringSystem.js` (perfection / tech-assembly / workshops / salvage / reverse-engineering / paths), `src/data/skills/production/skills_production.js` (the skill), `src/ui/combat/loadoutContainer.js` (tech slots), `src/data/currencies/currencies_production.js` (tomes).

> **One-line vision (the user's framing):** *Engineering is a knowledge skill-tree that **is** the build system. What you research determines what you can craft, what tech you can field, and therefore who your character is — a defender, a healer, a killer, or a ghost.* Tomes are its currency.

---

## 1. What Engineering is

Engineering is the game's **vertical knowledge skill** (`category: 'vertical'`, enhances all six crafting skills at +2%/level). But mechanically it's much more than a crafting multiplier — it's a **research tree the player spends tomes to climb**, and each node **unlocks recipes** across the crafting skills and **unlocks components** for the loadout's **technology slots**.

**Engineering = your build.** You cannot research everything in a playthrough (tomes + materials + time are scarce). The *subset of fields you invest in* defines your capabilities: your damage types, your defenses, your sustain, your utility. "What knowledges do you possess, and what combat setups go with them" is literally the build question (`COMBAT_PROGRESSION.md` archetypes are the combat face of this).

---

## 2. As-built in code (what already exists)

**The tree — `definitions.js › GameDefinitions.engineeringFields`:** **16 fields × 6 tiers (0–5) = 96 nodes.** Every node has `{ engLevel, cost: { tomes, <material> }, xp, time, unlocks:[...] }`. Tier 0 = engLevel 1, cost **1 tome**; tiers climb to engLevel 85, cost 100 tomes + exotic materials.

| # | Field | Icon | Theme |
|---|---|---|---|
| 1 | **Electronics** | ⚡ | circuits, computing hardware |
| 2 | **Ballistics** | 🎯 | projectile accuracy, penetration, elemental ammo |
| 3 | **Ordnance** | 💣 | explosives, demolitions, shaped/smart munitions |
| 4 | **Mechanical** | ⚙️ | machines, gearing, **automation / craft-speed** |
| 5 | **Energy Systems** | 🔋 | batteries, reactors, power |
| 6 | **Thermodynamics** | 🌡️ | heat engines, refrigeration, thermal control |
| 7 | **Materials** | 🔬 | alloys, composites, nanomaterials, **armor stock** |
| 8 | **Chemistry** | ⚗️ | synthesis, **pharmacology / medicine**, polymers |
| 9 | **Programming** | 💻 | algorithms, ML, **research queues / auto-craft**, AI |
| 10 | **Electromagnetics** | 🧲 | magnets, induction, railguns, particle beams |
| 11 | **Optics** | 🔭 | lenses, fiber, **lasers**, photonics, **holography** |
| 12 | **Acoustics** | 🔊 | resonance, ultrasound, **sonic shields**, infrasound |
| 13 | **Aerodynamics** | ✈️ | flight, propulsion, drones, orbital |
| 14 | **Hydraulics** | 💧 | pumps, pressure, power tools |
| 15 | **Cryogenics** | ❄️ | cooling, **cryo weapons**, superconductors |
| 16 | **Biotechnology** | 🧬 | culture, genetics, **augments**, synthetic biology |

**The plumbing — `engineeringSystem.js`:**
- **Technology Assembly** → consumes components, produces a **tech item with charges** for the loadout's tech slots.
- **Workshops** → per-crafting-skill upgrade tiers (rarity chance, craft speed, parallel slots, max rarity).
- **Perfection** → combine 10 same-type items → one of next rarity (the 9-tier ladder).
- **Salvage** → break items into materials (scales with eng level).
- **Reverse-engineering** → consume an item + currency → unlock its recipe.
- **Paths** → per-skill specialization selection (`ENGINEERING_PATHS`).

**The loadout — `loadoutContainer.js`:** equipment (weapon, armor, back, gloves, neck, boots, ring) + consumables (food, potion, ammo) + **4 technology slots (tech1–4), each gated by Intellect** (0 / 3 / 6 / 9 INT). Tech items are what Engineering's assembly produces.

---

## 3. The currency — TOMES *(reconciliation needed)*

**Decision (user): tomes are THE engineering currency.** The research tree already costs tomes ✓. But `engineeringSystem.js` runs **workshops, paths, and reverse-engineering on a separate `engineering.tokens`** currency. That's a split we should close.

> **DECISION 1 — RESOLVED: unify on tomes.** Workshops, paths, and reverse-engineering now spend **tomes**; the legacy `engineering.tokens` is retired (migrate any existing balance 1:1 into tomes). One knowledge currency, one mental model. *(Implementation: update `engineeringSystem.js` cost reads from `engineering.tokens` → `currencies.tomes`, add a migration.)*

Tomes (`currencies_production.js`): *"Knowledge currency used for unlocking skills and recipes."* Keep that identity — tomes = **knowledge**, and knowledge is the Elarans' hoarded resource (see §7–8).

---

## 4. Tech slots & the loadout — where a build is *worn*

The 4 Intellect-gated tech slots are the **expression** of your researched fields. You research a field → unlock a **tech-component recipe** → **assemble** a tech item (charges) → **slot it** → it shapes combat.

- **Intellect gates slot count** (0/3/6/9 INT for slots 1–4) — so an Intellect-leaning attribute build fields *more* tech, a tangible reason to invest the attribute (`SYSTEMS_OVERVIEW.md` attribute web).
- **Charges** mean tech is consumable-ish power — you maintain it (fits the plunder/produce economy; `RESOURCE_DESIGN.md` §6).
- Tech items are **where off-type answers live** — e.g., a cryo-emitter tech lets a ballistics build still handle Airborne drones; a cloak tech enables concealment; a stim-injector tech enables sustain.

> **DECISION 2 — RESOLVED: free-form slots.** Any tech item fits any of the 4 slots. Builds stay maximally expressive; scarcity (charges, tomes, materials) does the balancing.

---

## 5. Fields → Builds *(the heart of the system)*

The four build **intents** the user named — **defense, healing, offense, concealment** — plus **skilling/utility**, map onto the 16 fields. Most fields serve more than one intent; a *build* is a chosen cluster.

| Intent | Primary fields | Yields (tech / recipes) |
|---|---|---|
| **Offense** | Ballistics, Ordnance, Electromagnetics, Optics (lasers), Cryogenics, Acoustics | the 5 damage types; penetration, elemental/smart munitions, railguns, beam/sonic weapons |
| **Defense** | Materials, Thermodynamics, Electronics (shields), Acoustics (sonic shields) | armor stock, plating, thermal/EM/sonic shielding, damage-reduction tech |
| **Healing / sustain** | Chemistry (pharmacology), Biotechnology (augments), Energy (power for regen) | stims, meds, auto-heal tech, bio-augments, sustain under fire |
| **Concealment** | Optics (holography/cloak), Acoustics (silence), Programming (hacking), Electromagnetics (EM disruption) | cloaking tech, noise-kill, sensor-spoof, bypass-the-fight tools (ties to Thieving & dungeon checkpoints) |
| **Skilling / utility** | Mechanical (automation), Programming (auto-craft / research queues), Hydraulics/Aerodynamics (tools/mobility), Materials | craft-speed, parallel queues, gather yield, navigation/endurance aids |

**This is where "a build" comes from.** Examples (tie to `COMBAT_PROGRESSION.md` archetypes):
- **Heavy / "Gears of War":** Ballistics + Ordnance + Materials → explosive offense, heavy plating. Slow, durable, loud.
- **Light / "Assassin / Mirror's Edge":** Optics + Acoustics + Programming → cloak, silence, hack. Concealment build; leans on Thieving and the dungeon bypass checkpoints.
- **Soldier / "Call of Duty":** Ballistics + Electronics + Chemistry → balanced rifleman with shields and stims.
- **Sustain / support:** Chemistry + Biotechnology + Energy → outlast everything; strong for long idle fights.
- **Skiller:** Mechanical + Programming + Materials → automation, queues, better gear — the "I'm here for the crafting completion" path.

And crucially — **the player picks a lane because they can't fund them all.** Scarcity of tomes/materials/time = meaningful build identity in an idle game.

---

## 6. How Engineering gates crafting (the recipe web)

Each tree node's `unlocks` opens **recipes in the six crafting skills** (`skills_production.js`): Cooking, Chemistry, Smithing, Mechanics, Electronics, Tailoring. So Engineering is the **meta-layer above crafting**: you can't just smith a railgun — you must *know* Electromagnetics first. This is the user's "Engineering unlocks concepts which unlock crafting recipes for each crafting skill."

**Canonical crafting-skill roles** (RESOLVED):
- **Smithing** — ore refinement + metal components; crafts **metal equipment**: weapons, **armor plating**, and **jewelry** (rings/necklaces). Needs Mining.
- **Mechanics** — **assembly of components into physical items**: **guns, tools, mechanical technology.**
- **Electronics** — anything needing **circuitry / computer components**: flashlights, AR goggles, sensors, **hacking tech**, shields/augments.
- **Tailoring** — **clothing + armor assembly**: combines **armor plating (from Smithing) + cloth** into **modern armor** (plate-carrier style — *not* medieval metal suits). Cloth/light armor early (no ore); plated armor once Smithing feeds plating.
- **Cooking** — food & buffs. **Chemistry** — **serums & tinctures** (stims, potions), plus ammo/explosive compounds.
- **Tech components (for the 4 slots)** — assembled from recipes the engineering fields unlock.

All crafting consumes resources from **harvesting + thieving + combat loot + quest rewards.** Engineering is the **meta-layer**: a field must be *researched* before its recipes appear in these skills (e.g. no railgun from Mechanics until Electromagnetics is known).

> **Design rule:** every region's crafting unlocks should trace back to a field the player can plausibly have researched by then (`REGION_BUILDS.md` coverage checks). Early regions = tier-0/1 fields; Infernus = tier-5 exotic.

---

## 7. The tome economy — sourcing beyond quests *(the open problem)*

**Problem (user):** tomes currently come almost entirely from quests (`definitions.js` mission reward). We need steady, non-quest income that scales with play.

**Thesis — tomes are stolen knowledge.** The Elarans are the knowledge-hoarding technocracy; Unity was kept ignorant (`WORLD_BIBLE.md`). So the player **takes the enemy's knowledge** to arm themselves — thematically core, and it spreads tome income across *four* systems rather than quests alone:

| Source | Mechanic | Ties to | Feel |
|---|---|---|---|
| **★ Thieving Elaran data** | pilfer archives, data caches, research terminals → tomes | Thieving skill | the outcast stealing the oppressor's science (primary early source) |
| **Combat loot (knowledge enemies)** | Elaran **technicians / engineers / officers** drop **data cores** → tomes | Combat, enemy roster | "kill the smart ones, take their notes" |
| **Discovery of research sites** | archives, libraries, labs, data terminals (a **site type**) yield tome caches | Navigation | reading the world rewards exploration |
| **Salvage / reverse-engineering** | breaking down Elaran tech yields **schematic fragments** → tomes | Engineering itself | a self-feeding research loop |
| **Decoding clue caches** | the narrative clue caches (`MAP_POI.md`) grant tomes on decode | Narrative | unifies lore engagement with progression |
| **Idle "Archive / Study desk"** *(optional)* | a built workstation slowly converts **recovered documents** (a gatherable/loot) into tomes over time | idle loop | genre-fit passive trickle while away |

> **DECISION 3 — RESOLVED: three standing sources.** Tomes come (beyond quests) from **① Thieving Elaran data caches** (primary), **② combat data-cores** off Elaran technicians/engineers/officers, and **③ discovery of research sites** (archives/labs/terminals). *Not adopted:* salvage/reverse-engineering and the idle Archive (kept out for now). Every Elaran-held region should feed at least one of the three; the player can't fully fund Engineering from quests.

---

## 8. Narrative integration

- **Tomes = the enemy's knowledge, turned against them.** Unity was denied science; the player rebuilds an arsenal from Elaran data. Every tome is a small theft of the thing that oppressed them. (Reinforces the vengeance arc and the "flawed founding" theme — Unity's pacifism left them *ignorant*, a vulnerability.)
- **The guide** (the Elaran outcast) is a natural tome/concept source — he *has* the knowledge Unity lacks; early engineering hints can come through him.
- **Field choice as characterization:** a player who goes Biotech/Chemistry (healing) vs. Ordnance (demolition) is role-playing a different response to the same trauma. The build *is* a character statement.
- **Register C exotic fields** (tier-5: exotic matter, antimatter, quantum, transhumanism) are **Seed-derived / Infernus-tier** — the "beyond human metrology" knowledge (`RESOURCE_DESIGN.md` §3 Register C). Researching them late = wielding the Asterion's own science: the ultimate transgression.

---

## 9. Reconciliation & open tasks

1. ~~Currency~~ **RESOLVED** — unified on **tomes**; `engineering.tokens` retired (§3).
2. ~~Tech slots~~ **RESOLVED** — **free-form** (§4).
3. ~~Tome sources~~ **RESOLVED** — Thieving data caches + combat data-cores + research-site finds (§7).
4. **Materials naming cleanup:** the tree's material costs use placeholders (`copperOre`, `ironOre`, `steelIngot`, `silicon`, `quantumSubstrate`, `voidEssence`…). Reconcile with `RESOURCE_DESIGN.md` (inorganic=familiar → `copperite` etc.; exotic tier-5 → Register C Seed-matter). Large pass; do alongside the item-data cleanup.
5. **Legacy `technologies` block** in `definitions.js` (basic_gears, crude_explosives…) overlaps the new `engineeringFields` — pick one as canon (recommend `engineeringFields`) and migrate/remove the other.
6. **Field → build balance:** confirm each intent (offense/defense/heal/conceal/skill) has a viable, fun lane and that tech slots can express it.
7. **Early pacing:** how much Engineering surfaces in the tutorial (see §10).
8. **Crafting-skill roles — RESOLVED** (canonical model in §6): Smithing = ore refinement + metal weapons/plating/jewelry; Mechanics = guns/tools/mechanical tech; Electronics = circuitry/hacking/shields; **Tailoring = clothing + modern armor assembly (plating + cloth)**; Cooking = food; Chemistry = serums & tinctures. *Live code (`skills_production.js`) needs a pass to match — it currently gives Smithing/Mechanics/Electronics overlapping weapon types and Tailoring cloth-only.*
9. **Naming — RESOLVED: "Tailoring"** is the display name (code id `tailoring`). Update the `--textiles-color` CSS var and any "Textiles" strings to match.

---

## 10. Early-game introduction (tutorial pacing)

Engineering is deep, so introduce it **gently** and let it bloom:
- **Region 2 (Scoutreach):** the player loots their **first tomes** (Thieving an Elaran data cache / a downed drone's core), which **unlocks the Engineering skill** and lets them research **one tier-0 concept** (1 tome) that unlocks **one recipe** → craft their **first tech component** → slot it in **Tech slot 1** (0 INT). One field, one node, one tech item — the mechanic demonstrated, not dumped.
- **Regions 3–5:** widen gradually — a second field becomes available, the first **armor** recipes (Tailoring) are reinforced, the first **workshop** upgrade appears. By the 5-region checkpoint the player understands: *research → recipes → gear/tech → build.*
- The **full 16-field tree** opens up as tomes and materials scale east — the player commits to a lane as scarcity bites.
