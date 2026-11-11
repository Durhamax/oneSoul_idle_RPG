# Stylesheet Organization

This directory contains all CSS for the Idle RPG game, extracted from the inline `<style>` block in index.html.

## Load Order

The stylesheets are loaded in the following order in index.html:

1. **variables.css** (87 lines) - CSS custom properties (must load first)
2. **global.css** (52 lines) - Global styles, resets, and base typography
3. **components.css** (314 lines) - Reusable UI components
4. **background.css** (126 lines) - Dynamic background system
5. **header.css** (361 lines) - Header and sidebar navigation
6. **layout.css** (382 lines) - Dashboard grid and panel layouts
7. **game-ui.css** (2,179 lines) - Game-specific UI components
8. **modals.css** (2,079 lines) - Modal and panel overlays
9. **developer.css** (1,653 lines) - Developer tools and debug panels

**Total: 7,233 lines of CSS**

## File Descriptions

### variables.css
Contains all CSS custom properties including:
- Color palette (primary, secondary, text, borders, status colors)
- Typography (fonts, sizes, weights, letter-spacing)
- Spacing scale
- Effects (blur, shadows, transitions)
- Border radius values

### global.css
Global baseline styles:
- Box-sizing reset
- Body styles
- Heading defaults
- Typography utility classes
- Color utility classes

### components.css
Reusable component styles:
- Buttons (base, variants, states, shimmer effects)
- Progress bars (with animations)
- Stats display (rows, grids, items)
- Cards (base, headers, titles, body)
- Global container overrides

### background.css
Dynamic background system:
- Background container and layers
- Gradient overlays
- Particle system animations
- Particle type variants (leaves, snow, dust, mist, fog, embers, smoke)

### header.css
Top navigation and sidebar:
- Ultra-compact header (single row, 48px)
- Level display and XP bar
- Activity status
- Currency display
- Vertical sidebar navigation (80px wide)
- Tab notification badges

### layout.css
Page layout and grid systems:
- Main content area with sidebar offset
- Dashboard grid (3-column responsive)
- Panel positioning and sizing
- Overview, skills, equipment, crafting, missions panels
- Bank panel

### game-ui.css
Game-specific UI components:
- Equipment layout (horizontal 4-container)
- Item cards and slots
- XP drops and animations
- Currency flashes
- Level-up effects
- Skill cards
- Perk display
- Combat UI elements
- Navigation components
- Skeleton loaders
- Tooltips
- Rarity-based styling

### modals.css
Modal overlays and panels:
- Weapon build modal
- Item detail modal
- Medal crafting warnings
- Modal animations (slide in/out)
- XP drop effects
- Tooltip styling
- Crafting station modals

### developer.css
Developer tools and debug panels:
- Developer stats panel (5-layer calculation display)
- Harvest stats panel (player vs node resistance)
- Responsive grid adjustments
- Skill card components
- Node panel components
- Health bar segments
- Status indicators

## Architecture Compliance

This modular organization follows the architecture specification requirement for external stylesheets, improving:
- **Maintainability**: Each file has a clear purpose
- **Load Performance**: Browsers can cache individual files
- **Development**: Easier to locate and modify specific styles
- **Collaboration**: Multiple developers can work on different files
