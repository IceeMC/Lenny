const { Event } = require("klasa");

class GuildBanRemoveEvent extends Event {

    async run(guild, user) {
        this.client.emit("logs", guild, {
            type: "memberUnban",
            user
        });
    }

}

module.exports = GuildBanRemoveEvent;