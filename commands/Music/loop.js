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
        if (!audioPlayer) return message.send("Nothing is currently playing.");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            return message.send("<:rip:459416322917400588> You did not request this song.");
        audioPlayer.looping = !audioPlayer.looping;
        return message.send(`:repeat: Looping has been **${audioPlayer.looping ? "enabled" : "disabled"}**`);
    }

};

module.exports = Loop;