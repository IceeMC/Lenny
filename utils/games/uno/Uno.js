const UnoPlayer = require("./UnoPlayer.js");
const UnoCard = require("./UnoCard.js");
const moment = require("moment");
const colors = ["R", "G", "B", "Y"];

function repeat(arr = [], elem, times = 1) {
    for (let i = 0; i < times; i++) arr.push(elem);
    return arr;
}

class Uno {
    
    constructor(msg) {
        this.players = [];
        this.currentCard = null;
        this.cards = [];
        this.deadCards = [];
        this.rankings = [];
        this.drawnCards =  0;
        this.msg = msg;
        this.settings = this.msg ? this.msg.client.gateways.unoSaves.get(this.msg.channel.id, true) : null;
        this.started = false;
        this.startedAt = null;
        this.buildCards();
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
            for (let i = 0; i < 10; i++) this.cards.push(...repeat([], new UnoCard(`${color}${i}`), 2));
            // Push 2 skip cards, 2 reverse cards, 2 +2 cards for the color
            this.cards.push(...repeat([], new UnoCard(`${color}SKIP`), 2));
            this.cards.push(...repeat([], new UnoCard(`${color}REVERSE`), 2));
            this.cardspush(...repeat([], new UnoCard(`${color}+2`), 2));
        }
        // Add 4 Wild cards and 4 wild +4 cards
        this.cards.push(...repeat([], new UnoCard("WILD"), 4))
        this.cards.push(...repeat([], new UnoCard("WILD+4"), 4));
        // Lastly shuffle the cards
        this.cards.push(...this.shuffle());
        // Pick a random shuffled card as a base card
        // Making sure it isn't a special card.
        const filtered = this.cards.filter(c => !c.reverse || !c.skip || !c.wild);
        this.currentCard = filtered[Math.floor(Math.random() * filtered.length)];
    }

    shuffle(array = [...this.cards, ...this.deadCards]) {
        let j, x, i;
        for (i = array.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = array[i];
            array[i] = array[j];
            array[j] = x;
        }
        return array;
    }

    getNextTurn() {
        // Shift next player then push it back into the array creating a "recursive" effect.
        const next = this.players.shift();
        this.players.push(next);
        return next;
    }

    reversePlayers() {
        // Shifts the array, reverses it, then appends the shifted player back
        const player = this.players.shift();
        this.players.reverse();
        this.players.unshift(player);
    }

    skipPlayer() {
        // This will shift the next player then push it back 
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
        const { settings } = game;
        save.players = [this.current.toJSON(), ...game.players.map(p => p.toJSON())];
        save.cards = game.cards.map(c => c.toJSON());
        save.deadCards = game.deadCards.map(c => c.toJSON());
        save.rankings = game.rankings.map(r => r.toJSON());
        save.lastPlayed = game.lastPlayed;
        save.drawnCards = game.drawnCards;
        save.msg = { channel: game.msg.channel.id, id: game.msg.id };
        save.started = game.started;
        save.startedAt = game.startedAt;
        save.reversed = game.reversed;
        await settings.update(save);
        return true;
    }

    static async load(client, save) {
        const g = new Uno(client.channels.get(save.msg.channel).messages.get());
        if (!g.msg) return null;
        g.players = save.players.map(p => UnoPlayer.from(p));
        g.cards = save.cards.map(c => UnoCard.from(c));
        g.deadCards = save.deadCards.map(c => UnoCard.from(c));
        g.rankings = save.rankings.map(r => UnoPlayer.from(r));
        g.drawnCards = save.drawnCards;
        g.msg = client.channels.get()
    }

    drawCards(cards = 1) {
        const drawn = [];
        for (let i = 0; i < cards; i++) {
            for (const p of this.players) {
                !drawn[p.user.id] ? drawn[p.user.id] = [p.drawCard()] : drawn[p.user.id].push(p.drawCard());
            }
        }
        this.drawnCards += cards * this.players.length;
        this.players.map(p =>
            this.send(p.user.id, `
Hey, I have given you${cards > 1 ? " some cards" : "a card"}:

${drawn[p.user.id].map(c => `\`${c}\``).join(", ")}

You own ${player.cards.length} cards now.
`)
        );
    }

    drawCard(player, cards = 1) {

    }

    send(id, content) {
        this.players[id].send(content)
            .catch(() => this.msg.channel.send(`${player.user}, You seem to have disabled your DMs. To view your cards, run \`uno cards\`.`));
    }

    sendAll(content) {
        for (const player of this.players) player.send(content).catch(() => null);
    }

    buildScoreboard() {
        return `
Game over. Thanks for playing.

Here are the rankings:
${this.rankings.map((r, i) => `${i+1} -> \`${r.user.tag}\``).join("\n")}

The game took **${moment(Date.now() - this.startedAt)}** to complete.

**Game Statistics:**
${this.drawnCards.toLocaleString()} cards were drawn.

        `;
    }

}

module.exports = Uno;