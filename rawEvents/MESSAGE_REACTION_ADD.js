const Event = require("../framework/Event.js");

class MessageReactionAdd extends Event {

    async run({ d }) {
        const guild = this.client.guilds.get(d.guild_id);
        if (d.emoji.name !== "⭐") return;
        
        const { starboard } = guild;
        if (!starboard.channel) return;
        
        const channel = guild.channels.get(starboard.channel);
        if (!channel || !channel.postable) return;
        if (channel.nsfw) return;

        const fetchFrom = guild.channels.get(d.channel_id);
        if (!fetchFrom) return;
        const fetchedMessage = await fetchFrom.messages.fetch(d.message_id).catch(() => null);
        if (!fetchedMessage) return;
        const channelFetch = await channel.messages.fetch({ limit: 100 }).catch(() => null);
        if (!channelFetch) return;
        
        const starred = channelFetch.find(m => m.embeds.length && m.embeds[0].footer && starboard.regex.test(m.embeds[0].footer.text) && m.embeds[0].footer.text.endsWith(fetchedMessage.id));
        if (starred) return starboard.editStar(starred, fetchedMessage);
        return starboard.star(channel, fetchedMessage);
    }

}

module.exports = MessageReactionAdd;