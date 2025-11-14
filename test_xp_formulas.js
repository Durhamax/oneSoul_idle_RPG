/**
 * TEST XP FORMULAS
 *
 * Run this in the browser console to verify the new XP formulas are working correctly
 */

console.log("=== TESTING NEW XP FORMULAS ===\n");

// Test skill XP requirements
console.log("📈 SKILL XP REQUIREMENTS:");
console.log("Formula: baseExp * (scaling ^ (level - 1))");
console.log(`Base: ${GameEngine.gameBalance.skillBaseExpLv1to2} XP`);
console.log(`Scaling: ${GameEngine.gameBalance.skillExpScaling}x\n`);

const testSkillLevels = [1, 2, 3, 5, 10, 20, 50, 100];
for (let level of testSkillLevels) {
    // Temporarily set a test skill to this level
    const originalLevel = GameEngine.state.skills.mining.level;
    GameEngine.state.skills.mining.level = level;

    const xpNeeded = GameEngine.getSkillExpRequired('mining');

    // Restore original level
    GameEngine.state.skills.mining.level = originalLevel;

    console.log(`Level ${level}→${level+1}: ${xpNeeded.toLocaleString()} XP`);
}

console.log("\n🌟 CHARACTER XP REQUIREMENTS:");
console.log("Formula: baseExp * (scaling ^ (level - 1))");
console.log(`Base: ${GameEngine.gameBalance.characterBaseExpLv1to2} XP`);
console.log(`Scaling: ${GameEngine.gameBalance.characterExpScaling}x\n`);

const testCharLevels = [1, 2, 3, 5, 10, 20, 50, 100];
for (let level of testCharLevels) {
    // Temporarily set character to this level
    const originalLevel = GameEngine.state.characterLevel.level;
    GameEngine.state.characterLevel.level = level;

    const xpNeeded = GameEngine.getCharacterExpRequired();

    // Restore original level
    GameEngine.state.characterLevel.level = originalLevel;

    console.log(`Level ${level}→${level+1}: ${xpNeeded.toLocaleString()} XP`);
}

console.log("\n=== TEST COMPLETE ===");
console.log("✅ Endless leveling system is active!");
console.log("💡 Adjust scaling in dev tools on the Skills tab to fine-tune progression");
