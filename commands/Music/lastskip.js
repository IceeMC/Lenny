const { Command } = require('klasa');

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
        if (!audioPlayer || !audioPlayer.queue) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            throw message.language.get("COMMAND_MUSIC_NOT_REQUESTER");

        if (audioPlayer.queue.length === 0) {
            message.sendLocale("COMMAND_MUSIC_END");
            this.client.audioManager.leave(message.guild.id);
            // Discord bug fix
            this.client.audioManager.forEach(aPlayer => {
                aPlayer.pause();
                return setTimeout(() => aPlayer.resume(), 700);
            });
        } else {
            audioPlayer.queue = [audioPlayer.queue[audioPlayer.queue.length - 1]];
            audioPlayer.play(audioPlayer.queue[0].track);
            return message.channel.send(message.language.get("COMMAND_MUSIC_PLAYING", audioPlayer));
        }
    }

};

module.exports = LastSkip;