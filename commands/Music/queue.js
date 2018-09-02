const { Command, RichDisplay } = require('klasa');
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
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer || !audioPlayer.queue) return message.send("Nothing is currently playing.");

        const queueDisplay = new RichDisplay(new MessageEmbed()
            .setColor(0xFFFFFF)
            .addField(`Music queue for ${message.guild.name}`, `Use the reactions to switch between pages.`)
        );

        for (let i = 0; i < audioPlayer.queue.length; i += 6) {
            const template = new MessageEmbed();
            const tracks = audioPlayer.queue.slice(i, i + 6);
            template.setColor(this.client.utils.color);
            template.setTitle("Use the reactions to switch between pages.")
            template.setDescription(tracks.map(track => `\`•\` **${track.title}** (${track.length})`));
            queueDisplay.addPage(template);
        }

        queueDisplay.run(await message.send("Loading..."), { filter: (reaction, user) => user === message.author });
    }

};

module.exports = Queue;