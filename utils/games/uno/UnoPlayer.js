const UnoCard = require("./UnoCard.js");

class UnoPlayer {

    constructor(user) {
        this.user = user;
        this.cards = [];
        this.ranking = null;
        this.buildCards();
    }

    buildCards() {
        for (let i = 0; i < 7; i++) this.cards.push(this.randomCard());
    }

    drawCard() {
        const card = this.randomCard();
        this.cards.push(card);
        return card;
    }

    getCard(name) {
        return this.cards.find(c => c.info.name === name);
    }

    send(content) {
        return this.user.send(content).catch(() => null);
    }

    playCard(name) {
        const card = this.getCard(name);
        if (!card) throw "You don't have that card!";
        this.cards.splice(card, 1);
    }

    randomCard() {
        return new UnoCard(UnoCard.cards.ALL[~~(Math.random() * UnoCard.cards.ALL.length)]);
    }

    get won() {
        return this.cards.length;
    }

}

module.exports = UnoPlayer;