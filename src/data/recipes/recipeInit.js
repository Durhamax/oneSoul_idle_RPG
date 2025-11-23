/**
 * RECIPE REGISTRY INITIALIZATION
 */

window.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Initializing Recipe Registry...');

    if (typeof RecipeRegistry === 'undefined') {
        console.error('❌ RecipeRegistry not loaded!');
        return;
    }

    if (typeof GameDefinitions === 'undefined') {
        console.error('❌ GameDefinitions not loaded!');
        return;
    }

    if (GameDefinitions._legacyRecipes && typeof GameDefinitions._legacyRecipes === 'object') {
        console.log('🔄 Migrating legacy recipes from GameDefinitions...');

        let migratedCount = 0;
        for (let recipeId in GameDefinitions._legacyRecipes) {
            if (!RecipeRegistry.production[recipeId]) {
                RecipeRegistry.legacy[recipeId] = GameDefinitions._legacyRecipes[recipeId];
                migratedCount++;
            }
        }

        console.log(`✅ Migrated ${migratedCount} legacy recipes to RecipeRegistry.legacy`);
    }

    RecipeRegistry.printSummary();
    console.log('✅ Recipe Registry Initialized');
});
