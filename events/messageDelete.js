const Event = require("../framework/Event.js");

class MessageDeleteEvent extends Event {

    async run(message) {
        if (message.reply) await message.reply.delete().catch(() => null); // Delete reply no matter what
        if (!message.guild.config.logs.messages) return;
        this.client.emit("logs", message.guild, {
            type: "messageDelete",
            message
        });
    }

}

module.exports = MessageDeleteEvent;