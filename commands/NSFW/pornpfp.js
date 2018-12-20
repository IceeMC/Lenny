const Command = require("../../framework/Command.js");
const { MessageEmbed } = require("discord.js");

class PornPFP extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_PORNPFP_DESCRIPTION"),
            cooldown: 5,
            aliases: ["getmeapornpfp", "inappropriatepfp", "lewdavatar"]
        });
    }

    async run(message) {
        if (!message.channel.nsfw) throw message.language.get("NSFW_CHANNEL_NO_NSFW");
        const url = await this.client.utils.p0rn("nsfw_avatar");
        const embed = new MessageEmbed();
        embed.setAuthor("Here you go, pervert.", message.author.displayAvatarURL({ format: "png" }));
        embed.setColor(this.client.utils.color);
        embed.setImage(url);
        embed.setTimestamp();
        embed.setFooter(`Hentai requested by: ${message.author.tag} | NSFW provided by: nikos.life`);
        return message.send(embed);
    }

}

module.exports = PornPFP;