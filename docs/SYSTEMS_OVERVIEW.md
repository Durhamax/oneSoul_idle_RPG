# One Soul — Systems Map & Content Coverage

**Status:** Living document — v0.4 (adds §2 the attribute model — one build-axis identity per attribute, applied the same way across combat/gather/craft/nav)
**Last updated:** 2026-11-11
**Purpose:** The shared mental model of **how every system works together**, and the **content-coverage checklist** we run each region/content pass against so nothing (a skill, a build, a feature) gets starved. For implementation detail see `md_notes/GAME_CONTEXT.md` and `md_notes/OneSoul_Crafting_System_Design.md`. For narrative/economy design see the other `docs/` files.

---

## 1. How it all works together (the interconnection web)

**Character level** → grants **attribute points** (build identity) + **perk tiles** (one per 10 levels). 

**7 Attributes** (Health, Strength, Defense, Stealth, Perception, Mobility, Intellect) are the **build axis** — one identity per attribute, applied the *same way* across combat, gathering, crafting, and navigation. Attributes scale **efficiency** (how well you roll); **skills/tech are pass-gates** (whether you can attempt it); **equipment is the type axis** (what you're strong/weak against). Full model in **§2**.

The core loops:

```
NAVIGATION (spend endurance) ──► discover nodes / enemies / paths / new regions ──► unlocks content
       │
       ▼
GATHERING (6 skills) ──► raw resources ─┐
COMBAT (Elaran enemies) ──► loot: components, gear, MEDALS (trophies), gold ─┤
       │                                                             ▼
       │                                              CRAFTING (6+1 skills) ──► equipment / consumables / tech
       │                                                             │
       │                                                             ▼
       │                                                     LOADOUT (equip) ──► stronger combat & gathering
       ▼
MEDALS (Elaran trophies) ──► ROLL perks (stake more = higher rarity) ──► PERK GRID (7×7 — fills through campaign, maxes in endgame) ──► modifiers across EVERY system
```

- **Engineering** sits above crafting: gates workstation tiers (better crafting), runs **perfection** (rarity upgrades) and **technology assembly** (tech-slot items) — the meta-crafting + item sink.
- **Missions** are the connective tissue: their 19 objective types require actions in *every* system and reward currency/items/unlocks/tomes — they gate progression and carry the **narrative**.
- **Currencies** close loops: **gold** (buy/upgrade), **tomes** (unlock skills/recipes/research), **medals** (combat loot — Elaran uniform trophies — spent to roll perks), **gems** (premium, future).
- **Everything persists** in one `GameEngine.state` object (auto-save 30s, offline-combat progression = the idle payoff, export/import, migrations).

**The point:** pull any one thread and it moves the others. A new region isn't "some enemies" — it's gathering nodes **and** crafting inputs **and** loot **and** discoveries **and** missions **and** perk-fragment sources **and** a dungeon, or it starves part of the machine.

---

## 2. The attribute model — the build axis

The 7 attributes **are** the character build. Each has **one identity**, expressed the same way in every domain, so a build reads consistently whether you're fighting, gathering, or crafting — there are no separate "gathering stats."

**Three axes, never blurred:**

- **Attributes = efficiency (continuous).** How hard you hit, how fast/rich an action resolves, how much you shrug off. Always a *scaling* number — never a hard yes/no.
- **Skills + Tech = pass-gates (thresholds).** Whether you may attempt a node / recipe / checkpoint at all (required level, tool, or tech). See `COMBAT_PROGRESSION.md §5`.
- **Equipment = the type axis.** *What* you're strong or weak against — the 5×5 damage/armor matrix (`COMBAT_PROGRESSION.md §3`). Attributes decide how well you roll; gear decides the matchup.

**One roll, everywhere.** Every contested action is the same weighted roll — `yourStat ÷ (yourStat + theirStat)` — your character **and equipment** against the opposition:

- **Combat:** accuracy vs enemy evasion (hit), crit rating vs enemy crit-resistance (crit); damage then runs the type matrix → resistances → DR pipeline.
- **Gathering:** your per-skill gather rating vs the **node's** resistance/evasion — nodes are "enemies" with per-tier, per-type defenses (`RESOURCE_DESIGN.md`). Node families counter gather builds the way armor types counter damage types.
- **Crafting:** recipe difficulty / workstation tier is the opposition; attributes scale craft **speed** and the **rarity roll**.

**Per-attribute identity (canonical — holds across all domains):**

| Attribute | Identity | Combat | Gathering | Crafting | Navigation / Dungeon |
|---|---|---|---|---|---|
| ❤️ **Health** | Endurance | Max HP — survive more hits | Hazard buffer — work risky nodes longer before forced recovery | Cooking | Endurance pool; survival/hazard checkpoints |
| 💪 **Strength** | Force | Melee damage | Break-power & yield vs heavy nodes (Mining, Logging) | Smithing | Force doors / barriers (clear speed) |
| 🛡️ **Defense** | Mitigation | Damage reduction + armor rating | Reduce node-hazard damage | — | Soak environmental hazards |
| 🥷 **Stealth** | Finesse | Evasion (dodge) | Success vs wary quarry (Hunting, Fishing, Thieving) | — | Bypass patrols / alarms (speed) |
| 👁️ **Perception** | Precision | Accuracy + crit | Rare-find + crit yield (all skills); spot weak points | Mechanics | Discovery chance; detect traps / weak points |
| 🏃 **Mobility** | Quickness | Attack speed | Gather speed (all skills) | Tailoring | Travel / route speed; traversal |
| 🧠 **Intellect** | Tech / Mind | Tech-slot capacity + tech power | Engineering / research-node efficiency | Electronics & Chemistry | Hack terminals / locks (crack speed) |

**Reading a build (poles, not classes):** **Light** leans Stealth / Mobility / Perception (dodge, speed, precision → pierce & crit, stealth checkpoints). **Heavy** leans Health / Strength / Defense / Intellect (HP, raw damage, DR, heavy tech → explosive/AoE, force & hack checkpoints). **Medium** is balanced. The same attributes that define your fight define your gathering and your dungeon routes — **one identity, reused**, so specializing for combat also shapes how you harvest and explore. Archetype detail: `COMBAT_PROGRESSION.md §3`; dungeon checkpoints: §5.

> **Why this matters:** it makes every attribute point a *meaningful, legible* build choice and lets us tune encounters/nodes/checkpoints against a build's whole profile — the basis for "roll my stats + gear against the enemy" combat that rewards specialization while leaving room for hybrids.

---

## 3. System quick-reference

| System | Mechanic | Content surface |
|---|---|---|
| **Character / Attributes** | level → attribute pts + perk tiles; 7 attributes feed combat/gather/craft/nav | attribute-gated content (tech slots, dungeon efficiency) |
| **Currency** | gold, medals, tomes, gems (+ fragments) | sources (combat/mission/sell) & sinks (upgrades/unlocks) |
| **Gathering (6)** | Mining, Logging, Fishing, Hunting, Foraging, Thieving → nodes (resourceTable, biome, tool & level req, XP, respawn) | **nodes + named resources per region** |
| **Crafting (6+1)** | Cooking, Chemistry, Smithing, Mechanics, Electronics, Tailoring + Engineering; skill-lvl × workstation-tier; rolls rarity | **recipes + outputs per region** |
| **Items & rarity** | 3 categories (equipment/consumable/material); **9 rarities, uniform** (common→creator); equipment **instanced** (per-instance rarity/stats/enhancements/potential); stackables in dual-bank | item definitions, rarity rolls, enhancement |
| **Loadout** | weapon, armor(set), back, gloves, neck, boots, ring, tool + ammo/food/potion + tech1–4 (Intellect-gated); **`statCompiler` → `state.compiledStats`** (single source of truth, read by combat) → combatPower | the 3 build lines' gear |
| **Combat** | timer-based auto-battle; 5 damage × 5 armor type-effectiveness; accuracy/evasion/crit/armor-pen; auto-consumption (auto-eat, potion, ammo); enemies w/ lootTable, elite abilities/phases; offline sim | **enemies (type/scaled/loot) + encounters per region** |
| **Navigation** | exploreRegion spends endurance → discovery rolls → nodes/enemies/paths/regions; recovery (Health/campfire); hex map + quick-travel | **discoveries, paths, region progress** |
| **Perks (7×7 grid) — power scaling + endgame** | 49 tiles (+1/10 lvls); spend **medals** (combat trophies) to **roll** perk tiles — stake more at once = higher rarity ceiling (9 rarities, 1–9 stats from a **~70-stat pool across every system**); combine 3→1, salvage. **Fills through the campaign for power scaling; 100% all-creator completion is the endgame grind.** | medal (trophy) sources; power curve + endgame completion |
| **Engineering** | gates workstation tiers (eng ≥ tier×10); perfection (10→rarity); tech assembly (multi-skill components → charged tech); salvage | components, blueprints, tech recipes |
| **Missions** | 19 objective types (kill/killType/killAny, harvest/gather, turnIn/set, craft/craftSkill, explore/discover/travel, levelSkill/levelChar, equip, earn/spend gold, talk, custom, visitTab); EventBus-driven | **the narrative + cross-system objectives** |
| **State / Saves** | one state object; auto-save; offline progression; migrations | — (plumbing) |
| **Narrative** | missions (main_story) + discoverable clues + region mood | see `WORLD_BIBLE.md`, `MAP_POI.md` |

---

## 4. The perk stat pool (why perks touch everything)

Perks **scale your power through the campaign** (and are the endgame completion chase): you spend **medals looted from defeated Elaran soldiers** (a trophy stripped from their uniforms; higher-rank/tougher enemies drop more per unit of combat time) to **roll** perk tiles. Each tile grants stats from this pool — proof that content in *any* system has a perk that cares about it:
**Offense (6), Defense (5), Resistance (5 — one per damage type), Consumables (9 — food/potion/tech/ammo potency, conservation, auto-eat), Loot (3 — gold/fragment/item find), Attribute Scaling (7), Navigation (5), Gathering Speed (6) + Yield (6), Crafting Speed (7) + Yield (5) + Rarity (2), Experience (2).**

So every gathering skill, every crafting skill, navigation, consumables, and loot all have dedicated perk levers. When we add content to a skill, the perk hooks already exist.

---

## 5. Content-coverage checklist (run this per region / content pass)

For each region, make sure the pass touches — or deliberately skips with a reason — each row:

- [ ] **Gathering** — which of the 6 skills have nodes here? Named resources (per `RESOURCE_DESIGN.md`)?
- [ ] **Crafting** — which of the 7 skills get recipes/inputs here? Which build line do outputs serve?
- [ ] **Combat** — enemy type mix (armor/damage), scaled to the band (`COMBAT_PROGRESSION.md`), loot streams (`RESOURCE_DESIGN.md` §6)?
- [ ] **Builds** — are all three lines (light/medium/heavy) fed by this region's gear/consumables, and tested by its encounters?
- [ ] **Navigation** — discoveries, exit paths, region-progress unlocks?
- [ ] **Missions** — objectives spanning systems (not just kills): include gather/craft/turnIn/explore/levelSkill where natural; carry the narrative beat?
- [ ] **Perks/medals** — **medal** drops present (combat, scaling with enemy rank) so the grid fills through the campaign? (Full all-creator optimization is the endgame grind, not a campaign gate.)
- [ ] **Engineering** — components / blueprints / tech-recipe inputs available here?
- [ ] **Currency** — gold, tome, fragment sources?
- [ ] **Dungeon** — an attribute/skill-gated sequence (`COMBAT_PROGRESSION.md` §5) as the farming loop?
- [ ] **Narrative** — the region's beat/clue (`MAP_POI.md`)?

**Spread rule:** across the full 80-region arc, every skill (6 gather + 7 craft), every damage/armor type, and every build line must get a *spotlight* region where it's the star — not just incidental coverage. Track spotlights so nothing is perpetually secondary.

---

## 6. Decisions locked + data tasks

- **Rarity = 9, uniform everywhere** (common, uncommon, rare, epic, legendary, mythic, divine, transcendent, creator). **Data task:** `itemSchema.js` `ITEM_RARITIES` lists only 6 — expand to 9 so items, equipment, medals, and perfection share one scale.
- **Perk grid = 7×7 (49 tiles)** — progressed through the campaign for power scaling; **100% all-creator completion is a near-asymptotic endgame grind** (huge medals + time), not required to finish. **Data task:** the save comment still says "5×5" — stale; clean it.
- **Medals = combat loot** (Elaran uniform trophies), spent to roll perks; higher-rank enemies drop more per unit time. **Data task:** `currencies_production.js` lists medal sources as achievements/milestones — change to combat and reflect the trophy lore in the description. (Worth formalizing the trophy flavor in `WORLD_BIBLE.md` too.)
- **Armor slot unified:** one **armor (set)** slot (head/chest/legs), not the old 9-slot 3×3.
- Legacy placeholder resources are **delete-on-sight** (`RESOURCE_DESIGN.md` §5).

### §2 attribute model — implementation gaps (the code is behind the spec)

The §2 model is the **target**. Today only **combat** honors it; the rest is the build-out:

- **One stat engine.** `statCompiler` → `state.compiledStats` is the single source of truth (combat reads it). **Retire the parallel `StatCalculator`** (`src/core/statCalculator.js`) — its attribute→skill map is dormant and divergent (it, not live code, is where "Stealth helps hunting" currently "lives"). The Overview Combat Stats panel + POWER were already repointed to `compiledStats`.
- **Wire gathering to attributes (the big one).** `gatheringSystem` currently uses **only** skill level + tool + perks + carry weight — **no attributes at all**, so every gathering tooltip is fiction today. Implement the §2 gather roll: per-skill gather rating (Strength for Mining/Logging, Stealth for Hunting/Fishing/Thieving, Perception for rare/crit, Mobility for speed) vs **node resistance/evasion** (per-tier, per-type). Dormant scaffolding to port the *intent* from: `StatCalculator.calculateHarvestVsNode` + `getNodeDefensiveStatsByTier`.
- **Fix Intellect's live role.** Today it only grants crafting speed + gates tech-slot *display*; tech items aren't equippable yet. Give it the §2 role: tech-slot power in combat and hack/crack efficiency at dungeon checkpoints (ties to `ENGINEERING_DESIGN.md` tech slots).
- **Reconcile combat formula drift (needed for "consistent impacts").** Same stat is defined several ways: **Defense DR** — tooltip 1%/pt, `statCompiler` 1%/pt (cap .75), but `damageCalculator` 0.1%/pt **and partially double-counts** it; **Evasion** — `statCompiler` Stealth×1.5 vs `combatRolls` Stealth×10; **Crit multiplier** — 1.5 (`statCompiler`) vs 2.0 (`damageCalculator`); **Crit resistance** — `statCompiler` Defense×0.5 vs `combatRolls` Perception×10. Pick one formula per stat in `statCompiler`; make `combatRolls`/`damageCalculator` *read* it instead of recomputing.
- **Correct the Overview attribute tooltips** (`src/ui/overviewUI.js` `ATTRIBUTES`) to the §2 table once wired — they currently promise gathering/crafting effects that don't exist (e.g. Stealth→thieving, Perception→rare foraging). **Add Stealth→Hunting** as part of the gather wiring above.
