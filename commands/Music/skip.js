const Command = require("../../framework/Command.js");

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
        const audioPlayer = message.guild.audioPlayer;
        if (!audioPlayer || !audioPlayer.queue) return message.send("Nothing is currently playing.");
        if (!message.member.voice.channelID) throw message.language.get("COMMAND_PLAY_NO_VC");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            throw message.language.get("COMMAND_MUSIC_NOT_REQUESTER");

        audioPlayer.queue.shift();
        if (audioPlayer.queue.length === 0) {
            audioPlayer.stop();
            message.sendLocale("COMMAND_MUSIC_END");
            this.client.audioManager.leave(message.guild.id);
            audioPlayer.idle = true;
            // Discord bug fix
            this.client.audioManager.forEach(aPlayer => {
                aPlayer.pause();
                return setTimeout(() => aPlayer.resume(), 700);
            });
        } else {
            audioPlayer.play(audioPlayer.queue[0].track);    
            return message.channel.send(message.language.get("COMMAND_MUSIC_PLAYING", audioPlayer));
        }
    }

};

module.exports = Skip;