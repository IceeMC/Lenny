const { Command } = require("klasa");
const { MessageEmbed } = require("discord.js");
const superagent = require("superagent");
const cheerio = require("cheerio");

class Lyrics extends Command {

    constructor(...args) {
        super(...args, {
            name: "lyrics",
            runIn: ["text"],
            description: language => language.get("COMMAND_LYRICS_DESCRIPTION"),
            usage: "[query:string]",
            aliases: ["lyric"],
            requiredPermissions: ["EMBED_LINKS", "SEND_MESSAGES"]
        });
    }

    async run(message, [query]) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        if (audioPlayer && query === undefined) query = audioPlayer.queue[0].title;

        const res = (await superagent.get(`https://api.genius.com/search?q=${query}`).set("Authorization", `Bearer ${this.client.config.genius}`)).body;
        if (!res.response.hits) return message.send("No results found. Try searching for a different song.");

        const res1 = (await superagent.get(res.response.hits[0].result.url)).text;
        const scraped = cheerio.load(res1);
        if (!scraped("p").first().text()) return message.send("No results found. Try searching for a different song.");

        let description = scraped("p").first().text();
        if (description.length > 2045) description = `${description.slice(0, 2045)}...`;

        const embed = new MessageEmbed();
        embed.setTitle(res.response.hits[0].result.full_title);
        embed.setThumbnail(res.response.hits[0].result.header_image_thumbnail_url);
        embed.setColor(this.client.utils.color);
        embed.setDescription(description);
        embed.setFooter("Powered by: https://genius.com", message.author.displayAvatarURL());
        return message.sendEmbed(embed);
    }

}

module.exports = Lyrics;