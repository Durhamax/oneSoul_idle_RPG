/**
 * SIMPLEX NOISE GENERATOR
 *
 * Implementation of Simplex Noise for procedural terrain generation.
 * Based on Ken Perlin's improved noise algorithm.
 */

class SimplexNoise {
    constructor(seed = Math.random()) {
        // Gradients for 2D case
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];

        // Initialize base permutation
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }

        this.perm = [];
        this.gradP = [];

        // Seed the random number generator
        this.seed(seed);
    }

    seed(seed) {
        if (seed > 0 && seed < 1) {
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }

        // Use a simple LCG to generate pseudo-random permutation from seed
        const random = (function(s) {
            return function() {
                s = (s * 9301 + 49297) % 233280;
                return s / 233280;
            };
        })(seed);

        // Initialize p array with seeded random
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        // Fisher-Yates shuffle with seeded random
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }

        // Initialize permutation table
        for (let i = 0; i < 256; i++) {
            this.perm[i] = this.perm[i + 256] = this.p[i];
            this.gradP[i] = this.gradP[i + 256] = this.grad3[this.p[i] % 12];
        }
    }

    /**
     * 2D Simplex Noise
     * @param {number} xin - X coordinate
     * @param {number} yin - Y coordinate
     * @returns {number} - Noise value between -1 and 1
     */
    noise2D(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

        // Skew the input space to determine which simplex cell we're in
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;

        // Determine which simplex we are in
        let i1, j1;
        if (x0 > y0) {
            i1 = 1; j1 = 0;
        } else {
            i1 = 0; j1 = 1;
        }

        // Offsets for second corner
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        // Offsets for third corner
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;

        // Work out the hashed gradient indices
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

        // Calculate contribution from three corners
        let n0, n1, n2;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }

        // Add contributions and scale to [-1, 1]
        return 70.0 * (n0 + n1 + n2);
    }

    /**
     * Dot product helper
     */
    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    /**
     * Octave noise for more natural terrain
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} octaves - Number of octaves
     * @param {number} persistence - How much each octave contributes
     * @returns {number} - Combined noise value
     */
    octaveNoise2D(x, y, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }
}
