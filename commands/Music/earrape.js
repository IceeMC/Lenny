const Command = require("../../framework/Command.js");

class EarRape extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: language => language.get("COMMAND_EARRAPE_DESCRIPTION"),
            cooldown: 300 // 5 minutes to prevent abuse
        });
    }

    async run(message) {
        const audioPlayer = message.guild.audioPlayer;
        if (!audioPlayer || !audioPlayer.queue) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            throw message.language.get("COMMAND_MUSIC_NOT_REQUESTER");
        const { oldVolume } = audioPlayer.setVolume(1000);
        return message.sendLocale("COMMAND_EARRAPE_SUCCESS", [1000 - oldVolume]);
    }

};

module.exports = EarRape;