# Unified Crafting UI Design

## 🎯 Design Philosophy
Following the successful Combat UI pattern: A single "Crafting" view with tab navigation that contains ALL crafting-related functionality.

## 📐 Proposed Structure

### Main Navigation Change
**Current:** Skills Tab (crafting recipes) + Tech Tab (workstations/engineering)  
**Proposed:** Single "🔨 CRAFTING" sidebar button → Unified crafting interface

## 🗂️ Three-Tab Layout (Similar to Combat UI)

### Tab 1: "📜 RECIPES" (Default/Primary Tab)
**Purpose:** Main crafting interface - where players spend most time

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [Skill Selector - Horizontal Pills]                      │
│ Smithing | Mechanics | Electronics | Tailoring | Chem... │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐    [Active Queue - Right Sidebar]  │
│  │  Recipe Card 1   │    ┌────────────────────┐         │
│  │  ─────────────   │    │ SMITHING QUEUE     │         │
│  │  Materials:      │    │ ▓▓▓▓▓▓▓░░░ 75%     │         │
│  │  • Copper x3 ✓   │    │ Bronze Ingot       │         │
│  │  • Coal x1 ✗     │    │                    │         │
│  │  [Craft] [x10]   │    │ MECHANICS QUEUE    │         │
│  └─────────────────┘    │ ▓▓░░░░░░░░ 20%     │         │
│                          │ Steel Gear          │         │
│  ┌─────────────────┐    │                    │         │
│  │  Recipe Card 2   │    │ CHEMISTRY QUEUE    │         │
│  │  ...              │    │ [Empty]            │         │
│  └─────────────────┘    └────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Skill pills at top (highlight active skill)
- Recipe grid (3-4 columns) 
- Material availability indicators (✓/✗)
- Quick craft buttons (x1, x5, x10, Max)
- Active queue sidebar showing ALL skills (not just current)
- Locked recipes shown but grayed out with requirements

