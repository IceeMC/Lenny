class Language {

    constructor(client, storeName, {
        name = null,
    }) {
        this.client = client;
        this.store = this.client.storeManager.getStore(storeName);
        this.name = name;
        this.responses = {};
        this.path = null;
    }

    get(key, ...args) {
        if (!this.responses[key]) return this.responses["NO_LOCALIZATION_YET"](key);
        const gotten = typeof this.responses[key] === "function" ? this.responses[key](...args) : this.responses[key];
        return Array.isArray(gotten) ? gotten.join("\n") : gotten;
    }

}

module.exports = Language;