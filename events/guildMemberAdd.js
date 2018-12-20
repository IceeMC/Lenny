const Event = require("../framework/Event.js");

class GuildMemberAddEvent extends Event {

    async run(member) {
        if (member.guild.config.logs.joins) this.client.emit("logs", member.guild, {
            type: "memberJoin",
            member
        });
        const { config } = member.guild;
        if (!config.welcome.enabled || !config.welcome.welcomeChannel) return;
        this.autoRole(member); // Add role if available
        const formatted = this.format(config.welcome.welcomeMessage, member);
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

    autoRole(member) {
        const { config } = member.guild;
        if (!config.autoRole) return;
        if (!member.guild.me.permissions.has("MANAGE_ROLES")) return;
        return member.roles.add(config.autoRole, "Chat Noir Auto Role").catch(() => null);
    }

}

module.exports = GuildMemberAddEvent;