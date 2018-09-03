const { Event } = require("klasa");

class ChannelUpdateEvent extends Event {

    async run(oldChannel, newChannel) {
        if (newChannel.type === "dm") return;
        if (!channel.guild.settings.logs.channels) return;
        const updates = [];
        if (newChannel.name !== oldChannel.name) updates.push({ text: "Channel Name", old: oldChannel.name, new: newChannel.name });
        if (newChannel.topic !== oldChannel.topic) updates.push({ text: "Topic Change", old: oldChannel.topic, new: newChannel.topic });
        this.client.emit("logs", newChannel.guild, {
            type: "channelUpdate",
            channel: newChannel,
            updates
        });
    }

};

module.exports = ChannelUpdateEvent;