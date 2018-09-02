const { Store } = require("klasa");
const RawEvent = require("./RawEvent.js");

class RawEventStore extends Store {

    constructor(client) {
        super(client, "rawEvents", RawEvent);
    }

}

module.exports = RawEventStore;