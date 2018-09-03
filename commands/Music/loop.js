const { Command } = require('klasa');

class Loop extends Command {

    constructor(...args) {
        super(...args, {
            name: "loop",
            aliases: ["repeat", "togglerepeat", "toggleloop"],
            runIn: ["text"],
            description: language => language.get("COMMAND_LOOP_DESCRIPTION"),
            extendedHelp: "No extended help available.",
        });
    }

    async run(message) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer) throw message.language.get("COMMAND_MUSIC_NOT_PLAYING");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            throw message.language.get("COMMAND_MUSIC_NOT_REQUESTER");
        audioPlayer.looping = !audioPlayer.looping;
        return message.sendLocale(audioPlayer.looping ? "COMMAND_LOOP_ENABLE" : "COMMAND_LOOP_DISABLE");
    }

};

module.exports = Loop;