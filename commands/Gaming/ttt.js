const { Command } = require("klasa");

class TicTacToe extends Command {

    constructor(...args) {
        super(...args, {
            name: "ttt",
            aliases: ["tictactoe"],
            runIn: ["text"],
            description: language => language.get("COMMAND_TTT_DESCRIPTION"),
            usage: "<create|join|leave|start> [args:string]",
            usageDelim: " "
        });
    }

    async run(message, [type, ...params]) {
        if (type === "create") this.create(message);
        if (type === "join") this.join(message);
        if (type === "leave") this.leave(message);
        if (type === "start") this.start(message);
    }

    create(message) {
        if (this.client.tttGames.get(message.channel.id)) throw "A game is already running here.";
        this.client.utils.newTTTGame(message);
        this.client.tttGames.get(message.channel.id).addPlayer(message.author);
        return message.send(":white_check_mark: Game created!");
    }

    join(message) {
        const game = this.client.tttGames.get(message.channel.id);
        if (!game) throw "There is no game running here!";
        if (game.players.size === 2) throw "You cannot join this game!";
        game.addPlayer(message.author);
        return message.send("You have been added to the game");
    }

    leave(message) {
        const game = this.client.tttGames.get(message.channel.id);
        if (!game) throw "There is no game running here!";
        if (message.author === game.host) throw "You cannot leave the game.";
        game.removePlayer(message.author);
        return message.send("You have been removed from the game");
    }

    start(message) {
        const game = this.client.tttGames.get(message.channel.id);
        if (!game) throw "There is no game running here!";
        if (message.author !== game.host) throw "You cannot start the game.";
        game.start();
    }

}

module.exports = TicTacToe;