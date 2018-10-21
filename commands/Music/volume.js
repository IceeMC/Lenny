const { Command } = require("klasa");

class Volume extends Command {

    constructor(...args) {
        super(...args, {
            name: "volume",
            runIn: ["text"],
            usage: "<value:number{5,100}>",
            cooldown: 15,
            description: language => language.get("COMMAND_VOLUME_DESCRIPTION"),
        });
    }

    async run(message, [value]) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        const oldVolume = audioPlayer.playerState.currentVolume;
        const newVolume = Math.round(value);
        audioPlayer.setVolume(newVolume);
        return message.sendLocale("COMMAND_MUSIC_SET_VOLUME", [oldVolume, newVolume]);
    }

}

module.exports = Volume;