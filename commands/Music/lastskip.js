const { Command, RichDisplay } = require('klasa');

class LastSkip extends Command {

    constructor(...args) {
        super(...args, {
            name: "lastskip",
            runIn: ["text"],
            description: language => language.get("COMMAND_LASTSKIP_DESCRIPTION"),
            extendedHelp: "No extended help available.",
        });
    }

    async run(message, [position]) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer || !audioPlayer.queue) return message.send("Nothing is currently playing.");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            return message.send("You did not request this song.");

        if (audioPlayer.queue.length === 0) {
            message.channel.send("The music party is over... Queue up some more music!");
            this.client.audioManager.leave(message.guild.id);
            // Discord bug fix
            this.client.audioManager.forEach(aPlayer => {
                aPlayer.pause();
                return setTimeout(() => aPlayer.resume(), 700);
            });
        } else {
            message.send("Skipping...");
            audioPlayer.queue = [audioPlayer.queue[audioPlayer.queue.length - 1]];
            audioPlayer.play(audioPlayer.queue[0].track);
            return await message.send(`:musical_note: **${audioPlayer.queue[0].title}** is now being played as requested by \`${audioPlayer.queue[0].requester.tag}\``);
        }
    }

};

module.exports = LastSkip;