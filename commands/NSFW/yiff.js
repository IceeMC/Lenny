const Command = require("../../framework/Command.js");
const { MessageEmbed } = require("discord.js");
const { get } = require("superagent");

class Yiff extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_YIFF_DESCRIPTION"),
            cooldown: 5,
            aliases: ["y1ff", "furryporn", "hotyiff"]
        });
    }

    async run(message) {
        if (!message.channel.nsfw) throw message.language.get("NSFW_CHANNEL_NO_NSFW");
        const result = await this.getRandomPost();
        const embed = new MessageEmbed();
        embed.setAuthor(result.title, message.author.displayAvatarURL({ format: "png" }));
        embed.setColor(this.client.utils.color);
        embed.setImage(result.url);
        embed.setTimestamp();
        embed.setFooter(`Author: ${result.author} | 👍 ${result.ups} | 👎 ${result.downs}`);
        return message.send(embed);
    }

    async getRandomPost() {
        const request = await get("https://api.reddit.com/r/yiff/top/.json?sort=top&t=day&limit=250");
        const children = request.body.data.children;
        const randomPost =  children[Math.floor(Math.random() * children.length)].data;
        return {
            nsfw: randomPost.over_18,
            author: randomPost.author_fullname,
            url: randomPost.url,
            title: randomPost.title,
            ups: randomPost.ups,
            downs: randomPost.downs
        };
    }

}

module.exports = Yiff;