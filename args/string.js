const Arg = require("../framework/commandUsage/Arg.js");

class StringArg extends Arg {

    constructor(...args) {
        super(...args, { aliases: ["str"] });
    }

    run(_, arg) {
        return typeof arg !== "string" ? String(arg) : arg;
    }

}

module.exports = StringArg;