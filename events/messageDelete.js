const { Event } = require("klasa");

class MessageDeleteEvent extends Event {

    async run(message) {
        const lastBulkDelete = message.guild.lastBulkDelete ? message.guild.lastBulkDelete : null;
        this.client.emit("logs", message.guild, {
            type: "messageDelete",
            message
        });
    }

}

module.exports = MessageDeleteEvent;