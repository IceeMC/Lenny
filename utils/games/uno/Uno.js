const UnoPlayer = require("./UnoPlayer.js");

class Uno {
    
    constructor(msg) {
        this.players = new Map();
        this.msg = msg;
        this.started = false;
    }

    playerKeys() { return Array.from(this.players.keys()); }

    playerValues() { return Array.from(this.players.values()); }

    addPlayer(user) {
        if (!this.players.get(user.id)) {
            this.players.set(user.id, new UnoPlayer(user));
            this.msg.channel.send(`${user}, **Has joined the game.`);
        } else {
            this.msg.send(":x: **You are already in this game!**");
        }
    }

    removePlayer(user) {
        if (this.players.get(user.id)) {
            this.players.delete(user.id);
            this.msg.send(`${user}, **Has left the game.**`);
        } else {
            this.msg.send(":x: **You are not in this game!**");
        }
    }

    drawCard(player) {
        const card = player.drawCard();
        this.send(player.user.id, `You were given the following card:\n\n\`${card}\``);
    }

    drawCards(value) {
        const drawn = {};
        for (let i = 0; i < value; i++) this.playerValues().forEach(p =>
            !drawn[p.user.id] ? drawn[p.user.id] = [p.drawCard()] : drawn[p.user.id].push(p.drawCard())
        );
        Object.entries(drawn).map(v => this.send(v[0], `You were given the following card${v[1].length > 1 ? "s" : ""}:\n${v[1].map(c => `\`${c}\``)}`))
    }

    send(id, content) {
        this.players.get(id).send(content)
            .catch(() => this.msg.channel.send(`${player.user}, You seem to have disabled your DMs. To view your cards, run \`uno cards\`.`));
    }

}

module.exports = Uno;