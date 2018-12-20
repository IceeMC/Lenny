class Arg {

    constructor(client, storeName, { aliases = [] }) {
        this.client = client;
        this.store = this.client.storeManager.getStore(storeName);
        this.name = null; // This will be defined later by the store
        this.aliases = aliases;
    }

    async run() {
        throw `${this.name} has no run method.`;
    }

}

module.exports = Arg;