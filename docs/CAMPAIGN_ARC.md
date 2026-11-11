# One Soul — Campaign Arc, Site Taxonomy & Themes

**Status:** Living document — v0.1
**Last updated:** 2026-11-10
**Companion to:** `WORLD_BIBLE.md` (theme/cosmology), `MAP_POI.md` (geographic beats), `REGIONS_GEOGRAPHY.md` (economy). This doc is the **questline spine** (what drives the player across the 80 regions), the **site-type taxonomy** to populate regions with, and the **resounding themes** to weave through all of it.

> **CANON — Site lettering (resolved).** **Site Alpha = Infernus** (hex 80): the **first** Asterion Seed the Elarans actually *located* — the corrupted remnant they catalogued as AV-S1 in 895 AL and now mine/reverse-engineer. **Site Beta = the Cradle**: the **intact** Seed, still signaling. The Elarans have detected its signature and matched it to Alpha's family, so **Site Beta is their designation for a source they are tracking but have not yet reached** — and chasing that signature *into Unity's last refuge* is what starts the war. Unity, living atop it, have **no idea it exists**: they run no deepground mining to stumble on it and lack the technology to detect the signature. They just receive its benefits — the Cradle's impossible fertility — blissfully ignorant, until the intrusion. (Matches `WORLD_BIBLE.md` §cosmology and the hex map.)

---

## 1. The driving spine (5 acts across 80 regions)

Each act is a **question** that pulls the player forward. Regions within an act aren't strictly linear — the player roams, but geography should make sense (region numbers roughly spiral out from the Cradle toward Infernus). The acts overlay the three Movements (`WORLD_BIBLE.md` §8) and the 10 tiers (`MAP_POI.md`).

| Act | ~Regions | Driving question | Geography (tiers) | Movement |
|---|---|---|---|---|
| **I** | ~1–20 | **Why did the Elarans invade?** Survey drones tracked a Seed signature (**Site Beta**, unknown to Unity) into Unity's last refuge — the player sets out to learn why. | Cradle → Forests/Islands → Gulf/Riveria (T1–3) | I → II |
| **II** | ~21–40 | **How do I disrupt Elaran expansion?** Sabotage, raids, cutting the war machine's reach across the western Elaran-industrial sprawl. | Riverlands → Highlands → Icelands (T4–6) | II |
| **III** | ~41–53 | **Where are the leaders, and how do I annihilate the system (Elaria)?** Reach the capital, get to the root of what they're *after* — and learn **Site Alpha** (the located Seed in Infernus) exists. | overland approach → Elaria (T7) | II climax |
| **IV** | ~54–73 | **What's at Site Alpha / in the eastern lands that could answer my questions?** Chase the answers across the fire hemisphere. | Desert → Badlands (T8–9) | II → III |
| **V** | ~74–80 | **Locate Site Alpha within Infernus.** The endgame destination; the proof; the reckoning. | Infernus (T10) | III |

**Structural motif — *violence prolongs the questline*.** The player tends to **destroy enemies (and places) before extracting answers** — razing the very source that held the next clue. So each answer arrives late and points onward; the player's rage literally extends his own quest and delays understanding. This is a gameplay-narrative engine *and* a tragic reinforcement of the vengeful protagonist (`WORLD_BIBLE.md` §6): his fury costs him knowledge.

---

## 1a. Anchor Map — the 80-hex skeleton

The **top-down skeleton**: the memorable things each tier must deliver, placed before any region is detailed, so every hex points at a payoff and nothing is aimless filler. **The campaign runs through missions** — like the wired tutorial chain (missions 101–106, Elder Maren) that hands off into the still-empty `main_story.js`. Each tier's anchors are a **mission chain to author.** Columns: **★ signature mission-beats/rewards**, **combat** (the damage type *discovered* here + the enemy **armor types present**), and **tome source** (`ENGINEERING_DESIGN.md` §7). *Grounded in wired content where it exists; names elsewhere are proposals.*

