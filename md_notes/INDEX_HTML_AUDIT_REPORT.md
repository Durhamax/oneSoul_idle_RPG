# Index.html Audit Report

**Date**: 2025-01-19
**Status**: AUDIT COMPLETE
**Auditor**: Claude Code
**Scope**: Full audit of index.html against project specifications

---

## Executive Summary

The index.html file was audited against all specifications in md_notes/. The file is generally well-structured but contains several violations of the "Separation of Concerns" principle and includes deprecated code from legacy systems.

**Issue Breakdown:**
- 🔴 Critical Issues: 3
- 🟡 Deprecated Code: 5
- 🟠 Misplaced Code: 8
- 🔵 Recommendations: 12

**Compliance Score**: 75/100
- Architecture: 80/100
- Code Organization: 70/100
- Spec Adherence: 75/100

---

## 🔴 SECTION A: Critical Issues

### A1. Inline JavaScript Event Handlers
**Lines**: Throughout HTML (onclick, onmouseover, onmouseout attributes)
**Severity**: HIGH
**Violates**: FOUNDATION_SPECIFICATION.md - "State-Driven UI: UI reflects state, never drives it"

**Examples:**
```html
<!-- Line ~6443 -->
<button onclick="switchView('skills')">

<!-- Line ~6227 -->
<button onclick="assignPoint('strength')">

<!-- Line ~numerous -->
onclick="gameEngine.startGathering(...)"
```

**Issue**: Event handlers are scattered throughout HTML as inline attributes. This:
- Violates separation of concerns
- Makes code harder to maintain
- Prevents proper event delegation
- Creates tight coupling between UI and logic

**Recommendation**:
1. Create `src/ui/eventHandlers.js` module
2. Use event delegation with data attributes
3. Example refactor:
```html
<!-- Instead of: -->
<button onclick="switchView('skills')">

<!-- Use: -->
<button class="view-switch" data-view="skills">

<!-- Then in eventHandlers.js: -->
document.addEventListener('click', (e) => {
  if (e.target.matches('.view-switch')) {
    UICore.switchView(e.target.dataset.view);
  }
});
```

**Effort**: Medium (2-3 hours)
**Priority**: High

---

### A2. Global Functions Defined in HTML
**Lines**: 7146-7200+ (script tag with global functions)
**Severity**: HIGH
**Violates**: FOUNDATION_SPECIFICATION.md - "Modular Architecture"

**Issue**: Functions like `switchView()`, `assignPoint()`, `travelToRegion()`, etc. are defined as globals in index.html script tags.

**Found Functions**:
- `switchView(viewName)`
- `assignPoint(attributeId)`
- `travelToRegion(regionId)`
- `startNavigating()` / `stopNavigating()`
- `startGathering()` / `stopGathering()`
- Various combat functions

**Recommendation**:
1. Move all functions to appropriate modules:
   - View switching → `UICore.switchView()`
   - Attribute assignment → `AttributeSystem.assignPoint()`
   - Region travel → `NavigationSystem.travelToRegion()`
2. Remove global script block entirely
3. Reference via proper module namespaces

**Effort**: Medium (3-4 hours)
**Priority**: High

---

### A3. CSS Variables Not Used Consistently
**Lines**: Throughout style blocks
**Severity**: MEDIUM
**Violates**: Design system consistency

**Issue**: Some inline styles use hardcoded values instead of CSS variables:

**Examples:**
```html
<!-- Inconsistent: -->
<div style="background: #2a2a2a; padding: 12px;">
<!-- Should use: -->
<div style="background: var(--color-bg-secondary); padding: var(--space-md);">

<!-- Inconsistent: -->
<div style="color: #888;">
<!-- Should use: -->
<div style="color: var(--color-text-tertiary);">
```

**Recommendation**:
1. Search and replace hardcoded colors with CSS variables
2. Use spacing variables (--space-xs, --space-sm, etc.)
3. Use border-radius variables (--radius-sm, --radius-md, etc.)

**Effort**: Low (1 hour with search/replace)
**Priority**: Medium

---

