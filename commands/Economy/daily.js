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
            throw message.language.get("COMMAND_DAILY_ALREADY_CLAIMED", this.client.utils.formatMS(Date.now() - message.member.config.lastDaily));
        const coins = (await this.client.utils.isVoter(message.author.id)) ? 3500 : 2500;
        await message.member.setCoins(coins);
        await message.member.updateConfig({ lastDaily: Date.now() + 864e5 });
        return message.sendLocale("COMMAND_DAILY_CLAIMED", [coins, (await this.client.utils.isVoter(message.author.id))]);
    }

}

module.exports = Daily;