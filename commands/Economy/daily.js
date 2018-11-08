const { Command, Duration } = require("klasa");

class Daily extends Command {

    constructor(...args) {
        super(...args, {
            name: "daily",
            runIn: ["text"],
            description: language => language.get("COMMAND_DAILY_DESCRIPTION"),
            aliases: ["dailycoins", "dcoins", "coindaily", "coinbonus"]
        });
    }

    async run(message) {
        if (Date.now() < message.member.settings.lastDaily)
            throw message.language.get("COMMAND_DAILY_ALREADY_CLAIMED", Duration.toNow(message.member.settings.lastDaily));
        await message.member.setCoins(2500);
        await this.cooldown(message.member);
        return message.sendLocale("COMMAND_DAILY_CLAIMED", [2500]);
    }

    async cooldown(member) {
        return await member.settings.update("lastDaily", Date.now() + 864e5);
    }

}

module.exports = Daily;