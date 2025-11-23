# Claude Code Instructions Template

Copy this template when giving tasks to Claude Code:

---

## 🎯 Task: [DESCRIBE YOUR TASK HERE]

### Foundation Documents
**MANDATORY**: Before implementing ANYTHING, you must:
1. Read `FOUNDATION_SPECIFICATION.md` - This is the authoritative architecture
2. Read `IMPLEMENTATION_GUIDE.md` - This provides concrete examples
3. Read `CURRENT_STATE_SUMMARY.md` - This shows what's broken/working
4. Follow the patterns EXACTLY as specified

### Current State Context
- Navigation UI: ❌ BROKEN (blank display)
- Gathering System: ❌ BROKEN (nodes show depleted)
- Combat System: ✅ Working
- Equipment System: ✅ Working (migration fix needs testing)
- Registry Migration: ✅ Complete for main systems

### Implementation Requirements
When implementing this task, you MUST:
- Follow the directory structure in FOUNDATION_SPECIFICATION.md
- Use the Registry pattern for ALL data
- Keep systems stateless (no stored state in systems)
- Use EventBus for system communication
- Handle all errors as specified
- Maintain performance budgets (<10ms tick, <16ms render)
- Make everything mobile-responsive

### Code Patterns to Follow
```javascript
// ✅ CORRECT Registry Usage
const item = ItemRegistry.get(itemId);
if (!item) {
    console.error(`[SystemName] Item not found: ${itemId}`);
    return null;
}

// ✅ CORRECT System Pattern
const SystemName = {
    init(engine) {
        engine.methodName = this.methodName.bind(engine);
        EventBus.on('event', this.handleEvent);
    },
    
    methodName() {
        // Access state via this.state
        // Emit events, don't call other systems
    }
};

// ✅ CORRECT UI Pattern
class UIComponent {
    shouldUpdate(newState) {
        return JSON.stringify(newState) !== this.lastState;
    }
    
    render(state) {
        if (!this.shouldUpdate(state)) return;
        // Render logic
    }
}
```

### Testing Requirements
After implementation:
1. Run validation: `validateImplementation()` in console
2. Check no console errors
3. Verify performance: tick < 10ms
4. Test on mobile viewport
5. Ensure save/load still works

### Specific Task Instructions
[ADD YOUR SPECIFIC REQUIREMENTS HERE]

### Expected Outcome
[DESCRIBE WHAT SUCCESS LOOKS LIKE]

### Files to Modify
[LIST SPECIFIC FILES THAT NEED CHANGES]

---

Remember: The FOUNDATION_SPECIFICATION.md is the SINGLE SOURCE OF TRUTH. Any code that doesn't follow it must be refactored to comply.
