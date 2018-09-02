const { Command } = require("klasa");

class Starboard extends Command {

    constructor(...args) {
        super(...args, {
            name: "starboard",
            subCommands: true,
            description: language => language.get("COMMAND_STARBOARD_DESCRIPTION"),
            usage: "<limit|channel> [args:string]",
            runIn: ["text"],
            aliases: ["sboard"]
        });
    }

    async limit(message, [limit]) {
        if (!limit) throw message.language.get("COMMAND_STARBOARD_NOLIMIT");
        const { starboard } = message.guild;
        if (starboard.limit === limit) throw message.language.get("COMMAND_STARBOARD_LIMIT_SAME");
        await message.guild.settings.update([
            ["starboard.limit", limit]
        ]);
        return message.sendLocale("COMMAND_STARBOARD_LIMIT_CHANGED");
    }

    async channel(message) {
        if (message.mentions.channels.size) {
            if (!message.mentions.channels.first().postable) throw message.language.get("COMMAND_STARBOARD_CANT_SPEAK");
            await message.guild.settings.update([
                ["starboard.channel", message.mentions.channels.first().id]
            ], message.guild);
            return message.sendLocale("COMMAND_STARBOARD_CHANNEL_UPDATE", [message.mentions.channels.first()]);
        } else throw message.language.get("COMMAND_STARBOARD_NO_MENTION");
    }

}

module.exports = Starboard;