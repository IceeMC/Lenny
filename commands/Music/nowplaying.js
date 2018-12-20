const Command = require("../../framework/Command.js");
const { MessageEmbed } = require("discord.js");

class NowPlaying extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_NOW_PLAYING_DESCRIPTION"),
            aliases: ["np", "nowp", "nplay"],
        });
    }

    async run(message) {
        const audioPlayer = message.guild.audioPlayer;
        if (!audioPlayer) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        if (!message.member.voice.channelID) throw message.language.get("COMMAND_PLAY_NO_VC");
        const embed = new MessageEmbed();
        embed.setColor(0xFFFFFF);
        embed.addField("Progress", this.getProgress(audioPlayer));
        embed.addField("Simple Queue:", this.queue(audioPlayer));
        return message.send({ embed });
    }

    getProgress(player) {
        const bar = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬".split("");
        const pos = Math.ceil(player.playerState.currentPosition / player.queue[0].data.info.length * 30);
        bar[pos] = "🔘";
        return `\`${bar.join("")}\``;
    }

    queue(player) {
        if (player.queue.length > 10) {
            const mapped = player.queue.map(t => `**[${t.title}](${t.url})** (${t.length})`);
            return `${mapped.join("\n")}\n...and ${player.queue.length - mapped.length} more!`;
        }
        return player.queue.map(t => `**[${t.title}](${t.url})** (${t.length})`).join("\n");
    }

}

module.exports = NowPlaying;