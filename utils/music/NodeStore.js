class NodeStore extends Map {

    constructor(iterable) { // eslint-disable-line
        super(iterable);
    }

    /**
     * Returns an array of the maps keys.
     * @returns {Array} The new array from all the keys.
     */
    toKeyArray() {
        return Array.from(this.keys());
    }

    /**
     * Returns an array of the maps values.
     * @returns {Array<any>}
     */
    toValueArray() {
        return Array.from(this.values());
    }

    /**
     * Returns a random key from this map.
     * @returns {Array<any>} The random key.
     */
    randomKey() {
        return this.toKeyArray()[Math.floor(Math.random() * keyArr.length)];
    }

    /**
     * Returns a random value from this map.
     * @returns {Array<any>} The random value.
     */
    randomValue() {
        return this.toValueArray()[Math.floor(Math.random() * valueArr.length)];
    }

    /**
     * Finds a value using a key.
     * @param {string} key The property you want to search in.
     * @param {string} toFind The value you want to find.
     * @returns {any} The value that was found.
     * @example
     * server.routes.find("path", "/")
     */
    find(key, toFind) {
        for (const v of this.values()) {
            if (v[key] === toFind) return v;
        }
    }

    /**
     * Returns the first value of the collection.
     * @returns {any}
     */
    first() {
        return this.values().next().value;
    }

    /**
     * Creates a new map using an array.
     * @param {function} mapper The function to use when mapping the array.
     * @returns {Array<any>}
     */
    map(mapper) {
        if (!(mapper instanceof Function)) throw new Error("Cannot map values without a function.");
        return this.toValueArray().map(mapper.bind(this));
    }

    /**
     * Creates a new map using an array.
     * @param {function} filter The function to use when filtering the array.
     * @returns {Array<any>}
     */
    filter(filter) {
        if (!(filter instanceof Function)) throw new Error("Cannot map values without a function.");
        return this.toValueArray().filter(filter.bind(this));
    }

    /**
     * Converts the map to an object.
     */
    obj() {
        return [...this.entries()].reduce((main, [k, v]) => ({ ...main, [k]: v }), {});
    }

    /**
     * Clones the entire contents of this map.
     * This includes the keys and values.
     * @returns {KlassicMap}
     */
    makeClone() {
        return new this.constructor(this);
    }
    
}

module.exports = NodeStore;