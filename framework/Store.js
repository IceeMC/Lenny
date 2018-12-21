const { sep } = require("path");

class Store {

    constructor(client, storeName, path) {
        this.client = client;
        this.storeName = storeName;
        this.path = path;
        this.files = new Map();
    }

    addFile(path) {
        try {
            const file = new (require(path))(this.client, this.storeName);
            const paths = path.split(sep);
            if (!file.name || file.name === "") file.name = paths[paths.length - 1].split(".")[0];
            if (!file.path || file.path === "") file.path = path;
            this.files.set(file.name, file);
            return file;
        } catch (e) {
            const paths = path.split(sep);
            this.client.console.error(`Failed to load file ${paths[paths.length - 1]} in store ${this.storeName}\n${e.stack}`);
        }
    }

    addFileNoCatch(path) {
        const file = new (require(path))(this.client, this.storeName);
        const paths = path.split(sep);
        if (!file.name || file.name === "") file.name = paths[paths.length - 1].split(".")[0];
        if (!file.path || file.path === "") file.path = path;
        this.files.set(file.name, file);
        return file;
    }

    get(name) {
        if (this.hasOwnProperty("aliases") && this.aliases instanceof Map) {
            const found = this.files.get(name) || this.aliases.get(name);
            return found;
        } else {
            const found = this.files.get(name);
            return found;
        }
    }
    
    has(name) {
        if (this.hasOwnProperty("aliases") && this.aliases instanceof Map) {
            const hasFile = this.files.has(name) || this.aliases.has(name);
            return hasFile;
        } else {
            const hasFile = this.files.has(name);
            return hasFile;
        }
    }

    keys() {
        return [...this.files.keys()];
    }

    values() {
        return [...this.files.values()];
    }

    map(cb) {
        return [...this.files.values()].map(cb.bind(this));
    }

    filter(cb) {
        return [...this.files.values()].filter(cb.bind(this));
    }

    deleteFile(f) {
        const file = this.files.get(f);
        if (!file) throw new Error(`${f} does not exist in the store.`);
        this.files.delete(f);
        return file;
    }

    reload(f) {
        const file = this.files.get(f);
        if (!file) throw new Error(`${f} does not exist in the store.`);
        delete require.cache[file.path];
        this.files.delete(f);
        let reloaded;
        try { reloaded = this.addFileNoCatch(file.path); } catch (e) { reloaded = e; }
        return reloaded;
    }

    setup() {}

}

module.exports = Store;
