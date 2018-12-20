const Command = require("../../framework/Command.js");

class Uno extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ["unogame"],
            runIn: ["text"],
            description: language => language.get("COMMAND_UNO_DESCRIPTION"),
            extendedHelp: language => language.get("COMMAND_UNO_DESCRIPTION"),
            subCommands: ["create", "join", "leave", "stop", "pickup"],
            usage: "<type>",
            check: 2
        });
    }

    async pickup(message) {
        const game = this.client.unoGames.get(message.channel.id);
        if (!game) throw "No game is being played here!";
        const player = game.players[message.author.id];
        if (!player) throw "You are not in the game!";
        if (!game.started) throw "You can't pick up a card when the game has not started.";
    }

}

module.exports = Uno;