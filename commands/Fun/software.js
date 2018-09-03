const { Command } = require("klasa");
const { MessageEmbed } = require("discord.js");
const { get } = require("superagent");

class Software extends Command {

    constructor(...args) {
        super(...args, {
            name: "software",
            description: language => language.get("COMMAND_SOFTWARE_DESCRIPTION"),
            aliases: ["softwaregore", "rsoftwaregore"]
        });
    }

    async run(message) {
        const result = await this.getRandomPost();
        const embed = new MessageEmbed()
            .setColor(this.client.utils.color)
            .setTitle(result.title)
            .setImage(result.url)
            .setFooter(`Post by: ${result.author}`)
    }

    async getRandomPost() {
        const request = await get("https://api.reddit.com/r/softwaregore/top/.json?limit=1000")
        const children = request.body.data.children;
        const randomPost =  children[Math.floor(Math.random() * children.length)].data;
        return {
            url: randomPost.preview.images[0].source.url,
            title: randomPost.title,
            author: randomPost.author_fullname
        };
    }

}

module.exports = Software;