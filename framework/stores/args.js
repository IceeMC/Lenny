const Store = require("../Store.js");

class ArgsStore extends Store {

    constructor(client, name, path) {
        super(client, name, path);
        this.aliases = new Map();
    }

    setup() {
        for (const arg of this.files.values()) {
            if (arg.aliases.length > 0) arg.aliases.map(a => this.aliases.set(a, arg));
        }
    }

}

module.exports = ArgsStore;