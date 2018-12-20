const Command = require("../../framework/Command.js");

class Daily extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_DAILY_DESCRIPTION"),
            aliases: ["dailycoins", "dcoins", "coindaily", "coinbonus"]
        });
    }

    async run(message) {
        if (Date.now() < message.member.config.lastDaily)
            throw message.language.get("COMMAND_DAILY_ALREADY_CLAIMED", this.client.utils.formatMS(message.member.config.lastDaily));
        await message.member.setCoins(2500);
        await message.member.updateConfig({ lastDaily: Date.now() + 864e5 });
        return message.sendLocale("COMMAND_DAILY_CLAIMED", [2500]);
    }

}

module.exports = Daily;