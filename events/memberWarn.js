const Event = require("../framework/Event.js");

class MemberWarn extends Event {


    async run(guild, reason, member) {
        if (!guild.config.logs.warns) return;
        this.client.emit("logs", guild, {
            type: "memberWarn",
            reason,
            member
        });
    }

}

module.exports = MemberWarn;