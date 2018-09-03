const { MessageEmbed } = require("discord.js");

class Starboard {

    constructor(guild) {
        this.guild = guild;
        this._starboard = guild.settings.starboard;
        this.regex = /Stars: (.*) \| ID: (.*)/;
        this.filter = (m, m1) => m.embeds.length && m.embeds[0].footer && this.regex.test(m.embeds[0].footer.text) && m.embeds[0].footer.text.endsWith(m1.id);
    }

    get channel() {
        return this._starboard.channel;
    }

    get limit() {
        return this._starboard.limit;
    }

    editStar(starred, message) {
        const regexMatch = this.regex.exec(starred.embeds[0].footer.text);
        const attachment = message.embeds[0] ? message.embeds[0].image ? this._check(message.embeds[0].image.url) : null : null;
        const em = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png" }))
            .setFooter(`Stars: ${parseInt(regexMatch[1])+1} | ID: ${message.id}`)
            .setTimestamp()
            .setColor(this.guild.client.utils.color)
            .setImage(attachment)
            .setDescription(message.content);
        return starred.edit({ embed: em }).catch(() => null);
    }

    star(channel, message) {
        if (message.reactions.get("⭐").count < this.limit) return;
        const attachment = message.attachments.size > 0 ? this._check(message.attachments.array()[0].url) : null;
        const em = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png" }))
            .setFooter(`Stars: ${this.guild.settings.starboard.limit} | ID: ${message.id}`)
            .setTimestamp()
            .setColor(this.guild.client.utils.color)
            .setImage(attachment)
            .setDescription(message.content);
        return channel.send({ embed: em }).catch(() => null);
    }

    removeStar(starred, message) {
        const regexMatch = this.regex.exec(starred.embeds[0].footer.text);
        const attachment = message.embeds[0] ? message.embeds[0].image ? this._check(message.embeds[0].image.url) : null : null;
        if (parseInt(regexMatch[1]) > 1) {
            const em = new MessageEmbed()
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png" }))
                .setFooter(`Stars: ${parseInt(regexMatch[1])-1} | ID: ${message.id}`)
                .setTimestamp()
                .setColor(this.guild.client.utils.color)
                .setImage(attachment)
                .setDescription(message.content);
            starred.edit({ embed: em }).catch(() => null);
        } else {
            starred.delete().catch(() => null);
        }
    }

    _check(url) {
        const urlSplit = url.split(".");
        const test = /(?:(png|jpeg|jpg|gif))/gi.test(urlSplit[urlSplit.length - 1]);
        if (test) return url;
        return null;
    }

}

module.exports = Starboard;