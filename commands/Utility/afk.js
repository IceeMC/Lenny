const Command = require("../../framework/Command.js");

class AFK extends Command {

    constructor(...args) {
        super(...args, {
            name: "afk",
            aliases: ["setafk", "afkstatus"],
            runIn: ["text"],
            subCommands: ["set", "remove"],
            usage: "<type> [afkMessage:string::all]",
            description: language => language.get("COMMAND_AFK_DESCRIPTION"),
        });
    }

    async set(message, [afkMessage]) {
        if (!afkMessage) throw message.language.get("COMMAND_AFK_NO_MESSAGE");
        const { afk: { isAfk } } = message.author.config;
        if (isAfk) throw message.language.get("COMMAND_AFK_ALREADY_AFK", [message.guild.config.prefix]);
        await message.author.updateConfig({ afk: { isAfk: true, message: this.client.clean(message, afkMessage) } });
        return message.sendLocale("COMMAND_AFK_SET", [this.client.clean(message, afkMessage)]);
    }

    async remove(message) {
        const { afk: { isAfk } } = message.author.config;
        if (!isAfk) throw message.language.get("COMMAND_AFK_NOT_AFK", [message.guild.config.prefix]);
        await message.author.updateConfig({ afk: { isAfk: false, message: null } });
        return message.sendLocale("COMMAND_AFK_REMOVE");
    }

}

module.exports = AFK;