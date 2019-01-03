const { MessageEmbed } = require("discord.js");
const attachmentRgx = /(?:(png|jpe?g|gif))/gi;
const urlRegex = /https?:\/\/[A-Za-z0-9-]+(?:(png|jpe?g|gif))/; // Not the best, but it works

class Starboard {

    constructor(guild) {
        this.guild = guild;
        this._starboard = guild.config.starboard;
        this.regex = /Stars: (.*) \| ID: (.*)/;
    }

    get channel() {
        return this._starboard.channel;
    }

    get limit() {
        return this._starboard.limit;
    }

    editStar(starred, message) {
        if (message.reactions.get("⭐").array().some(r => r.id === message.author.id)) return;
        const regexMatch = this.regex.exec(starred.embeds[0].footer.text);
        const attachment = message.embeds[0] && message.embeds[0].image ? this._check(message.embeds[0].image.url) : null;
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
        if (message.reactions.get("⭐").array().some(r => r.id === message.author.id)) return;
        const ua = this._userAttachment(message.content);
        const attachment = message.attachments.size > 0 ? this._check(message.attachments.array()[0].url) : ua;
        const em = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png" }))
            .setFooter(`Stars: ${this.guild.config.starboard.limit} | ID: ${message.id}`)
            .setTimestamp()
            .setColor(this.guild.client.utils.color)
            .setImage(attachment)
            .setDescription(message.content);
        return channel.send({ embed: em }).catch(() => null);
    }

    removeStar(starred, message) {
        const regexMatch = this.regex.exec(starred.embeds[0].footer.text);
        if (message.reactions.get("⭐").array().some(r => r.id === message.author.id)) return;
        const attachment = message.embeds[0] && message.embeds[0].image ? this._check(message.embeds[0].image.url) : null;
        if (parseInt(regexMatch[1]) - 1 > this.limit) {
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
    
    _userAttachment(content) {
        const urlRgx = 
    }

    _check(url) {
        const urlSplit = url.split(".");
        const validUrl = attachmentRgx.test(urlSplit[urlSplit.length - 1]);
        if (validUrl) return url;
        return null;
    }

}

module.exports = Starboard;
