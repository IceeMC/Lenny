const Event = require("../framework/Event.js");
const CooldownManager = require("../framework/CooldownManager.js");

class MessageEvent extends Event {

    constructor(...args) {
        super(...args);
        this.ratelimitedUsers = new Set();
        this.prefixRgx = /^((hey|hey )(!|!,|, | )?(chat noir|chatnoir)(!|!,|, | )?|(cn\.|cn\. ))/i;
        this.prefixReminderRgx = null;
        this.mentionPrefixRgx = null;
        this.cmdCooldowns = new CooldownManager();
        this.levelCooldowns = new CooldownManager();
        this.levelCooldowns.gen("all");
        this.client.once("ready", () => {
            this.prefixReminderRgx = new RegExp(`^<@!?${this.client.user.id}>$`);
            this.mentionPrefixRgx = new RegExp(`^<@!?${this.client.user.id}> `);
        });
    }

    async run(message) {
        // Prepare flags
        message._prepare();
        // Start checking
        if (message.guild && !message.guild.config) await this.client.db.addConfig(message.guild.id);
        if (message.guild && this.prefixReminderRgx.test(message.content))
            return message.send(message.language.get("PREFIX_REMINDER", message.guild.config.prefix));
        // AFK check
        if (message.mentions.users.size > 0 && message.guild && message.channel.postable) {
            const foundAFKUsers = message.mentions.users.map(u => !u.bot && u.config.afk && u.config.afk.isAfk && u.id !== message.author.id);
            if (!foundAFKUsers.size) {} // Using return would fuck up mentions REE
            else return message.send(foundAFKUsers.map(u => message.language.get("USER_AFK", u)).join("\n"));
        }
        // Update coins and possibly level up (that member)
        if (message.guild && message.member && !message.author.bot) {
            try {
                this.levelCooldowns.create("all", {
                    key: message.author.id,
                    cooldown: 5000,
                    bypass: (await this.client.permChecks.runCheck(10, message)).value
                });
                const coins = Math.floor(Math.random() * 2) + 10;
                await message.member.setCoins(coins);
                const level = Math.floor(0.1 * Math.sqrt(message.member.config.coins));
                if (message.member.config.level < level) {
                    await message.member.setLevel(level);
                    if (message.guild.config.levelsEnabled && message.channel.postable)
                        await message.send(message.language.get("MEMBER_LEVEL_UP", message.member));
                }
            } catch (_) {
                // Do nothing
            }
        }
        // Handle commands
        const prefix = this.getPrefix(message);
        if (message.author.bot || !message.content.startsWith(prefix)) return;
        const commands = this.client.storeManager.getStore("commands");
        const aliases = commands.aliases;
        const split = message.content.slice(prefix.length).split(/\s+/g);
        const command = split[0].toLowerCase();
        const args = split.slice(1);
        const cmd = commands.files.get(command) || aliases.get(command);
        if (!cmd) {
            message.def({ k: "args", v: args }, { k: "prefix", v: prefix });
            return this.client.emit("unknownCmd", message, command);
        }
        message.def({ k: "command", v: cmd }, { k: "args", v: args }, { k: "prefix", v: prefix });
        cmd.def({ k: "message", v: message });
        try {
            if (!message.channel.postable) return;
            message.channel.startTyping();
            if (!cmd.runIn.includes(message.channel.type)) return message.channel.stopTyping(true);
            if (!message.guild._checkPerms(cmd.perms) || !message.channel._checkPerms(cmd.perms))
                throw message.language.get("MISSING_BOT_PERMS", perms);
            const { check: { sendError }, value } = await this.client.permChecks.runCheck(cmd.check, message);
            if (!value && sendError) throw message.language.get("CHECK_NO_PERMISSION", check);
            if (!value && !sendError) return message.channel.stopTyping(true);
            // Cooldown the command
            try {
                this.cmdCooldowns.create(cmd.name, {
                    key: message.author.id,
                    cooldown: cmd.cooldown,
                    bypass: (await this.client.permChecks.runCheck(10, message)).value
                });
            } catch (e) {
                const time = this.cmdCooldowns.time(cmd.name, message.author.id);
                if (e === "CD_ACTIVE" && time !== 0) throw message.language.get("CMD_ON_CD", cmd, this.client.utils.formatMS(time));
            }
            const argParams = await cmd.usage.run(message);
            const valid = argParams[0] && typeof argParams[0] === "string" && argParams[0] === args[0];
            const runMethod = typeof cmd.run === "function";
            if (valid && cmd[argParams[0]] && !runMethod) {
                await cmd[argParams[0]](message, (await cmd.usage.run(message, 1)));
            } else if (valid && !cmd[argParams[0]] && runMethod) {
                await cmd.run(message, [argParams[0], ...(await cmd.usage.run(message, 1))]);
            } else {
                await cmd.run(message, argParams);
            }
            return message.channel.stopTyping(true);
        } catch (err) {
            this.client.emit("cmdError", message, cmd, err);
            message.channel.stopTyping(true);
        }
    }

    getPrefix(message) {
        if (this.prefixRgx.test(message.content)) return this.prefixRgx.exec(message.content)[0];
        if (message.guild) {
            const { prefix } = message.guild.config;
            return prefix;
        }
        if (message.channel.type === "dm") return "";
        return "cn.";
    }

}

module.exports = MessageEvent;
