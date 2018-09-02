const { Event } = require("klasa");

class MemberWarn extends Event {


    async run(guild, reason, member) {
        this.client.emit("logs", guild, {
            type: "memberWarn",
            reason,
            member
        });
    }

}

module.exports = MemberWarn;