const { MessageEmbed } = require("discord.js");

class Starboard {

    constructor(guild) {
        this.guild = guild;
        Object.defineProperty(this, "_starboard", { value: guild.settings.starboard, writable: false });
    }

    get cache() {
        return this._starboard.cache;
    }

    get channel() {
        return this._starboard.channel;
    }

    get limit() {
        return this._starboard.limit;
    }

    getStar(id) {
        return this._starboard.cache.find(cached => cached.id === id);
    }

    editStar(channel, message) {
        if (message.author.id === message.author.id) return;
        let cached = this.getStar(message.id);
        cached.stars++;
        const embed = new MessageEmbed()
            .setAuthor(cached.author.tag, author.avatar)
            .setFooter(`Star count: ${cached.stars}`)
            .setTimestamp(new Date(cached.timestamp))
            .setColor(this.guild.client.utils.color);
        if (cached.attachment) embed.setImage(cached.attachment);
        if (cached.content) embed.setDescription(cached.content);
        channel.messages.get(cached.editId).edit({ embed }).then(() => {
            this._update(cached);
        }).catch(() => null);
    }

    starRaw(channel, m, packet) {
        if (m.author.id === packet.user_id) return;
        let attachment = m.attachments.size > 0 ? this._check(m.attachments.array()[0].url) : null;
        const data = {
            id: packet.message_id,
            attachment,
            content: m.content,
            author: {
                tag: m.author.tag,
                avatar: m.author.displayAvatarURL(),
            },
            timestamp: Date.now(),
            stars: 1
        };
        const embed = new MessageEmbed()
            .setAuthor(data.author.tag, data.author.avatar)
            .setFooter(`Star count: ${data.stars}`)
            .setTimestamp(new Date(data.timestamp))
            .setColor(this.guild.client.utils.color);
        if (data.attachment) embed.setImage(data.attachment);
        if (data.content) embed.setDescription(data.content);
        channel.send({ embed }).then(sent => {
            data.editId = sent.id;
            this._update(data);
        }).catch(() => null);
    }

    removeStar(channel, message) {
        let cached = this.getStar(message.id);
        cached.stars--;
        if (cached.stars < 1) {
            const embed = new MessageEmbed()
                .setAuthor(cached.author.tag, author.avatar)
                .setFooter(`Star count: ${cached.stars}`)
                .setTimestamp(new Date(cached.timestamp))
                .setColor(this.guild.client.utils.color);
            if (cached.attachment) embed.setImage(cached.attachment);
            if (cached.content) embed.setDescription(cached.content);
            channel.messages.get(cached.editId).edit({ embed }).then(() => {
                this._update(cached);
            }).catch(() => null);
        } else {
            channel.messages.get(cached.editId).delete().then(() => {
                this._update(cached, true);
            })
        }
    }

    _check(url) {
        const urlSplit = url.split(".");
        const test = /(?:(png|jpeg|jpg|gif))/gi.test(urlSplit[urlSplit.length - 1]);
        if (test) return url;
        return null;
    }

    _update(data, remove = false) {
        this.guild.settings.update("starboard.cache", data, { action: remove ? "add" : "remove" });
    }

}

module.exports = Starboard;