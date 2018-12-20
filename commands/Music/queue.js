const Command = require("../../framework/Command.js");
const Paginator = require("../../framework/Paginator.js");
const { MessageEmbed } = require("discord.js");

class Queue extends Command {

    constructor(...args) {
        super(...args, {
            name: "queue",
            runIn: ["text"],
            aliases: ["songs", "tracks"],
            description: language => language.get("COMMAND_LOOP_DESCRIPTION"),
            extendedHelp: "No extended help available.",
        });
    }

    async run(message) {
        const audioPlayer = message.guild.audioPlayer;
        if (!audioPlayer || !audioPlayer.queue) return message.send("Nothing is currently playing.");
        if (!message.member.voice.channelID) throw message.language.get("COMMAND_PLAY_NO_VC");

        const queuePaginator = new Paginator(message, new MessageEmbed()
            .setColor(this.client.utils.color)
            .addField(`Music queue for ${message.guild.name}`, "Use the reactions to switch between pages.")
        );

        for (let i = 0; i < audioPlayer.queue.length; i += 6) {
            const template = new MessageEmbed();
            const tracks = audioPlayer.queue.slice(i, i + 6);
            template.setColor(this.client.utils.color);
            template.setDescription(tracks.map(track => `\`•\` **${track.title}** (${track.length})`));
            queuePaginator.addPage(template);
        }

        return await queuePaginator.start();
    }

};

module.exports = Queue;