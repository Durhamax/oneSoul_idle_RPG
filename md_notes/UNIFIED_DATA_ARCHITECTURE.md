# Unified Data Architecture

## Why This Architecture?

### The Problem With the Old Approach

Previously, all game data was defined in ONE giant file (`definitions.js` - 8400+ lines):

```javascript
const GameDefinitions = {
    items: { sword: {...}, shield: {...}, ... },      // 3000 lines
    enemies: { goblin: {...}, orc: {...}, ... },      // 2000 lines
    missions: { quest1: {...}, quest2: {...}, ... },  // 1500 lines
    recipes: { recipe1: {...}, recipe2: {...}, ... }  // 1600 lines
};
```

**Problems:**
- ❌ Massive files (impossible to navigate)
- ❌ No modularity (can't split by category)
- ❌ No environment separation (production/dev/test mixed together)
- ❌ No validation (typos only found at runtime)
- ❌ Merge conflicts (multiple developers editing same file)
- ❌ Can't hot-reload (need full page refresh)
- ❌ Memory inefficient (loads everything even if not needed)

### The Solution: Registry Pattern

The Registry Pattern is **industry-standard** (used by Unity, Unreal, WoW, Factorio) and solves all these problems:

```javascript
// Modular registry system
const ItemRegistry = {
    production: {},  // Real game items
    dev: {},         // Development items
    test: {},        // Test items
    legacy: {},      // Backwards compatibility
    planned: {}      // Documentation
};

// Dynamic getter
Object.defineProperty(GameDefinitions, 'items', {
    get() {
        return ItemRegistry.getAllActive();  // Returns only what's configured
    }
});
```

**Benefits:**
- ✅ Modular files (100-200 lines each, easy to navigate)
- ✅ Environment separation (production excludes dev/test items)
- ✅ Schema validation (catches errors on load)
- ✅ No merge conflicts (separate files per category)
- ✅ Hot-reload capable (future feature)
- ✅ Memory efficient (load only what's needed)
- ✅ Dynamic at runtime (can add/remove items on the fly)

## Overview

This document defines the **standard architecture pattern** for ALL game data in OneSoul Idle RPG. Every entity type (Items, Nodes, Enemies, Missions, Regions, Skills, Recipes) follows the same consistent pattern.

## Architecture Principles

### 1. Single Source of Truth
- Each entity type has ONE registry
- All data flows through the registry
- No duplicate definitions

### 2. Environment Separation
- `production`: Real game content (always active)
- `dev`: Development/testing content (toggleable)
- `test`: Temporary test content (toggleable)
- `legacy`: Deprecated content (backwards compatibility)
- `planned`: Future content (documentation only)

### 3. Schema Validation
- Every entity has a schema definition
- Validation on registration
- Clear error messages

### 4. Dynamic Getters
- `GameDefinitions.{entityType}` is a getter, not static object
- Always returns `{EntityType}Registry.getAllActive()`
- Backwards compatible with existing code

### 5. Consistent File Structure
```
src/data/{entityType}/
├── {entityType}Registry.js       # Core registry
├── {entityType}Schema.js         # Validation schema
├── {entityType}Validator.js      # Validation logic
├── {entityType}Utils.js          # Helper utilities
├── {entityType}Init.js           # Initialization
└── production/
    ├── {category1}.js
    ├── {category2}.js
    └── ...
```

## Standard Registry Template

Every registry follows this exact pattern:

```javascript
/**
 * {ENTITY_TYPE} REGISTRY
 *
 * Multi-environment organization system for {entity_type}s
 */

const {EntityType}Registry = {
    // Environment Registries
    production: {},  // Real game content (active)
    dev: {},         // Development content
    test: {},        // Temporary test content
    legacy: {},      // Deprecated content
    planned: {},     // Future content (docs)

    // Configuration
    config: {
        includeDev{EntityType}s: false,
        includeTest{EntityType}s: false,
        includeLegacy{EntityType}s: true,
        includePlanned{EntityType}s: false,
    },

    /**
     * Register {entity_type}s to a specific registry
     */
    register(registry, {entityType}s) {
        if (!this.hasOwnProperty(registry)) {
            console.error(`❌ Invalid registry: ${registry}`);
            return;
        }

        this[registry] = {
            ...this[registry],
            ...{entityType}s,
        };

        console.log(`📦 Registered ${Object.keys({entityType}s).length} {entity_type}s to ${registry} registry`);
    },

    /**
     * Get all active {entity_type}s based on config
     */
    getAllActive() {
        let combined = {
            ...this.production,  // Always include production
        };

        if (this.config.includeDev{EntityType}s) {
            combined = { ...combined, ...this.dev };
        }

        if (this.config.includeTest{EntityType}s) {
            combined = { ...combined, ...this.test };
        }

        if (this.config.includeLegacy{EntityType}s) {
            combined = { ...combined, ...this.legacy };
        }

        if (this.config.includePlanned{EntityType}s) {
            combined = { ...combined, ...this.planned };
        }

        return combined;
    },

    /**
     * Get specific {entity_type} by ID
     */
    get({entityType}Id) {
        const all = this.getAllActive();
        return all[{entityType}Id] || null;
    },

    /**
     * Check if {entity_type} exists
     */
    has({entityType}Id) {
        return this.get({entityType}Id) !== null;
    },

    /**
     * Get {entity_type}s by environment
     */
    getByStatus(status) {
        if (!this.hasOwnProperty(status)) {
            console.error(`❌ Invalid status: ${status}`);
            return {};
        }
        return { ...this[status] };
    },

    /**
     * Get statistics
     */
    getStatistics() {
        const stats = {
            production: Object.keys(this.production).length,
            dev: Object.keys(this.dev).length,
            test: Object.keys(this.test).length,
            legacy: Object.keys(this.legacy).length,
            planned: Object.keys(this.planned).length,
            total: 0
        };

        stats.total = stats.production + stats.dev + stats.test + stats.legacy + stats.planned;
        return stats;
    },

    /**
     * Print summary
     */
    printSummary() {
        const stats = this.getStatistics();
        console.log(`📊 {EntityType} Registry Summary:`);
        console.log(`   Production: ${stats.production}`);
        console.log(`   Dev: ${stats.dev}`);
        console.log(`   Test: ${stats.test}`);
        console.log(`   Legacy: ${stats.legacy}`);
        console.log(`   Planned: ${stats.planned}`);
        console.log(`   TOTAL: ${stats.total} {entity_type}s`);
    }
};
```

## Standard Initialization Template

Every entity type has an init file:

```javascript
/**
 * {ENTITY_TYPE} INITIALIZATION
 *
 * Initializes the {EntityType}Registry and migrates legacy data
 */

window.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Initializing {EntityType} Registry...');

    if (typeof {EntityType}Registry === 'undefined') {
        console.error('❌ {EntityType}Registry not loaded!');
        return;
    }

    if (typeof GameDefinitions === 'undefined') {
        console.error('❌ GameDefinitions not loaded!');
        return;
    }

    // Migrate legacy data from GameDefinitions._legacy{EntityType}s
    if (GameDefinitions._legacy{EntityType}s && typeof GameDefinitions._legacy{EntityType}s === 'object') {
        console.log('🔄 Migrating legacy {entity_type}s from GameDefinitions...');

        let migratedCount = 0;
        for (let {entityType}Id in GameDefinitions._legacy{EntityType}s) {
            // Only migrate if not already in production
            if (!{EntityType}Registry.production[{entityType}Id]) {
                {EntityType}Registry.legacy[{entityType}Id] = GameDefinitions._legacy{EntityType}s[{entityType}Id];
                migratedCount++;
            }
        }

        console.log(`✅ Migrated ${migratedCount} legacy {entity_type}s to {EntityType}Registry.legacy`);
    }

    // Validate all {entity_type}s (if validator exists)
    if (typeof {EntityType}Validator !== 'undefined') {
        const validation = {EntityType}Validator.validateAll({EntityType}Registry);

        if (validation.invalid > 0) {
            console.error(`❌ Found ${validation.invalid} invalid {entity_type}s`);
        }

        if (validation.warnings > 0) {
            console.warn(`⚠️  Found ${validation.warnings} {entity_type} warnings`);
        }
    }

    // Print statistics
    {EntityType}Registry.printSummary();

    console.log('✅ {EntityType} Registry Initialized');
});
```

## GameDefinitions Dynamic Getter Template

In `definitions.js`, after the closing of the main object:

```javascript
// Track if legacy {entity_type}s have been migrated
let _legacy{EntityType}sMigrated = false;

// Define dynamic getter for {entity_type}s property
Object.defineProperty(GameDefinitions, '{entityType}s', {
    get() {
        // On first access, migrate legacy {entity_type}s to {EntityType}Registry
        if (!_legacy{EntityType}sMigrated && typeof {EntityType}Registry !== 'undefined') {
            console.log('🔄 Migrating legacy {entity_type}s from GameDefinitions to {EntityType}Registry...');

            let migratedCount = 0;
            for (let {entityType}Id in this._legacy{EntityType}s) {
                // Only add to legacy if not already in production
                if (!{EntityType}Registry.production[{entityType}Id]) {
                    {EntityType}Registry.legacy[{entityType}Id] = this._legacy{EntityType}s[{entityType}Id];
                    migratedCount++;
                }
            }

            _legacy{EntityType}sMigrated = true;
            console.log(`✅ Migrated ${migratedCount} legacy {entity_type}s to {EntityType}Registry.legacy`);
        }

        // Return all active {entity_type}s from {EntityType}Registry
        if (typeof {EntityType}Registry !== 'undefined') {
            return {EntityType}Registry.getAllActive();
        }

        // Fallback: return legacy {entity_type}s if {EntityType}Registry not loaded yet
        console.warn('⚠️  {EntityType}Registry not available, using legacy {entity_type}s');
        return this._legacy{EntityType}s;
    },

    // Allow setting (for backwards compatibility, but log a warning)
    set(value) {
        console.warn('⚠️  Direct assignment to GameDefinitions.{entityType}s is deprecated.');
        console.warn('   Use {EntityType}Registry.production[{entityType}Id] = {...} instead');
    },

    enumerable: true,
    configurable: false
});
```

## Complete Implementation Checklist

For each entity type, create these files:

### 1. Registry File
- [ ] `src/data/{entityType}/{entityType}Registry.js`
- Implements: register(), getAllActive(), get(), has(), getByStatus(), getStatistics(), printSummary()

### 2. Schema File
- [ ] `src/data/{entityType}/{entityType}Schema.js`
- Defines: Required fields, optional fields, field types, validation rules

### 3. Validator File
- [ ] `src/data/{entityType}/{entityType}Validator.js`
- Implements: validate({entityType}), validateAll(registry), printValidationReport()

### 4. Utils File
- [ ] `src/data/{entityType}/{entityType}Utils.js`
- Implements: Helper functions specific to this entity type

### 5. Init File
- [ ] `src/data/{entityType}/{entityType}Init.js`
- Runs on DOMContentLoaded: migrates legacy data, validates, prints summary

### 6. Production Data Files
- [ ] `src/data/{entityType}/production/{category}.js`
- Registers data: `{EntityType}Registry.production.{id} = {...}`

### 7. Update definitions.js
- [ ] Rename `{entityType}s:` to `_legacy{EntityType}s:`
- [ ] Add dynamic getter using Object.defineProperty()

### 8. Update index.html
- [ ] Add script tags in correct order:
  1. {entityType}Schema.js
  2. {entityType}Registry.js
  3. {entityType}Utils.js
  4. {entityType}Validator.js
  5. Production data files
  6. {entityType}Init.js (before gameEngine.js)

## Load Order Pattern

Standard load order in index.html:

```html
<!-- {EntityType} System -->
<script src="src/data/{entityType}/{entityType}Schema.js"></script>
<script src="src/data/{entityType}/{entityType}Registry.js"></script>
<script src="src/data/{entityType}/{entityType}Utils.js"></script>
<script src="src/data/{entityType}/{entityType}Validator.js"></script>

<!-- {EntityType} Data -->
<script src="src/data/{entityType}/production/{category1}.js"></script>
<script src="src/data/{entityType}/production/{category2}.js"></script>

<!-- {EntityType} Initialization (must be before gameEngine.js) -->
<script src="src/data/{entityType}/{entityType}Init.js"></script>
```

## Entity Types to Implement

| Entity Type | Priority | Status |
|-------------|----------|--------|
| Items | High | ✅ Complete |
| Nodes | High | ✅ Complete |
| Enemies | High | ✅ Complete |
| Missions | High | 🔄 To implement |
| Regions | Medium | 🔄 To implement |
| Skills | Medium | 🔄 To implement |
| Recipes | Medium | 🔄 To implement |
| Incursions | Low | 📋 Planned |
| Events | Low | 📋 Planned |

## Benefits of Unified Architecture

### 1. Consistency
- Every developer knows exactly where to find/add data
- Same patterns across all entity types
- Reduced cognitive load

### 2. Maintainability
- Modular file structure (not one giant file)
- Clear separation of concerns
- Easy to locate and fix bugs

### 3. Extensibility
- Easy to add new entity types
- Environment separation enables A/B testing
- Hot-reload capability (future)

### 4. Performance
- Lazy loading possible (future optimization)
- Memory efficient (load only what's needed)
- Caching strategies (future optimization)

### 5. Developer Experience
- Schema validation catches errors early
- Console utilities for debugging
- Clear documentation pattern

### 6. Backwards Compatibility
- Existing code continues to work
- Legacy data preserved
- Gradual migration path

## Migration Strategy

### Phase 1: High Priority (Immediate)
1. ✅ Items (Complete)
2. ✅ Nodes (Complete)
3. 🔄 Enemies (Next)
4. 🔄 Missions (Next)

### Phase 2: Medium Priority
5. Regions
6. Skills
7. Recipes

### Phase 3: Low Priority
8. Incursions (if needed)
9. Events (if needed)

### Phase 4: Optimization
- Implement lazy loading
- Add hot-reload capability
- Performance profiling
- Memory optimization

## Example: Full Implementation

See `ITEM_REGISTRY_ARCHITECTURE.md` for a complete, working example of this pattern applied to Items.

See `NODE_ITEM_ARCHITECTURE.md` for node-specific architecture details.

## Console Debugging

Standard console utilities for each entity type:

```javascript
// In browser console:
{EntityType}Registry.printSummary()
{EntityType}Registry.getStatistics()
{EntityType}Registry.get('{entityType}Id')
{EntityType}Registry.getAllActive()
GameDefinitions.{entityType}s  // Dynamic getter
```

## Questions & Answers

**Q: Why not use a database?**
A: For a client-side game, flat files with runtime registries are:
- Faster (no query overhead)
- Simpler (no database dependencies)
- Easier to version control
- Better for modding

**Q: Why not JSON files?**
A: JavaScript files allow:
- Comments and documentation
- Code reuse (shared constants)
- IDE autocomplete
- Type checking (with JSDoc)

**Q: What about save file compatibility?**
A: Legacy registries maintain old IDs for backwards compatibility with saves.

**Q: How do I add a new entity type?**
A: Follow the checklist above. Use Items or Nodes as reference implementation.

## Reference Implementations

- **Items**: See `src/data/items/` - Complete implementation
- **Nodes**: See `src/data/nodes/` - Complete implementation
- **Future**: Enemies, Missions, Regions will follow same pattern
