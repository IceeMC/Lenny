const { Command } = require("klasa");
const { MessageEmbed } = require("discord.js");
const { get } = require("superagent");

class Meme extends Command {

    constructor(...args) {
        super(...args, {
            name: "meme",
            description: language => language.get("COMMAND_MEME_DESCRIPTION"),
            aliases: ["m3m3", "memeplox"]
        });
    }

    async run(message) {
        const result = await this.getRandomPost();
        if (result.nsfw && !message.channel.nsfw) throw "The post I found could only be viewed in NSFW channels. Try again!";
        const embed = new MessageEmbed()
            .setColor(this.client.utils.color)
            .setTitle(result.title)
            .setImage(result.url)
            .setTimestamp()
            .setFooter(`👍 ${result.ups} | 👎 ${result.downs}`);
        return message.sendEmbed(embed);
    }

    async getRandomPost() {
        const request = await get("https://api.reddit.com/user/kerdaloo/m/dankmemer/top/.json?sort=top&t=day&limit=500")
        const children = request.body.data.children;
        const randomPost =  children[Math.floor(Math.random() * children.length)].data;
        return {
            nsfw: randomPost.over_18,
            url: randomPost.url,
            title: randomPost.title,
            ups: randomPost.ups,
            downs: randomPost.downs
        };
    }

}

module.exports = Meme;