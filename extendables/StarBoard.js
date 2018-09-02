const { Extendable } = require("klasa");
const Starboard = require("../utils/Starboard.js");

class StarBoard extends Extendable {

    constructor(...args) {
        super(...args, {
            appliesTo: ["Guild"],
            name: 'starboard',
            enabled: true
        });
    }

    get extend() {
        return new Starboard(this);
    }

}

module.exports = StarBoard;