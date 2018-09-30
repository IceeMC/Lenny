const { Extendable } = require("klasa");
const { GuildMember } = require("discord.js");

class GuildMemberExtensions extends Extendable {

    constructor(...args) {
        super(...args, { appliesTo: [GuildMember] });
    }

    async setCoins(coins, { deduct, overwrite } = {}) {
        if (!overwrite) overwrite = false;
        if (!deduct) deduct = false;
        if (isNaN(coins)) throw new Error("coins must be a valid number.");
        await this.settings.update("coins", deduct ? this.settings.coins - parseInt(coins) : overwrite ? parseInt(coins) : this.settings.coins + parseInt(coins));
        return this.settings.coins;
    }

    async setLevel(level) {
        if (isNaN(level)) throw new Error("level must be a valid number.");
        await this.settings.update("level", parseInt(level));
        return this.settings.level;
    }

}

module.exports = GuildMemberExtensions;