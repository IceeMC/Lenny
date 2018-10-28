const UnoPlayer = require("./UnoPlayer.js");
const UnoCard = require("./UnoCard.js");
const colors = ["R", "G", "B", "Y"];

class Uno {
    
    constructor(msg) {
        this.players = [];
        this.cards = [];
        this.lastPlayed = null;
        this.drawnCards = 0;
        this.msg = msg;
        this.started = false;
        this.startedAt = null;
        this.reversed = false;
    }

    get current() {
        return this.players[0];
    }

    addPlayer(user) {
        if (!this.players[user.id]) {
            this.players.push(new UnoPlayer(user));
            this.msg.channel.send(`${user}, **Has joined the game.`);
        } else {
            this.msg.send(":x: **You are already in the game!**");
        }
    }

    removePlayer(user) {
        if (this.players[user.id]) {
            delete this.players[user.id];
            this.msg.send(`${user}, **Has left the game.**`);
        } else {
            this.msg.send(":x: **You are not in this game!**");
        }
    }

    buildCards() {
        // Add one zero card to for each color and 100 more cards.
        for (const color of colors) {
            this.cards.push(new UnoCard(`${color}0`));
            for (let i = 0; i < 10; i++) this.cards.push(new UnoCard(`${color}${i}`), new UnoCard(`${color}${i}`));
        }
        // Add 4 Wild cards and 4 wild +4 cards
        this.cards.push(
            new UnoCard("WILD"), new UnoCard("WILD"), new UnoCard("WILD"), new UnoCard("WILD"),
            new UnoCard("WILD+4"), new UnoCard("WILD+4"), new UnoCard("WILD+4"), new UnoCard("WILD+4"),
        )
    }

    randomCard() { 
        return this.cards[Math.floor(Math.random() * this.cards.length)];
    }

    getNextTurn() {
        const next = this.players.shift();
        this.players.push(next);
        return next;
    }

    reversePlayers() {
        this.reversed = !this.reversed;
        const player = this.lastPlayer;
        this.players.reverse();
        this.players.unshift(player);
    }

    skipPlayer() {
        const skipped = this.players.shift();
        this.players.push(skipped);
    }

    drawCard(player) {
        this.drawnCards++;
        const card = player.drawCard();
        this.send(player.user.id, `You were given the following card:\n\n\`${card}\``);
    }

    drawCards(cards) {
        const drawn = {};
        for (let i = 0; i < cards; i++) for (const p of this.players) {
            !drawn[p.user.id] ? drawn[p.user.id] = [this.randomCard()] : drawn[p.user.id].push(this.randomCard());
        }
        this.drawnCards += cards * this.players.length;
        Object.entries(drawn).map(v =>
            this.send(v[0], `You were given the following card${cards > 1 ? "s" : ""}:\n${v[1].map(c => `\`${c}\``).join(", ")}`)
        );
    }

    send(id, content) {
        this.players[id].send(content)
            .catch(() => this.msg.channel.send(`${player.user}, You seem to have disabled your DMs. To view your cards, run \`uno cards\`.`));
    }

}

module.exports = Uno;