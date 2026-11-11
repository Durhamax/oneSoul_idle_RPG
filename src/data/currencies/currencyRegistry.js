/**
 * CURRENCY REGISTRY
 *
 * Manages currency metadata (gold, medals, tomes, gems, etc.).
 */

class CurrencyRegistryClass extends BaseRegistry {
    constructor() {
        super('currency');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'icon'],
            optional: [
                'description', 'abbreviation', 'maxStack', 'tradeable',
                'category', 'color', 'rarity', 'sources', 'uses', 'tags'
            ]
        };
    }

    // Query methods
    getByCategory(category) {
        const allCurrencies = this.getAllActive();
        const filtered = {};
        for (const [id, currency] of Object.entries(allCurrencies)) {
            if (currency.category === category) filtered[id] = currency;
        }
        return filtered;
    }

    getTradeable() {
        const allCurrencies = this.getAllActive();
        const filtered = {};
        for (const [id, currency] of Object.entries(allCurrencies)) {
            if (currency.tradeable === true) filtered[id] = currency;
        }
        return filtered;
    }

    getPremium() {
        return this.getByCategory('premium');
    }

    getEarnable() {
        return this.getByCategory('earnable');
    }
}

const CurrencyRegistry = new CurrencyRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyRegistry;
}
