const fs = require("fs-nextra");
const Store = require("./Store.js");
const { extname } = require("path");

class StoreManager {

    constructor(client) {
        this.client = client;
        this.stores = {};
    }

    getStore(name) {
        const store = this.stores[name];
        if (!store) throw new Error(`${name} is not a valid store.`);
        return store;
    }

    async addStore(s) {
        if (!(s instanceof Store)) throw new Error(`${s.constructor ? s.constructor.name : s.name} does not extend the store class.`);
        this.stores[s.storeName] = s;
	    await this.loadStore(s.storeName);
        return this.stores[s.storeName];
    }

    deleteStore(s) {
        const store = this.getStore(name);
        if (!store) throw new Error(`${s} is not a valid store.`);
        delete this.stores[s];
        return store;
    }

    keys() {
        return Object.keys(this.stores);
    }

    values() {
        return Object.values(this.stores);
    }

    map(cb) {
        return Object.values(this.stores).map(cb.bind(this));
    }

    filter(cb) {
        return Object.values(this.stores).filter(cb.bind(this));
    }

    find(cb) {
        return Object.values(this.stores).find(cb.bind(this));
    }

    async loadStore(name) {
        const store = this.getStore(name);
        const files = [...(await fs.scan(`${process.cwd()}/${name}`, {
            filter: (s, f) => s.isFile() && extname(f) === ".js"
        })).keys()];
        if (!files.length) return;
        for (const file of files) store.addFile(file);
    }

}

module.exports = StoreManager;