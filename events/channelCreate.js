const { Event } = require("klasa");

class ChannelCreateEvent extends Event {

    async run(channel) {
        if (channel.type === "dm") return;
        this.client.emit("logs", channel.guild, {
            type: "channelAdd",
            channel
        });
    }

};

module.exports = ChannelCreateEvent;