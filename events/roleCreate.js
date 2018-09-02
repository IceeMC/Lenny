const { Event } = require("klasa");

class RoleCreate extends Event {

    async run(role) {
        if (!role.guild.settings.logs.roles) return;
        this.client.emit("logs", role.guild, {
            type: "roleAdd",
            role
        })
    }

}

module.exports = RoleCreate;