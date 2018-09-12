const { Extendable } = require("klasa");

class SetCoins extends Extendable {

    constructor(...args) {
        super(...args, {
            appliesTo: ["GuildMember"],
            name: "setCoins"
        });
    }

    async extend(coins, { deduct, overwrite } = {}) {
        if (!overwrite) overwrite = false;
        if (!deduct) deduct = false;
        if (isNaN(coins)) throw new Error("coins must be a valid number.");
        await this.settings.update("coins", deduct ? this.settings.coins - parseInt(coins) : overwrite ? parseInt(coins) : this.settings.coins + parseInt(coins));
        return this.settings.coins;
    }

}

module.exports = SetCoins;