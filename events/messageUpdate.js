const { Event } = require("klasa");

class MessageUpdateEvent extends Event {

    async run(oldMessage, newMessage) {
        if(oldMessage.content === newMessage.content) return;
        if (this.client.ready) this.client.monitors.run(newMessage);
        if (!oldMessage.guild.settings.logs.messages) return;
        this.client.emit("logs", newMessage.guild, {
            type: "messageUpdate",
            oldContent: oldMessage.content,
            newContent: newMessage.content,
            member: newMessage.member
        });
    }

};

module.exports = MessageUpdateEvent;