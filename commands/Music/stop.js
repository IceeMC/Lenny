const { Command } = require('klasa');

class Stop extends Command {

    constructor(...args) {
        super(...args, {
            name: "stop",
            runIn: ["text"],
            description: language => language.get("COMMAND_STOP_DESCRIPTION"),
            extendedHelp: "No extended help available.",
        });
    }

    async run(message) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer || !audioPlayer.queue) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            throw message.language.get("COMMAND_MUSIC_NOT_REQUESTER");

        audioPlayer.stop();
        audioPlayer.idle = true;
        audioPlayer.playing = false;
        this.client.audioManager.leave(message.guild.id);
        return message.sendLocale("COMMAND_MUSIC_END");
    }

};

module.exports = Stop;