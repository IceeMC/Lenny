class UnoPlayer {

    constructor(uno, user) {
        this.uno = uno;
        this.user = user;
        this.cards = [];
        this.ranking = null;
        this.hasGone = false;
        this.buildCards();
    }

    buildCards() {
        for (let i = 0; i < 7; i++) this.cards.push(this.uno.randomCard());
    }

    drawCard() {
        const card = this.uno.randomCard();
        this.cards.push(card);
        return card;
    }

    static from(data) {

    }

    getCard(name) {
        return this.cards.find(c => c.info.name.toLowerCase() === name.toLowerCase());
    }

    send(content) {
        return this.user.send(content).catch(() => null);
    }

    playCard(name) {
        const card = this.getCard(name);
        if (!card) throw "You don't have that card!";
        this.cards.splice(card, 1);
    }

}

module.exports = UnoPlayer;