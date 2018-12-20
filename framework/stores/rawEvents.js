const Store = require("../Store.js");

class EventStore extends Store {

    constructor(...args) {
        super(...args);
    }

    setup() {
        this.client.on("raw", packet => {
            const event = this.files.get(packet.t);
            if (!event) return;
            return event.run(packet);
        })
    }

}

module.exports = EventStore;