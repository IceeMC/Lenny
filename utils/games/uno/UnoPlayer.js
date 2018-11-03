const UnoCard = require("./UnoCard.js");

class UnoPlayer {

    constructor(uno, user) {
        this.uno = uno;
        this.user = user;
        this.cards = [];
        this.drawnCards = 0;
        this.buildCards();
    }

    buildCards() {
        for (let i = 0; i < 7; i++) this.cards.push(this.uno.cards[Math.floor(Math.random() * this.uno.cards.length)]);
    }

    drawCard() {
        this.drawnCards++;
        const card = this.uno.cards[Math.floor(Math.random() * this.uno.cards.length)];
        this.cards.push(card);
        return card;
    }

    static from(client, save) {
        const player = new UnoPlayer();
        player.uno = client.unoGames.get(save.gameId);
        player.user = client.users.get(save.id);
        player.cards = save.cards.map(c => UnoCard.from(c));
        player.drawnCards = save.drawnCards;
    }

    canPlayCard(name) {
        const wildAliases = ["Wild", "WILD", "Wild+4", "WILD+4"];
        if (wildAliases.includes(name)) {
            const card = this.cards.find(c => c.info.name === wildAliases.find(a => a.toLowerCase() === name.toLowerCase()).toUpperCase());
            if (wild) return { card, type: "CARD" };
            return { card: null, type: "NO_WC"};
        }
        // Find a valid card.
        for (const card of this.cards) {
            if (card.name === this.uno.current.name || card.value === this.uno.current.value || card.wild || card.reverse || card.skip) {
                return { card: null, type: "INVALID" };
            } else {
                return { card, type: "CARD" };
            }
        }
    }

    send(content) { return this.user.send(content); }

    toJSON() {
        return {
            user: {
                username: this.user.username,
                id: this.user.id,
                discriminator: this.user.discriminator,
                tag: this.user.tag
            },
            cards: this.cards.map(c => c.toJSON()),
            drawnCards: this.drawnCards
        }
    }

}

module.exports = UnoPlayer;