### Tab 2: "🏭 WORKSHOP" 
**Purpose:** Workstation management and upgrades

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                    WORKSTATION OVERVIEW                   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  SMITHING    │  │  MECHANICS   │  │ ELECTRONICS  │  │
│  │  Tier 2/5    │  │  Tier 1/5    │  │  Tier 1/5    │  │
│  │  ──────────  │  │  ──────────  │  │  ──────────  │  │
│  │  Benefits:   │  │  Benefits:   │  │  Benefits:   │  │
│  │  +10% Rarity │  │  Base Stats  │  │  Base Stats  │  │
│  │  +10% Speed  │  │              │  │              │  │
│  │  ──────────  │  │  ──────────  │  │  ──────────  │  │
│  │  Next: T3    │  │  Next: T2    │  │  Next: T2    │  │
│  │  Cost:       │  │  Cost:       │  │  Locked:     │  │
│  │  5 Adv BP    │  │  3 Com BP    │  │  Eng Lvl 20  │  │
│  │  [UPGRADE]   │  │  [UPGRADE]   │  │  [────────]  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  TAILORING   │  │  CHEMISTRY   │  │   COOKING    │  │
│  │  ...         │  │  ...         │  │   ...        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  Blueprint Inventory: Common: 12 | Advanced: 3 | Master: 0│
└─────────────────────────────────────────────────────────┘
```

**Features:**
- All 6 workstations as large cards
- Current tier and max tier display
- Active benefits clearly listed
- Upgrade requirements (blueprints + engineering level)
- Visual progress bar toward next tier
- Blueprint inventory at bottom

### Tab 3: "⚙️ ENGINEERING"
**Purpose:** Advanced features - perfection, technology assembly, salvaging

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                 ENGINEERING LAB (Level 25)                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────┐  ┌───────────────────────┐ │
│  │   EQUIPMENT PERFECTION   │  │  TECHNOLOGY ASSEMBLY  │ │
│  │  ───────────────────    │  │  ──────────────────  │ │
│  │  Combine 10 → 1 Higher  │  │  Create Tech Items    │ │
│  │                         │  │                       │ │
│  │  Success Rate: 45%      │  │  Available: 3         │ │
│  │  (+2.5% from Eng)       │  │                       │ │
│  │                         │  │  • Recon Drone        │ │
│  │  [SELECT ITEMS]         │  │  • Shield Generator   │ │
│  └─────────────────────────┘  │  • Stim Injector      │ │
│                                │                       │ │
│  ┌─────────────────────────┐  │  [VIEW RECIPES]       │ │
│  │      SALVAGING          │  └───────────────────────┘ │
│  │  ───────────────────    │                           │
│  │  Recover Materials      │  Engineering Statistics:   │
│  │  Recovery: 25-50%       │  • Perfections: 12/45     │
│  │                         │  • Technologies: 8        │
│  │  [SELECT ITEM]          │  • Materials Saved: 2.4k  │
│  └─────────────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Engineering level prominently displayed
- Three action panels: Perfection, Assembly, Salvage
- Success rates with bonuses shown
- Statistics tracking
- Clean, advanced-feature feel

## 🎨 Visual Design Principles

### Consistent with Combat UI
- Dark theme with skill-colored accents
- Tab navigation at top of content area
- Active tab highlighted (blue glow)
- Smooth transitions between tabs
- Cards with hover effects

### Skill Color Coding
```css
--smithing-color: #8B4513;    /* Brown - earthy metals */
--mechanics-color: #708090;   /* Steel gray */
--electronics-color: #00CED1; /* Electric cyan */
--tailoring-color: #8B008B;   /* Deep purple */
--chemistry-color: #32CD32;   /* Lime green */
--cooking-color: #FF6347;     /* Tomato red */
```

### Information Hierarchy
1. **Primary:** What can I craft now? (Recipes tab)
2. **Secondary:** How can I improve? (Workshop tab)
3. **Tertiary:** Advanced optimization (Engineering tab)

## 🔄 Migration Path

### Phase 1: Create New Unified UI
1. Create `/src/ui/crafting/UnifiedCraftingUI.js`
2. Create sub-components:
   - `/src/ui/crafting/RecipesTab.js`
   - `/src/ui/crafting/WorkshopTab.js`
   - `/src/ui/crafting/EngineeringTab.js`
   - `/src/ui/crafting/CraftQueue.js`

### Phase 2: Data Consolidation
- Move workstation data from Tech tab
- Move recipe display from Skills tab
- Consolidate engineering features

### Phase 3: Remove Old UI
- Deprecate crafting buttons in Skills tab
- Remove workstation info from Tech tab
- Skills tab becomes pure skill progression display

## 📊 Benefits of Unification

### User Experience
- **One-stop shop** for all crafting needs
- **Reduced clicks** - no jumping between tabs
- **Better context** - see workstation tier while crafting
- **Queue visibility** - always see what's crafting across all skills

### Code Benefits
- **Single state manager** for crafting UI
- **Reusable components** (queue display, recipe cards)
- **Cleaner separation** from skills system
- **Similar pattern** to successful Combat UI

### Information Architecture
- **Logical grouping** - all crafting together
- **Progressive disclosure** - basic → advanced features
- **Clear mental model** - "Crafting" = everything about making items

## 🚀 Implementation Priority

1. **Start with Recipes Tab** - Core functionality
2. **Add Workshop Tab** - Important progression info  
3. **Add Engineering Tab** - Advanced features
4. **Polish animations** - Queue progress, crafting effects
5. **Add keyboard shortcuts** - Quick craft, tab switching

## 💭 Alternative Considerations

### Alternative 1: Skill-Based Tabs
Instead of Recipes/Workshop/Engineering, have one tab per crafting skill:
- ❌ Too many tabs (6+)
- ❌ Hides cross-skill queue status
- ❌ Where does Engineering go?

### Alternative 2: Single Page, No Tabs
Everything on one scrollable page:
- ❌ Information overload
- ❌ Difficult to focus on task
- ✅ Could work with collapsible sections

### Alternative 3: Modal-Based
Keep current system but improve modals:
- ❌ Maintains fragmentation
- ❌ More clicks required
- ❌ Harder to see overall status

## 📝 Conclusion

The three-tab unified crafting UI provides:
1. **Clean organization** matching successful Combat UI pattern
2. **Task-focused tabs** (craft/upgrade/optimize)
3. **Persistent queue visibility**
4. **Natural progression** from basic to advanced
5. **Extensible structure** for future features

This design consolidates all crafting-related features while maintaining clarity and following established UI patterns in your game.