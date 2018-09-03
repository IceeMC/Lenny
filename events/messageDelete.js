const { Event } = require("klasa");

class MessageDeleteEvent extends Event {

    async run(message) {
        if (!message.guild.settings.logs.messages) return;
        this.client.emit("logs", message.guild, {
            type: "messageDelete",
            message
        });
    }

}

module.exports = MessageDeleteEvent;