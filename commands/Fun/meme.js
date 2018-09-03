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
        const embed = new MessageEmbed()
            .setColor(this.client.utils.color)
            .setTitle(result.title)
            .setImage(result.url)
            .setTimestamp()
            .setFooter(`👍 ${result.ups} | 👎 ${result.downs}`);
        return message.sendEmbed(embed);
    }

    async getRandomPost() {
        const request = await get("https://api.reddit.com/user/kerdaloo/m/dankmemer/top/.json?limit=1000")
        const children = request.body.data.children;
        const randomPost =  children[Math.floor(Math.random() * children.length)].data;
        return {
            url: randomPost.preview.images[0].source.url,
            title: randomPost.title,
            ups: randomPost.ups,
            downs: randomPost.downs
        };
    }

}

module.exports = Meme;