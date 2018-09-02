const { Command } = require("klasa");

class Logs extends Command {
    
    constructor(...args) {
        super(...args, {
            name: "logs",
            runIn: ["text"],
            aliases: ["mlogs", "modlogs"],
            usage: "<enable|disable|channel> [args:string]",
            usageDelim: " ",
            permissionLevel: 7,
            description: language => language.get("COMMAND_LOGS_DESCRIPTION")
        });
        this.validKeys = ["roles", "nicknames", "bans", "kicks", "joins", "leaves", "warns", "messages", "all", "everything"];
    }

    async run(message, [type, ...params]) {
        if (type === "enable") return this.enableSetting(message, params);
        if (type === "disable") return this.disableSetting(message, params);
        if (type === "channel") return this.changeChannel(message, params);
    }

    async enableSetting(message, [key]) {
        if (!key) return message.sendLocale("COMMAND_LOGS_NO_KEY", [this.validKeys.map(k => `\`${key}\``).join(", ")]);
        if (key === "all" || key === "everything") return this.enableAll(message);
        if (key === "channel") return message.sendLocale("COMMAND_LOGS_CHANNEL_KEY", [message.guild.settings.prefix]);
        if (!this.validKeys.includes(key)) return message.sendLocale("COMMAND_LOGS_INVALID_KEY");
        if (message.guild.settings.logs[key]) return message.sendLocale("COMMAND_LOGS_ALREADY_ENABLED", [message.guild.settings.prefix, key]);
        await message.guild.settings.update([[`logs.${key}`, true]]);
        return message.sendLocale("COMMAND_LOGS_ENABLED", [key]);
    }

    async disableSetting(message, [key]) {
        if (!key) return message.sendLocale("COMMAND_LOGS_NO_KEY", [this.validKeys.map(k => `\`${key}\``).join(", ")]);
        if (key === "all" || key === "everything") return this.enableAll(message);
        if (key === "channel") return message.sendLocale("COMMAND_LOGS_CHANNEL_KEY", [message.guild.settings.prefix]);
        if (!this.validKeys.includes(key)) return message.sendLocale("COMMAND_LOGS_INVALID_KEY");
        if (!message.guild.settings.logs[key]) return message.sendLocale("COMMAND_LOGS_ALREADY_DISABLED", [message.guild.settings.prefix, key]);
        await message.guild.settings.update([[`logs.${key}`, true]]);
        return message.sendLocale("COMMAND_LOGS_DISABLED", [key]);
    }

    async enableAll(message) {
        await message.guild.settings.update([
            ["logs.roles", true],
            ["logs.nicknames", true],
            ["logs.bans", true],
            ["logs.kicks", true],
            ["logs.joins", true],
            ["logs.leaves", true],
            ["logs.warns", true],
            ["logs.messages", true]
        ]);
        return message.sendLocale("COMMAND_LOGS_ENABLE_ALL");
    }

    async disableAll(message) {
        await message.guild.settings.update([
            ["logs.roles", false],
            ["logs.nicknames", false],
            ["logs.bans", false],
            ["logs.kicks", false],
            ["logs.joins", false],
            ["logs.leaves", false],
            ["logs.warns", false],
            ["logs.messages", false]
        ]);
        return message.sendLocale("COMMAND_LOGS_DISABLE_ALL");
    }

    async changeChannel(message) {
        if (message.mentions.channels.size) {
            if (!message.mentions.channels.first().postable) return message.sendLocale("COMMAND_LOGS_NO_SPEAK");
            await message.guild.settings.update([
                ["logs.channel", message.mentions.channels.first().id]
            ], message.guild);
            return message.sendLocale("COMMAND_LOGS_CHANNEL_UPDATED", [message.mentions.channels.first()]);
        } else return message.sendLocale("COMMAND_LOGS_MENTION");
    }

}

module.exports = Logs;