# oneSoul Idle RPG

A browser-based idle RPG featuring hex-grid exploration, global discovery mechanics, and strategic progression systems.

## Features

### Core Gameplay
- **Hex Grid World Map**: Explore a procedurally generated world with 127+ unique regions
- **Global Discovery System**: Resource nodes and enemies discovered in any region become globally accessible with stackable health bonuses (+10 health per region)
- **Multi-Skill Progression**: Level up skills including Mining, Logging, Fishing, Foraging, Hunting, Thieving, Combat, and Navigation
- **Strategic Combat**: Turn-based combat with equipment, perks, and type effectiveness system

### Exploration & Discovery
- **Region-Based Exploration**: Each region has unique biomes, enemies, and resources
- **Navigation System**: Unlock new regions by meeting navigation level requirements
- **Rest/Recovery Mechanic**: Sustain exploration by consuming food and logs
- **Mission System**: Complete region-specific quests for rewards

### Character Progression
- **Equipment System**: Equip weapons, armor, and accessories with various stats
- **Perk Grid**: Unlock and allocate perks for permanent bonuses
- **Skill Leveling**: Gain experience through activities to unlock new content
- **Enhancement System**: Upgrade equipment for increased power

### Crafting & Economy
- **Crafting System**: Create equipment, consumables, and tools
- **Engineering System**: Advanced crafting with medal requirements
- **Medal Crafting**: Create special medals that unlock unique crafting recipes
- **Resource Management**: Harvest, store, and utilize diverse materials

### Quality of Life
- **Auto-Save**: Progress automatically saves to browser localStorage
- **Offline Progress**: Combat continues while you're away
- **Developer Tools**: Built-in tools for testing and debugging (accessible via Developer tab)
- **Migration System**: Automatic save data migration for backward compatibility

## How to Play

### Getting Started
1. Open `index.html` in a modern web browser
2. Start in the tutorial region at coordinates (-3, -4)
3. Complete the tutorial mission to unlock exploration
4. Begin harvesting resources and fighting enemies

### Navigation
- Click on hex tiles in the World Map to view region details
- Click "Travel Here" to move to adjacent discovered regions
- Use "Start Exploring" to discover resources and enemies in your current region
- Higher Navigation levels unlock access to distant regions

### Combat
- Navigate to the Combat tab
- Select an enemy from discovered enemies
- Click "Start Combat" to begin automatic turn-based combat
- Equip better gear to defeat stronger enemies

### Skills
- Harvest resource nodes to gain skill experience
- Each skill level unlocks access to new nodes and content
- Skills: Mining, Logging, Fishing, Foraging, Hunting, Thieving, Combat, Navigation

### Progression Path
1. Harvest basic resources (logs, fish, herbs)
2. Craft basic equipment
3. Fight low-level enemies
4. Discover new regions
5. Unlock advanced crafting
6. Challenge stronger enemies
7. Complete missions for rewards

## Technical Details

### File Structure
```
oneSoul_idle_RPG/
├── index.html              # Main game file
├── src/
│   ├── core/               # Game engine and definitions
│   ├── systems/            # Game systems (combat, crafting, navigation, etc.)
│   ├── ui/                 # User interface components
│   ├── data/               # Item and node data definitions
│   └── utils/              # Utility functions
└── assets/                 # Images and backgrounds
```

### Key Systems
- **gameEngine.js**: Core game loop and state management
- **globalDiscoverySystem.js**: Manages globally accessible nodes/enemies
- **navigationSystem.js**: Handles region exploration and discovery
- **combatSystem.js**: Turn-based combat mechanics
- **craftingSystem.js**: Item creation system
- **perkGridSystem.js**: Skill tree management
- **migrationSystem.js**: Save data versioning and migration

### Technology Stack
- Pure JavaScript (ES6+)
- HTML5
- CSS3
- No external dependencies or frameworks
- Client-side only (runs entirely in browser)

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

Requires JavaScript enabled and localStorage support.

## Development

### Running Locally
Simply open `index.html` in your browser. No build process or server required.

### Developer Tools
Access the Developer tab in-game for:
- State inspection
- Resource manipulation
- Skill level modification
- Save data management
- Performance monitoring

### Contributing
This is a personal project, but suggestions and bug reports are welcome via GitHub Issues.

## Roadmap

### Planned Features
- Additional biomes and regions
- More enemy types and boss encounters
- Expanded mission system
- Guild/faction mechanics
- Prestige/rebirth system
- Achievement system
- Cloud save integration

## Credits

**Developer**: Durhamax

**Special Thanks**:
- Claude (Anthropic) for development assistance
- Simplex Noise library for procedural generation

## License

This project is open source. Feel free to learn from it, modify it, or use it as a base for your own projects.

## Support

Found a bug? Have a suggestion?
- Open an issue on GitHub: https://github.com/Durhamax/oneSoul_idle_RPG/issues
- Provide details about your browser, steps to reproduce, and any console errors

## Changelog

### Version 1.0.0 (Initial Release)
- Global discovery system implementation
- Rest/recovery mechanic with resource consumption
- Region-based exploration with hex grid world map
- Combat system with equipment and perks
- Crafting and engineering systems
- Mission system
- Skill progression
- Starting region: (-3,-4) with navigation level 1 requirement

---

**Play now**: Simply open `index.html` in your browser and start your adventure!
