const { Command, RichDisplay } = require('klasa');

class Skip extends Command {

    constructor(...args) {
        super(...args, {
            name: "skip",
            runIn: ["text"],
            description: language => language.get("COMMAND_SKIP_DESCRIPTION"),
            extendedHelp: "No extended help available.",
        });
    }

    async run(message) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer || !audioPlayer.queue) return message.send("Nothing is currently playing.");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            return message.send("<:rip:459416322917400588> You did not request this song.");

        audioPlayer.queue.shift();
        if (audioPlayer.queue.length === 0) {
            audioPlayer.stop();
            message.channel.send("The music party is over... Queue up some more music!");
            this.client.audioManager.leave(message.guild.id);
            audioPlayer.idle = true;
            // Discord bug fix
            this.client.audioManager.forEach(aPlayer => {
                aPlayer.pause();
                return setTimeout(() => aPlayer.resume(), 700);
            });
        } else {
            message.send("Skipping...");
            audioPlayer.play(audioPlayer.queue[0].track);
            return await message.send(`:musical_note: **${audioPlayer.queue[0].title}** is now being played as requested by \`${audioPlayer.queue[0].requester.tag}\``);
        }
    }

};

module.exports = Skip;