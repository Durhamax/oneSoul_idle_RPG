# One Soul — Map & Points of Interest

**Status:** Living document — v0.4 (the four marquee tiers fleshed: 1, 5, 7, 10; Tiers 2–4, 6, 8–9 scaffolded)
**Last updated:** 2026-11-09
**Companion to:** `WORLD_BIBLE.md` (theme, cosmology, story). This doc places the *narrative* onto the real 80-hex, 10-tier map.

---

## How to read this doc

### The map at a glance
- **80 hexes, 10 tiers.** The player's rough route runs green-pole → fire-pole: **Tier 1 (The Cradle)** west, up and across to **Tier 10 (Infernus / Site Alpha)**, then a narrative **return to the Cradle** for the Asterion arrival.
- **Named hex = a Point of Interest (an authored story beat). Numbered-only hex = texture** (generic gathering/combat/wonder fill; no authored story — these keep the map vast and cheap).
- **No dead hexes.** Even a too-dangerous hex always offers Navigation (explore → raise discovery → resolve silhouettes). See `WORLD_BIBLE.md` §0.

### Every POI fills two columns (the core method)
1. **Progression beat** — what it introduces/scales: a skill, a combat type, a **weapon/material unlock**, an elite, an incursion.
2. **Mood + Lore beat** — what it makes the player *feel* and *the question it plants.*

A hex with only column 1 is a dead hex. A hex with both is a *place.*

### Weapon & material gating
Weapon types and their crafting materials **drop by region/tier** — most aren't available until the player reaches the tier that drops them. Each tier's Progression line should name its weapon/material unlocks. (Exact drop tables TBD — pull from the item/node registries as we flesh each tier.)

### Beat classes (tag every beat)
- **`[MAIN]`** — advances the core plot (the question, the homecoming, the proof, the turn).
- **`[SIDE]`** — optional; world texture, character, rewards. Deepens without gating.
- **`[FALSE]`** — deliberate misdirection. A lead that *looks* load-bearing and isn't — Unity myth, Elaran cover story, or Elara's genuine madness vs. her lucidity. Thematically core: the player is chasing an unverifiable truth, and **learning which clues lie is the game.** Use sparingly and fairly (a false beat should be *re-readable* as false in hindsight, never a cheat).

### POI types (the job a hex does)
`Hub` · `Memory/Ruin` · `Clue Cache` · `Guide Crossing` · `Installation` · `Anomaly/Seed` · `Threshold/Vista`

### The two voices (lore delivery — see `WORLD_BIBLE.md` §7)
- **The Elaran guide** (living): recurring, grudging survival contact. First met at Scoutreach. Humanizes the enemy through dependence.
- **Elara's log** (dead, found): foundational myth both factions know; the player uncovers *proof* that re-means it. Anchored at **Liora — the Landing Site (hex 31)** and paid off in the bookend.

---

## The spine: 10 tiers → 3 movements

Movements are narrative overlays, not hard tier walls.

| Tier | Zone | Movement | Named POIs |
|---|---|---|---|
| 1 | The Cradle / Lower Woodlands | **I → II** | 1 The Cradle, 2 Scoutreach, 3 Greythorn Watch, 4 Shalebrook, 5–7 Verduun S/E/N |
| 2 | Forests and Islands | II | 11 Kaluhea, 12 Rava, 13 Makilo (Kahelion Platform) |
| 3 | Gulf Palisades | II | 16 South Point (Sea Light), 17 Palisade South, 18 Palisade North, 20 Varyx (Riveria Port City), 22 Riveria Headwaters |
| 4 | Riverlands | II | 26 Ravenfjord |
| 5 | Highlands *(shock)* | II | **31 Liora — Landing Site**, 32 Mag Rail Center, 33 Djuma (Anthracite Mine) |
| 6 | Icelands | II | *(texture-heavy — the indifferent threshold before the overland push into Elaria)* |
| 7 | **Elaran Urban Center — Lore Heavy** | **II climax** | 47 Hydro Facility, 48 Elaria Metropolis, 49 Elaria Suburbs, 50 Nova Liora (Naval Base), 51 Bay of Elaria, 52 Industrial District |
| 8 | Desert Lands | II → III | *(the crossing into the fire hemisphere)* |
| 9 | Badlands | III approach | *(ground corrupting toward Infernus)* |
| 10 | **Infernus** | **III** | 76 Heart of Infernus, 80 Site Alpha → then the **return to the Cradle** |

