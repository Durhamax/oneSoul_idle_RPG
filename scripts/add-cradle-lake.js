/**
 * Add Cradle Lake Shallows node and Solfish item
 */

const fs = require('fs');
const path = require('path');

// Cradle Lake Shallows node CSV row
const cradleLakeNode = [
    '',  // _notes
    'active',  // _status
    '8',  // baseHealth
    '20',  // baseXP
    '["plains","lake","starting_region"]',  // biomes
    'fish_spot',  // category
    '#4A90E2',  // color
    'Shallow waters of Cradle Lake, teeming with solfish',  // description
    '',  // developmentNotes
    '100',  // discoveryWeight
    '',  // exhaustionThreshold
    'fishing',  // harvestSound
    '2.5',  // harvestTime
    '🎣',  // icon
    'cradle_lake_shallows',  // id
    'TRUE',  // implemented
    'TRUE',  // instancedLoot
    'FALSE',  // isExhaustible
    'TRUE',  // isRenewable
    '12',  // maxHealth
    '6',  // minHealth
    'FALSE',  // multiHarvest
    'Cradle Lake Shallows',  // name
    '',  // nextTier
    'fishing',  // nodeType
    'water_ripple',  // particleEffect
    '',  // previousTier
    'cradle_lake_series',  // progressionPath
    '0.02',  // rareBonusPerLevel
    '3',  // rareDropChance
    '',  // rareDropTable
    'common',  // rarity
    '1',  // recommendedLevel
    '1',  // requiredSkillLevel
    '0',  // requirements_characterLevel
    '[]',  // requirements_quests
    'fishing',  // requirements_skill
    '1',  // requirements_skillLevel
    '1',  // requirements_toolTier
    '["fishing_rod"]',  // requirements_tools
    '[{"itemId":"solfish","weight":100,"minYield":1,"maxYield":2,"skillScaling":true}]',  // resourceTable
    '25',  // respawnTime
    '',  // seasonalAvailability
    '',  // spawnConditions
    '100',  // spawnWeight
    '0.02',  // speedBonusPerLevel
    'production',  // status
    '1',  // tier
    'FALSE',  // timeDependent
    "You've discovered a fishing spot in the shallows!",  // unlockMessage
    '2',  // upgradeAmount
    '30',  // upgradeChance
    '1.0',  // version
    'FALSE',  // weatherDependent
    '1',  // xpMultiplier
    'linear',  // xpScaling
    '0.05'  // yieldBonusPerLevel
].join(',');

// Solfish item CSV row
const solfishItem = [
    '',  // _notes
    'active',  // _status
    '',  // _tier
    'material',  // category
    '',  // consumeTime
    '',  // cooldown
    'resources',  // defaultTab
    'A small, silvery fish found in shallow lakes. Common catch for beginners.',  // description
    'Infinity',  // devLimit
    '',  // effectType
    '',  // effectValue
    '',  // effect_attackBuff
    '',  // effect_defenseBuff
    '',  // effect_duration
    '',  // effect_heal
    '',  // effect_regen
    '',  // effect_speedBuff
    '',  // equipSlot
    '1',  // gatherLevel
    'fishing',  // gatherSkill
    '',  // healAmount
    'solfish',  // id
    '🐟',  // image
    '',  // itemType
    '',  // magazineSize
    'Solfish',  // name
    'common',  // rarity
    '',  // reloadTime
    'fish',  // resourceType
    '',  // slot
    '',  // specialAttack_chance
    '',  // specialAttack_damageMultiplier
    '',  // specialAttack_description
    '',  // specialAttack_effect_damagePerTick
    '',  // specialAttack_effect_defenseLoss
    '',  // specialAttack_effect_duration
    '',  // specialAttack_effect_tickInterval
    '',  // specialAttack_effect_type
    '',  // specialAttack_name
    '100',  // stackLimit
    '',  // stats_accuracy
    '',  // stats_armorPenetration
    '',  // stats_armorRatings_airborne
    '',  // stats_armorRatings_biological
    '',  // stats_armorRatings_droid
    '',  // stats_armorRatings_insulated
    '',  // stats_armorRatings_plated
    '',  // stats_attackDamage
    '',  // stats_attackSpeed
    '',  // stats_chopDamage
    '',  // stats_damageType
    '',  // stats_defense
    '',  // stats_digPower
    '',  // stats_fishingPower
    '',  // stats_foragingPower
    '',  // stats_harvestSpeed
    '',  // stats_huntingPower
    '',  // stats_magicPower
    '',  // stats_maxHealth
    '',  // stats_pickaxeDamage
    '',  // stats_range
    '',  // stats_skinningBonus
    '',  // stats_speed
    '',  // stats_thievingPower
    '',  // stats_weight
    '["material","fish","fishing","food"]',  // tags
    '4'  // value
].join(',');

// Append to CSV files
const nodesPath = path.join(__dirname, '../data/csv/nodes.csv');
const itemsPath = path.join(__dirname, '../data/csv/items.csv');

fs.appendFileSync(nodesPath, '\n' + cradleLakeNode);
console.log('✅ Added Cradle Lake Shallows to nodes.csv');

fs.appendFileSync(itemsPath, '\n' + solfishItem);
console.log('✅ Added Solfish to items.csv');

console.log('\n📊 Summary:');
console.log('   Node: Cradle Lake Shallows (fishing, tier 1)');
console.log('   Item: Solfish (100% drop rate)');
