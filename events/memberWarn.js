const { Event } = require("klasa");

class MemberWarn extends Event {


    async run(guild, reason, member) {
        if (!guild.settings.logs.warns) return;
        this.client.emit("logs", guild, {
            type: "memberWarn",
            reason,
            member
        });
    }

}

module.exports = MemberWarn;