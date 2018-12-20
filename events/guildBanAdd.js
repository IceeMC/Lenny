const Event = require("../framework/Event.js");

class GuildBanAddEvent extends Event {

    async run(guild, user) {
        if (!guild.config.logs.bans) return;
        let reason = await guild.fetchBans()
            .then(bans => {
                const ban = bans.find(ban => ban.user.id === user.id);
                return ban ? ban.reason : "No reason provided.";
            })
            .catch(() => "Could not fetch ban.");
        this.client.emit("logs", guild, {
            type: "memberBan",
            user,
            reason
        });
    }

}

module.exports = GuildBanAddEvent;