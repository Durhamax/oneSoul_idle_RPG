# Example Claude Code Prompt: Fix Navigation UI

This is an example of how to use the foundation documents when giving tasks to Claude Code.

---

## 🎯 Task: Fix the Broken Navigation UI System

### Foundation Documents
**MANDATORY**: Before implementing ANYTHING, you must:
1. Read `FOUNDATION_SPECIFICATION.md` - This is the authoritative architecture
2. Read `IMPLEMENTATION_GUIDE.md` - This provides concrete examples (see "Fix Navigation UI" section)
3. Read `CURRENT_STATE_SUMMARY.md` - Shows Navigation UI is currently BROKEN (blank display)
4. Read `GAME_CONTEXT.md` - Shows how Navigation worked in v1.9

### Current State Context
The Navigation UI is completely broken after the directory cleanup performed on 2025-01-19:
- **Problem**: Navigation tab shows empty/blank display
- **When it broke**: After removing 10 duplicate files and cleaning directories
- **Last working**: v1.9 had blue borders, animated footsteps, endurance bar

Working reference systems you can examine:
- `combatUI.js` - ✅ Working UI pattern
- `equipmentUI.js` - ✅ Working state caching pattern

### Implementation Requirements
Fix the Navigation UI following these requirements:

1. **Debug the current failure**:
   - Add console logging to identify where rendering fails
   - Check if WorldTilemap is loaded
   - Verify MapGridSystem initialization
   - Check if the cleanup removed critical dependencies

2. **Restore functionality**:
   - Navigation map should show hexagonal tiles
   - Current region should have blue border with glow effect
   - Endurance bar should show "Exploring" or "🔋 Resting" based on state
   - Clicking regions should trigger travel if valid path exists
   - Animated footsteps (👣) should appear during active navigation

3. **Follow the correct patterns**:
   ```javascript
   // Use state caching pattern from FOUNDATION_SPECIFICATION.md
   const NavigationView = {
       lastState: null,
       
       render() {
           const currentState = {
               regions: GameEngine.state.regions,
               currentRegion: GameEngine.state.currentRegion,
               endurance: GameEngine.state.activeNavigation.endurance
           };
           
           if (JSON.stringify(currentState) === this.lastState) return;
           
           // Render logic here
           this.lastState = JSON.stringify(currentState);
       }
   };
   ```

4. **Ensure proper error handling**:
   ```javascript
   // Check all dependencies exist
   if (typeof WorldTilemap === 'undefined') {
       console.error('[NavigationUI] WorldTilemap not loaded!');
       return;
   }
   
   // Handle missing DOM elements
   const container = document.getElementById('navigation-container');
   if (!container) {
       console.error('[NavigationView] Container not found');
       return;
   }
   ```

### Testing Requirements
After fixing, verify:
1. Run in console: `NavigationSystem.getAdjacentRegions()`
2. Check map renders with all 80 tiles from WorldTilemap
3. Click a region to test travel
4. Verify endurance bar depletes during exploration
5. Check animated footsteps appear
6. No console errors
7. Performance: Render time < 16ms

### Specific Task Instructions
1. Start by examining `src/ui/navigationUI.js`
2. Check load order in `index.html` - ensure all dependencies load before navigationUI
3. Verify `src/data/worldTilemap.js` is loaded and contains 80 tiles
4. Fix any missing references caused by the file cleanup
5. Implement proper state caching as shown in pattern
6. Test all navigation features work

### Expected Outcome
- Navigation tab shows hexagonal world map
- 80 tiles displayed (matching WorldTilemap)
- Current region highlighted with blue glow
- Adjacent regions show as explorable (yellow border)
- Clicking valid regions triggers travel
- Endurance bar works during exploration
- No console errors
- Follows all patterns from FOUNDATION_SPECIFICATION.md

### Files to Modify
- `src/ui/navigationUI.js` - Main UI file to fix
- `src/systems/navigationSystem.js` - May need to verify system methods work
- `index.html` - Check script load order if dependencies missing

### Additional Context
The navigation system was working perfectly in v1.9 with these features:
- Blue gradient endurance bar
- Region tiles with status badges
- Mission requirement indicators
- Animated footsteps during exploration

Reference the v1.9 implementation patterns but update to follow FOUNDATION_SPECIFICATION.md patterns.

---

Remember: The FOUNDATION_SPECIFICATION.md is the SINGLE SOURCE OF TRUTH. The navigation UI must be refactored to comply with the specified patterns, not just patched to work.
