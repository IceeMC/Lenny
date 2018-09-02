const { Argument } = require("klasa");

class Color extends Argument {

    run(arg, possible, message) {
        const colorMatch = /(?:0x|#)([A-Fa-f0-9]{6})/.exec(arg);
        if (!colorMatch) throw message.language.get("RESOLVER_INVALID_COLOR", possible.name);
        return colorMatch[1];
    }

}

module.exports = Color;