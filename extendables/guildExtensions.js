const { Extendable } = require("klasa");
const { Guild } = require("discord.js");

class GuildExtensions extends Extendable {

    constructor(...args) {
        super(...args, { appliesTo: [Guild] });
    }

    get audioPlayer() {
        return this.client.audioManager.get(this.id) || null;
    }

}

module.exports = GuildExtensions;