const { readFileSync } = require("fs");

module.exports = {
    guild: "558035191193665537",
    joinsChannel: "558421538358034432",
    upvoteChannel: "558496638646091816",
    bugsChannel: "558496765507272725",
    errorsChannel: "558421478408978442",
    suggestionsChannel: "558496898525167617",
    // roles: { beta: "506119917024575509", premium: "476467857543266316" },
    tttBoard: readFileSync(`${process.cwd()}/assets/ttt.png`)
};
