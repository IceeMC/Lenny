const UnoPlayer = require("./UnoPlayer.js");
const UnoCard = require("./UnoCard.js");
const { Duration, KlasaMessage } = require("klasa");
const colors = ["R", "G", "B", "Y"];

class Uno {
    
    constructor(msg, save = null) {
        this.players = save.players || [];
        this.cards = save.cards || [];
        this.deadCards = save.deadCards || [];
        this.rankings = save.rankings || [];
        this.lastPlayed = save.lastPlayed || null;
        this.drawnCards = save.drawnCards || 0;
        this.msg = msg instanceof KlasaMessage ? msg : this.client.channels.find(save.msg.channel).get(save.msg.id);
        this.started = save.started || false;
        this.startedAt = save.startedAt || null;
        this.reversed = save.reversed || false;
    }

    get current() {
        return this.players[0];
    }

    addPlayer(user) {
        if (!this.players[user.id]) {
            this.players.push(new UnoPlayer(this, user));
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
        // Add one zero card to for each color
        for (const color of colors) {
            this.cards.push(new UnoCard(`${color}0`));
            for (let i = 0; i < 10; i++) this.cards.push(new UnoCard(`${color}${i}`), new UnoCard(`${color}${i}`));
            this.cards.push(
                new UnoCard(`${color}SKIP`), new UnoCard(`${color}SKIP`),
                new UnoCard(`${color}REVERSE`), new UnoCard(`${color}REVERSE`),
                new UnoCard(`${color}+2`), new UnoCard(`${color}+2`)
            )
        }
        // Add 4 Wild cards and 4 wild +4 cards
        this.cards.push(
            new UnoCard("WILD"), new UnoCard("WILD"), new UnoCard("WILD"), new UnoCard("WILD"),
            new UnoCard("WILD+4"), new UnoCard("WILD+4"), new UnoCard("WILD+4"), new UnoCard("WILD+4"),
        )
    }

    shuffle() {

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
        const player = this.players.shift();
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
        this.send(player.user.id, `
Here, I have given you a card:

\`${card}\`

You own ${player.cards.length} cards now.`);
    }

    static async save(game) {
        const save = {};
        save.players = game.players.map(p => p.toJSON());
        save.cards = game.cards.map(c => c.toJSON());
        save.deadCards = game.deadCards.map(c => c.toJSON());
        save.rankings = game.rankings;
        save.lastPlayed = game.lastPlayed;
        save.drawnCards = game.drawnCards;
        save.msg = { channel: game.msg.channel.id, id: game.msg.id };
        save.started = game.started;
        save.startedAt = game.startedAt;
        save.reversed = game.reversed;
        return save;
    }

    static load(save) {
        const g = new Uno(null, save);
        if (!g.msg) return null;
        this.msg.client.unoGames.set(g.msg.channel.id, g);
        return g;
    }

    drawCards(cards = 1) {
        const drawn = [];
        for (let i = 0; i < cards; i++) for (const p of this.players) {
            !drawn[p.user.id] ? drawn[p.user.id] = [this.randomCard()] : drawn[p.user.id].push(this.randomCard());
        }
        this.drawnCards += cards * this.players.length;
        this.players.map(v =>
            this.send(v[0], `
Here, I have given you${cards > 1 ? " some cards" : "a card"}:

${v[1].map(c => `\`${c}\``).join(", ")}

You own ${player.cards.length} cards now.
`)
        );
    }

    send(id, content) {
        this.players[id].send(content)
            .catch(() => this.msg.channel.send(`${player.user}, You seem to have disabled your DMs. To view your cards, run \`uno cards\`.`));
    }

    buildScoreboard() {
        return `
Game over. Thanks for playing.

Here are the rankings:
${this.rankings.map((r, i) => `${i+1} -> \`${r.user.tag}\``).join("\n")}

The game took **${Duration.toNow(Date.now() - this.startedAt)}** to complete. ${this.drawnCards.toLocaleString()} were removed from the deck in all.
        `;
    }

}

module.exports = Uno;