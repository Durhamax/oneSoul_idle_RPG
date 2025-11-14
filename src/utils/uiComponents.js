/**
 * UI COMPONENTS UTILITIES
 *
 * Reusable UI component generators for consistent styling across the game.
 */

const UIComponents = {
    /**
     * Generate a standardized skill header with level and XP progress bar
     * @param {object} options - Configuration object
     * @param {string} options.skillId - Skill ID (e.g., 'engineering', 'mining', 'forging')
     * @param {string} options.icon - Icon emoji for the skill
     * @param {string} options.displayName - Display name (defaults to skill definition name)
     * @param {string} options.color - Accent color (hex, defaults to #e94560)
     * @param {string} options.bgGradient - Background gradient CSS (defaults to dark blue)
     * @param {string} options.borderColor - Border color (hex, defaults to #0f3460)
     * @param {string} options.barGradient - Progress bar gradient (defaults to purple)
     * @returns {string} - HTML string for the skill header
     */
    renderSkillHeader(options) {
        const {
            skillId,
            icon = '🔧',
            displayName = null,
            color = '#e94560',
            bgGradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderColor = '#0f3460',
            barGradient = 'linear-gradient(90deg, #533483 0%, #7b3ff2 100%)'
        } = options;

        // Get skill data
        const skill = GameEngine.state.skills[skillId];
        if (!skill) {
            return `<div style="color: #ff6b6b;">Error: Skill '${skillId}' not found</div>`;
        }

        const skillDef = GameEngine.definitions.skills[skillId];
        const skillName = displayName || (skillDef ? skillDef.name : skillId);

        // Calculate XP to next level
        const baseExp = skillDef?.baseExp || 100;
        const expCurve = skillDef?.expCurve || 1.5;
        const xpForNextLevel = Math.floor(baseExp * Math.pow(skill.level + 1, expCurve));
        const xpProgress = skill.level >= 100 ? 100 : (skill.exp / xpForNextLevel * 100);

        return `
        <div style="background: ${bgGradient};
                    border: 2px solid ${borderColor};
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 3em;">${icon}</div>
                <div style="flex: 1;">
                    <div style="font-size: 1.5em; font-weight: bold; color: ${color}; margin-bottom: 5px;">
                        ${skillName} Level ${skill.level}
                    </div>
                    <div style="background: #0a0a1a; border-radius: 10px; height: 20px; overflow: hidden; position: relative;">
                        <div style="background: ${barGradient};
                                    height: 100%;
                                    width: ${xpProgress}%;
                                    transition: width 0.5s;">
                        </div>
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                                    display: flex; align-items: center; justify-content: center;
                                    color: white; font-size: 0.8em; font-weight: bold; text-shadow: 0 0 3px black;">
                            ${skill.level >= 100 ? 'MAX LEVEL' : `${skill.exp.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    /**
     * Get themed colors for specific skill types
     * @param {string} skillId - Skill ID
     * @returns {object} - Color theme object {color, bgGradient, borderColor, barGradient}
     */
    getSkillTheme(skillId) {
        const themes = {
            // Gathering skills - Green theme
            mining: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #2a1a1a 0%, #3a2a1a 100%)',
                borderColor: '#6b4423',
                barGradient: 'linear-gradient(90deg, #8b5a2b 0%, #cd853f 100%)'
            },
            logging: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #1a2a1a 0%, #2a3a1a 100%)',
                borderColor: '#4a6b23',
                barGradient: 'linear-gradient(90deg, #6b8b2b 0%, #9acd32 100%)'
            },
            fishing: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #1a1a2a 0%, #1a2a3a 100%)',
                borderColor: '#234a6b',
                barGradient: 'linear-gradient(90deg, #2b6b8b 0%, #4682b4 100%)'
            },
            hunting: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #2a1a1a 0%, #3a2a2a 100%)',
                borderColor: '#6b2323',
                barGradient: 'linear-gradient(90deg, #8b2b2b 0%, #cd5c5c 100%)'
            },
            foraging: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #1a2a1a 0%, #2a3a2a 100%)',
                borderColor: '#3a6b3a',
                barGradient: 'linear-gradient(90deg, #4a8b4a 0%, #32cd32 100%)'
            },

            // Crafting skills - Orange/Yellow theme
            forging: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #2a1a0a 0%, #3a2a1a 100%)',
                borderColor: '#8b4513',
                barGradient: 'linear-gradient(90deg, #cd5c00 0%, #ff8c00 100%)'
            },
            machining: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #1a1a2a 0%, #2a2a3a 100%)',
                borderColor: '#4a5a6b',
                barGradient: 'linear-gradient(90deg, #5a7a8b 0%, #87ceeb 100%)'
            },
            cooking: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #2a1a1a 0%, #3a2515 100%)',
                borderColor: '#8b6b23',
                barGradient: 'linear-gradient(90deg, #cd8b2b 0%, #ffd700 100%)'
            },
            chemistry: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #1a2a1a 0%, #2a3a2a 100%)',
                borderColor: '#4a8b4a',
                barGradient: 'linear-gradient(90deg, #5acd5a 0%, #00ff00 100%)'
            },
            textiles: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #2a1a2a 0%, #3a2a3a 100%)',
                borderColor: '#8b4a8b',
                barGradient: 'linear-gradient(90deg, #cd5acd 0%, #da70d6 100%)'
            },
            engineering: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderColor: '#0f3460',
                barGradient: 'linear-gradient(90deg, #533483 0%, #7b3ff2 100%)'
            },

            // Combat/Navigation - Red/Blue theme
            combat: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #2a0a0a 0%, #3a1a1a 100%)',
                borderColor: '#8b0000',
                barGradient: 'linear-gradient(90deg, #cd0000 0%, #ff4500 100%)'
            },
            navigation: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 100%)',
                borderColor: '#0f3460',
                barGradient: 'linear-gradient(90deg, #3483cd 0%, #4a9eff 100%)'
            },

            // Default theme
            default: {
                color: '#e94560',
                bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderColor: '#0f3460',
                barGradient: 'linear-gradient(90deg, #533483 0%, #7b3ff2 100%)'
            }
        };

        return themes[skillId] || themes.default;
    }
};
