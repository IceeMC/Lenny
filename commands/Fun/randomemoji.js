const Command = require("../../framework/Command.js");
const { MessageEmbed } = require("discord.js");

class RandomEmoji extends Command {

    constructor(...args) {
        super(...args, {
            description: language => language.get("COMMAND_RANDOM_EMOJI_DESCRIPTION")
        });
    }

    async run(message) {
        const emojis = this.client.guilds.reduce((arr, g) => [...arr, ...g.emojis.array()], []);
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const embed = new MessageEmbed()
            .setTitle(randomEmoji.name.replace(/_/g, " "))
            .setColor(this.client.utils.color)
            .setImage(randomEmoji.url)
            .setTimestamp()
            .setFooter(`Emoji found in ${randomEmoji.guild.name}`);
        return message.send({ embed });
    };

}

module.exports = RandomEmoji;