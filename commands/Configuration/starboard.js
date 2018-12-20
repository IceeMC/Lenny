const Command = require("../../framework/Command.js");

class Starboard extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_STARBOARD_DESCRIPTION"),
            check: 7,
            runIn: ["text"],
            subCommands: ["limit", "channel"],
            usage: "<type> [params:string::all]",
            aliases: ["sboard"]
        });
    }

    async run(message, [type, ...params]) {
        if (!type) throw message.language.get("BAD_SUB_CMD_TYPE", ["limit", "channel"]);
        if (type === "limit") return this.limit(message, params);
        if (type === "channel") return this.channel(message, params);
        throw message.language.get("BAD_SUB_CMD_TYPE", ["limit", "channel"]);
    }

    async limit(message, [limit]) {
        if (!limit) throw message.language.get("COMMAND_STARBOARD_NOLIMIT");
        const { starboard } = message.guild;
        if (parseInt(limit) < 1) throw message.language.get("COMMAND_STARBOARD_LIMIT_ZERO");
        if (starboard.limit === parseInt(limit)) throw message.language.get("COMMAND_STARBOARD_LIMIT_SAME");
        await message.guild.updateConfig({ "starboard.limit": limit });
        return message.sendLocale("COMMAND_STARBOARD_LIMIT_CHANGED", [starboard.limit, parseInt(limit)]);
    }

    async channel(message) {
        if (message.mentions.channels.size) {
            if (!message.mentions.channels.first().postable) throw message.language.get("COMMAND_STARBOARD_CANT_SPEAK");
            const { starboard } = message.guild.config;
            await message.guild.updateConfig({ "starboard.channel": message.mentions.channels.first().id });
            return message.sendLocale("COMMAND_STARBOARD_CHANNEL_UPDATE", [message.mentions.channels.first()]);
        } else throw message.language.get("COMMAND_STARBOARD_NO_MENTION");
    }

}

module.exports = Starboard;