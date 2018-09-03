const { Event } = require("klasa");

class GuildBanRemoveEvent extends Event {

    async run(guild, user) {
        if (!guild.settings.logs.bans) return;
        this.client.emit("logs", guild, {
            type: "memberUnban",
            user
        });
    }

}

module.exports = GuildBanRemoveEvent;