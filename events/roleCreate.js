const Event = require("../framework/Event.js");

class RoleCreate extends Event {

    async run(role) {
        if (!role.guild.config.logs.roles) return;
        this.client.emit("logs", role.guild, {
            type: "roleAdd",
            role
        })
    }

}

module.exports = RoleCreate;