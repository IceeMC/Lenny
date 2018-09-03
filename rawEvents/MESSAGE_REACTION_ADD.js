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

        const fetchFrom = guild.channels.get(packet.channel_id);
        if (!fetchFrom) return;
        const fetchedMessage = await fetchFrom.messages.fetch(packet.message_id).catch(() => null);
        if (!fetchedMessage) return;
        const channelFetch = await channel.messages.fetch({ limit: 100 }).catch(() => null);
        if (!channelFetch) return;
        
        const starred = channelFetch.find(m => m.embeds.length && m.embeds[0].footer && starboard.regex.test(m.embeds[0].footer.text) && m.embeds[0].footer.text.endsWith(fetchedMessage.id));
        if (starred) return starboard.editStar(starred, fetchedMessage);
        return starboard.star(channel, fetchedMessage);
    }

}

module.exports = MessageReactionAdd;