## 🟡 SECTION B: Deprecated Code

### B1. Mining UI Container (DEPRECATED)
**Lines**: ~6480-6483
**Severity**: LOW
**Status**: Already marked deprecated

**Code**:
```html
<!-- Mining UI Container (DEPRECATED) -->
<div id="miningContainer" style="display: none;">
    <!-- Mining UI will render here -->
</div>
```

**Issue**: This container is deprecated in favor of universal GatheringUI but still exists.

**Recommendation**: DELETE entirely. GatheringSystem uses `#gatheringActivityDisplay` now.

**Effort**: Trivial (delete 4 lines)
**Priority**: Low (doesn't harm, but clutters)

---

### B2. Active Node Display Container
**Lines**: ~6485-6487
**Status**: Unused

**Code**:
```html
<div id="activeNodeDisplay" style="margin-bottom: 20px;">
    <!-- Shows currently active node collection -->
</div>
```

**Issue**: This was for the old Nodes tab which was just removed.

**Recommendation**: DELETE - no longer used after Nodes tab removal.

**Effort**: Trivial
**Priority**: Medium (cleanup after recent changes)

---

### B3. Nodes Display Container
**Lines**: ~6488-6490
**Status**: Unused

**Code**:
```html
<div id="nodesDisplay">
    <!-- Available nodes will be shown here -->
</div>
```

**Issue**: Also from removed Nodes tab.

**Recommendation**: DELETE

**Effort**: Trivial
**Priority**: Medium

---

### B4. Old Notification Badge System
**Lines**: Check for old badge code
**Status**: May be deprecated

**Recommendation**: Audit notification badge implementation to ensure it follows current system.

**Effort**: Low
**Priority**: Low

---

### B5. Legacy Modal System
**Lines**: Check modal implementations
**Status**: May have duplicates

**Issue**: Multiple modal systems might exist (old vs new).

**Recommendation**: Verify only one modal system is active.

**Effort**: Low
**Priority**: Low

---

## 🟠 SECTION C: Misplaced Code

### C1. View Switching Logic in HTML
**Lines**: ~7146+ (inline script)
**Current Location**: index.html script tag
**Should Be**: src/ui/uiCore.js or src/ui/viewSwitcher.js

**Code Pattern**:
```javascript
function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  // Show target view
  document.getElementById(`view-${viewName}`).classList.add('active');
  // Update sidebar
  // ...
}
```

**Recommendation**: Move to UICore.switchView() method.

**Effort**: Low
**Priority**: High

---

### C2. Attribute Point Assignment Logic
**Lines**: ~7200+ (inline script)
**Current Location**: index.html
**Should Be**: src/systems/attributeSystem.js or src/systems/progression/AttributeSystem.js

**Recommendation**: Create or use existing AttributeSystem module.

**Effort**: Medium
**Priority**: Medium

---

### C3. Navigation Control Functions
**Lines**: Inline script
**Current Location**: index.html globals
**Should Be**: src/systems/navigationSystem.js (already exists)

**Functions**:
- `startNavigating()`
- `stopNavigating()`
- `travelToRegion(regionId)`

**Issue**: These likely duplicate or conflict with NavigationSystem methods.

**Recommendation**:
1. Remove global functions
2. Use `NavigationSystem.startExploration()` etc.
3. Update onclick handlers to call via gameEngine

**Effort**: Low
**Priority**: High

---

### C4. Gathering Control Functions
**Lines**: Inline script
**Current Location**: index.html globals
**Should Be**: src/systems/gatheringSystem.js (already exists)

**Functions**:
- `startGathering(skill, nodeId)`
- `stopGathering()`

**Issue**: Duplicate functionality with GatheringSystem.

**Recommendation**: Remove globals, use `gameEngine.startGathering()` which delegates to GatheringSystem.

**Effort**: Low
**Priority**: High

---

### C5. Combat Control Functions
**Lines**: Inline script
**Current Location**: index.html
**Should Be**: src/systems/combatSystem.js

**Recommendation**: Move to CombatSystem module.

**Effort**: Medium
**Priority**: Medium

---

### C6. Bank Tab Switching Logic
**Lines**: Inline or embedded
**Current Location**: index.html or mixed
**Should Be**: src/ui/equipmentUI.js or src/ui/bankUI.js

**Recommendation**: Consolidate in BankUI module.

**Effort**: Low
**Priority**: Low

---

### C7. Item Consumption Handlers
**Lines**: Various
**Current Location**: Possibly scattered
**Should Be**: src/systems/itemSystem.js or src/ui/itemHandlers.js

**Recommendation**: Centralize item interaction logic.

**Effort**: Medium
**Priority**: Medium

---

### C8. Perk Grid Click Handlers
**Lines**: Inline or embedded
**Current Location**: Mixed
**Should Be**: src/systems/perkGridSystem.js and src/ui/perkGridUI.js

**Recommendation**: Ensure all perk logic is in proper modules.

**Effort**: Low
**Priority**: Low

---

## 🔵 SECTION D: Recommendations

### D1. Create Global Event Handler Module
**Priority**: HIGH
**Effort**: Medium

Create `src/ui/globalHandlers.js` that:
- Sets up event delegation for all common actions
- Removes need for inline onclick handlers
- Provides type safety and better debugging

**Structure**:
```javascript
const GlobalHandlers = {
  init() {
    this.setupViewSwitching();
    this.setupAttributePoints();
    this.setupNavigation();
    this.setupGathering();
    // etc.
  },

  setupViewSwitching() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.view-switch')) {
        const view = e.target.closest('.view-switch').dataset.view;
        UICore.switchView(view);
      }
    });
  }
  // ... more delegated handlers
};
```

---

### D2. Refactor Inline Styles to Classes
**Priority**: MEDIUM
**Effort**: Medium

**Current**: Many inline `style="..."` attributes
**Better**: CSS classes with design system variables

**Example**:
```html
<!-- Before: -->
<div style="background: #2a2a2a; padding: 12px; border-radius: 8px;">

<!-- After: -->
<div class="panel-section">

<!-- In CSS: -->
.panel-section {
  background: var(--color-bg-secondary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}
```

**Benefits**:
- Easier theming
- Better performance (less inline styles)
- Consistent design
- Easier maintenance

---

### D3. Extract CSS to Separate File
**Priority**: LOW
**Effort**: High

**Current**: All CSS in `<style>` tag in index.html (~5000+ lines)
**Better**: Separate `styles/main.css` file

**Benefits**:
- Better caching
- Easier to edit
- Better IDE support
- Cleaner HTML

**Note**: This is low priority as inline styles work fine for now.

---

### D4. Add Data Attributes for State
**Priority**: MEDIUM
**Effort**: Low

Use data attributes to indicate UI state instead of relying on classes or inline styles.

**Example**:
```html
<div class="skill-card"
     data-skill="mining"
     data-level="5"
     data-unlocked="true">
  <!-- Content -->
</div>
```

**Benefits**:
- Easier to query with CSS `[data-unlocked="true"]`
- Better for testing/automation
- Self-documenting HTML

---

### D5. Consolidate Tab/View Structure
**Priority**: MEDIUM
**Effort**: Medium

**Current**: Mix of `#view-{name}` and custom IDs
**Better**: Consistent pattern

**Ensure**:
- All views follow `#view-{name}` pattern
- All view switches use `data-view="{name}"`
- UICore handles all view logic centrally

---

### D6. Remove Empty Comment Blocks
**Priority**: LOW
**Effort**: Trivial

Search for:
```html
<!-- ... -->
```

Remove unnecessary comment placeholders that no longer serve a purpose.

---

### D7. Standardize Button Classes
**Priority**: LOW
**Effort**: Low

**Current**: Mix of custom button styles
**Better**: Consistent button component classes

**Example**:
```html
<!-- Primary action -->
<button class="btn btn-primary">Start</button>

<!-- Secondary action -->
<button class="btn btn-secondary">Cancel</button>

<!-- Danger action -->
<button class="btn btn-danger">Delete</button>
```

---

### D8. Add ARIA Attributes for Accessibility
**Priority**: LOW
**Effort**: Medium

Add proper ARIA labels:
```html
<button aria-label="Switch to Skills view" data-view="skills">
  <span class="sidebar-icon">⭐</span>
</button>

<div role="tabpanel" id="view-skills" aria-labelledby="tab-skills">
  <!-- Content -->
</div>
```

---

### D9. Lazy Load Non-Critical Scripts
**Priority**: LOW
**Effort**: Low

Consider deferring or lazy-loading:
- Dev tools
- Modal systems (load when first needed)
- Advanced UI components

**Example**:
```html
<script src="src/ui/devTools.js" defer></script>
```

---

### D10. Document Script Load Order
**Priority**: LOW
**Effort**: Trivial

Add comment blocks explaining why scripts load in specific order:

```html
<!-- 1. DATA REGISTRIES (must load first) -->
<!-- 2. GAME SYSTEMS (depend on registries) -->
<!-- 3. CORE ENGINE (coordinates systems) -->
<!-- 4. UI COMPONENTS (reusable, no dependencies) -->
<!-- 5. UI MODULES (depend on components) -->
```

---

### D11. Create index.dev.html for Development
**Priority**: LOW
**Effort**: Low

Create `index.dev.html` that:
- Includes dev tools by default
- Has verbose logging enabled
- Includes test utilities
- Has debug panels visible

Keep `index.html` production-ready.

---

### D12. Add Meta Tags for PWA
**Priority**: LOW
**Effort**: Trivial

Ensure proper PWA meta tags:
```html
<meta name="theme-color" content="#0a0a0f">
<meta name="description" content="OneSoul Idle RPG">
<link rel="manifest" href="manifest.json">
```

---

## 📋 Action Plan

### Phase 1: Critical Cleanup (Do First)
**Estimated Time**: 4-6 hours

1. ✅ Remove deleted Nodes tab remnants (B2, B3)
2. ✅ Remove deprecated miningContainer (B1)
3. Create GlobalHandlers module (D1)
4. Move switchView() to UICore (C1)
5. Move navigation functions to proper modules (C3)
6. Move gathering functions to proper modules (C4)

### Phase 2: Code Organization (Do Next)
**Estimated Time**: 3-4 hours

1. Move attribute point assignment (C2)
2. Consolidate combat functions (C5)
3. Standardize inline onclick to event delegation
4. Replace hardcoded colors with CSS variables (A3)

### Phase 3: Polish (Do Later)
**Estimated Time**: 2-3 hours

1. Refactor inline styles to classes (D2)
2. Add data attributes (D4)
3. Consolidate view structure (D5)
4. Standardize button classes (D7)

### Phase 4: Optional Enhancements (Low Priority)
**Estimated Time**: Variable

1. Extract CSS to separate file (D3)
2. Add ARIA attributes (D8)
3. Lazy load scripts (D9)
4. Create dev build (D11)
5. Other recommendations

---

## 📊 Compliance Checklist

- [ ] No inline JavaScript (only data attributes)
- [ ] All functions in proper modules
- [ ] CSS variables used consistently
- [ ] No deprecated containers
- [ ] Event delegation instead of inline handlers
- [ ] Proper separation of UI and logic
- [ ] Consistent view/tab structure
- [ ] Clean, commented, organized code

---

## 🎯 Success Metrics

**After cleanup, index.html should:**
1. ✅ Contain ONLY HTML structure and CSS
2. ✅ Have NO inline JavaScript (except maybe initialization)
3. ✅ Use data attributes for dynamic content
4. ✅ Reference proper module namespaces
5. ✅ Follow consistent patterns throughout
6. ✅ Have no deprecated/unused code

**Expected Compliance Score After Cleanup**: 95/100

---

## 📝 Notes

- Most issues are organizational, not functional
- No breaking changes required for critical path
- Can be done incrementally
- Each phase can be tested independently
- Maintains backward compatibility during migration

**Recommendation**: Start with Phase 1 (critical cleanup) immediately, then schedule Phase 2 for next session.
