# CLAUDE.md — One Soul (oneSoul_idle_RPG)

Browser-based idle RPG (vanilla JS/HTML5/CSS3, no framework, registry pattern, localStorage saves). Working dir: `C:\Users\durha\oneSoul_idle_RPG`.

## Documentation policy — READ THIS BEFORE WRITING ANY DOC

**All design + technical docs live in `docs/`, indexed in [`docs/README.md`](docs/README.md).**

Before creating a new `.md` to change or add spec/design/architecture information:
1. **Open [`docs/README.md`](docs/README.md) and find the doc that already owns the topic.** Update that doc in place.
2. **Do NOT create a new doc** unless the topic is genuinely not covered by any existing doc. Making new files as the vision evolves causes old specs to silently deprecate — that is the problem we are avoiding.
3. **If you do add a new doc**, add a row for it in `docs/README.md` in the same change.
4. **Never write dated status snapshots / changelogs into living docs** (they rot). That belongs in commits or `docs/archive/`.
5. When the vision changes, **edit in place and let the old wording go** — deprecate, don't accumulate.

Topic → home: narrative/cosmology → `WORLD_BIBLE.md`; campaign structure/themes → `CAMPAIGN_ARC.md`; map beats → `MAP_POI.md`; geography/economy → `REGIONS_GEOGRAPHY.md`; resources/naming/loot → `RESOURCE_DESIGN.md`; combat curve/builds → `COMBAT_PROGRESSION.md`; system interconnections → `SYSTEMS_OVERVIEW.md`; engineering/tech/build system → `ENGINEERING_DESIGN.md`; a specific hex → `REGION_BUILDS.md`; **how it's coded** → `ARCHITECTURE.md`. Superseded/historical docs are in `docs/archive/` (reference only).

## Canon quick-reference (don't contradict)

- **Seeds:** **Site Alpha = Infernus** (first-located, corrupted, AV-S1). **Site Beta = the Cradle** (intact, Elaran-tracked, Unity blissfully ignorant). See `WORLD_BIBLE.md` §3.
- **Resources:** inorganic = familiar (real metals, lightly renamed e.g. `copperite`), organic = alien. Grounded templates: pinewood, solfish, minnows, minty herb, small pelt, resin. `RESOURCE_DESIGN.md`.
- **Rarity:** 9-tier uniform (common→creator). **Perk grid:** 7×7. **Medals:** combat war-trophy currency → perk rolls. **Tomes:** engineering/knowledge currency (the build-system research tree). `ENGINEERING_DESIGN.md`.
- **Crafting roles:** Smithing = metal weapons/plating/jewelry; Mechanics = guns/tools/mechanical tech; Electronics = circuitry/hacking/shields; Tailoring = clothing + **modern armor assembly (plating + cloth)**; Cooking = food; Chemistry = serums/tinctures. Engineering (tomes) is the research meta-layer; **tech slots are free-form**; tomes come from Thieving/combat data-cores/research sites. `ENGINEERING_DESIGN.md`.

## Conventions

- Vanilla JS, registry pattern (`ItemRegistry`, `NodeRegistry`, etc.); systems inject methods into `GameEngine`; UI reads state, systems write it.
- Grounding new specs in code: region schema = `docs/REGION_TEMPLATE.js`; skills = `src/data/skills/production/skills_production.js`; engineering tree = `src/core/definitions.js` (`engineeringFields`).
- Commit/push only when the user asks.
