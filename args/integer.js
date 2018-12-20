const Arg = require("../framework/commandUsage/Arg.js");

class IntegerArg extends Arg {

    constructor(...args) {
        super(...args, { aliases: ["int", "num", "number"] });
    }

    run(message, arg) {
        if (!parseInt(arg)) throw message.language.get("ARG_BAD_INT");
        return parseInt(arg);
    }

}

module.exports = IntegerArg;