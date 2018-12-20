const Event = require("../framework/Event.js");

class GuildMemberUpdate extends Event {

    async run(oldMember, newMember) {
        if (newMember.roles.size > oldMember.roles.size && newMember.guild.config.logs.roles) {
            const oldRoles = oldMember.roles;
            const addedRoles = newMember.roles.filter(role => !oldRoles.has(role.id));
            this.client.emit("logs", newMember.guild, {
                type: "memberRoleAdd",
                member: oldMember,
                roles: addedRoles
            });
        }
        // Member has been removed from a role.
        if (newMember.roles.size < oldMember.roles.size && newMember.guild.config.logs.roles) {
            const newRoles = newMember.roles;
            const removedRoles = oldMember.roles.filter(role => !newRoles.has(role.id));
            this.client.emit("logs", newMember.guild, {
                type: "memberRoleRemove",
                member: oldMember,
                roles: removedRoles
            });
        }
        if (newMember.nickname !== oldMember.nickname && newMember.guild.config.logs.nicknames) {
            this.client.emit("logs", newMember.guild, {
                type: "nicknameChange",
                member: oldMember,
                oldNick: oldMember.nickname ? oldMember.nickname : oldMember.user.username,
                newNick: newMember.nickname ? newMember.nickname : newMember.user.username
            })
        }
    }

}

module.exports = GuildMemberUpdate;