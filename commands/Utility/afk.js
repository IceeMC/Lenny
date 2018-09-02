const { Command } = require("klasa");

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
        if (type === "remove") return this.remove(message);
    }

    async set(message, [...afkMessage]) {
        if (!afkMessage) throw "Please provide an AFK message.";
        const { afk } = message.author.settings;
        if (!afk) throw "You are not AFK at the moment.";
        await message.author.settings.update([["afk.afk", true], ["afk.message", this.clean(afkMessage.join(" "))]]);
        return message.send(`Ok! You are now afk for: \`${afkMessage.join(" ")}\``);
    }

    async remove(message) {
        const { afk } = message.author.settings;
        if (!afk) throw "You are not AFK at the moment.";
        await message.author.settings.update([["afk.afk", false], ["afk.message", null]]);
        return message.send("Ok! You are no longer AFK.");
    }

    clean(text) {
        return text.replace(/@/g, "@\u200b").replace(/`/g, "");
    }

}

module.exports = AFK;