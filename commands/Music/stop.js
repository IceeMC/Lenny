const { Command, RichDisplay } = require('klasa');

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
        if (!audioPlayer || !audioPlayer.queue) return message.send("Nothing is currently playing.");
        if (audioPlayer.queue[0].requester !== message.author && !message.member.permissions.has("ADMINISTRATOR"))
            return message.send("<:rip:459416322917400588> You did not request this song.");

        audioPlayer.stop();
        audioPlayer.idle = true;
        audioPlayer.playing = false;
        this.client.audioManager.leave(message.guild.id);
        return message.send("The music party is over... Queue up some more music!");
    }

};

module.exports = Stop;