**Two structural hinges:**
- **The overland approach into Tier 7 (Elaria)** is Movement II's point of no return. There is **no sea crossing** — the player arrives by **land**, and the climax of the approach is **severely damaging Elaran infrastructure** (hydro, rail, industry) *en route*, crippling the enemy's expansion engine before ever reaching the capital proper. From there they walk into the enemy's world entire.
- **Liora (31)** is the emotional hinge — the Ark landed in the Highlands *north* of where Unity was later pushed, so walking north is walking back to humanity's arrival. Homecoming and origin in one hex.

---

## TIER 1 — The Cradle / Lower Woodlands *(worked example)*

*Mood arc: golden sanctuary → the first wrongness → grief → a held breath → war.*

### Hex 1 — The Cradle · `[MAIN]` · Hub / Anomaly-Seed (dormant)
- **Progression:** Tutorial. Basic tools; intro gathering skills & materials; craft basic equipment/consumables. Safe node density. Starter weapon tier only.
- **Mood/Lore:** The sanctuary. Over-saturated, golden, *too* fertile — subliminally wrong (the Beta Seed, unseen). The Covenant is taught here; the lake of trapped rainwater at the center.
- **Clue / Discovery:** Unity's hall houses the **Ark relic / Elara monument** — the player can read her degrading log *now*, dismissed as founding myth. **Plants the bookend.** The first clue is a screen nobody reads as true.
- **Guide:** None — the Elaran outcast lives *outside* the Cradle.

### Hex 2 — Scoutreach · `[MAIN]` · Installation + Guide Crossing
- **Progression:** First combat (Elaran survey drones). Perk tutorial + combat upgrades. Introduce **Thieving**. First real weapon/material drops.
- **Mood/Lore:** The invasion made real — machines in the garden. The player alone notices the drones are *surveying for something*, not just raiding. *"What are they looking for?"*
- **Clue:** A downed drone's **survey data** — signal readings referencing Infernus (AV-S1). Meaningless to the player yet; the first breadcrumb toward the fire pole.
- **Guide — FIRST crossing:** the Elaran outcast, met in the wild past the breach. Grudging transaction: glances at the drone data, mutters *"hunting ghost-signals again,"* trades a survival tip for pressing on. The dynamic is set: you need him, you hate it.

### Hex 3 — Greythorn Watch · `[MAIN]` · Memory/Ruin + Clue Cache
- **Progression:** Higher-tier gathering nodes/materials.
- **Mood/Lore:** Overgrown early Unity homes reclaimed by forest — curious, reminiscent, melancholy. **The homecoming begins:** this was Unity's, *before* the Cradle. Grief as texture.
- **Clue:** A cache of **Unity records** — the centuries of being *pushed* from these lands. Ties the displacement theme to a real place.
- **`[SIDE]` optional:** an early settler's account that name-drops the schism and "the madwoman's walls" — rewards the curious, deepens Elara.

### Hex 4 — Shalebrook · `[SIDE]` (breather) · Threshold/Vista
- **Progression:** Unique hunting & fishing; +lvl nodes/materials.
- **Mood/Lore:** Serene, calm — the held breath before Verduun. Proof the world beyond home can still be beautiful; plants longing. On the horizon: the towering dark mass of **Verduun**, silhouetted.
- **Clue — `[FALSE]` seed:** a *too-perfect* fishing pool. Reads as a pristine natural wonder (and the game lets the player treat it as one) — but it's a faint Seed-echo the player can't yet interpret. A "false calm" that only re-reads as significant much later.

### Hex 5 — Verduun Forest South · `[MAIN]` · Installation / Memory
- **Progression:** Explore fortifications; **wildlife incursion** (first incursion-type event). New materials.
- **Mood/Lore:** Transition into the towering Verduun forest. **First visuals of old Elaran brutality** — stark, abandoned bunkers. The ancestral homeland, scarred.
- **Clue:** Unity war records / the account of the displacement *from Verduun itself* — the wound at its source.
- **Guide — recross:** a line about how "Unity always runs, never fights" — foreshadowing the player's own divergence.

