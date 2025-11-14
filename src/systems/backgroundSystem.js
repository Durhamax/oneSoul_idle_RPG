/**
 * BACKGROUND SYSTEM
 *
 * Dynamic biome-based background system with atmospheric particles and smooth transitions.
 * Provides immersive visual feedback for different regions while maintaining UI readability.
 *
 * DEBUGGING HELPER:
 * Paste this in browser console to test image loading:
 *
 * // Test if image can be loaded
 * const testImg = new Image();
 * testImg.onload = () => console.log('✅ Image loaded successfully!', testImg.width, 'x', testImg.height);
 * testImg.onerror = () => console.error('❌ Failed to load image!');
 * testImg.src = 'assets/backgrounds/regions/region_the_scar_01.png';
 *
 * // Test if backgroundLayer exists and check its style
 * const bgLayer = document.getElementById('backgroundLayer');
 * console.log('backgroundLayer element:', bgLayer);
 * console.log('Current backgroundImage:', bgLayer?.style.backgroundImage);
 * console.log('Computed backgroundImage:', window.getComputedStyle(bgLayer)?.backgroundImage);
 */

const BackgroundSystem = {
    currentBiome: null,
    transitionDuration: 1000, // 1 second
    particleInterval: null,

    /**
     * Biome background definitions
     */
    biomes: {
        plains: {
            name: 'Plains',
            // Background image for plains region
            image: 'assets/backgrounds/regions/region_plains_01.png',
            gradient: 'linear-gradient(180deg, rgba(135, 206, 235, 0.3) 0%, rgba(154, 205, 50, 0.2) 100%)',
            // Fallback: CSS gradient background that looks like plains (used if image fails to load)
            backgroundColor: 'linear-gradient(180deg, #87CEEB 0%, #9ACD32 50%, #6B8E23 100%)',
            blur: 2,
            brightness: 1.1,
            parallaxSpeed: 0.5,
            particles: {
                type: 'leaves',
                count: 15,
                color: 'rgba(154, 205, 50, 0.6)',
                size: [8, 12],
                speed: [3, 6]
            }
        },
        forest: {
            name: 'Forest',
            image: null, // Can add 'assets/backgrounds/forest.jpg'
            gradient: 'linear-gradient(180deg, rgba(34, 139, 34, 0.4) 0%, rgba(0, 100, 0, 0.3) 100%)',
            backgroundColor: 'linear-gradient(180deg, #2F4F2F 0%, #228B22 50%, #006400 100%)',
            blur: 3,
            brightness: 0.8,
            parallaxSpeed: 0.3,
            particles: {
                type: 'leaves',
                count: 25,
                color: 'rgba(34, 139, 34, 0.7)',
                size: [6, 10],
                speed: [2, 5]
            }
        },
        mountains: {
            name: 'Mountains',
            image: null, // Can add 'assets/backgrounds/mountains.jpg'
            gradient: 'linear-gradient(180deg, rgba(70, 130, 180, 0.3) 0%, rgba(105, 105, 105, 0.3) 100%)',
            backgroundColor: 'linear-gradient(180deg, #4682B4 0%, #708090 50%, #696969 100%)',
            blur: 1,
            brightness: 1.0,
            parallaxSpeed: 0.2,
            particles: {
                type: 'snow',
                count: 30,
                color: 'rgba(255, 255, 255, 0.8)',
                size: [4, 8],
                speed: [2, 4]
            }
        },
        desert: {
            name: 'Desert',
            image: null, // Can add 'assets/backgrounds/desert.jpg'
            gradient: 'linear-gradient(180deg, rgba(255, 218, 185, 0.3) 0%, rgba(244, 164, 96, 0.2) 100%)',
            backgroundColor: 'linear-gradient(180deg, #FFDAB9 0%, #F4A460 50%, #D2691E 100%)',
            blur: 4,
            brightness: 1.2,
            parallaxSpeed: 0.4,
            particles: {
                type: 'dust',
                count: 20,
                color: 'rgba(244, 164, 96, 0.5)',
                size: [3, 6],
                speed: [4, 7]
            }
        },
        coast: {
            name: 'Coast',
            image: null, // Can add 'assets/backgrounds/coast.jpg'
            gradient: 'linear-gradient(180deg, rgba(135, 206, 250, 0.3) 0%, rgba(64, 224, 208, 0.2) 100%)',
            backgroundColor: 'linear-gradient(180deg, #87CEEB 0%, #87CEFA 50%, #40E0D0 100%)',
            blur: 2,
            brightness: 1.15,
            parallaxSpeed: 0.6,
            particles: {
                type: 'mist',
                count: 12,
                color: 'rgba(255, 255, 255, 0.4)',
                size: [15, 25],
                speed: [1, 3]
            }
        },
        swamp: {
            name: 'Swamp',
            image: null, // Can add 'assets/backgrounds/swamp.jpg'
            gradient: 'linear-gradient(180deg, rgba(85, 107, 47, 0.4) 0%, rgba(47, 79, 79, 0.3) 100%)',
            backgroundColor: 'linear-gradient(180deg, #556B2F 0%, #4F4F2F 50%, #2F4F4F 100%)',
            blur: 5,
            brightness: 0.7,
            parallaxSpeed: 0.25,
            particles: {
                type: 'fog',
                count: 18,
                color: 'rgba(144, 238, 144, 0.3)',
                size: [20, 35],
                speed: [1, 2]
            }
        },
        tundra: {
            name: 'Tundra',
            image: null, // Can add 'assets/backgrounds/tundra.jpg'
            gradient: 'linear-gradient(180deg, rgba(176, 224, 230, 0.3) 0%, rgba(255, 250, 250, 0.2) 100%)',
            backgroundColor: 'linear-gradient(180deg, #B0E0E6 0%, #ADD8E6 50%, #FFFAFA 100%)',
            blur: 2,
            brightness: 1.1,
            parallaxSpeed: 0.3,
            particles: {
                type: 'snow',
                count: 40,
                color: 'rgba(255, 255, 255, 0.9)',
                size: [3, 7],
                speed: [3, 6]
            }
        },
        urban: {
            name: 'Urban',
            image: null, // Can add 'assets/backgrounds/urban.jpg'
            gradient: 'linear-gradient(180deg, rgba(105, 105, 105, 0.4) 0%, rgba(47, 79, 79, 0.3) 100%)',
            backgroundColor: 'linear-gradient(180deg, #696969 0%, #505050 50%, #2F4F4F 100%)',
            blur: 3,
            brightness: 0.85,
            parallaxSpeed: 0.4,
            particles: {
                type: 'embers',
                count: 10,
                color: 'rgba(255, 140, 0, 0.6)',
                size: [4, 8],
                speed: [2, 5]
            }
        },
        industrial: {
            name: 'Industrial',
            image: null, // Can add 'assets/backgrounds/industrial.jpg'
            gradient: 'linear-gradient(180deg, rgba(139, 69, 19, 0.4) 0%, rgba(64, 64, 64, 0.3) 100%)',
            backgroundColor: 'linear-gradient(180deg, #8B4513 0%, #654321 50%, #404040 100%)',
            blur: 4,
            brightness: 0.75,
            parallaxSpeed: 0.35,
            particles: {
                type: 'smoke',
                count: 15,
                color: 'rgba(105, 105, 105, 0.5)',
                size: [12, 20],
                speed: [2, 4]
            }
        }
    },

    /**
     * Initialize the background system
     */
    init() {
        console.log("🎨 Background System Initialized");

        // Set initial background based on current region
        const currentRegion = GameEngine.state.currentRegion;
        const hexDef = GameEngine.definitions.worldMap?.[currentRegion];

        console.log(`🎨 Init - Current region: ${currentRegion}`);
        console.log(`🎨 Init - Region data:`, hexDef);

        if (hexDef) {
            this.updateBackgroundFromRegion(hexDef.biome, hexDef.name, currentRegion);
        } else {
            console.warn(`⚠️ No region data found for ${currentRegion}, will retry after delay`);
            // Retry after a short delay in case world map isn't ready yet
            setTimeout(() => {
                const retryHexDef = GameEngine.definitions.worldMap?.[currentRegion];
                if (retryHexDef) {
                    console.log(`🎨 Retry successful, loading background for ${retryHexDef.name}`);
                    this.updateBackgroundFromRegion(retryHexDef.biome, retryHexDef.name, currentRegion);
                }
            }, 100);
        }
    },

    /**
     * Update background based on biome
     * @param {string} biome - Biome name
     * @param {string} regionName - Region name (for special backgrounds)
     * @param {string} regionId - Region ID (for specific region images)
     */
    updateBackgroundFromRegion(biome, regionName = null, regionId = null) {
        console.log(`🎨 updateBackgroundFromRegion called with:`, { biome, regionName, regionId });

        // Get region-specific background from region definition
        let customImage = null;

        if (regionId && GameEngine.definitions.worldMap?.[regionId]) {
            const regionDef = GameEngine.definitions.worldMap[regionId];
            customImage = regionDef.backgroundImage;

            if (customImage) {
                console.log(`🎨 ✅ Region '${regionName}' has custom background: ${customImage}`);
            } else {
                console.log(`🎨 Region '${regionName}' using biome (${biome}) default background`);
            }
        } else {
            console.log(`🎨 No region definition found for ${regionId}, using biome defaults`);
        }

        // Fallback to plains if biome not found
        if (!this.biomes[biome]) {
            console.warn(`⚠️ Biome '${biome}' not found, defaulting to plains`);
            biome = 'plains';
        }

        // Skip if already on this biome (unless we have a custom image)
        if (this.currentBiome === biome && !customImage) {
            console.log(`🎨 Already on biome: ${biome}, skipping update`);
            return;
        }

        console.log(`🎨 Changing background to: ${regionName || biome}`);

        const biomeData = { ...this.biomes[biome] };

        // Override with custom image if available
        if (customImage) {
            console.log(`🎨 Using region-specific background: ${customImage}`);
            biomeData.image = customImage;
        } else {
            console.log(`🎨 Using biome default image: ${biomeData.image || 'none (using gradient)'}`);
        }

        this.currentBiome = biome;

        // Update background layers
        this.updateBackgroundLayer(biomeData);
        this.updateGradientLayer(biomeData);

        // Clear and restart particles
        this.clearParticles();
        this.startParticles(biomeData.particles);
    },

    /**
     * Update the background layer
     */
    updateBackgroundLayer(biomeData) {
        const bgLayer = document.getElementById('backgroundLayer');
        if (!bgLayer) {
            console.error('❌ backgroundLayer element not found!');
            return;
        }

        // Add transition class
        bgLayer.classList.add('transitioning');

        // If image is provided, use it; otherwise use backgroundColor
        if (biomeData.image) {
            // Test if image exists before setting it
            const testImage = new Image();
            testImage.onload = () => {
                console.log(`🎨 Setting background image: ${biomeData.image}`);
                bgLayer.style.backgroundImage = `url('${biomeData.image}')`;
                bgLayer.style.backgroundColor = ''; // Clear background color
            };
            testImage.onerror = () => {
                console.warn(`⚠️ Background image not found: ${biomeData.image}, using fallback color`);
                // Fallback to solid color if image fails to load
                bgLayer.style.backgroundImage = ''; // Clear background image
                bgLayer.style.background = biomeData.backgroundColor || '#1a1a28'; // Use backgroundColor or default
            };
            testImage.src = biomeData.image;
        } else {
            console.log(`🎨 Setting background color/gradient: ${biomeData.backgroundColor}`);
            bgLayer.style.backgroundImage = ''; // Clear background image
            bgLayer.style.background = biomeData.backgroundColor; // Support gradients
        }

        bgLayer.style.filter = `blur(${biomeData.blur}px) brightness(${biomeData.brightness})`;
        console.log(`🎨 Applied filter: blur(${biomeData.blur}px) brightness(${biomeData.brightness})`);

        // Remove transition class after animation
        setTimeout(() => {
            bgLayer.classList.remove('transitioning');
        }, this.transitionDuration);
    },

    /**
     * Update the gradient overlay
     */
    updateGradientLayer(biomeData) {
        const gradientLayer = document.getElementById('gradientLayer');
        if (!gradientLayer) return;

        gradientLayer.classList.add('transitioning');
        gradientLayer.style.background = biomeData.gradient;

        setTimeout(() => {
            gradientLayer.classList.remove('transitioning');
        }, this.transitionDuration);
    },

    /**
     * Clear all particles
     */
    clearParticles() {
        const particleLayer = document.getElementById('particleLayer');
        if (!particleLayer) return;

        // Clear existing particles
        particleLayer.innerHTML = '';

        // Clear particle generation interval
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }
    },

    /**
     * Start generating particles
     */
    startParticles(particleConfig) {
        const particleLayer = document.getElementById('particleLayer');
        if (!particleLayer) return;

        // Create initial particles
        for (let i = 0; i < particleConfig.count; i++) {
            setTimeout(() => {
                this.createParticle(particleConfig);
            }, i * 200); // Stagger initial creation
        }

        // Continuously generate particles
        this.particleInterval = setInterval(() => {
            if (particleLayer.childElementCount < particleConfig.count) {
                this.createParticle(particleConfig);
            }
        }, 3000);
    },

    /**
     * Create a single particle
     */
    createParticle(config) {
        const particleLayer = document.getElementById('particleLayer');
        if (!particleLayer) return;

        const particle = document.createElement('div');
        particle.className = `particle particle-${config.type}`;

        // Random size within range
        const size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = config.color;

        // Random starting position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${-10 - Math.random() * 10}%`;

        // Random animation duration
        const duration = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
        particle.style.animationDuration = `${duration}s`;

        // Random horizontal drift
        const drift = (Math.random() - 0.5) * 100;
        particle.style.setProperty('--drift', `${drift}px`);

        particleLayer.appendChild(particle);

        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, duration * 1000);
    },

    /**
     * Get current biome name
     */
    getCurrentBiomeName() {
        return this.biomes[this.currentBiome]?.name || 'Unknown';
    }
};
