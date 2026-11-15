/**
 * Tier 1 Materials - Region 1 (The Cradle)
 *
 * These materials are gathered from the 6 starting nodes.
 * Each material has a skill association for inventory sorting.
 *
 * Node Mapping:
 * - Fishing: Lake Shallows (node 1_1) - 3 materials
 * - Hunting: Meadow Game Trail (node 1_2) - 3 materials
 * - Foraging: Fallen Timber (node 1_3) - 4 materials
 * - Logging: Lakeside Forest (node 1_4) - 3 materials
 * - Mining: Riverbed (node 1_5) - 4 materials
 * - Foraging: Meadow Herb Patch (node 1_6) - 2 materials
 *
 * Total: 19 Tier 1 Materials
 */

const MATERIAL_ITEMS = {
    // ==========================================
    // FISHING - Lake Shallows (node 1_1)
    // ==========================================
    solfish: {
        id: 'solfish',
        name: 'Solfish',
        description: 'A common freshwater fish found in shallow lakes. Its mild flavor makes it ideal for cooking.',
        type: 'material',
        category: 'material',
        subcategory: 'fish',
        skill: 'fishing',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 2,
        icon: 'assets/icons/materials/solfish.png',
        tags: ['fish', 'food-ingredient', 'cooking']
    },

    minnows: {
        id: 'minnows',
        name: 'Minnows',
        description: 'Tiny silver fish prized as live bait. Equip them to the ammo slot while fishing to improve your catch rate — one is spent each fishing attempt. They are bait, not ammunition: a ranged weapon cannot fire them.',
        type: 'material',
        category: 'material',
        subcategory: 'fish',
        skill: 'fishing',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: 'assets/icons/materials/minnows.png',
        // Equippable bait: lives in the ammo slot, but is a bait-class consumable so
        // combat never spends it (see consumeAmmo/canAttack). Consumed per fishing interval.
        equipSlot: 'ammo',
        ammoCategory: 'bait',
        weight: 0.2,                 // flat per stack (live bait), never × quantity
        fishingSuccessBonus: 0.15,   // +15% fishing success while equipped (with charges)
        tags: ['fish', 'bait']
    },

    mossShrimp: {
        id: 'mossShrimp',
        name: 'Moss Shrimp',
        description: 'A rare delicacy that hides among lake vegetation. Prized by chefs.',
        type: 'material',
        category: 'material',
        subcategory: 'fish',
        skill: 'fishing',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 15,
        icon: 'assets/icons/materials/moss_shrimp.png',
        tags: ['fish', 'food-ingredient', 'cooking', 'rare']
    },

    // ==========================================
    // HUNTING - Meadow Game Trail (node 1_2)
    // ==========================================
    smallGameMeat: {
        id: 'smallGameMeat',
        name: 'Small Game Meat',
        description: 'Fresh meat from small meadow creatures. Best cooked soon after harvest.',
        type: 'material',
        category: 'material',
        subcategory: 'meat',
        skill: 'hunting',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: 'assets/icons/materials/small_game_meat.png',
        tags: ['meat', 'food-ingredient', 'cooking']
    },

    smallPelts: {
        id: 'smallPelts',
        name: 'Small Pelts',
        description: 'Soft fur pelts from small game. Used in crafting light armor and accessories.',
        type: 'material',
        category: 'material',
        subcategory: 'hide',
        skill: 'hunting',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 5,
        icon: 'assets/icons/materials/small_pelts.png',
        tags: ['hide', 'leather', 'tailoring', 'crafting']
    },

    feathers: {
        id: 'feathers',
        name: 'Feathers',
        description: 'Light, flexible feathers used for fletching arrows and decorative crafts.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'hunting',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 8,
        icon: 'assets/icons/materials/feathers.png',
        tags: ['fletching', 'crafting', 'mechanics']
    },

    // ==========================================
    // FORAGING - Fallen Timber (node 1_3)
    // ==========================================
    mintyHerb: {
        id: 'mintyHerb',
        name: 'Minty Herb',
        description: 'A fragrant herb with cooling properties. Essential for many recipes and remedies.',
        type: 'material',
        category: 'material',
        subcategory: 'herb',
        skill: 'foraging',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 2,
        icon: 'assets/icons/materials/minty_herb.png',
        tags: ['herb', 'food-ingredient', 'cooking', 'chemistry']
    },

    commonMushrooms: {
        id: 'commonMushrooms',
        name: 'Common Mushrooms',
        description: 'Edible fungi found growing on fallen logs. Nutritious but bland alone.',
        type: 'material',
        category: 'material',
        subcategory: 'fungus',
        skill: 'foraging',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: 'assets/icons/materials/common_mushrooms.png',
        tags: ['fungus', 'food-ingredient', 'cooking']
    },

    plantFibers: {
        id: 'plantFibers',
        name: 'Plant Fibers',
        description: 'Strong natural fibers stripped from forest plants. Used in rope and bowstrings.',
        type: 'material',
        category: 'material',
        subcategory: 'fiber',
        skill: 'foraging',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 6,
        icon: 'assets/icons/materials/plant_fibers.png',
        tags: ['fiber', 'crafting', 'mechanics', 'tailoring']
    },

    auroranTuber: {
        id: 'auroranTuber',
        name: 'Auroran Tuber',
        description: 'A tough, gnarled tuber that glows faintly at the roots. Prized by cooks and alchemists — a key ingredient once paired with shellfish in a hearty boil.',
        type: 'material',
        category: 'material',
        subcategory: 'herb',
        skill: 'foraging',
        tier: 1,
        rarity: 'epic',
        stackable: true,
        stackLimit: 999,
        value: 25,
        icon: 'assets/icons/materials/auroran_tuber.png',
        tags: ['herb', 'alchemy', 'chemistry', 'cooking', 'rare']
    },

    // ==========================================
    // LOGGING - Lakeside Forest (node 1_4)
    // ==========================================
    pinewood: {
        id: 'pinewood',
        name: 'Pinewood',
        description: 'Common softwood from lakeside pines. Easy to work with for basic construction.',
        type: 'material',
        category: 'material',
        subcategory: 'wood',
        skill: 'logging',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 2,
        icon: 'assets/icons/materials/pinewood.png',
        tags: ['wood', 'crafting', 'construction'],
        fuel: true,
        fuelStats: {
            burnTime: 30,
            warmth: 5,
            efficiency: 1.0
        }
    },

    riverwillow: {
        id: 'riverwillow',
        name: 'Riverwillow',
        description: 'Flexible willow wood that grows near water. Prized for bows and woven crafts.',
        type: 'material',
        category: 'material',
        subcategory: 'wood',
        skill: 'logging',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 5,
        icon: 'assets/icons/materials/riverwillow.png',
        tags: ['wood', 'crafting', 'mechanics', 'flexible'],
        fuel: true,
        fuelStats: {
            burnTime: 35,
            warmth: 6,
            efficiency: 1.1
        }
    },

    resin: {
        id: 'resin',
        name: 'Resin',
        description: 'Sticky tree sap that hardens over time. Used as adhesive and waterproofing.',
        type: 'material',
        category: 'material',
        subcategory: 'extract',
        skill: 'logging',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 8,
        icon: 'assets/icons/materials/resin.png',
        tags: ['extract', 'adhesive', 'crafting', 'chemistry']
    },

    // ==========================================
    // MINING - Riverbed (node 1_5)
    // ==========================================
    clay: {
        id: 'clay',
        name: 'Clay',
        description: 'Malleable river clay used for pottery, bricks, and basic construction.',
        type: 'material',
        category: 'material',
        subcategory: 'mineral',
        skill: 'mining',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 1,
        icon: 'assets/icons/materials/clay.png',
        tags: ['mineral', 'construction', 'crafting']
    },

    flint: {
        id: 'flint',
        name: 'Flint',
        description: 'Sharp-edged stone that sparks when struck. Essential for primitive tools and fire.',
        type: 'material',
        category: 'material',
        subcategory: 'stone',
        skill: 'mining',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 4,
        icon: 'assets/icons/materials/flint.png',
        tags: ['stone', 'crafting', 'tools', 'mechanics']
    },

    copperiteOre: {
        id: 'copperiteOre',
        name: 'Copperite Ore',
        description: 'Raw copper-bearing ore with a distinctive green tint. Smelts into usable metal.',
        type: 'material',
        category: 'material',
        subcategory: 'ore',
        skill: 'mining',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 10,
        icon: 'assets/icons/materials/copperite_ore.png',
        tags: ['ore', 'metal', 'smithing', 'smelting']
    },

    goldFlakes: {
        id: 'goldFlakes',
        name: 'Gold Flakes',
        description: 'Tiny flecks of gold found in riverbeds. Valuable but require refining.',
        type: 'material',
        category: 'material',
        subcategory: 'precious',
        skill: 'mining',
        tier: 1,
        rarity: 'epic',
        stackable: true,
        stackLimit: 999,
        value: 50,
        icon: 'assets/icons/materials/gold_flakes.png',
        tags: ['precious', 'currency', 'rare', 'smithing']
    },

    // ==========================================
    // FORAGING - Meadow Herb Patch (node 1_6)
    // ==========================================
    meadowGreens: {
        id: 'meadowGreens',
        name: 'Meadow Greens',
        description: 'Fresh leafy greens from open meadows. A staple ingredient in Unity cooking.',
        type: 'material',
        category: 'material',
        subcategory: 'vegetable',
        skill: 'foraging',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 1,
        icon: '🥬',
        tags: ['vegetable', 'food-ingredient', 'cooking']
    },

    daypetalBloom: {
        id: 'daypetalBloom',
        name: 'Daypetal Bloom',
        description: 'A rare flower that only blooms during the day. Its petals have medicinal properties.',
        type: 'material',
        category: 'material',
        subcategory: 'flower',
        skill: 'foraging',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 20,
        icon: '🌸',
        tags: ['flower', 'alchemy', 'chemistry', 'medicine']
    },

    // ==========================================
    // REFINED / COMPONENTS (crafted + salvaged intermediates)
    // ==========================================
    copperWire: {
        id: 'copperWire',
        name: 'Copper Wire',
        description: 'Copperite ore smelted down and drawn into fine conductive wire. The backbone of early circuitry and electronics.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'smithing',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 14,
        icon: '🔌',
        tags: ['metal', 'wire', 'component', 'electronics', 'refined']
    },

    salvagedSensor: {
        id: 'salvagedSensor',
        name: 'Salvaged Sensor',
        description: 'An intact optical sensor pried from a downed Elaran survey drone. Pair it with copper wiring to assemble your first working technology.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'electronics',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 22,
        icon: '📟',
        tags: ['salvage', 'sensor', 'component', 'electronics']
    },

    // ==========================================
    // TIER 2 — SCOUTREACH: propellant stock (bog), chemistry reagents, ranging furs
    // ==========================================
    bogNiter: {
        id: 'bogNiter',
        name: 'Bog Niter',
        description: 'Crusted saltpeter leached from a peat bog, where centuries of decay concentrate the nitrates. The oxidizer in crude small-arms propellant — enough to drive a bullet, not to level a wall.',
        type: 'material',
        category: 'material',
        subcategory: 'mineral',
        skill: 'mining',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 6,
        icon: '🧂',
        tags: ['mineral', 'oxidizer', 'propellant', 'chemistry']
    },

    bogSulfur: {
        id: 'bogSulfur',
        name: 'Bog Sulfur',
        description: 'Yellow sulfur scraped from the sour seeps at a bog\'s edge. Burns hot and fast — the fuel half of black-powder-grade propellant.',
        type: 'material',
        category: 'material',
        subcategory: 'mineral',
        skill: 'mining',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 6,
        icon: '🟡',
        tags: ['mineral', 'fuel', 'propellant', 'chemistry']
    },

    charcoal: {
        id: 'charcoal',
        name: 'Charcoal',
        description: 'Wood charred slow in a sealed kiln. The third leg of propellant and a clean-burning fuel.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'logging',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 4,
        icon: '⚫',
        tags: ['fuel', 'propellant', 'chemistry', 'refined']
    },

    peatMoss: {
        id: 'peatMoss',
        name: 'Peat Moss',
        description: 'Spongy moss pulled from the bog surface. A reagent base and binder for tinctures and compounds.',
        type: 'material',
        category: 'material',
        subcategory: 'herb',
        skill: 'foraging',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: '🌿',
        tags: ['herb', 'reagent', 'chemistry']
    },

    bogMyrtle: {
        id: 'bogMyrtle',
        name: 'Bog Myrtle',
        description: 'A resinous wetland shrub. Its aromatic oils are prized in chemistry for stabilizing volatile mixes.',
        type: 'material',
        category: 'material',
        subcategory: 'herb',
        skill: 'foraging',
        tier: 2,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 7,
        icon: '🍃',
        tags: ['herb', 'reagent', 'chemistry', 'stabilizer']
    },

    rangerPelt: {
        id: 'rangerPelt',
        name: 'Ranger Pelt',
        description: 'A thick, weather-shedding hide from Scoutreach\'s larger game. Supple enough to move in, tough enough for all-terrain ranging gear.',
        type: 'material',
        category: 'material',
        subcategory: 'hide',
        skill: 'hunting',
        tier: 2,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 9,
        icon: '🦫',
        tags: ['hide', 'leather', 'tailoring', 'light-armor']
    },

    // ==========================================
    // TIER 2 — ELARAN SALVAGE (plunder: thieving + combat loot)
    // ==========================================
    scrapAlloy: {
        id: 'scrapAlloy',
        name: 'Scrap Alloy',
        description: 'Light structural alloy stripped from Elaran kit. Reworks easily into plating and casings.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'thieving',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 8,
        icon: '🔩',
        tags: ['salvage', 'metal', 'component', 'smithing', 'tailoring']
    },

    salvagedWiring: {
        id: 'salvagedWiring',
        name: 'Salvaged Wiring',
        description: 'Spools of fine insulated wire pulled from Elaran hardware. Feeds mechanisms and triggers alike.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'thieving',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 9,
        icon: '🧷',
        tags: ['salvage', 'wire', 'component', 'mechanics', 'electronics']
    },

    droneParts: {
        id: 'droneParts',
        name: 'Drone Parts',
        description: 'Servos, linkages and a ruined rotor hub from a downed survey drone. The guts of any home-built mechanism.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'thieving',
        tier: 2,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 12,
        icon: '⚙️',
        tags: ['salvage', 'parts', 'component', 'mechanics']
    },

    powerCell: {
        id: 'powerCell',
        name: 'Power Cell',
        description: 'A still-charged Elaran cell. Dangerous to crack open, invaluable to anyone building tech.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'thieving',
        tier: 2,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 16,
        icon: '🔋',
        tags: ['salvage', 'power', 'component', 'electronics']
    },

    droneDataCore: {
        id: 'droneDataCore',
        name: 'Drone Data Core',
        description: 'A sealed memory core prised from a survey drone. Decoded, it gives up Elaran schematics — the knowledge Unity was never allowed.',
        type: 'material',
        category: 'material',
        subcategory: 'knowledge',
        skill: 'thieving',
        tier: 2,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 40,
        icon: '💾',
        tags: ['salvage', 'knowledge', 'data', 'engineering']
    },

    sixMmCasing: {
        id: 'sixMmCasing',
        name: '6mm Casing',
        description: 'A drawn-brass case sized to the 6mm standard. Prime it, charge it with propellant, seat a slug — a round.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'smithing',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: '🔶',
        tags: ['component', 'ammo', 'casing', 'mechanics', 'smithing']
    },

    gunPropellant: {
        id: 'gunPropellant',
        name: 'Gun Propellant',
        description: 'Milled, corned small-arms powder — niter, sulfur and charcoal in balance. The charge behind every round you load.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'chemistry',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 10,
        icon: '💥',
        tags: ['propellant', 'component', 'chemistry', 'ammo']
    },

    // ==========================================
    // TIER 2 — VERDUUN FOREST + VERDUUN NORTH (war salvage)
    // ==========================================
    verduunHardwood: {
        id: 'verduunHardwood',
        name: 'Verduun Hardwood',
        description: 'Dense, slow-grown timber from the old Unity woods. Harder and heavier than pinewood — good stocks and hafts.',
        type: 'material',
        category: 'material',
        subcategory: 'wood',
        skill: 'logging',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 5,
        icon: '🪵',
        tags: ['wood', 'logging', 'crafting']
    },

    verduunFernshoot: {
        id: 'verduunFernshoot',
        name: 'Verduun Fernshoot',
        description: 'A tender forest fern shoot, faintly sweet. A forage staple of the old Unity woods.',
        type: 'material',
        category: 'material',
        subcategory: 'vegetable',
        skill: 'foraging',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 2,
        icon: '🌱',
        tags: ['vegetable', 'food-ingredient', 'cooking']
    },

    corrodedPlating: {
        id: 'corrodedPlating',
        name: 'Corroded Plating',
        description: 'Armor plate dug from the Verduun trenches, five centuries under dirt. Scoured and re-set, it still turns a blade — the raw stock of heavy armor.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'mining',
        tier: 2,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 11,
        icon: '🛡️',
        tags: ['salvage', 'metal', 'plating', 'smithing', 'tailoring', 'heavy-armor']
    },

    // ==========================================
    // TIER 2 — WEST COAST (saltwater, shoals, dunes)
    // ==========================================
    seaSalt: {
        id: 'seaSalt',
        name: 'Sea Salt',
        description: 'Coarse salt raked from the tidal pans. Cures meat, seasons food, and feeds a dozen chemistries.',
        type: 'material',
        category: 'material',
        subcategory: 'mineral',
        skill: 'mining',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: '🧊',
        tags: ['mineral', 'food-ingredient', 'cooking', 'chemistry']
    },

    saltstone: {
        id: 'saltstone',
        name: 'Saltstone',
        description: 'A hard evaporite block from the dune flats. Ground down, it serves as flux, abrasive and whetstone stock.',
        type: 'material',
        category: 'material',
        subcategory: 'mineral',
        skill: 'mining',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 4,
        icon: '🪨',
        tags: ['mineral', 'smithing', 'abrasive']
    },

    kelpFrond: {
        id: 'kelpFrond',
        name: 'Kelp Frond',
        description: 'A broad ribbon of coastal kelp. Edible, and a useful chemistry base once dried.',
        type: 'material',
        category: 'material',
        subcategory: 'herb',
        skill: 'foraging',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: '🌊',
        tags: ['herb', 'food-ingredient', 'cooking', 'chemistry']
    },

    saltherb: {
        id: 'saltherb',
        name: 'Saltherb',
        description: 'A hardy, salt-tolerant shore herb with a briny bite. A coastal seasoning and poultice green.',
        type: 'material',
        category: 'material',
        subcategory: 'herb',
        skill: 'foraging',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: '🌾',
        tags: ['herb', 'food-ingredient', 'cooking', 'medicine']
    },

    shellfish: {
        id: 'shellfish',
        name: 'Shellfish',
        description: 'Mussels and clams prised from the tidal shoals. The missing ingredient for a proper coastal boil.',
        type: 'material',
        category: 'material',
        subcategory: 'fish',
        skill: 'fishing',
        tier: 2,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 6,
        icon: '🦪',
        tags: ['shellfish', 'food-ingredient', 'cooking']
    },

    driftwood: {
        id: 'driftwood',
        name: 'Driftwood',
        description: 'Sun-bleached wood washed up along the dunes. Dry and light — quick fuel and rough stock.',
        type: 'material',
        category: 'material',
        subcategory: 'wood',
        skill: 'logging',
        tier: 2,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 2,
        icon: '🪵',
        tags: ['wood', 'fuel', 'logging']
    },

    // ==========================================
    // TIER 2 — REVERSE-ENGINEERING SAMPLES (dropped by Elaran grunts)
    // Strip one down (consumed, free) to learn its recipe. Non-instanced so the
    // reverse-engineering flow's item count/consume works by id.
    // ==========================================
    elaranIssuePlate: {
        id: 'elaranIssuePlate',
        name: 'Battered Elaran Plate',
        description: 'A dented chest plate pulled off a downed Elaran grunt. Too damaged to wear, but strip it down and you can learn how it was made.',
        type: 'material',
        category: 'material',
        subcategory: 'salvage',
        skill: 'thieving',
        tier: 2,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 25,
        icon: '🦺',
        reverseEngineerable: true,
        recipeId: 'craftElaranPlate',
        reverseEngineerCost: 0,
        tags: ['salvage', 'reverse-engineer', 'armor', 'heavy-armor']
    },

    elaran6mmDefender: {
        id: 'elaran6mmDefender',
        name: 'Salvaged Elaran Sidearm',
        description: 'A jammed, half-wrecked Elaran pistol chambered in 6mm. It will never fire again — but its workings are a blueprint waiting to be read.',
        type: 'material',
        category: 'material',
        subcategory: 'salvage',
        skill: 'thieving',
        tier: 2,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 35,
        icon: '🔫',
        reverseEngineerable: true,
        recipeId: 'craft6mmDefender',
        reverseEngineerCost: 0,
        tags: ['salvage', 'reverse-engineer', 'weapon', 'firearm']
    },

    elaran6mmRounds: {
        id: 'elaran6mmRounds',
        name: 'Spent 6mm Rounds',
        description: 'A handful of fired and live 6mm cartridges scavenged from a firefight. Pull one apart and you can work out how to load your own.',
        type: 'material',
        category: 'material',
        subcategory: 'salvage',
        skill: 'thieving',
        tier: 2,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 15,
        icon: '🧨',
        reverseEngineerable: true,
        recipeId: 'craft6mmRounds',
        reverseEngineerCost: 0,
        tags: ['salvage', 'reverse-engineer', 'ammo', 'munitions']
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MATERIAL_ITEMS;
}
