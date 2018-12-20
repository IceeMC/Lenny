const Event = require("../framework/Event.js");

class ChannelDeleteEvent extends Event {

    async run(channel) {
        if (channel.type === "dm") return;
        if (!channel.guild.config.logs.channels) return;
        this.client.emit("logs", channel.guild, {
            type: "channelRemove",
            channel
        });
    }

};

module.exports = ChannelDeleteEvent;