### Hex 6 — Verduun Forest East · `[MAIN]` · Installation
- **Progression:** Further fortifications; new enemies.
- **Mood/Lore:** The bunker network deepens — and shows **traces of *recent* human activity.** Not just ruins anymore. Something is active here *now.*
- **Clue:** Recent Elaran redeployment orders — *why reoccupy these old lines now?*

### Hex 7 — Verduun Forest North · `[MAIN]` · Installation (mini-boss)
- **Progression:** **First Elite enemy.** Bunker Command **Incursion**. Gateway toward the Riveria border (Tier 3).
- **Mood/Lore:** An *occupied* bunker command near the border. *"What are they doing?"* — the question sharpens.
- **Clue — the pincer revealed:** the drone survey is **coordinated from here**, hunting Infernus-matching signals — and the orders name **the Cradle** as a target. As the player pushed *out*, the enemy is closing *in* on home. (See `WORLD_BIBLE.md` §8 — the pincer.)

**Tier 1 texture hexes:** 16 South Point (Sea Light) — the Cradle's ocean edge (the "half ocean" of the crater; candidate `[SIDE]` fishing/coastal beat), plus unnumbered-story greens for gathering fill.

---

## TIERS 2–10 — Scaffold *(roles placed; `[TO FLESH]`)*

> Each entry: hex — one-line role · beat class · POI type. We flesh these tier-by-tier, adding side/false beats and mainline meat as we go.

### Tier 2 — Forests and Islands *(II)* — Unity's dwindled reach; survival on the margins
- **11 Kaluhea** — a surviving Unity island-settlement; refuge + resupply · `[MAIN]`/`[SIDE]` · Memory/Hub `[TO FLESH]`
- **12 Rava** — fishing/coastal community; the sea as lifeline · `[SIDE]` · Threshold `[TO FLESH]`
- **13 Makilo (Kahelion Platform)** — an offshore platform; first hint of pre-Unity or Elaran sea-tech · `[MAIN]`/`[FALSE]?` · Installation/Clue `[TO FLESH]`

### Tier 3 — Gulf Palisades *(II)* — first contact with Elaran-mixed civilization; the Covenant starts to feel small
- **16 South Point (Sea Light)** — coastal waypoint/lighthouse · `[SIDE]` · Threshold `[TO FLESH]`
- **17 Palisade South / 18 Palisade North** — the sea-cliff gate between Unity's gulf and the wider world · `[MAIN]` · Threshold/Installation `[TO FLESH]`
- **20 Varyx (Riveria Port City)** — bustling port, Unity presence under Elaran-sympathizer rule; the enemy has *faces and families* here · `[MAIN]` · Hub/Clue `[TO FLESH]`
- **22 Riveria Headwaters** — the river that feeds Riveria; a contested resource · `[SIDE]`/`[MAIN]` · Installation `[TO FLESH]`

### Tier 4 — Riverlands *(II)* — the broad green middle; the land stops being Unity's at all
- **26 Ravenfjord** — a fjord settlement; last clearly-human waypoint before the heights · `[MAIN]`/`[SIDE]` · Memory/Hub `[TO FLESH]`

## TIER 5 — Highlands *(shock)* *(II)* — origin and industry overlap *(fleshed)*

*Mood arc: the green is gone. Cold stone, storm-light, and the hum of Elaran power. Humanity's birthplace on Aurora Vitae, now ringed by the war machine that grew out of it. **This is where the war starts to feel like a lie.***

*Era note: the sci-fi tech visuals ramp hard here — maglev lines, mine-scars, the Ark's dead reactor. **Shock-type weapons and their materials first drop in this tier**; Highland storms and Elaran power are the same motif.*

