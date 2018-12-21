const { Structures, MessageEmbed } = require("discord.js");
const Starboard = require("../utils/Starboard.js");
const replies = new Map();

Structures.extend("Guild", _Guild => {
    class Guild extends _Guild {
        
        constructor(...args) {
            super(...args);
            this._sb = null;
        }

        get config() {
            return this.client.db.getConfigSync(this.id);
        }

        get audioPlayer() {
            return this.client.audioManager.get(this.id) || null;
        }

        get starboard() {
            if (!this._sb) {
                this._sb = new Starboard(this);
                return this._sb;
            }
            return this._sb;
        }

        async updateConfig(update = {}) {
            return await this.client.db.updateConfig(this.id, update);
        }

        _checkPerms(perms) {
            return this.me.permissions.has(perms);
        }

    }
    return Guild;
});

Structures.extend("GuildMember", _GuildMember => {
    class GuildMember extends _GuildMember {
        
        constructor(...args) {
            super(...args);
        }

        get config() {
            return this.client.db.getMemberSync(this.guild.id, this.user.id);
        }

        async updateConfig(update = {}) {
            return await this.client.db.updateMember(this.guild.id, this.user.id, update);
        }

        async setCoins(coins, { deduct, overwrite } = {}) {
            if (!overwrite) overwrite = false;
            if (!deduct) deduct = false;
            if (isNaN(coins)) throw new Error("coins must be a valid number.");
            const { coins: curCoins } = this.config;
            await this.client.db.updateMember(this.guild.id, this.user.id, {
                coins: deduct ? curCoins - coins : overwrite ? coins : curCoins + coins
            });
            return this.config.coins;
        }
    
        async setLevel(level, { deduct, overwrite } = {}) {
            if (!overwrite) overwrite = false;
            if (!deduct) deduct = false;
            if (isNaN(level)) throw new Error("level must be a valid number.");
            const { level: curLevel } = this.config;
            await this.client.db.updateMember(this.guild.id, this.user.id, {
                level: deduct ? curLevel - level : overwrite ? level : curLevel + level
            });
            return (await this.client.db.getMember(this.id)).level;
        }

    }

    return GuildMember;
});

Structures.extend("User", _User => {
    class User extends _User {

        constructor(...args) {
            super(...args);
        }

        get config() {
            return this.client.db.getUserSync(this.id);
        }

        async updateConfig(doc = {}) {
            return await this.client.db.updateUser(this.id, doc);
        }

    }

    return User;
})

Structures.extend("Message", _Message => {
    class Message extends _Message {
        
        constructor(...args) {
            super(...args);
            this._parsed = null;
        }

        get flags() {
            return this._parsed.flags;
        }

        get language() {
            const lang = this.guild && this.guild.config ? this.guild.config.language : "en-US";
            return this.client.storeManager.getStore("languages").files.get(lang);
        }

        // A shortcut for message.key = value;
        def(...props) { props.map(p => this[p.k] = p.v); }

        _prepare() {
            // Regex for quoted name and value support.
            const rgx = /(?:--|—)(?:'|"|“|‘)?(\w+)(?:'|"|”|’)?(?:=(?:'|"|“|‘)?(.*)(?:'|"|”|’)?)?/g;
            const flags = {};
            this.content = this.content.replace(rgx, (_, name, value) => {
                flags[name || value] = value || name;
                return "";
            });
            this._parsed = { content: this.content, flags };
        }

        get reply() {
            return replies.get(this.id);
        }

        async send(content, options = {}) {
            if (replies.has(this.id)) {
                let reply = replies.get(this.id);
                if (reply) {
                    if (reply.content === content) return reply;
                    if (content instanceof MessageEmbed) {
                        options = { embed: content._apiTransform() };
                        content = null;
                    } else if (typeof content === "object" && content.embed) {
                        options = { embed: content.embed._apiTransform() };
                        content = null;
                    } else if (typeof content === "string" && reply.embeds.length > 0) options.embed = null;
                    const newReply = await reply.edit(content, options);
                    return newReply;
                }
            } else {
                if (content instanceof MessageEmbed) {
                    options.embed = content;
                    content = "";
                } else if (typeof content === "object" && content.embed) {
                    options.embed = content.embed;
                    content = "";
                }
                replies.set(this.id, await this.channel.send(content, options));
                return replies.get(this.id);
            }
        }

        async sendLocale(key, args = [], options = {}) {
            const locale = this.language.get(key, ...args);
            return await this.send(locale, options);
        }

        // This was not copied from klasa just similar.
        async prompt(text, time = 60000) {
            const temp = await this.channel.send(text);
            const collector = await this.channel.awaitMessages(m => m.author === this.author, { time, max: 1 });
            await temp.delete().catch(() => null);
            if (collector.size < 1) throw "The prompt timed out!";
            return collector.first();
        }

    }

    return Message;
});

Structures.extend("TextChannel", _TextChannel => {
    class TextChannel extends _TextChannel {
        
        constructor(...args) {
            super(...args);
        }

        get postable() {
            return this.guild.me.permissions.has("SEND_MESSAGES");
        }

        _checkPerms(perms) {
            return this.permissionsFor(this.guild.me).has(perms);
        }

    }

    return TextChannel;
});