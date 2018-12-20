const Command = require("../../framework/Command.js");
const ArgResolver = require("../../framework/ArgResolver.js");

class Volume extends Command {

    constructor(...args) {
        super(...args, {
            name: "volume",
            runIn: ["text"],
            cooldown: 15,
            description: language => language.get("COMMAND_VOLUME_DESCRIPTION"),
            usage: "<volume:int[10,150]>"
        });
    }

    async run(message, [volume]) {
        const audioPlayer = message.guild.audioPlayer;
        if (!audioPlayer) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        if (!message.member.voice.channelID) throw message.language.get("COMMAND_PLAY_NO_VC");
        const { oldVolume, newVolume } = audioPlayer.setVolume(volume);
        return message.sendLocale("COMMAND_VOLUME_SET", [oldVolume, newVolume]);
    }

}

module.exports = Volume;