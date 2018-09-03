const { Command } = require("klasa");

class Welcomes extends Command {

    constructor(...args) {
        super(...args, {
            name: "welcomes",
            subcommands: true,
            description: language => language.get("COMMAND_WELCOMES_DESCRIPTION"),
            permissionLevel: 7,
            usage: "<enable|disable|channel> [args:string]",
            usageDelim: " ",
            runIn: ["text"]
        });
    }

    async enable(message) {
        await message.guild.settings.update([["welcome.enabled", true]]);
        return message.sendLocale("COMMAND_WELCOMES_ENABLED");
    }

    async disable(message) {
        await message.guild.settings.update([["welcome.enabled", false]]);
        return message.sendLocale("COMMAND_WELCOMES_DISABLED");
    }

    async channel(message) {
        if (message.mentions.channels.size) {
            if (!message.mentions.channels.first().postable) throw message.language.get("COMMAND_WELCOMES_CANT_SPEAK");
            await message.guild.settings.update([
                ["welcome.channel", message.mentions.channels.first().id]
            ], message.guild);
            return message.sendLocale("COMMAND_WELCOMES_CHANNEL_UPDATE", [message.mentions.channels.first()]);
        } else throw message.language.get("COMMAND_WELCOMES_NO_MENTION");
    }

}