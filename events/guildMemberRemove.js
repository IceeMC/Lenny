const Event = require("../framework/Event.js");

class GuildMemberRemoveEvent extends Event {

    async run(member) {
        if (member.guild.config.logs.leaves) this.client.emit("logs", member.guild, {
            type: "memberLeave",
            member
        });
        const { config } = member.guild;
        if (!config.welcome.enabled || !config.welcome.welcomeChannel) return;
        const formatted = this.format(config.welcome.leaveMessage, member);
        const welcomeChannel = member.guild.channels.get(config.welcome.welcomeChannel);
        if (!welcomeChannel || !welcomeChannel.postable) return;
        return welcomeChannel.send(formatted).catch(() => null);
    }

    format(message, member) {
        return message
            .replace(/{mention}/g, member.toString())
            .replace(/{id}/g, member.user.id)
            .replace(/{username}/g, member.user.username)
            .replace(/{discriminator}/g, member.user.discriminator)
            .replace(/{tag}/g, member.user.tag)
            .replace(/{guild}/g, member.guild.name)
            .replace(/{guildId}/g, member.guild.id);
    }

}

module.exports = GuildMemberRemoveEvent;