class Language {

    constructor(client, storeName, {
        name = null,
        interval = 0
    }) {
        this.client = client;
        this.store = this.client.storeManager.getStore(storeName);
        this.name = name;
        this.path = null;
        this.interval = interval;
        this._bound = null;
    }

    async run() {
        throw `Task: ${this.constructor.name} does not have a run function.`;
    }

    get bound() {
        if (this._bound) return this._bound;
        this._bound = this.run.bind(this);
        return this._bound;
    }

}

module.exports = Language;