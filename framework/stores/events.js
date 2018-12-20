const Store = require("../Store.js");

class EventStore extends Store {

    constructor(...args) {
        super(...args);
    }

    setup() {
        const keys = [...this.files.keys()];
        keys.map(k => this.client.on(k, (...args) => this.files.get(k).run(...args)));
    }

}

module.exports = EventStore;