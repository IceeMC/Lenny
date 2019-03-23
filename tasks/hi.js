const Task = require("../framework/Task");
const { inspect } = require("util");

class Hi extends Task {

    constructor(...args) {
        super(...args, {
            name: "hi",
            runAfterSetup: true,
            interval: 0
        })
    }

    async run() {
        console.log(inspect(this, { depth: 0 }));
        const obj = { yes: undefined };
        return obj.yes.hi;
    }

}

module.exports = Hi;