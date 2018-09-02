const RawEvent = require("../utils/RawEvent.js");
const { MessageEmbed } = require("discord.js");

class MessageReactionAdd extends RawEvent {

    async run(packet) {
        const guild = this.client.guilds.get(packet.guild_id);
        if (packet.emoji.name !== "⭐") return;
        const { starboard } = guild;
        if (!starboard.channel) return;
        const channel = guild.channels.get(starboard.channel);
        if (!channel || !channel.postable) return;
        if (channel.nsfw) return;
        const findId = starboard.getStar(packet.message_id) ? starboard.getStar(packet.message_id).editId : null;
        const starred = channel.messages.find(message => message.id === findId);
        if (starred) {
            starboard.editStar(channel, starred);
        } else {
            const m = await channel.messages.fetch(packet.message_id);
            starboard.starRaw(channel, m, packet);
        }
    }

}

module.exports = MessageReactionAdd;