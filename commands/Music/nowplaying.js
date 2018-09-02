const { Command } = require("klasa");
const { MessageEmbed } = require("discord.js");

class NowPlaying extends Command {

    constructor(...args) {
        super(...args, {
            name: "nowplaying",
            runIn: ["text"],
            description: language => language.get("COMMAND_NOW_PLAYING_DESCRIPTION"),
            aliases: ["np", "nowp", "nplay"],
            requiredPermissions: ["ATTACH_FILES", "SEND_MESSAGES"]
        });
    }

    async run(message) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer || !audioPlayer.queue) return message.send("There is nothing playing.");
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
            return `${mapped.join("\n")}\n...and ${player.queue.length - mapped.length}`;
        }
        return player.queue.map(t => `**[${t.title}](${t.url})** (${t.length})`).join("\n");
    }

}

module.exports = NowPlaying;