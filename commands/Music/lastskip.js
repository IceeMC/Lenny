const Command = require("../../framework/Command.js");

class LastSkip extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_LASTSKIP_DESCRIPTION"),
        });
    }

    async run(message) {
        const audioPlayer = message.guild.audioPlayer;
        if (!audioPlayer || !audioPlayer.queue) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        if (!message.member.voice.channelID) throw message.language.get("COMMAND_PLAY_NO_VC");
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