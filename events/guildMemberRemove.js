const { Event } = require("klasa");

class GuildMemberRemoveEvent extends Event {

    async run(member) {
        if (member.guild.settings.logs.leaves) this.client.emit("logs", member.guild, {
            type: "memberLeave",
            member
        });
        const { settings } = member.guild;
        if (!settings.welcome.enabled || !settings.welcome.welcomeChannel) return;
        const formatted = this.format(settings.welcome.leaveMessage, member);
        const welcomeChannel = member.guild.channels.get(settings.welcome.welcomeChannel);
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