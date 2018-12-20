const Event = require("../framework/Event.js");

class RoleDelete extends Event {

    async run(role) {
        if (!role.guild.config.logs.roles) return;
        this.client.emit("logs", {
            type: "roleRemove",
            role
        })
    }

}

module.exports = RoleDelete;