| Tier · Zone | Act | ★ Signature mission-beats / rewards | Combat: type discovered · enemy armor present | Tome source |
|---|---|---|---|---|
| **1 Cradle** | I | Tutorial chain (101–106): ends crafting the **Greensman Training Bow + Flinthead Arrows** (first weapon); `unityScoutSet` armor given; **Elara's monument** (the bookend plant). Then the **first-combat chain** (combat/perk/Thieving intros — *to author; some missing*). | **Pierce** discovered (bow) · **Biological** (scouts), **Airborne** (survey drones) | first **data-cores** off drones (Scoutreach) |
| **2 Forests/Islands** | I | **Kahelion Platform** = first tech-salvage (circuits/parts) & first research site; **Kaluhea** Unity refuge (hub). **Ports** appear as POIs (no boat mechanic). | **Incendiary** discovered (Chemistry) — counters Biological · Biological, Airborne, first **Insulated** tease | **research site** (Kahelion) + Thieving |
| **3 Gulf Palisades** | I | ★ **Firearms unlock** (Mechanics — the leap from the bow); **Varyx** port city (the enemy has faces & families); **Varyx Warehouse Run** dungeon (Dock Master boss) | Pierce firearms mature · Biological, **Insulated** (urban tech troops) | **Thieving** Varyx data caches |
| **4 Riverlands** | II | Land stops being Unity's (**Ravenfjord**); Act II opens: first **sabotage / infrastructure-disruption** missions; first **big-game hunt** | scaling · Biological, Insulated, first **Plated** tease (road vehicles) | river-infra research site |
| **5 Highlands** *(shock)* | II | ★★ **The Ark remains** (at Liora) — search its **archives / passenger lockers** for a campaign-relevant find *(TBD)* = the mid-game turn (Elara's real words; "the war is a lie"); **Mag Rail** scale reveal; **Djuma mine** (industrial Mining/Smithing → plating, firearm materials) | **Shock** discovered (EM/Energy) — counters **Droid** · **Droid** (mining mechs), Plated, Biological | the **Ark archives** — major research cache |
| **6 Icelands** *(cryo)* | II | **Cryo unlock** → finally answers the **Airborne drones** that have harassed since T1; the indifferent threshold before the east | **Cryo** discovered (Cryogenics) — counters **Airborne** · Airborne (recon aircraft), Insulated | ice research station |
| **7 Elaria** | III | ★★ **Arrive by LAND** (no sea crossing); **severely damage Elaran infrastructure en route** (the Act II "disrupt" climax) → **assault the capital**; bi-modal society; **Site Alpha revealed**; the **believer** introduced | elite Elaran regulars · **all armor types converge** | ★ **Elaria central archive** — the richest cache (the hoard itself) |
| **8 Desert** *(explosive)* | IV | **Explosive unlock** → **heavy builds** come online; the fire hemisphere; chasing "what's at Site Alpha" | **Explosive** discovered (Ordnance) — counters **Plated** · **Plated** (heavy armor/vehicles), Droid | desert dig-site / outpost |
| **9 Badlands** | IV | Ground corrupting toward Infernus; the last approach; **Register C exotic resources** tease | hardest pre-endgame · mixed elite (all types) | abandoned deep-survey site |
| **10 Infernus** | V | ★★★ **Site Alpha** (hex 80) — **the proof** ("we are not alone"); **Seed-exotic (Register C) weapons/tech** (tier-5 Engineering fields); **Heart of Infernus** (76); the believer **rallies Elaran forces to defend the Cradle**; then **return to the Cradle** (bookend payoff) | endgame; Seed-tier · all types + exotic | the Seed research itself |

**Reading the skeleton:**
- **The campaign is mission-delivered.** Anchors aren't abstract — each becomes a **mission chain** continuing the wired tutorial (101–106) into `main_story.js`. Authoring those chains *is* building the campaign. (Objective types already exist: gather/craft/equip/explore/visitTab/… — `src/data/missions/objectiveTypes.js`.)
- **Damage types — discovered deliberately, never forced.** Each type has an intentional **discovery point** (a tier + Engineering field + materials) and is **strengthened through Engineering** (Ballistics→Pierce, Chemistry/Ordnance→Incendiary, EM/Energy→Shock, Cryogenics→Cryo, Ordnance→Explosive). But **enemy armor types recur across many tiers**, not just where their counter unlocks (Airborne harasses from T1 to the Icelands; Droid/Plated recur through the industrial east) — so a discovered type stays useful, and **discovery ≠ obligation**: a player who invests other fields/attributes can beat an armor type without its "ideal" counter. The counter is an *option the game offers*, not a gate. *(Full table lives in `COMBAT_PROGRESSION.md`.)*
- **The three marquee anchors** (★★+): **T5 the Ark** (the turn), **T7 Elaria** (the land assault + Site Alpha reveal), **T10 Site Alpha** (the proof). Everything else paces between them.
- **Tome economy spans the map:** every Elaran-held tier feeds at least one source; research sites cluster at knowledge hubs (Kahelion → the Ark → Elaria's archive → the Seed).
- **The combat amulet is a *side* collectible, not the spine** — see Appendix A (`REGION_BUILDS.md`). Think Melvor's *Fury of the Elemental Zodiac*: assemble a strong end-game **combat** amulet from components that drop off notable fights across the tiers. A power/completionist chase layered on top; the **story rides the missions**, not the amulet.

---

## 2. Site-type taxonomy (what to place in a region)

Every region is populated from this palette. Each type is a natural home for combat, skilling, dungeons, lore, and the themes below.

| Site type | Typical content | Serves |
|---|---|---|
| **Military installations** | bunkers, bases, batteries, naval/air facilities; combat + dungeons; elites | politics & military theme; the war machine |
| **Critical infrastructure** | power, water, comms, transport (mag-rail), hydro; sabotage dungeons | second-world fragility; Elaran dependence/extraction |
| **Resource collection sites** | mines, farms, logging, fisheries, platforms; gathering nodes | the economy; the salad-bowl labor force |
| **Towns / settlements** | daily life, markets, the Elaran mass or Unity remnants | culture, language, the humanization beats |
| **Cities** | Elaria, Varyx, Riveria — power, propaganda, the elite | politics; the stratified society; the capital |
| **Characters of interest** | the guide, defectors, officials, lost Unity kin, witnesses | personal stories that carry the themes & clues |
| **Geographic POIs** | seed-touched anomalies, alien biomes, vistas, ruins | the second world's strangeness; wonder; discovery |

(Marry this with the beat types in `MAP_POI.md` — Memory/Ruin, Clue Cache, Guide Crossing, Installation, Anomaly/Seed, Threshold/Vista — and the combat/dungeon model in `COMBAT_PROGRESSION.md`.)

---

## 3. Resounding themes (weave through content)

These are the "what if?" questions that give the world resonance. Each should surface *through* sites and characters, not exposition.

**1. The second world — what could go wrong?**
Colonizing a fresh planet: terraforming dependence (the colony's very habitability rests on alien seed-infrastructure it can't see), single-point-of-failure fragility, biosphere incompatibility, isolation from Earth, generational drift. The Cradle's uncanny fertility is secretly a *dependence*. → **critical infrastructure, geographic POIs.**

**2. A salad bowl on a new planet — emergent culture.**
The pioneers were a *mix* of Earth cultures (distinct, not melted). Over centuries, two answers emerged: **Unity** synthesized them into one communal creed (the Covenant); the **Elarans** stratified them into a hierarchy (the Threshold). The map's own place-names are already a salad bowl — *Kaluhea, Ravenfjord, Djuma, Varyx, Liora* — blended Earth roots; lean into food, ritual, aesthetics, naming. → **towns, cities, characters.**

**3. Language — drift and divergence.**
Centuries on, an evolved creole/koiné: founding terms preserved (the *Covenant*, the *AL* calendar), everyday speech drifted. Faction as dialect/register — Unity communal plainspeak vs Elaran institutional/technical cant. Signage, propaganda, graffiti (Elara's walls) show the living language. → **towns, cities, clue caches.**

**4. Politics & military — built from scratch.**
Governance invented on a blank world: Elaran technocratic, militarized, stratified; Unity communal, consensus, pacifist. The military contrast — a professional Elaran war-machine vs a people who refused to arm. Councils, enforcement, propaganda visible in settlements. → **military installations, cities.**

**5. A flawed founding — the document that didn't fit reality.**
The **Covenant of Unity** was written by founders for a *peaceful* world — with little provision for defense and none for an external threat or an "are we alone?" crisis. Elara's edit exposed the gap; the schism was the system failing an unforeseen shock. The deep tragedy: humanity's second chance was undermined by an imperfect founding charter — Unity clinging to it dogmatically, the Elarans abandoning it entirely. Both are failure modes of the same flawed founding. → **clue caches, characters, Liora (the Ark/founding site).**

---

## 4. Resource note (universe physics)

The periodic table is **universal** — elements and **metals are real and recognizable** (grounds the `copperite`-style naming). What differs on Aurora Vitae is **compounds and organic life**, formed under this world's conditions: *recognizable metals, alien organisms.* So the resource split is **inorganic = familiar, organic = alien.** (Folded into `RESOURCE_DESIGN.md`.)

---

## 5. To reconcile / next

- ~~Confirm Site A/B lettering~~ **RESOLVED:** Alpha = Infernus (located), Beta = Cradle (intact, Unity-ignorant). All docs aligned.
- Finalize **exact region-number → act** boundaries against the 80-hex map.
- Reconcile the **early Site Alpha breadcrumbs** (`MAP_POI.md` Scoutreach drone data) with the Act III reveal — early hints stay cryptic; Act III is full understanding. (The player never learns Site Beta is *beneath the Cradle* until the late-game twist — that the home they're defending is the very thing the enemy is hunting.)
- As regions are fleshed (`REGIONS_GEOGRAPHY.md`), assign each the site-types (§2) and the theme(s) (§3) it carries.
