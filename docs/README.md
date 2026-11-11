# One Soul — Documentation Index

**This folder is the single home for all living design + technical docs.** Before writing anything new, find the doc below that already owns the topic and **update it**. New files are a last resort (see "Working agreement" at the bottom).

**Last updated:** 2026-11-10

---

## Design / vision

| Doc | Owns |
|---|---|
| [WORLD_BIBLE.md](WORLD_BIBLE.md) | The narrative north star — theme, cosmology (the Two Seeds / Site Alpha & Beta), factions, protagonist, movements, the ending. |
| [CAMPAIGN_ARC.md](CAMPAIGN_ARC.md) | The 5-act questline spine, the site-type taxonomy, and the resounding themes. |
| [MAP_POI.md](MAP_POI.md) | The 80-hex map as story beats — per-hex roles, clues, guide crossings, tier arcs. |
| [REGIONS_GEOGRAPHY.md](REGIONS_GEOGRAPHY.md) | The expansion engine — geography, the resource/tech gradient, per-region economy. |
| [RESOURCE_DESIGN.md](RESOURCE_DESIGN.md) | Resource naming registers, the inorganic=familiar/organic=alien rule, the combat-driven loot method, and the node/gathering model + archetype library. |
| [COMBAT_PROGRESSION.md](COMBAT_PROGRESSION.md) | The power curve, build archetypes, encounter/sequence (dungeon) model, type system. |
| [SYSTEMS_OVERVIEW.md](SYSTEMS_OVERVIEW.md) | How every system interconnects; per-system reference; the content-spread rule. |
| [ENGINEERING_DESIGN.md](ENGINEERING_DESIGN.md) | Engineering as the build system — the 16-field research tree, tomes, tech slots, fields→builds, open decisions. |

## Per-region buildout

| Doc | Owns |
|---|---|
| [REGION_BUILDS.md](REGION_BUILDS.md) | Implementation-ready per-hex specs (combat-first), plus Appendix A (seeded campaign rewards & assembly components). |
| [REGION_SCHEMA.md](REGION_SCHEMA.md) | Prose explanation of the region data schema. |
| [REGION_TEMPLATE.js](REGION_TEMPLATE.js) | The canonical copyable region definition template. |

## Technical

| Doc | Owns |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the game is built — registries, systems, state shape, UI, equipment/loadout, dev patterns. The consolidated technical reference. |

## History

- [archive/](archive/) — superseded design docs and completed migration/test/standard notes. **Reference only; not current.** Promote something back out only if it becomes canon again.

---

## Working agreement (to stop doc sprawl)

1. **Check this index first.** If a doc already owns the topic, edit that doc — don't create a parallel one.
2. **One topic, one home.** Narrative → WORLD_BIBLE; campaign structure → CAMPAIGN_ARC; a system → its system doc; how-it's-coded → ARCHITECTURE; a specific hex → REGION_BUILDS.
3. **New file only for a genuinely new topic** not covered above — and when you add one, add a row here in the same change.
4. **Don't write dated status snapshots** into living docs (they rot). Status/changelog belongs in commits or `archive/`.
5. **When vision changes, update in place** and let the old wording go — deprecate, don't accumulate.
