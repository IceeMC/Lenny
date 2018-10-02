const { Extendable } = require("klasa");
const { Guild } = require("discord.js");
const Starboard = require("../utils/Starboard.js");

class StarBoard extends Extendable {

    constructor(...args) {
        super(...args, { appliesTo: [Guild] });
    }

    get starboard() {
        return new Starboard(this);
    }

}

module.exports = StarBoard;