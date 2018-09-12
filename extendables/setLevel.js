const { Extendable } = require("klasa");

class SetCoins extends Extendable {

    constructor(...args) {
        super(...args, {
            appliesTo: ["GuildMember"],
            name: "setLevel"
        });
    }

    async extend(level) {
        if (isNaN(level)) throw new Error("level must be a valid number.");
        await this.settings.update("level", parseInt(level));
        return this.settings.level;
    }

}

module.exports = SetCoins;