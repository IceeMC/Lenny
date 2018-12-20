const Command = require("../../framework/Command.js");

class Loop extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ["repeat", "togglerepeat", "toggleloop"],
            runIn: ["text"],
            description: language => language.get("COMMAND_LOOP_DESCRIPTION"),
        });
    }

    async run(message) {
        const audioPlayer = message.guild.audioPlayer;
        if (!audioPlayer) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        if (!message.member.voice.channelID) throw message.language.get("COMMAND_PLAY_NO_VC");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            throw message.language.get("COMMAND_MUSIC_NOT_REQUESTER");
        audioPlayer.looping = !audioPlayer.looping;
        return message.sendLocale(audioPlayer.looping ? "COMMAND_LOOP_ENABLE" : "COMMAND_LOOP_DISABLE");
    }

};

module.exports = Loop;