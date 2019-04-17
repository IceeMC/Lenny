const { readFileSync } = require("fs");

module.exports = {
    guild: "558035191193665537",
    joinsChannel: "568167373618806814",
    upvoteChannel: "568167420737355980",
    bugsChannel: "568167475582337035",
    errorsChannel: "568167528430567424",
    suggestionsChannel: "568167576593629185",
    // roles: { beta: "506119917024575509", premium: "476467857543266316" },
    tttBoard: readFileSync(`${process.cwd()}/assets/ttt.png`)
};
