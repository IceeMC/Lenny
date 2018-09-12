const { Command, util: { clean } } = require("klasa");

class AFK extends Command {

    constructor(...args) {
        super(...args, {
            name: "afk",
            aliases: ["setafk", "afkstatus"],
            runIn: ["text"],
            description: language => language.get("COMMAND_AFK_DESCRIPTION"),
            usage: "<set|remove> [args:string]",
            usageDelim: " ",
            extendedHelp: "No extended help available",
        });
    }

    run(message, [type, ...params]) {
        if (type === "set") return this.set(message, params);
        if (type === "remove") return this.set(message, params);
    }

    async set(message, [...afkMessage]) {
        if (!afkMessage) throw message.language.get("COMMAND_AFK_NO_MESSAGE");
        const { isAfk } = message.author.settings;
        if (isAfk) throw message.language.get("COMMAND_AFK_ALREADY_AFK");
        await message.author.settings.update([["afk.isAfk", true], ["afk.afkMessage", clean(afkMessage.join(" "))]]);
        return message.sendLocale("COMMAND_ADK_SET", afkMessage.join(" "));
    }

    async remove(message) {
        const { isAfk } = message.author.settings;
        if (!isAfk) throw message.language.get("COMMAND_AFK_NOT_AFK");
        await message.author.settings.update("afk", null);
        return message.sendLocale("COMMAND_AFK_REMOVE", afkMessage.join(" "));
    }

}

module.exports = AFK;