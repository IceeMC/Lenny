const Command = require("../../framework/Command.js");

class Logs extends Command {
    
    constructor(...args) {
        super(...args, {
            name: "logs",
            runIn: ["text"],
            aliases: ["mlogs", "modlogs"],
            check: 7,
            subCommands: ["enable", "disable", "channel"],
            usage: "[t:string] [key:string]",
            description: language => language.get("COMMAND_LOGS_DESCRIPTION")
        });
        this.validKeys = ["guild", "channels", "roles", "nicknames", "bans", /*"kicks",*/ "joins", "leaves", "warns", "messages"];
    }

    async run(message, [type, key]) {
        if (!type) throw message.language.get("SUB_COMMAND_INVALID", ["enable", "disable", "channel"]);
        if (type === "enable") return this.enableSetting(message, [key]);
        if (type === "disable") return this.disableSetting(message, [key]);
        if (type === "channel") return this.changeChannel(message);
        throw message.language.get("SUB_COMMAND_INVALID", ["enable", "disable", "channel"]);
    }

    async enableSetting(message, [key]) {
        if (!key) throw message.language.get("COMMAND_LOGS_NO_KEY", this.validKeys);
        if (key === "all" || key === "everything") return this.enableAll(message);
        if (key === "channel") throw message.language.get("COMMAND_LOGS_CHANNEL_KEY", message.guild.config.prefix);
        if (!this.validKeys.includes(key)) throw message.language.get("COMMAND_LOGS_INVALID_KEY");
        if (message.guild.config.logs[key]) throw message.language.get("COMMAND_LOGS_ALREADY_ENABLED", message.guild.config.prefix, key);
        await message.guild.updateConfig({ [`logs.${key}`]: true });
        return message.sendLocale("COMMAND_LOGS_ENABLED", [key]);
    }

    async disableSetting(message, [key]) {
        if (!key) throw message.language.get("COMMAND_LOGS_NO_KEY", this.validKeys);
        if (key === "all" || key === "everything") return this.disableAll(message);
        if (key === "channel") throw message.language.get("COMMAND_LOGS_CHANNEL_KEY", message.guild.config.prefix);
        if (!this.validKeys.includes(key)) throw message.language.get("COMMAND_LOGS_INVALID_KEY");
        if (!message.guild.config.logs[key]) throw message.language.get("COMMAND_LOGS_ALREADY_DISABLED", message.guild.config.prefix, key);
        await message.guild.updateConfig({ [`logs.${key}`]: false });
        return message.sendLocale("COMMAND_LOGS_DISABLED", [key]);
    }

    async enableAll(message) {
        const { logs } = message.guild.config;
        if (Object.keys(logs).filter(k => k !== "channel" && logs[k]).length === this.validKeys.length)
            throw message.language.get("COMMAND_LOGS_ALREADY_ENABLED_ALL");
        const { channel } = logs;
        const newLogs = this.validKeys.reduce((obj, key) => ({ ...obj, [key]: true }), {});
        await message.guild.updateConfig({
            logs: { channel, ...newLogs }
        });
        return message.sendLocale("COMMAND_LOGS_ENABLE_ALL");
    }

    async disableAll(message) {
        const { logs } = message.guild.config;
        if (Object.keys(logs).filter(k => k !== "channel" && !logs[k]).length === this.validKeys.length)
            throw message.language.get("COMMAND_LOGS_ALREADY_DISABLED_ALL");
        const { channel } = logs;
        const newLogs = this.validKeys.reduce((obj, key) => ({ ...obj, [key]: false }), {});
        await message.guild.updateConfig({
            logs: { channel, ...newLogs }
        });
        return message.sendLocale("COMMAND_LOGS_DISABLE_ALL");
    }

    async changeChannel(message) {
        if (message.mentions.channels.size) {
            if (!message.mentions.channels.first().postable) throw message.language.get("COMMAND_LOGS_NO_SPEAK");
            await message.guild.updateConfig({ "logs.channel": message.mentions.channels.first().id });
            return message.sendLocale("COMMAND_LOGS_CHANNEL_UPDATED", [message.mentions.channels.first()]);
        } else throw message.language.get("COMMAND_LOGS_MENTION");
    }

}

module.exports = Logs;