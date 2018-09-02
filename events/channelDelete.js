const { Event } = require("klasa");

class ChannelDeleteEvent extends Event {

    async run(channel) {
        if (channel.type === "dm") return;
        this.client.emit("logs", channel.guild, {
            type: "channelRemove",
            channel
        });
    }

};

module.exports = ChannelDeleteEvent;