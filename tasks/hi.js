const Task = require("../framework/Task");

class Hi extends Task {

    async run() {
        const obj = { yes: undefined };
        return obj.yes.hi;
    }

}

module.exports = Hi;