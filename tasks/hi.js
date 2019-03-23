const Task = require("../framework/Task");
const { inspect } = require("util");

class Hi extends Task {

    constructor(...args) {
        super(...args, {
            name: "hi",
            interval: 1500
        })
    }

    async run() {
        console.log(inspect(task, { depth: 0 }), "hi");
    }

}

module.exports = Hi;