const Event = require("../framework/Event.js");

class GuildBanRemoveEvent extends Event {

    async run(guild, user) {
        if (!guild.config.logs.bans) return;
        this.client.emit("logs", guild, {
            type: "memberUnban",
            user
        });
    }

}

module.exports = GuildBanRemoveEvent;