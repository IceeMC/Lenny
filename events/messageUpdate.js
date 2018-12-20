const Event = require("../framework/Event.js");

class MessageUpdateEvent extends Event {

    async run(oldMessage, newMessage) {
        if (!newMessage._parsed) newMessage._prepare();
        if(oldMessage.content === newMessage.content) return;
        this.client.emit("message", newMessage);
        if (!oldMessage.guild.config.logs.messages) return;
        this.client.emit("logs", newMessage.guild, {
            type: "messageUpdate",
            oldContent: oldMessage.content,
            newContent: newMessage.content,
            member: newMessage.member
        });
    }

};

module.exports = MessageUpdateEvent;