const { Command } = require("klasa");

class Starboard extends Command {

    constructor(...args) {
        super(...args, {
            name: "starboard",
            subcommands: true,
            description: language => language.get("COMMAND_STARBOARD_DESCRIPTION"),
            permissionLevel: 7,
            usage: "<limit|channel> [args:string] [channel:textchannel]",
            usageDelim: " ",
            runIn: ["text"],
            aliases: ["sboard"]
        });
    }

    async run(message, [type, ...params, channel]) {
        if (type === "limit") return this.limit(message, params);
        if (type === "channel") return this.channel(message, params);
    }

    async limit(message, [limit]) {
        if (!limit) throw message.language.get("COMMAND_STARBOARD_NOLIMIT");
        const { starboard } = message.guild;
        if (parseInt(limit) < 1) throw message.language.get("COMMAND_STARBOARD_LIMIT_ZERO");
        if (starboard.limit === parseInt(limit)) throw message.language.get("COMMAND_STARBOARD_LIMIT_SAME");
        await message.guild.settings.update([
            ["starboard.limit", parseInt(limit)]
        ]);
        return message.sendLocale("COMMAND_STARBOARD_LIMIT_CHANGED", [starboard.limit, parseInt(limit)]);
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