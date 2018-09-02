const { Event } = require("klasa");

class MessageUpdateEvent extends Event {

    async run(oldMessage, newMessage) {
        if(oldMessage.content === newMessage.content) return;
        // Run monitors
        if (this.client.ready) this.client.monitors.run(newMessage);
        this.client.emit("logs", newMessage.guild, {
            type: "messageUpdate",
            oldContent: oldMessage.content,
            newContent: newMessage.content,
            member: newMessage.member
        });
    }

};

module.exports = MessageUpdateEvent;