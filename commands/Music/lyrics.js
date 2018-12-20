const Command = require("../../framework/Command.js");
const { MessageEmbed } = require("discord.js");
const superagent = require("superagent");
const cheerio = require("cheerio");

class Lyrics extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_LYRICS_DESCRIPTION"),
            aliases: ["lyric"],
            requiredPermissions: ["EMBED_LINKS", "SEND_MESSAGES"]
        });
    }

    async run(message, [...query]) {
        const audioPlayer = message.guild.audioPlayer;

        const res = (await superagent
            .get(`https://api.genius.com/search?q=${audioPlayer && !query.join(" ") ? audioPlayer.queue[0].title : query.join(" ")}`)
            .set("Authorization", `Bearer ${this.client.config.genius}`)
        ).body;
        if (!res.response.hits.length) return message.send("No results found. Try searching for a different song.");

        const res1 = (await superagent.get(res.response.hits[0].result.url)).text;
        const scraped = cheerio.load(res1);
        let desc = scraped("p").first().text();
        if (!desc) return message.send("No results found. Try searching for a different song.");
        console.log(desc.length);

        const embed = new MessageEmbed();
        embed.setTitle(res.response.hits[0].result.full_title);
        embed.setThumbnail(res.response.hits[0].result.header_image_thumbnail_url);
        embed.setColor(this.client.utils.color);
        embed.setDescription(desc.length > 2045 ? `${desc.slice(2045)}...` : desc);
        embed.setFooter("Powered by: https://genius.com", message.author.displayAvatarURL());
    }

}

module.exports = Lyrics;