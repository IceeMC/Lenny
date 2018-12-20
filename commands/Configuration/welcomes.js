const Command = require("../../framework/Command.js");

class Welcomes extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_WELCOMES_DESCRIPTION"),
            check: 7,
            subCommands: ["enable", "disable", "channel"],
            usage: "<type>",
            runIn: ["text"]
        });
    }

    async run(message, [type]) {
        console.log(type);
        if (type === "enable") return this.enableWelcomes(message);
        if (type === "disable") return this.disableWelcomes(message);
        if (type === "channel") return this.channel(message);
    }

    async enableWelcomes(message) {
        await message.guild.updateConfig({ "welcomes.enabled": true });
        return message.sendLocale("COMMAND_WELCOMES_ENABLED");
    }

    async disableWelcomes(message) {
        await message.guild.updateConfig({ "welcomes.enabled": false });
        return message.sendLocale("COMMAND_WELCOMES_DISABLED");
    }

    async channel(message) {
        if (message.mentions.channels.size) {
            if (!message.mentions.channels.first().postable) throw message.language.get("COMMAND_WELCOMES_CANT_SPEAK");
            await message.guild.updateConfig({ "welcome.channel": message.mentions.channels.first().id });
            return message.sendLocale("COMMAND_WELCOMES_CHANNEL_UPDATE", [message.mentions.channels.first()]);
        } else throw message.language.get("COMMAND_WELCOMES_NO_MENTION");
    }

}

module.exports = Welcomes;