### Hex 31 — Liora, the Landing Site · `[MAIN]` · Clue Cache / Memory *(the history hinge)*
- **Progression:** Shock-type weapon/material unlocks begin (the Ark's dormant reactor / Highland storms). Higher-tier gathering. A major navigation/discovery gate — the Ark is vast; much to uncover.
- **Mood/Lore:** A colossal dead hulk on a high ridge — **the Ark**, where humanity first touched Aurora Vitae. North of everything Unity still holds: the player has walked *back to the beginning.* Reverent, cold, enormous, haunted. Elaran industry crowds its edges — the sacred origin, half strip-mined.
- **Clue / Discovery (the big one):** The player enters the real Ark and finds **Elara's original walls** — not the curated reliquary shown at the Cradle, but the actual halls where she scrawled her descent from lucid to mad. The founding records are here too: the thousands waking, reading her, and **splitting *at this very site*** — Unity and Elaran lineages physically parting on this ridge. **This is the mid-game turn:** the player came for revenge and leaves with a question — *what if the madwoman wasn't mad?* The war begins to feel like a lie told over a truth.
- **The bookend (setup):** The player gets the full human history and Elara's real words *here* — but **not the proof.** (Proof waits at Infernus / Site Alpha. The final re-read, understanding everything, happens on the return to the Cradle.)
- **`[FALSE]` beat — the competing myth:** The Elarans revere Liora too. The player finds an **Elaran shrine to Elara as a founding *visionary*** — the prophet who "saw the enemy" — wrapped in leadership propaganda and fabricated "evidence of contact" used to justify the war economy. Same woman, opposite reading. The player can't yet tell which Elara is real: cautionary madwoman or vindicated seer. *(In truth she was neither prophet nor insane — just the one who was awake. **Both factions are wrong about her.** The player who assumes the Elaran shrine is the "real" truth has been misdirected.)*
- **Guide — his strongest beat:** closer to Elaran country, he's more at home. Here he says the quiet part — that he left his people *because* of what they built on this ground, and that the Elara the Elarans worship is a lie dressed up to sell a war. The first time he gives the player something other than survival: **doubt.**

### Hex 32 — Mag Rail Center · `[MAIN]` · Installation / Clue Cache
- **Progression:** Combat ramps — Elaran regulars, not drones. New shock-tier materials/weapons via raided freight.
- **Mood/Lore:** The maglev logistics spine of the Elaran war machine — freight hauling ore and arms east toward Elaria. The sheer **scale** lands: Unity holds a crater; the Elarans run a continent-spanning industrial grid. The player feels small, and the question "what are they building?" sharpens into *"they're building it everywhere."*
- **Clue:** Manifest data — everything funnels to **Elaria**, and onward toward **Infernus.** Confirms the destination; the player now knows where the road ends.

### Hex 33 — Djuma, the Anthracite Mine · `[MAIN]` · Installation *(thematic anchor)*
- **Progression:** Shock/energy weapon & material unlocks (the mine's power). Elite labor-overseer enemies. Incursion option.
- **Mood/Lore:** Extraction at a scale that scars the land — smoke, forced-pace labor, the Highlands gutted for carbon and power. To a player raised on the Covenant, this is **Earth's mistake happening again, in front of them** — the overconsumption the pioneers fled, rebuilt by humanity's other half. The clearest look yet at *why* Unity fears the Elaran way — and a crack of horror that the player now wields weapons forged from exactly this.
- **Clue / `[SIDE]`:** Laborers' accounts — ordinary Elarans ground down by their own society's greed. Humanizes the enemy *from below* (not leaders — victims), setting up Tier 7's suburbs.

**Tier 5 texture hexes:** 34–36 (Highland storm-country / Elaran industrial fringe) — shock-tier gathering & combat fill.

### Tier 6 — Icelands *(II)* — the indifferent threshold before the east crossing
- *(Texture-heavy.)* Candidate POI: a frozen `[FALSE]` beat — a "signal" in the ice that looks like the Asterion truth but is an Elaran listening post (or a dead end). Isolation; the world at its most uncaring. `[TO FLESH]`

## TIER 7 — Elaran Urban Center (Elaria), *Lore Heavy* *(II climax)* — the humanization climax; the construction mystery pays off *(fleshed)*

*Mood arc: the point of no return. The player has crossed the sea into the enemy's beating heart — a vast, humming, living city that **refuses to be a target.** The avenger came to raze Elaria; Elaria keeps turning out to be full of people. **"The enemy becomes human; the self becomes the enemy."***

*Era note: peak conventional/tech weaponry unlocks here — the Elaran arsenal at full industrial maturity. No comfortable quick-travel-home; the player is deep in hostile ground. Traversal order below = the player's path through the city.*

### Elaran society — the motive, and the two modes
The Elaran war economy only makes sense because **the belief is real.** They still hold Elara's warning — *we are not alone* — but it lives in only one half of a **bi-modal society:**

- **The elite / militarized class** genuinely believe the threat and drive the resource burn. They read AV-S1 (Infernus) as confirmation and have oriented a whole civilization toward preparing for an enemy they cannot prove to anyone below them — and mostly don't try to. *Not greedy conquerors — true believers doing a monstrous thing for a real reason.* The knowing hand behind the drones, the industry, the fleet.
- **The population mass** lives in a managed, consumerist near-idiocracy — fed, distracted, laboring. They power the burn without the *why.* Elaran by nation, not by knowledge.

**The filter — "the Threshold":** potential is evaluated in childhood; the minority who clear it continue through education into the informed/elite strata, the rest are dropped into the labor force young. The single choice that made Elaran society what it is — a ruthless meritocratic sort that emerged when a people formed on a new world with few rules and one existential fear. *(Unity answered Earth's trauma with gentleness; the Elarans answered the **same** trauma with sorting and preparation. **Two children of one catastrophe.**)*

**The misdirection this creates (`[FALSE]` surface):** a Unity player first sees the *mass* — shallow, consumerist — and reads the whole society as greedy idiocracy ripe for conquest. That reading is wrong; the real engine is the hidden believing elite. Seeing past the idiocracy-surface to the true motive is the player's work here — the theme (who looks past the surface) made into a level.

### Hex 51 — Bay of Elaria · `[MAIN]` · Installation *(the threshold)*
- **Progression:** the overland approach's end at the capital's seaward edge; a major combat gate (shore defenses, patrol craft turned inward). Advanced Elaran weapon/material drops begin.
- **Mood/Lore:** first full sight of the capital — a skyline of industry and light, vast beyond anything Unity ever built, fronting the bay. Awe and dread. Behind the player, the wrecked infrastructure they fought through to get here; ahead, the enemy's world entire.
- **Clue:** harbor control logs — the scale of Elaran military traffic; everything oriented *outward,* as if expecting something.

### Hex 50 — Nova Liora, the Naval Base · `[MAIN]` · Installation
- **Progression:** heavy combat (Elaran navy, elites). Naval/heavy weapon unlocks.
- **Mood/Lore:** "New Liora." The Elarans named their war-fleet's home after **the landing site** — the place humanity arrived, its legacy now a spearhead. Reverence turned to steel. Fresh from the *real* Liora, the player feels the perversion of it.
- **Clue — `[FALSE]` ambiguity:** the fleet isn't postured toward Unity (a crater of farmers) — it faces *the open sea and the sky.* Reads as paranoid imperial overreach (*false: "they're just warmongers"*). The truth the player can't yet hold: they're preparing for something that isn't human.

### Hex 49 — Elaria Suburbs · `[MAIN]`/`[SIDE]` · Memory *(the hardest beat)*
- **Progression:** low combat — a *humanization* zone, not a battle. Thieving/social opportunities.
- **Mood/Lore:** the **population mass** — markets, homes, workers off shift, a managed consumerist calm. These are the Elarans sorted *out* of knowledge young; they don't even know about the threat their labor funds. The player's path of destruction ran through people who were never part of the war-decision and were denied the understanding that might make them culpable. The hatred's hardest, saddest test.
- **Clue — the gut-punch:** Elaran civilian media reveals **how Elarans see Unity** — backward holdouts clinging to a death-cult doctrine while the world needs defending — and bulletins about **a lone Unity killer carving a bloody path toward the capital.** *The player is the monster in Elaria's story.*
- **`[SIDE]` — the Threshold:** the player can witness a sorting day — children evaluated, a few pulled up into education, the rest turned toward the labor lines. A quiet horror, and the clearest window into how this society was built. (Tie-in: **the guide failed his Threshold** — see below.)

### Hex 48 — Elaria Metropolis · `[MAIN]` · Hub / Clue Cache
- **Progression:** the capital heart; major combat around the seats of power. Best tech-weapon unlocks.
- **Mood/Lore:** the center of Elaran power — the informed **elite class** that actually runs the war. Monuments to expansion, the **Elara-as-visionary** myth at civic scale, the Covenant's abandonment enshrined as *survival.* The worldview that made the enemy.
- **Clue / confrontation (resolves the knowing-circle question):** the elite genuinely know. The player can confront an elite **true-believer who lays out the threat from the enemy's own mouth** — *you kill us for arming against something your little crater could never imagine.* But the player has no proof yet, so it reads as manipulation or madness — **the same bind Elara was in.** The truth, delivered by the hated enemy, before the player can believe it. *(Canon: a believing elite class — not a tiny cell, not blind momentum.)*
- **Clue — sets up Infernus:** classified archives tie the whole program to AV-S1 and route it toward Site Alpha.

### Hex 52 — Industrial District · `[MAIN]` · Installation / Clue *(the payoff)*
- **Progression:** the "what are they building?" answer. Heavy combat, elite defenders, incursion. Endgame-approach materials.
- **Mood/Lore:** the thing the whole journey asked about — a **planetary-scale military-industrial program:** the elite's genuine conviction made into assembly lines, powered by the mass's labor. To the player (and to the mass itself) it reads as monstrous greed; it is, in truth, **preparation disguised as an empire's hunger.** The horror is real either way — the shield is built on an Earth-repeating injustice.
- **Clue:** the program's outputs route toward **Infernus / Site Alpha** — they're building their war *around the corrupted Seed.* The road's end is confirmed, its purpose half-glimpsed.

### Hex 47 — Hydro Facility · `[SIDE]` · Installation *(the moral beat)*
- **Progression:** optional sabotage target; infrastructure combat.
- **Mood/Lore:** the city's lifeblood — power and water for millions. A choice with weight: crippling it hurts the war machine *and* the civilians the player just walked among. The Covenant-raised avenger, handed the logic of total war. *What kind of thing has he become?*

### The Guide at Elaria — his homeland, his wound
His most personal, fraught stretch — his own people, the city he left. **Proposed origin:** he **failed his Threshold** — sorted into the labor mass as a child, too clever for the life it gave him, self-taught through hard survival. A brilliant mind the filter threw away; living proof the system is wrong, and the reason he left. That's the root of his hollow wisdom and his double bitterness — toward the elite who discarded him *and* the Covenant that would have kept him soft. He **won't** walk the Metropolis with the player; he has history here. Beats: a warning at the Bay, a bitter truth in the Suburbs, and a near-break where the player glimpses him as **one of them** — the enemy's humanity collapsed into the single face the player has come to rely on.

**Tier 7 texture hexes:** 53 and the urban fringe — Elaran city-outskirts combat/industrial fill.

### Tier 8 — Desert Lands *(II → III)* — the crossing into the fire hemisphere; the war-machine in the open
- *(Texture-heavy; Elaran supply lines, exposure, heat.)* Candidate POIs `[TO FLESH]`

### Tier 9 — Badlands *(III approach)* — the ground itself corrupting toward Infernus; dread rising
- *(Texture-heavy; the biome degrading, Seed-corruption visible.)* Candidate POIs `[TO FLESH]`

## TIER 10 — Infernus *(Movement III)* — the proof, the reckoning, the turn *(fleshed)*

*Mood arc: the fire pole. The badlands' corruption boils over into a volcanic hellscape — the hardest, most hostile ground in the game, and the root of the Elaran war. **This is where the invisible finally becomes visible, and the whole story flips.***

*Era note: endgame. The exotic, "beyond human metrology" **Seed-derived weapons and materials** finally become craftable here — the player's ascent culminates in Asterion-tier tech, the ultimate transgression (the Covenant fully burned, alien power in a Unity hand). Survival attributes matter — heat, lava, dangerous nodes.*

### Hex 76 — Heart of Infernus · `[MAIN]` · Installation *(the war at its root)*
- **Progression:** the hardest installation combat in the game — the Elaran elite's most secret facility, guarding the Seed. Exotic/endgame material & weapon unlocks. Final-approach gauntlet.
- **Mood/Lore:** the source. Here the Elarans mine and reverse-engineer the corrupted Alpha Seed's exotic matter — the wellspring of everything "beyond human metrology" the player has fought against (and now wields). The machine of the war laid bare at its root, in a cathedral of fire.
- **Clue:** Elaran research — they've partly decoded the Seed. The last pieces before Site Alpha: *it isn't a power source. It's a signal.*

### Hex 80 — Site Alpha · `[MAIN]` · Anomaly/Seed *(THE FINAL QUEST — the payoff)*
- **Progression:** the Final Quest / final confrontation; the culmination of the combat and crafting ascent.
- **Mood/Lore:** the corrupted Alpha Seed itself — exotic, alien, undeniably *not of human make.* The thing Elara felt, made physical. **Elara vindicated: we are not alone.**
- **Clue / Revelation (the detonation)** — Elaran research (and/or the elite true-believer from Elaria, here at the source) assembles the full truth:
  - the Seed is a **beacon**, not a weapon;
  - there is a **second Seed** — intact, far louder — and it sits **under the Cradle. The player's home.**
  - the Asterion are **coming,** drawn by the beacons, and Aurora Vitae's loudest signal is the one the player has protected all along.
- **The Cradle double-meaning detonates:** the impossibly fertile home Unity reveres is the strongest beacon on the planet, and it has been calling the enemy for all of human history. The abundance was the trap. "The Cradle" is a cradle — for *them.*
- **The Asterion made visible:** the one image withheld all game. The sky changes; the fleet becomes perceptible; the arrival begins. (See `WORLD_BIBLE.md` §8, Movement III.)
- **The turn:** the player must get home — and the **Elarans, the enemy he slaughtered all game, mobilize to defend the Cradle.** His vengeance was aimed at humanity's shield.

### The guide at Infernus — the first to turn
His arc's capstone and the ending in miniature: **the guide is the first Elaran to stand with the player.** The micro of the macro. *(Open: does he survive it, or fall here as the bittersweet cost? Ties to the player's own end-state — still open.)*

### The elite true-believer — vindicated *(option)*
The believer the player refused in Elaria reappears at Site Alpha, proven right at the source, and becomes **the one who rallies the Elaran forces to the Cradle** — the enemy the player wronged most, now the face of humanity's salvation.

### The Return — Movement III resolution
Narrative traversal back toward the Cradle: earlier tiers re-skinned by war-mobilization and a wrong sky. **The bookend fires** — the player reaches home and re-reads Elara's log (at the Cradle monument, Tier 1), now understanding every line. Ends on the **Elarans forming a line to shield the Cradle** from the Asterion arrival — the held breath. *The actual war is the sequel; the player's personal reckoning (does he put the hatred down?) is left open — the sequel's question.*

**Tier 10 texture hexes:** 74, 75, 77–79 — the volcanic approach; the hardest combat/hazard fill; Elaran elite guard and lava-field dangerous nodes.

---

## Backlog — beats still to add

- **Side-quest beats** across tiers (character, world texture, optional rewards) — especially in texture-heavy Tiers 6, 8, 9.
- **False beats** (`[FALSE]`) — misdirections that re-read as false in hindsight. Seeds planted: Shalebrook's too-perfect pool (4), the Icelands "signal" (Tier 6), possibly Makilo's platform (13). Decide the *pattern* of lies (Unity myth? Elaran propaganda? Elara's madness vs. lucidity?).
- **Mainline meat** between the marquee beats — connective missions so every step feels equally weighted toward the arc.
- **Weapon/material unlock table per tier** — map which weapon types/materials drop where (pull from item/node registries). *(Geography, resources, and settlement/economy per region now live in `REGIONS_GEOGRAPHY.md`.)*
- **The Return leg** — which hexes the player re-traverses and how they're altered.

---

*Flesh order: Tier 1 ✓ → Tier 5 Liora ✓ → Tier 7 Elaria ✓ → Tier 10 Infernus ✓ — **the narrative spine is complete.** Remaining: backfill the connective tiers (2–4, 6, 8–9) and the texture/side/false beats within them; detail the Return leg; the standalone human-history timeline.*

*Note: Liora (31) anchors the standalone **human-history timeline** — the full chronology of humans on Aurora Vitae, broken into clues to scatter across the map — which is its own planned artifact (`WORLD_BIBLE.md` §14.2).*
