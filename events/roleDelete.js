const { Event } = require("klasa");

class RoleDelete extends Event {

    async run(role) {
        if (!role.guild.settings.logs.roles) return;
        this.client.emit("logs", {
            type: "roleRemove",
            role
        })
    }

}

module.exports = RoleDelete;