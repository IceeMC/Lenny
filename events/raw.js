const { Event } = require('klasa');

module.exports = class extends Event {

    async run(packet) {
        const { t, s, op, d } = packet;
        const rawEvent = this.client.rawEvents.get(t);
        if (rawEvent && rawEvent.enabled) {
            rawEvent.run(d);
        }
    }

};