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
        this.validKeys = ["guild", "channels", "roles", "nicknames", "bans", "kicks", "joins", "leaves", "warns", "messages"];
    }

    async run(message, [type, ...params]) {
        if (type === "enable") return this.enableSetting(message, params);
        if (type === "disable") return this.disableSetting(message, params);
        if (type === "channel") return this.changeChannel(message);
    }

    async enableSetting(message, [key]) {
        if (!key) throw message.language.get("COMMAND_LOGS_NO_KEY", this.validKeys);
        if (key === "all" || key === "everything") return this.enableAll(message);
        if (key === "channel") throw message.language.get("COMMAND_LOGS_CHANNEL_KEY", message.guild.settings.prefix);
        if (!this.validKeys.includes(key)) throw message.language.get("COMMAND_LOGS_INVALID_KEY");
        if (message.guild.settings.logs[key]) throw message.language.get("COMMAND_LOGS_ALREADY_ENABLED", message.guild.settings.prefix, key);
        await message.guild.settings.update([[`logs.${key}`, true]]);
        return message.sendLocale("COMMAND_LOGS_ENABLED", [key]);
    }

    async disableSetting(message, [key]) {
        if (!key) throw message.language.get("COMMAND_LOGS_NO_KEY", this.validKeys);
        if (key === "all" || key === "everything") return this.enableAll(message);
        if (key === "channel") throw message.language.get("COMMAND_LOGS_CHANNEL_KEY", message.guild.settings.prefix);
        if (!this.validKeys.includes(key)) throw message.language.get("COMMAND_LOGS_INVALID_KEY");
        if (!message.guild.settings.logs[key]) throw message.language.get("COMMAND_LOGS_ALREADY_DISABLED", message.guild.settings.prefix, key);
        await message.guild.settings.update([[`logs.${key}`, false]]);
        return message.sendLocale("COMMAND_LOGS_DISABLED", [key]);
    }

    async enableAll(message) {
        await message.guild.settings.update([...this.validKeys.map(k => [`logs.${key}`, true])]);
        return message.sendLocale("COMMAND_LOGS_ENABLE_ALL");
    }

    async disableAll(message) {
        await message.guild.settings.update([...this.validKeys.map(k => [`logs.${key}`, false])]);
        return message.sendLocale("COMMAND_LOGS_DISABLE_ALL");
    }

    async changeChannel(message) {
        if (message.mentions.channels.size) {
            if (!message.mentions.channels.first().postable) throw message.language.get("COMMAND_LOGS_NO_SPEAK");
            await message.guild.settings.update([
                ["logs.channel", message.mentions.channels.first().id]
            ], message.guild);
            return message.sendLocale("COMMAND_LOGS_CHANNEL_UPDATED", [message.mentions.channels.first()]);
        } else throw message.language.get("COMMAND_LOGS_MENTION");
    }

}

module.exports = Logs;